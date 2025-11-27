"use client"

import { useEffect, useState, useRef } from "react"
import { useParticipants, useLocalParticipant, useTracks } from "@livekit/components-react"
import { Track } from "livekit-client"
import { Mic, MicOff, Pin } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function CustomVideoGrid() {
  const participants = useParticipants()
  const { localParticipant } = useLocalParticipant()
  const [pinnedParticipant, setPinnedParticipant] = useState(null)
  const [layout, setLayout] = useState("grid") // 'grid' or 'speaker'

  // Get all tracks including screen shares
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false },
  )

  // Separate screen shares from camera tracks
  const screenShareTracks = tracks.filter((track) => track.source === Track.Source.ScreenShare)
  const cameraTracks = tracks.filter((track) => track.source === Track.Source.Camera)

  // If someone is screen sharing, switch to speaker view automatically
  useEffect(() => {
    if (screenShareTracks.length > 0 && layout === "grid") {
      setLayout("speaker")
    } else if (screenShareTracks.length === 0 && layout === "speaker") {
      setLayout("grid")
    }
  }, [screenShareTracks.length])

  const togglePin = (participant) => {
    setPinnedParticipant(pinnedParticipant?.identity === participant.identity ? null : participant)
  }

  // Determine what to show in the main area
  const mainTrack =
    screenShareTracks.length > 0
      ? screenShareTracks[0]
      : pinnedParticipant
        ? cameraTracks.find((t) => t.participant.identity === pinnedParticipant.identity)
        : null

  return (
    <div className="h-full w-full bg-gray-900 relative">
      {layout === "speaker" && mainTrack ? (
        // Speaker/Screen Share Layout
        <div className="flex flex-col h-full">
          {/* Main view - Screen share or pinned participant */}
          <div className="flex-1 relative bg-black flex items-center justify-center">
            <VideoTile track={mainTrack} isMain={true} />
          </div>

          {/* Bottom strip with other participants */}
          <div className="h-24 sm:h-32 md:h-40 bg-gray-800 border-t border-gray-700 overflow-x-auto">
            <div className="flex gap-2 p-2 h-full">
              {cameraTracks
                .filter((t) => !mainTrack || t.participant.identity !== mainTrack.participant.identity)
                .map((track) => (
                  <div key={track.participant.identity} className="relative h-full aspect-video flex-shrink-0">
                    <VideoTile track={track} isMain={false} onPin={() => togglePin(track.participant)} />
                  </div>
                ))}
            </div>
          </div>
        </div>
      ) : (
        // Grid Layout
        <div className="h-full w-full p-2 sm:p-4">
          <div
            className={cn(
              "grid gap-2 sm:gap-3 md:gap-4 h-full w-full",
              cameraTracks.length === 1 && "grid-cols-1",
              cameraTracks.length === 2 && "grid-cols-1 sm:grid-cols-2",
              cameraTracks.length === 3 && "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
              cameraTracks.length === 4 && "grid-cols-2",
              cameraTracks.length >= 5 && cameraTracks.length <= 6 && "grid-cols-2 sm:grid-cols-3",
              cameraTracks.length >= 7 && cameraTracks.length <= 9 && "grid-cols-2 sm:grid-cols-3",
              cameraTracks.length >= 10 && "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
            )}
          >
            {cameraTracks.map((track) => (
              <div key={track.participant.identity} className="relative">
                <VideoTile track={track} isMain={false} onPin={() => togglePin(track.participant)} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function VideoTile({ track, isMain, onPin }) {
  const videoRef = useRef(null)
  const participant = track.participant
  const isLocal = participant.isLocal
  const isSpeaking = participant.isSpeaking
  const isMicEnabled = participant.isMicrophoneEnabled

  useEffect(() => {
    if (videoRef.current && track.publication?.track) {
      track.publication.track.attach(videoRef.current)
    }

    return () => {
      if (track.publication?.track) {
        track.publication.track.detach()
      }
    }
  }, [track])

  const displayName = participant.name || participant.identity
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const isVideoEnabled = track.publication?.isSubscribed && !track.publication?.isMuted

  return (
    <div
      className={cn(
        "relative h-full w-full rounded-lg overflow-hidden bg-gray-800 border-2 transition-all",
        isSpeaking ? "border-green-500" : "border-transparent",
        isMain && "border-purple-500",
      )}
    >
      {/* Video or Avatar */}
      {isVideoEnabled ? (
        <video ref={videoRef} autoPlay playsInline muted={isLocal} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
          <div className="text-center">
            <div
              className={cn(
                "mx-auto rounded-full bg-white/20 flex items-center justify-center text-white font-bold",
                isMain
                  ? "h-20 w-20 sm:h-32 sm:w-32 text-3xl sm:text-5xl"
                  : "h-12 w-12 sm:h-16 sm:w-16 text-xl sm:text-2xl",
              )}
            >
              {initials}
            </div>
          </div>
        </div>
      )}

      {/* Participant Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 sm:p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isMicEnabled ? (
              <Mic className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            ) : (
              <MicOff className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
            )}
            <span className="text-xs sm:text-sm font-medium text-white truncate max-w-[120px] sm:max-w-[200px]">
              {displayName} {isLocal && "(You)"}
            </span>
          </div>

          {!isMain && onPin && (
            <Button size="icon" variant="ghost" onClick={onPin} className="h-6 w-6 sm:h-8 sm:w-8 hover:bg-white/20">
              <Pin className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </Button>
          )}
        </div>
      </div>

      {/* Speaking Indicator */}
      {isSpeaking && (
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
          <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-green-500 animate-pulse" />
        </div>
      )}
    </div>
  )
}
