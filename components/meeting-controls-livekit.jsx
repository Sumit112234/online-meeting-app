"use client"

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
import { useLocalParticipant } from "@livekit/components-react"
import { useState } from "react"
import { updateParticipantState } from "@/lib/realtime"

export function MeetingControlsLivekit({
  meetingId,
  participant,
  isHost,
  onLeave,
  onToggleChat,
  onToggleParticipants,
  showChat,
  showParticipants,
}) {
  const { localParticipant } = useLocalParticipant()
  const [videoQuality, setVideoQuality] = useState("720p")
  const [hasRaisedHand, setHasRaisedHand] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)

  const isMicEnabled = localParticipant?.isMicrophoneEnabled ?? false
  const isCameraEnabled = localParticipant?.isCameraEnabled ?? false

  const toggleMic = async () => {
    await localParticipant?.setMicrophoneEnabled(!isMicEnabled)
    await updateParticipantState(meetingId, participant.id, { isMicOn: !isMicEnabled })
  }

  const toggleCamera = async () => {
    await localParticipant?.setCameraEnabled(!isCameraEnabled)
    await updateParticipantState(meetingId, participant.id, { isVideoOn: !isCameraEnabled })
  }

  const toggleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        await localParticipant?.setScreenShareEnabled(false)
        setIsScreenSharing(false)
        await updateParticipantState(meetingId, participant.id, { isPresenting: false })
      } else {
        await localParticipant?.setScreenShareEnabled(true, {
          audio: true, // Include system audio
          selfBrowserSurface: "include",
          surfaceSwitching: "include",
        })
        setIsScreenSharing(true)
        await updateParticipantState(meetingId, participant.id, { isPresenting: true })
      }
    } catch (error) {
      console.error("[v0] Screen share error:", error)
      setIsScreenSharing(false)
    }
  }

  const toggleRaiseHand = async () => {
    const newState = !hasRaisedHand
    setHasRaisedHand(newState)
    await updateParticipantState(meetingId, participant.id, { hasRaisedHand: newState })
  }

  const changeVideoQuality = async (quality) => {
    setVideoQuality(quality)
    // Livekit handles quality automatically, this is for UI feedback
  }

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
                  variant={isMicEnabled ? "default" : "destructive"}
                  onClick={toggleMic}
                  className="rounded-full h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14"
                >
                  {isMicEnabled ? (
                    <Mic className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                  ) : (
                    <MicOff className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isMicEnabled ? "Mute" : "Unmute"}</p>
              </TooltipContent>
            </Tooltip>

            {/* Video Control */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="lg"
                  variant={isCameraEnabled ? "default" : "destructive"}
                  onClick={toggleCamera}
                  className="rounded-full h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14"
                >
                  {isCameraEnabled ? (
                    <Video className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                  ) : (
                    <VideoOff className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isCameraEnabled ? "Turn off camera" : "Turn on camera"}</p>
              </TooltipContent>
            </Tooltip>

            {/* Screen Share */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="lg"
                  variant={isScreenSharing ? "secondary" : "outline"}
                  onClick={toggleScreenShare}
                  className={cn(
                    "rounded-full h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14",
                    isScreenSharing && "bg-green-600 hover:bg-green-700 text-white",
                  )}
                >
                  <MonitorUp className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isScreenSharing ? "Stop presenting" : "Present screen"}</p>
              </TooltipContent>
            </Tooltip>

            <div className="hidden sm:block h-8 md:h-10 w-px bg-border mx-1 md:mx-2" />

            {/* Raise Hand */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="lg"
                  variant={hasRaisedHand ? "secondary" : "outline"}
                  onClick={toggleRaiseHand}
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
                  variant={showChat ? "secondary" : "outline"}
                  onClick={onToggleChat}
                  className="rounded-full h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14"
                >
                  <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
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
                  variant={showParticipants ? "secondary" : "outline"}
                  onClick={onToggleParticipants}
                  className="rounded-full h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14"
                >
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View participants</p>
              </TooltipContent>
            </Tooltip>

            {/* Settings */}
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
                <DropdownMenuItem onClick={() => changeVideoQuality("360p")}>
                  360p {videoQuality === "360p" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeVideoQuality("480p")}>
                  480p {videoQuality === "480p" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeVideoQuality("720p")}>
                  720p (Default) {videoQuality === "720p" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeVideoQuality("1080p")}>
                  1080p {videoQuality === "1080p" && "✓"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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

export { MeetingControlsLivekit as MeetingControls }
