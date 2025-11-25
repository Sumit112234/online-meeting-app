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
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle>Waiting Room</CardTitle>
          </div>
          <Badge variant="secondary">{waitingUsers.length}</Badge>
        </div>
        <CardDescription>Users waiting to join the meeting</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-96">
          <div className="space-y-3">
            {waitingUsers.map((user) => (
              <div
                key={user.uid}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.photoURL || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback className={user.isGuest ? user.avatarColor : "bg-primary"}>
                      {user.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{user.name}</p>
                      {user.isGuest && (
                        <Badge variant="outline" className="text-xs">
                          Guest
                        </Badge>
                      )}
                    </div>
                    {user.email && <p className="text-sm text-muted-foreground">{user.email}</p>}
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
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onReject(user.uid)}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onApprove(user)}
                    className="bg-green-600 hover:bg-green-700 text-white"
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
