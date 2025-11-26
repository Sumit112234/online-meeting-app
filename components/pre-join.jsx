"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Video, VideoOff, Mic, MicOff, ArrowRight } from "lucide-react"

export function PreJoin({ meeting, onJoin, isGuest, userName: initialName }) {
  const [name, setName] = useState(initialName || "")
  const [cameraOn, setCameraOn] = useState(true)
  const [micOn, setMicOn] = useState(true)
  const [stream, setStream] = useState(null)
  const videoRef = useRef(null)

  useEffect(() => {
    const getMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 },
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        })
        setStream(mediaStream)

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      } catch (error) {
        console.error("Error accessing media devices:", error)
        setCameraOn(false)
        setMicOn(false)
      }
    }

    getMedia()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = cameraOn
      }

      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = micOn
      }
    }
  }, [cameraOn, micOn, stream])

  const toggleCamera = () => setCameraOn(!cameraOn)
  const toggleMic = () => setMicOn(!micOn)

  const handleJoin = () => {
    if (isGuest && !name.trim()) {
      return
    }
    onJoin({ name: name.trim(), cameraOn, micOn })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-black dark:via-purple-950/30 dark:to-black p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">Ready to join?</CardTitle>
          <CardDescription>Meeting: {meeting?.title || "Untitled Meeting"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6">
          {/* Name Input for Guests */}
          {isGuest && (
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          {/* Video Preview */}
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            {cameraOn && stream ? (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <Avatar className="h-16 w-16 md:h-24 md:w-24">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl md:text-3xl">
                    {(name || initialName || "U")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-3 md:gap-4">
            <Button
              size="lg"
              variant={micOn ? "default" : "destructive"}
              onClick={toggleMic}
              className="rounded-full h-12 w-12 md:h-14 md:w-14"
            >
              {micOn ? <Mic className="h-5 w-5 md:h-6 md:w-6" /> : <MicOff className="h-5 w-5 md:h-6 md:w-6" />}
            </Button>
            <Button
              size="lg"
              variant={cameraOn ? "default" : "destructive"}
              onClick={toggleCamera}
              className="rounded-full h-12 w-12 md:h-14 md:w-14"
            >
              {cameraOn ? <Video className="h-5 w-5 md:h-6 md:w-6" /> : <VideoOff className="h-5 w-5 md:h-6 md:w-6" />}
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button size="lg" className="w-full" onClick={handleJoin} disabled={isGuest && !name.trim()}>
            Join Meeting
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </CardFooter>
      </Card>

      <style jsx>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  )
}
