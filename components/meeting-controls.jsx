"use client"

import { Button } from "@/components/ui/button"
import { Video, VideoOff, Mic, MicOff, MonitorUp, PhoneOff, Hand, MessageSquare, Users } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function MeetingControls({
  isVideoOn,
  isMicOn,
  isPresenting,
  hasRaisedHand,
  onToggleVideo,
  onToggleMic,
  onToggleScreenShare,
  onToggleHand,
  onToggleChat,
  onToggleParticipants,
  onLeave,
  unreadMessages = 0,
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-6 flex justify-center bg-gradient-to-t from-black/80 to-transparent">
      <div className="bg-card/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-border p-4">
        <TooltipProvider>
          <div className="flex items-center gap-3">
            {/* Mic Control */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="lg"
                  variant={isMicOn ? "default" : "destructive"}
                  onClick={onToggleMic}
                  className="rounded-full h-14 w-14"
                >
                  {isMicOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isMicOn ? "Mute" : "Unmute"}</p>
              </TooltipContent>
            </Tooltip>

            {/* Video Control */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="lg"
                  variant={isVideoOn ? "default" : "destructive"}
                  onClick={onToggleVideo}
                  className="rounded-full h-14 w-14"
                >
                  {isVideoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isVideoOn ? "Turn off camera" : "Turn on camera"}</p>
              </TooltipContent>
            </Tooltip>

            {/* Screen Share */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="lg"
                  variant={isPresenting ? "secondary" : "outline"}
                  onClick={onToggleScreenShare}
                  className={cn("rounded-full h-14 w-14", isPresenting && "bg-green-600 hover:bg-green-700 text-white")}
                >
                  <MonitorUp className="h-6 w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isPresenting ? "Stop presenting" : "Present screen"}</p>
              </TooltipContent>
            </Tooltip>

            {/* Divider */}
            <div className="h-10 w-px bg-border mx-2" />

            {/* Raise Hand */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="lg"
                  variant={hasRaisedHand ? "secondary" : "outline"}
                  onClick={onToggleHand}
                  className={cn(
                    "rounded-full h-14 w-14",
                    hasRaisedHand && "bg-yellow-500 hover:bg-yellow-600 text-white",
                  )}
                >
                  <Hand className="h-6 w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{hasRaisedHand ? "Lower hand" : "Raise hand"}</p>
              </TooltipContent>
            </Tooltip>

            {/* Chat */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={onToggleChat}
                  className="rounded-full h-14 w-14 relative bg-transparent"
                >
                  <MessageSquare className="h-6 w-6" />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center">
                      {unreadMessages}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle chat</p>
              </TooltipContent>
            </Tooltip>

            {/* Participants */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={onToggleParticipants}
                  className="rounded-full h-14 w-14 bg-transparent"
                >
                  <Users className="h-6 w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View participants</p>
              </TooltipContent>
            </Tooltip>

            {/* Divider */}
            <div className="h-10 w-px bg-border mx-2" />

            {/* Leave Meeting */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={onLeave}
                  className="rounded-full h-14 w-14 bg-red-600 hover:bg-red-700"
                >
                  <PhoneOff className="h-6 w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Leave meeting</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </div>
  )
}
