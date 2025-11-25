"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { X, Mic, MicOff, Video, VideoOff, Hand, Crown, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ParticipantsPanel({ participants, currentUser, isHost, onClose, onRemoveParticipant, onLowerHand }) {
  return (
    <Card className="h-full flex flex-col shadow-2xl">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Participants</CardTitle>
            <CardDescription>{participants.length} in meeting</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full p-4">
          <div className="space-y-2">
            {participants.map((participant) => {
              const isCurrentUser = participant.uid === currentUser?.uid
              const isParticipantHost = participant.role === "host"

              return (
                <div
                  key={participant.uid}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={participant.photoURL || "/placeholder.svg"} alt={participant.name} />
                      <AvatarFallback className={participant.isGuest ? participant.avatarColor : "bg-primary"}>
                        {participant.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">
                          {participant.name}
                          {isCurrentUser && " (You)"}
                        </p>
                        {isParticipantHost && <Crown className="h-3 w-3 text-yellow-500" />}
                        {participant.isGuest && (
                          <Badge variant="outline" className="text-xs">
                            Guest
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {participant.isMicOn ? (
                          <Mic className="h-3 w-3 text-green-600" />
                        ) : (
                          <MicOff className="h-3 w-3 text-muted-foreground" />
                        )}
                        {participant.isVideoOn ? (
                          <Video className="h-3 w-3 text-green-600" />
                        ) : (
                          <VideoOff className="h-3 w-3 text-muted-foreground" />
                        )}
                        {participant.hasRaisedHand && (
                          <Badge variant="secondary" className="text-xs bg-yellow-500 text-white">
                            <Hand className="h-2 w-2 mr-1" />
                            Raised hand
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Host Controls */}
                  {isHost && !isCurrentUser && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {participant.hasRaisedHand && (
                          <>
                            <DropdownMenuItem onClick={() => onLowerHand(participant.uid)}>Lower hand</DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem
                          onClick={() => onRemoveParticipant(participant.uid)}
                          className="text-destructive"
                        >
                          Remove from meeting
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
