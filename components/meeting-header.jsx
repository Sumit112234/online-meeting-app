"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Copy, Video } from "lucide-react"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"

export function MeetingHeader({ meeting, participantCount, meetingId }) {
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
    <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent z-10">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5 text-white" />
          <span className="text-white font-semibold">{meeting?.title || "Meeting"}</span>
        </div>
        <Badge variant="secondary" className="bg-white/20 text-white border-0">
          <Clock className="h-3 w-3 mr-1" />
          {duration}
        </Badge>
        <Badge variant="secondary" className="bg-white/20 text-white border-0">
          {participantCount} {participantCount === 1 ? "Participant" : "Participants"}
        </Badge>
      </div>

      <Button
        variant="secondary"
        size="sm"
        onClick={copyMeetingLink}
        className="bg-white/20 hover:bg-white/30 text-white border-0"
      >
        <Copy className="h-4 w-4 mr-2" />
        Copy invite link
      </Button>
    </div>
  )
}
