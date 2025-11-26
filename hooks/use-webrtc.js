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
  const [videoQuality, setVideoQuality] = useState("720p")

  const peerConnections = useRef({}) // { userId: RTCPeerConnection }
  const processedOffers = useRef(new Set())
  const processedAnswers = useRef(new Set())
  const processedCandidates = useRef(new Set())
  const localStreamRef = useRef(null)

  useEffect(() => {
    const initLocalStream = async () => {
      const { stream, error } = await getUserMedia({ video: videoQuality, audio: true })
      if (stream) {
        setLocalStream(stream)
        localStreamRef.current = stream
        console.log("[v0] Local stream initialized with quality:", videoQuality)
      } else {
        console.error("Failed to get local stream:", error)
      }
    }

    if (currentUser && !localStream) {
      initLocalStream()
    }

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [currentUser, videoQuality])

  // Create peer connection for a remote user
  const createPeerConnection = useCallback(
    (remoteUserId) => {
      if (peerConnections.current[remoteUserId]) {
        console.log("[v0] Peer connection already exists for", remoteUserId)
        return peerConnections.current[remoteUserId]
      }

      console.log("[v0] Creating new peer connection for", remoteUserId)
      const pc = new RTCPeerConnection(iceServers)

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          console.log("[v0] Adding track to peer connection:", track.kind, "for", remoteUserId)
          pc.addTrack(track, localStreamRef.current)
        })
      }

      pc.ontrack = (event) => {
        console.log("[v0] Received remote track from", remoteUserId, "kind:", event.track.kind)
        const [remoteStream] = event.streams
        if (remoteStream) {
          setRemoteStreams((prev) => {
            console.log("[v0] Setting remote stream for", remoteUserId)
            return {
              ...prev,
              [remoteUserId]: remoteStream,
            }
          })
        }
      }

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("[v0] Sending ICE candidate to", remoteUserId)
          addIceCandidateToFirebase(meetingId, currentUser.uid, remoteUserId, event.candidate)
        }
      }

      pc.onconnectionstatechange = () => {
        console.log("[v0] Connection state with", remoteUserId, ":", pc.connectionState)
        if (pc.connectionState === "failed") {
          console.log("[v0] Connection failed, attempting restart for", remoteUserId)
          pc.restartIce()
        }
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
          delete peerConnections.current[remoteUserId]
        }
      }

      pc.oniceconnectionstatechange = () => {
        console.log("[v0] ICE connection state with", remoteUserId, ":", pc.iceConnectionState)
      }

      peerConnections.current[remoteUserId] = pc
      return pc
    },
    [meetingId, currentUser],
  )

  useEffect(() => {
    if (!currentUser || !localStreamRef.current || !participants || participants.length === 0) {
      return
    }

    const createOffersForParticipants = async () => {
      for (const participant of participants) {
        if (participant.uid !== currentUser.uid && !peerConnections.current[participant.uid]) {
          console.log("[v0] Creating offer for new participant", participant.uid)
          const pc = createPeerConnection(participant.uid)
          await createOffer(meetingId, currentUser.uid, participant.uid, pc)
        }
      }
    }

    createOffersForParticipants()
  }, [participants, currentUser, meetingId, createPeerConnection, localStream])

  useEffect(() => {
    if (!currentUser || !localStreamRef.current) return

    const unsubscribe = listenForOffers(meetingId, currentUser.uid, async (fromUserId, offer) => {
      const offerId = `${fromUserId}-${offer.timestamp}`
      if (processedOffers.current.has(offerId)) return
      processedOffers.current.add(offerId)

      console.log("[v0] Received offer from", fromUserId)
      const pc = createPeerConnection(fromUserId)

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer))
        console.log("[v0] Creating answer for", fromUserId)
        await createAnswer(meetingId, currentUser.uid, fromUserId, pc)
      } catch (error) {
        console.error("Error handling offer:", error)
      }
    })

    return unsubscribe
  }, [meetingId, currentUser, createPeerConnection, localStream])

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

  const toggleVideo = useCallback(async () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOn(videoTrack.enabled)
        await updateParticipantState(meetingId, currentUser.uid, { isVideoOn: videoTrack.enabled })
      }
    }
  }, [meetingId, currentUser])

  const toggleMic = useCallback(async () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMicOn(audioTrack.enabled)
        await updateParticipantState(meetingId, currentUser.uid, { isMicOn: audioTrack.enabled })
      }
    }
  }, [meetingId, currentUser])

  const startScreenShare = useCallback(async () => {
    const { stream, error } = await getDisplayMedia()
    if (stream) {
      const screenTrack = stream.getVideoTracks()[0]

      Object.entries(peerConnections.current).forEach(([userId, pc]) => {
        const sender = pc.getSenders().find((s) => s.track?.kind === "video")
        if (sender) {
          console.log("[v0] Replacing video track with screen share for", userId)
          sender.replaceTrack(screenTrack).catch((err) => console.error("Replace track error:", err))
        }
      })

      const oldVideoTrack = localStreamRef.current?.getVideoTracks()[0]
      if (oldVideoTrack) {
        localStreamRef.current.removeTrack(oldVideoTrack)
        localStreamRef.current.addTrack(screenTrack)
        setLocalStream(localStreamRef.current)
      }

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

  const stopScreenShare = useCallback(async () => {
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop())

      const { stream: newCameraStream } = await getUserMedia({ video: videoQuality, audio: true })
      if (newCameraStream) {
        const newVideoTrack = newCameraStream.getVideoTracks()[0]

        Object.entries(peerConnections.current).forEach(([userId, pc]) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === "video")
          if (sender && newVideoTrack) {
            console.log("[v0] Restoring camera track for", userId)
            sender.replaceTrack(newVideoTrack).catch((err) => console.error("Replace track error:", err))
          }
        })

        // Stop old tracks and update local stream
        const oldVideoTrack = localStreamRef.current?.getVideoTracks()[0]
        if (oldVideoTrack) {
          oldVideoTrack.stop()
          localStreamRef.current.removeTrack(oldVideoTrack)
        }
        localStreamRef.current.addTrack(newVideoTrack)
        setLocalStream(localStreamRef.current)
      }

      setScreenStream(null)
      setIsPresenting(false)
      await updateParticipantState(meetingId, currentUser.uid, { isPresenting: false })
    }
  }, [screenStream, meetingId, currentUser, videoQuality])

  const changeVideoQuality = useCallback(
    async (quality) => {
      if (isPresenting) {
        console.log("[v0] Cannot change quality while presenting")
        return
      }

      const { stream: newStream } = await getUserMedia({ video: quality, audio: true })
      if (newStream) {
        const newVideoTrack = newStream.getVideoTracks()[0]

        Object.entries(peerConnections.current).forEach(([userId, pc]) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === "video")
          if (sender) {
            console.log("[v0] Updating video quality for", userId)
            sender.replaceTrack(newVideoTrack).catch((err) => console.error("Replace track error:", err))
          }
        })

        // Stop old tracks and update local stream
        const oldVideoTrack = localStreamRef.current?.getVideoTracks()[0]
        if (oldVideoTrack) {
          oldVideoTrack.stop()
          localStreamRef.current.removeTrack(oldVideoTrack)
        }
        localStreamRef.current.addTrack(newVideoTrack)
        setLocalStream(localStreamRef.current)
        setVideoQuality(quality)
      }
    },
    [isPresenting],
  )

  // Leave meeting
  const leaveMeeting = useCallback(async () => {
    // Stop all tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop())
    }
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop())
    }

    // Close all peer connections
    Object.values(peerConnections.current).forEach((pc) => pc.close())
    peerConnections.current = {}

    // Cleanup Firebase signaling data
    await cleanupSignaling(meetingId, currentUser.uid)
  }, [localStreamRef, screenStream, meetingId, currentUser])

  return {
    localStream,
    remoteStreams,
    screenStream,
    isVideoOn,
    isMicOn,
    isPresenting,
    videoQuality,
    toggleVideo,
    toggleMic,
    startScreenShare,
    stopScreenShare,
    leaveMeeting,
    changeVideoQuality,
  }
}
