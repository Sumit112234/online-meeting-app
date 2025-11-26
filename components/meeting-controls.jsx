"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Video, VideoOff, Mic, MicOff, MonitorUp, PhoneOff, Hand, MessageSquare, Users, Settings } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function MeetingControls({
  isVideoOn,
  isMicOn,
  isPresenting,
  hasRaisedHand,
  videoQuality = "720p",
  onToggleVideo,
  onToggleMic,
  onToggleScreenShare,
  onToggleHand,
  onToggleChat,
  onToggleParticipants,
  onChangeVideoQuality,
  onLeave,
  unreadMessages = 0,
}) {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className="fixed bottom-0 left-0 right-0 p-2 sm:p-4 md:p-6 flex justify-center bg-gradient-to-t from-black/80 to-transparent z-50">
      <div className="bg-card/95 backdrop-blur-lg rounded-xl md:rounded-2xl shadow-2xl border border-border p-2 md:p-4 w-full max-w-4xl">
        <TooltipProvider>
          <div className="flex items-center justify-between gap-1 sm:gap-2 md:gap-3">
            {/* Mic Control */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="lg"
                  variant={isMicOn ? "default" : "destructive"}
                  onClick={onToggleMic}
                  className="rounded-full h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14"
                >
                  {isMicOn ? (
                    <Mic className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                  ) : (
                    <MicOff className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                  )}
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
                  className="rounded-full h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14"
                >
                  {isVideoOn ? (
                    <Video className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                  ) : (
                    <VideoOff className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                  )}
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
                  className={cn(
                    "rounded-full h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14",
                    isPresenting && "bg-green-600 hover:bg-green-700 text-white",
                  )}
                >
                  <MonitorUp className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isPresenting ? "Stop presenting" : "Present screen"}</p>
              </TooltipContent>
            </Tooltip>

            {/* Divider - hide on small screens */}
            <div className="hidden sm:block h-8 md:h-10 w-px bg-border mx-1 md:mx-2" />

            {/* Raise Hand */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="lg"
                  variant={hasRaisedHand ? "secondary" : "outline"}
                  onClick={onToggleHand}
                  className={cn(
                    "rounded-full h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14",
                    hasRaisedHand && "bg-yellow-500 hover:bg-yellow-600 text-white",
                  )}
                >
                  <Hand className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
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
                  className="rounded-full h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 relative bg-transparent"
                >
                  <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-red-600 text-white text-[10px] sm:text-xs flex items-center justify-center">
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
                  className="rounded-full h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 bg-transparent"
                >
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View participants</p>
              </TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 bg-transparent"
                >
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Video Quality</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onChangeVideoQuality?.("360p")}>
                  360p {videoQuality === "360p" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChangeVideoQuality?.("480p")}>
                  480p {videoQuality === "480p" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChangeVideoQuality?.("720p")}>
                  720p (Default) {videoQuality === "720p" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChangeVideoQuality?.("1080p")}>
                  1080p {videoQuality === "1080p" && "✓"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Divider - hide on small screens */}
            <div className="hidden sm:block h-8 md:h-10 w-px bg-border mx-1 md:mx-2" />

            {/* Leave Meeting */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="lg"
                  variant="destructive"
                  onClick={onLeave}
                  className="rounded-full h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 bg-red-600 hover:bg-red-700"
                >
                  <PhoneOff className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
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
