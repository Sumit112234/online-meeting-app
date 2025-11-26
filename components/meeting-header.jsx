"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Copy, Video, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { formatMeetingId } from "@/lib/utils"

export function MeetingHeader({ meeting, participantCount, meetingId, isHost, onShowWaitingRoom }) {
  const { toast } = useToast()
  const [duration, setDuration] = useState("00:00")

  useEffect(() => {
    if (!meeting) return

    const startTime = meeting.createdAt
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const minutes = Math.floor(elapsed / 60000)
      const seconds = Math.floor((elapsed % 60000) / 1000)
      setDuration(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`)
    }, 1000)

    return () => clearInterval(interval)
  }, [meeting])

  const copyMeetingLink = () => {
    const link = `${window.location.origin}/meet/${meetingId}`
    navigator.clipboard.writeText(link)
    toast({
      title: "Link copied",
      description: "Meeting link copied to clipboard",
    })
  }

  return (
    <div className="absolute top-0 left-0 right-0 p-2 sm:p-3 md:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 bg-gradient-to-b from-black/80 to-transparent z-10">
      <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Video className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          <span className="text-white font-semibold text-sm sm:text-base truncate max-w-[150px] sm:max-w-none">
            {meeting?.title || "Meeting"}
          </span>
        </div>
        <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
          <Clock className="h-3 w-3 mr-1" />
          {duration}
        </Badge>
        <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs hidden sm:flex">
          {participantCount} {participantCount === 1 ? "Participant" : "Participants"}
        </Badge>
        <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs font-mono">
          {formatMeetingId(meetingId)}
        </Badge>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        {isHost && onShowWaitingRoom && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onShowWaitingRoom}
            className="bg-white/20 hover:bg-white/30 text-white border-0 text-xs sm:text-sm"
          >
            <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            <span className="hidden sm:inline">Waiting Room</span>
          </Button>
        )}

        <Button
          variant="secondary"
          size="sm"
          onClick={copyMeetingLink}
          className="bg-white/20 hover:bg-white/30 text-white border-0 text-xs sm:text-sm flex-1 sm:flex-none"
        >
          <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
          <span className="hidden sm:inline">Copy invite link</span>
          <span className="sm:hidden">Copy link</span>
        </Button>
      </div>
    </div>
  )
}
