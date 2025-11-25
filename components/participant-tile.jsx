"use client"

import { useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MicOff, Hand, MonitorPlay } from "lucide-react"
import { cn } from "@/lib/utils"

export function ParticipantTile({ participant, stream, isLocal = false, isPinned = false, onPin }) {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  const showVideo = participant.isVideoOn && stream

  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg",
        isPinned && "ring-4 ring-primary",
        "group cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all",
      )}
      onClick={onPin}
    >
      {/* Video or Avatar */}
      {showVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={cn("w-full h-full object-cover", isLocal && "mirror")}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Avatar className="h-20 w-20">
            <AvatarImage src={participant.photoURL || "/placeholder.svg"} alt={participant.name} />
            <AvatarFallback className={cn("text-2xl", participant.isGuest ? participant.avatarColor : "bg-primary")}>
              {participant.name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Overlay Information */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Top Right Badges */}
      <div className="absolute top-2 right-2 flex gap-2">
        {participant.isPresenting && (
          <Badge className="bg-green-600 text-white">
            <MonitorPlay className="h-3 w-3 mr-1" />
            Presenting
          </Badge>
        )}
        {participant.hasRaisedHand && (
          <Badge className="bg-yellow-500 text-white animate-pulse">
            <Hand className="h-3 w-3 mr-1" />
            Hand
          </Badge>
        )}
      </div>

      {/* Bottom Name Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium text-sm truncate">
            {participant.name}
            {isLocal && " (You)"}
          </span>
          {participant.role === "host" && (
            <Badge variant="secondary" className="text-xs">
              Host
            </Badge>
          )}
          {participant.isGuest && (
            <Badge variant="outline" className="text-xs text-white border-white/50">
              Guest
            </Badge>
          )}
        </div>
        {!participant.isMicOn && (
          <div className="bg-red-600 rounded-full p-1.5">
            <MicOff className="h-3 w-3 text-white" />
          </div>
        )}
      </div>
    </div>
  )
}
