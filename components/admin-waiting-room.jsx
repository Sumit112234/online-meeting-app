"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Check, X, Users, Video, VideoOff, Mic, MicOff } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

export function AdminWaitingRoom({ waitingUsers, onApprove, onReject }) {
  if (!waitingUsers || waitingUsers.length === 0) {
    return null
  }

  return (
    <Card className="w-full shadow-2xl">
      <CardHeader className="p-3 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <CardTitle className="text-base sm:text-lg">Waiting Room</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            {waitingUsers.length}
          </Badge>
        </div>
        <CardDescription className="text-xs sm:text-sm">Users waiting to join the meeting</CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0">
        <ScrollArea className="max-h-64 sm:max-h-96">
          <div className="space-y-2 sm:space-y-3">
            {waitingUsers.map((user) => (
              <div
                key={user.uid}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                  <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                    <AvatarImage src={user.photoURL || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback className={user.isGuest ? user.avatarColor : "bg-primary"}>
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm sm:text-base truncate">{user.name}</p>
                      {user.isGuest && (
                        <Badge variant="outline" className="text-[10px] sm:text-xs">
                          Guest
                        </Badge>
                      )}
                    </div>
                    {user.email && <p className="text-xs sm:text-sm text-muted-foreground truncate">{user.email}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      {user.cameraOn ? (
                        <Video className="h-3 w-3 text-green-600" />
                      ) : (
                        <VideoOff className="h-3 w-3 text-muted-foreground" />
                      )}
                      {user.micOn ? (
                        <Mic className="h-3 w-3 text-green-600" />
                      ) : (
                        <MicOff className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onReject(user.uid)}
                    className="text-destructive hover:text-destructive flex-1 sm:flex-none"
                  >
                    <X className="h-4 w-4 sm:mr-0" />
                    <span className="sm:hidden ml-2">Reject</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onApprove(user)}
                    className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Admit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
