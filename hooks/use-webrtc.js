"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import {
  iceServers,
  createOffer,
  createAnswer,
  addIceCandidate as addIceCandidateToFirebase,
  listenForOffers,
  listenForAnswers,
  listenForIceCandidates,
  cleanupSignaling,
  getUserMedia,
  getDisplayMedia,
} from "@/lib/webrtc"
import { updateParticipantState } from "@/lib/realtime"

export function useWebRTC(meetingId, currentUser, participants) {
  const [localStream, setLocalStream] = useState(null)
  const [remoteStreams, setRemoteStreams] = useState({}) // { userId: stream }
  const [screenStream, setScreenStream] = useState(null)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isMicOn, setIsMicOn] = useState(true)
  const [isPresenting, setIsPresenting] = useState(false)

  const peerConnections = useRef({}) // { userId: RTCPeerConnection }
  const processedOffers = useRef(new Set())
  const processedAnswers = useRef(new Set())
  const processedCandidates = useRef(new Set())

  // Initialize local media stream
  useEffect(() => {
    const initLocalStream = async () => {
      const { stream, error } = await getUserMedia({ video: true, audio: true })
      if (stream) {
        setLocalStream(stream)
      } else {
        console.error("Failed to get local stream:", error)
      }
    }

    if (currentUser && !localStream) {
      initLocalStream()
    }

    return () => {
      // Cleanup on unmount
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [currentUser])

  // Create peer connection for a remote user
  const createPeerConnection = useCallback(
    (remoteUserId) => {
      if (peerConnections.current[remoteUserId]) {
        return peerConnections.current[remoteUserId]
      }

      const pc = new RTCPeerConnection(iceServers)

      // Add local stream tracks to peer connection
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream)
        })
      }

      // Handle incoming remote stream
      pc.ontrack = (event) => {
        console.log("[v0] Received remote track from", remoteUserId)
        const [remoteStream] = event.streams
        setRemoteStreams((prev) => ({
          ...prev,
          [remoteUserId]: remoteStream,
        }))
      }

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("[v0] Sending ICE candidate to", remoteUserId)
          addIceCandidateToFirebase(meetingId, currentUser.uid, remoteUserId, event.candidate)
        }
      }

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log("[v0] Connection state with", remoteUserId, ":", pc.connectionState)
        if (
          pc.connectionState === "disconnected" ||
          pc.connectionState === "failed" ||
          pc.connectionState === "closed"
        ) {
          setRemoteStreams((prev) => {
            const updated = { ...prev }
            delete updated[remoteUserId]
            return updated
          })
        }
      }

      peerConnections.current[remoteUserId] = pc
      return pc
    },
    [meetingId, currentUser, localStream],
  )

  // Handle new participant joining
  useEffect(() => {
    if (!currentUser || !localStream || !participants || participants.length === 0) return

    // Create offers for all other participants
    participants.forEach(async (participant) => {
      if (participant.uid !== currentUser.uid && !peerConnections.current[participant.uid]) {
        console.log("[v0] Creating offer for", participant.uid)
        const pc = createPeerConnection(participant.uid)
        await createOffer(meetingId, currentUser.uid, participant.uid, pc)
      }
    })
  }, [participants, currentUser, localStream, meetingId, createPeerConnection])

  // Listen for incoming offers
  useEffect(() => {
    if (!currentUser || !localStream) return

    const unsubscribe = listenForOffers(meetingId, currentUser.uid, async (fromUserId, offer) => {
      const offerId = `${fromUserId}-${offer.timestamp}`
      if (processedOffers.current.has(offerId)) return
      processedOffers.current.add(offerId)

      console.log("[v0] Received offer from", fromUserId)
      const pc = createPeerConnection(fromUserId)

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer))
        await createAnswer(meetingId, currentUser.uid, fromUserId, pc)
      } catch (error) {
        console.error("Error handling offer:", error)
      }
    })

    return unsubscribe
  }, [meetingId, currentUser, localStream, createPeerConnection])

  // Listen for incoming answers
  useEffect(() => {
    if (!currentUser) return

    const unsubscribe = listenForAnswers(meetingId, currentUser.uid, async (fromUserId, answer) => {
      const answerId = `${fromUserId}-${answer.timestamp}`
      if (processedAnswers.current.has(answerId)) return
      processedAnswers.current.add(answerId)

      console.log("[v0] Received answer from", fromUserId)
      const pc = peerConnections.current[fromUserId]

      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer))
        } catch (error) {
          console.error("Error handling answer:", error)
        }
      }
    })

    return unsubscribe
  }, [meetingId, currentUser])

  // Listen for incoming ICE candidates
  useEffect(() => {
    if (!currentUser) return

    const unsubscribe = listenForIceCandidates(meetingId, currentUser.uid, async (fromUserId, candidateData) => {
      const candidateId = `${fromUserId}-${candidateData.timestamp}`
      if (processedCandidates.current.has(candidateId)) return
      processedCandidates.current.add(candidateId)

      console.log("[v0] Received ICE candidate from", fromUserId)
      const pc = peerConnections.current[fromUserId]

      if (pc && candidateData.candidate) {
        try {
          await pc.addIceCandidate(
            new RTCIceCandidate({
              candidate: candidateData.candidate,
              sdpMLineIndex: candidateData.sdpMLineIndex,
              sdpMid: candidateData.sdpMid,
            }),
          )
        } catch (error) {
          console.error("Error adding ICE candidate:", error)
        }
      }
    })

    return unsubscribe
  }, [meetingId, currentUser])

  // Toggle video
  const toggleVideo = useCallback(async () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOn(videoTrack.enabled)
        await updateParticipantState(meetingId, currentUser.uid, { isVideoOn: videoTrack.enabled })
      }
    }
  }, [localStream, meetingId, currentUser])

  // Toggle microphone
  const toggleMic = useCallback(async () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMicOn(audioTrack.enabled)
        await updateParticipantState(meetingId, currentUser.uid, { isMicOn: audioTrack.enabled })
      }
    }
  }, [localStream, meetingId, currentUser])

  // Start screen share
  const startScreenShare = useCallback(async () => {
    const { stream, error } = await getDisplayMedia()
    if (stream) {
      const screenTrack = stream.getVideoTracks()[0]

      // Replace video track in all peer connections
      Object.values(peerConnections.current).forEach((pc) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video")
        if (sender) {
          sender.replaceTrack(screenTrack)
        }
      })

      // Handle screen share end
      screenTrack.onended = () => {
        stopScreenShare()
      }

      setScreenStream(stream)
      setIsPresenting(true)
      await updateParticipantState(meetingId, currentUser.uid, { isPresenting: true })
    } else {
      console.error("Failed to get screen stream:", error)
    }
  }, [meetingId, currentUser])

  // Stop screen share
  const stopScreenShare = useCallback(async () => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop())

      // Restore camera track
      if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0]
        Object.values(peerConnections.current).forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === "video")
          if (sender && videoTrack) {
            sender.replaceTrack(videoTrack)
          }
        })
      }

      setScreenStream(null)
      setIsPresenting(false)
      await updateParticipantState(meetingId, currentUser.uid, { isPresenting: false })
    }
  }, [screenStream, localStream, meetingId, currentUser])

  // Leave meeting
  const leaveMeeting = useCallback(async () => {
    // Stop all tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
    }
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop())
    }

    // Close all peer connections
    Object.values(peerConnections.current).forEach((pc) => pc.close())
    peerConnections.current = {}

    // Cleanup Firebase signaling data
    await cleanupSignaling(meetingId, currentUser.uid)
  }, [localStream, screenStream, meetingId, currentUser])

  return {
    localStream,
    remoteStreams,
    screenStream,
    isVideoOn,
    isMicOn,
    isPresenting,
    toggleVideo,
    toggleMic,
    startScreenShare,
    stopScreenShare,
    leaveMeeting,
  }
}
