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

  const showVideo = participant?.isVideoOn && stream

  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg",
        isPinned && "ring-2 sm:ring-4 ring-primary",
        "group cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all",
        "min-h-[200px] sm:min-h-[250px]",
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
          <Avatar className="h-12 w-12 sm:h-16 sm:w-16 md:h-20 md:w-20">
            <AvatarImage src={participant?.photoURL || "/placeholder.svg"} alt={participant?.name} />
            <AvatarFallback
              className={cn(
                "text-lg sm:text-xl md:text-2xl",
                participant?.isGuest ? participant?.avatarColor : "bg-primary",
              )}
            >
              {participant?.name?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      )}

      {/* Overlay Information */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Top Right Badges */}
      <div className="absolute top-1 sm:top-2 right-1 sm:right-2 flex gap-1 sm:gap-2">
        {participant?.isPresenting && (
          <Badge className="bg-green-600 text-white text-[10px] sm:text-xs">
            <MonitorPlay className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
            <span className="hidden sm:inline">Presenting</span>
          </Badge>
        )}
        {participant?.hasRaisedHand && (
          <Badge className="bg-yellow-500 text-white animate-pulse text-[10px] sm:text-xs">
            <Hand className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
            <span className="hidden sm:inline">Hand</span>
          </Badge>
        )}
      </div>

      {/* Bottom Name Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 flex items-center justify-between">
        <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
          <span className="text-white font-medium text-xs sm:text-sm truncate">
            {participant?.name}
            {isLocal && " (You)"}
          </span>
          {participant?.role === "host" && (
            <Badge variant="secondary" className="text-[10px] sm:text-xs shrink-0">
              Host
            </Badge>
          )}
          {participant?.isGuest && (
            <Badge
              variant="outline"
              className="text-[10px] sm:text-xs text-white border-white/50 shrink-0 hidden sm:flex"
            >
              Guest
            </Badge>
          )}
        </div>
        {!participant?.isMicOn && (
          <div className="bg-red-600 rounded-full p-1 sm:p-1.5 shrink-0">
            <MicOff className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
          </div>
        )}
      </div>
    </div>
  )
}
