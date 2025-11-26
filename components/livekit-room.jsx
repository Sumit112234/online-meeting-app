"use client"

import { useEffect, useState } from "react"
import { LiveKitRoom, VideoConference, RoomAudioRenderer } from "@livekit/components-react"
import "@livekit/components-styles"
import { getLivekitToken, LIVEKIT_CONFIG } from "@/lib/livekit-config"
import { Loader2 } from "lucide-react"
import { MeetingControls } from "./meeting-controls"
import { MeetingHeader } from "./meeting-header"
import { ChatPanel } from "./chat-panel"
import { ParticipantsPanel } from "./participants-panel"
import { AdminWaitingRoom } from "./admin-waiting-room"

export function LivekitRoom({ meetingId, participant, isHost, onLeave }) {
  const [token, setToken] = useState("")
  const [wsUrl, setWsUrl] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showChat, setShowChat] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [showWaitingRoom, setShowWaitingRoom] = useState(false)

  useEffect(() => {
    async function fetchToken() {
      try {
        setLoading(true)
        const data = await getLivekitToken(meetingId, participant.name, participant.id)
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
  }, [meetingId, participant.name, participant.id])

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
          <button onClick={onLeave} className="mt-4 rounded-lg bg-purple-600 px-6 py-2 text-white hover:bg-purple-700">
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
      options={LIVEKIT_CONFIG.connectOptions}
      video={true}
      audio={true}
      onDisconnected={onLeave}
      className="h-screen w-full"
    >
      <div className="relative flex h-screen flex-col bg-background">
        {/* Header */}
        <MeetingHeader
          meetingId={meetingId}
          onShowWaitingRoom={() => setShowWaitingRoom(!showWaitingRoom)}
          isHost={isHost}
        />

        {/* Main Content Area */}
        <div className="relative flex flex-1 overflow-hidden">
          {/* Video Grid */}
          <div className="flex-1">
            <VideoConference chatMessageFormatter={(message) => message} SettingsComponent={null} />
          </div>

          {/* Chat Panel */}
          {showChat && <ChatPanel meetingId={meetingId} participant={participant} onClose={() => setShowChat(false)} />}

          {/* Participants Panel */}
          {showParticipants && (
            <ParticipantsPanel
              meetingId={meetingId}
              currentUserId={participant.id}
              isHost={isHost}
              onClose={() => setShowParticipants(false)}
            />
          )}

          {/* Waiting Room Panel (Host Only) */}
          {isHost && showWaitingRoom && (
            <AdminWaitingRoom meetingId={meetingId} onClose={() => setShowWaitingRoom(false)} />
          )}
        </div>

        {/* Controls */}
        <MeetingControls
          meetingId={meetingId}
          participant={participant}
          isHost={isHost}
          onLeave={onLeave}
          onToggleChat={() => setShowChat(!showChat)}
          onToggleParticipants={() => setShowParticipants(!showParticipants)}
          showChat={showChat}
          showParticipants={showParticipants}
        />

        {/* Room Audio Renderer */}
        <RoomAudioRenderer />
      </div>
    </LiveKitRoom>
  )
}
