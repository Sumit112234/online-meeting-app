"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MeetingHeader } from "./meeting-header"
import { VideoGrid } from "./video-grid"
import { MeetingControls } from "./meeting-controls"
import { ChatPanel } from "./chat-panel"
import { ParticipantsPanel } from "./participants-panel"
import { AdminWaitingRoom } from "./admin-waiting-room"
import { useWebRTC } from "@/hooks/use-webrtc"
import { useMeetingState } from "@/hooks/use-meeting-state"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export function MeetingRoom({ meetingId, currentUser }) {
  const router = useRouter()
  const { toast } = useToast()
  const { meeting, participants, waitingRoom } = useMeetingState(meetingId)

  const {
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
  } = useWebRTC(meetingId, currentUser, participants)

  const [showChat, setShowChat] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [showWaitingRoom, setShowWaitingRoom] = useState(true)
  const [pinnedUserId, setPinnedUserId] = useState(null)
  const [hasRaisedHand, setHasRaisedHand] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState(0)

  const isHost = meeting?.hostId === currentUser?.uid
  const currentParticipant = participants.find((p) => p.uid === currentUser?.uid)

  useEffect(() => {
    if (isHost && waitingRoom.length > 0) {
      setShowWaitingRoom(true)
    } else if (waitingRoom.length === 0) {
      setShowWaitingRoom(false)
    }
  }, [isHost, waitingRoom.length])

  const handleToggleHand = async () => {
    const newState = !hasRaisedHand
    setHasRaisedHand(newState)
    await apiClient.updateParticipantState(meetingId, currentUser.uid, { hasRaisedHand: newState })

    if (newState) {
      toast({
        title: "Hand raised",
        description: "The host can see your raised hand",
      })
    }
  }

  const handleToggleScreenShare = async () => {
    if (isPresenting) {
      await stopScreenShare()
    } else {
      await startScreenShare()
    }
  }

  const handleLeave = async () => {
    await leaveMeeting()
    await apiClient.removeParticipant(meetingId, currentUser.uid)

    if (isHost) {
      await apiClient.updateMeetingStatus(meetingId, false)
    }

    router.push("/dashboard")
  }

  const handleApprove = async (user) => {
    await apiClient.addParticipant(meetingId, user, false)
    await apiClient.removeFromWaitingRoom(meetingId, user.uid)
    toast({
      title: "User admitted",
      description: `${user.name} has joined the meeting`,
    })
  }

  const handleReject = async (userId) => {
    await apiClient.removeFromWaitingRoom(meetingId, userId)
    toast({
      title: "User rejected",
      description: "User was not admitted to the meeting",
    })
  }

  const handleRemoveParticipant = async (userId) => {
    await apiClient.removeParticipant(meetingId, userId)
    toast({
      title: "User removed",
      description: "User has been removed from the meeting",
    })
  }

  const handleLowerHand = async (userId) => {
    await apiClient.updateParticipantState(meetingId, userId, { hasRaisedHand: false })
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-black via-purple-950/30 to-black dark:from-black dark:via-purple-950/50 dark:to-black relative overflow-hidden">
      <MeetingHeader meeting={meeting} participantCount={participants.length} meetingId={meetingId} />

      <div className="flex-1 flex relative">
        <div className={cn("flex-1 transition-all duration-300", (showChat || showParticipants) && "mr-96")}>
          <VideoGrid
            participants={participants}
            localStream={localStream}
            remoteStreams={remoteStreams}
            currentUserId={currentUser.uid}
            pinnedUserId={pinnedUserId}
            onPinUser={setPinnedUserId}
          />
        </div>

        {(showChat || showParticipants) && (
          <div className="fixed right-0 top-0 bottom-0 w-96 bg-background border-l border-border z-20 pt-16 pb-32">
            {showChat && (
              <ChatPanel meetingId={meetingId} currentUser={currentUser} onClose={() => setShowChat(false)} />
            )}
            {showParticipants && (
              <ParticipantsPanel
                participants={participants}
                currentUser={currentUser}
                isHost={isHost}
                onClose={() => setShowParticipants(false)}
                onRemoveParticipant={handleRemoveParticipant}
                onLowerHand={handleLowerHand}
              />
            )}
          </div>
        )}

        {isHost && showWaitingRoom && waitingRoom.length > 0 && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-30 w-full max-w-xl px-4">
            <AdminWaitingRoom waitingUsers={waitingRoom} onApprove={handleApprove} onReject={handleReject} />
          </div>
        )}
      </div>

      <MeetingControls
        isVideoOn={isVideoOn}
        isMicOn={isMicOn}
        isPresenting={isPresenting}
        hasRaisedHand={hasRaisedHand}
        onToggleVideo={toggleVideo}
        onToggleMic={toggleMic}
        onToggleScreenShare={handleToggleScreenShare}
        onToggleHand={handleToggleHand}
        onToggleChat={() => {
          setShowChat(!showChat)
          setShowParticipants(false)
          setUnreadMessages(0)
        }}
        onToggleParticipants={() => {
          setShowParticipants(!showParticipants)
          setShowChat(false)
        }}
        onLeave={handleLeave}
        unreadMessages={unreadMessages}
      />
    </div>
  )
}
