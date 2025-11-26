"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LiveKitRoom, VideoConference, RoomAudioRenderer } from "@livekit/components-react"
import "@livekit/components-styles"
import { getLivekitToken } from "@/lib/livekit-config"
import { useMeetingState } from "@/hooks/use-meeting-state"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { MeetingHeader } from "./meeting-header"
import { MeetingControls } from "./meeting-controls-livekit"
import { ChatPanel } from "./chat-panel"
import { ParticipantsPanel } from "./participants-panel"
import { AdminWaitingRoom } from "./admin-waiting-room"
import { Loader2 } from "lucide-react"

export function MeetingRoom({ meetingId, currentUser }) {
  const router = useRouter()
  const { toast } = useToast()
  const { meeting, participants, waitingRoom } = useMeetingState(meetingId)

  const [token, setToken] = useState("")
  const [wsUrl, setWsUrl] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showChat, setShowChat] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [showWaitingRoom, setShowWaitingRoom] = useState(false)
  const [hasRaisedHand, setHasRaisedHand] = useState(false)

  const isHost = meeting?.hostId === currentUser?.uid

  // Fetch Livekit token
  useState(() => {
    async function fetchToken() {
      try {
        setLoading(true)
        const data = await getLivekitToken(meetingId, currentUser.name, currentUser.uid)
        setToken(data.token)
        setWsUrl(data.wsUrl)
      } catch (err) {
        console.error("[v0] Failed to get Livekit token:", err)
        setError("Failed to connect to meeting")
      } finally {
        setLoading(false)
      }
    }

    fetchToken()
  })

  const handleLeave = async () => {
    await apiClient.removeParticipant(meetingId, currentUser.uid)

    if (isHost) {
      await apiClient.updateMeetingStatus(meetingId, false)
    }

    router.push("/dashboard")
  }

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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-purple-500" />
          <p className="mt-4 text-lg text-muted-foreground">Connecting to meeting...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg text-red-500">{error}</p>
          <button
            onClick={handleLeave}
            className="mt-4 rounded-lg bg-purple-600 px-6 py-2 text-white hover:bg-purple-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={wsUrl}
      connect={true}
      video={true}
      audio={true}
      onDisconnected={handleLeave}
      className="h-screen w-full"
      options={{
        autoSubscribe: true,
        adaptiveStream: true,
        dynacast: true,
      }}
    >
      <div className="h-screen flex flex-col bg-gradient-to-br from-black via-purple-950/30 to-black dark:from-black dark:via-purple-950/50 dark:to-black relative overflow-hidden">
        <MeetingHeader
          meeting={meeting}
          participantCount={participants.length}
          meetingId={meetingId}
          onShowWaitingRoom={() => setShowWaitingRoom(!showWaitingRoom)}
          isHost={isHost}
        />

        <div className="flex-1 relative overflow-hidden flex">
          <div className="flex-1">
            <VideoConference chatMessageFormatter={(message) => message} SettingsComponent={null} />
          </div>

          {showChat && (
            <div className="w-full lg:w-96 bg-background border-l border-border">
              <ChatPanel meetingId={meetingId} currentUser={currentUser} onClose={() => setShowChat(false)} />
            </div>
          )}

          {showParticipants && (
            <div className="w-full lg:w-96 bg-background border-l border-border">
              <ParticipantsPanel
                participants={participants}
                currentUser={currentUser}
                isHost={isHost}
                onClose={() => setShowParticipants(false)}
                onRemoveParticipant={handleRemoveParticipant}
                onLowerHand={handleLowerHand}
              />
            </div>
          )}

          {isHost && showWaitingRoom && waitingRoom.length > 0 && (
            <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-30 w-full max-w-xl px-4">
              <AdminWaitingRoom waitingUsers={waitingRoom} onApprove={handleApprove} onReject={handleReject} />
            </div>
          )}
        </div>

        <MeetingControls
          hasRaisedHand={hasRaisedHand}
          onToggleHand={handleToggleHand}
          onToggleChat={() => setShowChat(!showChat)}
          onToggleParticipants={() => setShowParticipants(!showParticipants)}
          onLeave={handleLeave}
          isHost={isHost}
        />

        <RoomAudioRenderer />
      </div>
    </LiveKitRoom>
  )
}
