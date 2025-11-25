"use client"

import { ParticipantTile } from "./participant-tile"
import { cn } from "@/lib/utils"

export function VideoGrid({ participants, localStream, remoteStreams, currentUserId, pinnedUserId, onPinUser }) {
  const allParticipants = participants || []
  const participantCount = allParticipants.length

  // Grid layout based on participant count
  const getGridClass = () => {
    if (participantCount === 1) return "grid-cols-1"
    if (participantCount === 2) return "grid-cols-2"
    if (participantCount <= 4) return "grid-cols-2"
    if (participantCount <= 6) return "grid-cols-3"
    if (participantCount <= 9) return "grid-cols-3"
    return "grid-cols-4"
  }

  const getGridRows = () => {
    if (participantCount <= 3) return "grid-rows-1"
    if (participantCount <= 6) return "grid-rows-2"
    if (participantCount <= 9) return "grid-rows-3"
    return "grid-rows-4"
  }

  // If someone is pinned, show them large with others in sidebar
  if (pinnedUserId) {
    const pinnedParticipant = allParticipants.find((p) => p.uid === pinnedUserId)
    const otherParticipants = allParticipants.filter((p) => p.uid !== pinnedUserId)

    return (
      <div className="flex gap-4 h-full">
        {/* Main pinned video */}
        <div className="flex-1">
          <ParticipantTile
            participant={pinnedParticipant}
            stream={pinnedParticipant.uid === currentUserId ? localStream : remoteStreams[pinnedParticipant.uid]}
            isLocal={pinnedParticipant.uid === currentUserId}
            isPinned={true}
            onPin={() => onPinUser(null)}
          />
        </div>

        {/* Sidebar with other participants */}
        {otherParticipants.length > 0 && (
          <div className="w-72 space-y-4 overflow-y-auto">
            {otherParticipants.map((participant) => (
              <div key={participant.uid} className="aspect-video">
                <ParticipantTile
                  participant={participant}
                  stream={participant.uid === currentUserId ? localStream : remoteStreams[participant.uid]}
                  isLocal={participant.uid === currentUserId}
                  onPin={() => onPinUser(participant.uid)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Regular grid view
  return (
    <div className={cn("grid gap-4 h-full w-full p-4 auto-rows-fr", getGridClass(), getGridRows())}>
      {allParticipants.map((participant) => (
        <ParticipantTile
          key={participant.uid}
          participant={participant}
          stream={participant.uid === currentUserId ? localStream : remoteStreams[participant.uid]}
          isLocal={participant.uid === currentUserId}
          onPin={() => onPinUser(participant.uid)}
        />
      ))}
    </div>
  )
}
