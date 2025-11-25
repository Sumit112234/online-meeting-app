"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Video, VideoOff, Mic, MicOff, Loader2 } from "lucide-react"

export function WaitingRoom({ userName, onDeviceChange, initialStates = {} }) {
  const [cameraOn, setCameraOn] = useState(initialStates.cameraOn ?? true)
  const [micOn, setMicOn] = useState(initialStates.micOn ?? true)
  const [stream, setStream] = useState(null)
  const videoRef = useRef(null)

  useEffect(() => {
    // Get user media for preview
    const getMedia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: cameraOn,
          audio: micOn,
        })
        setStream(mediaStream)

        if (videoRef.current && cameraOn) {
          videoRef.current.srcObject = mediaStream
        }
      } catch (error) {
        console.error("Error accessing media devices:", error)
      }
    }

    if (cameraOn || micOn) {
      getMedia()
    }

    return () => {
      // Cleanup
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    if (stream) {
      // Update video track
      const videoTrack = stream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = cameraOn
      }

      // Update audio track
      const audioTrack = stream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = micOn
      }

      if (videoRef.current) {
        videoRef.current.srcObject = cameraOn ? stream : null
      }
    }

    // Notify parent of device state changes
    onDeviceChange?.({ cameraOn, micOn })
  }, [cameraOn, micOn, stream, onDeviceChange])

  const toggleCamera = () => setCameraOn(!cameraOn)
  const toggleMic = () => setMicOn(!micOn)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Ready to join?</CardTitle>
          <CardDescription>Someone will let you in soon. Please wait...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Video Preview */}
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
            {cameraOn ? (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                    {userName?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            <Button
              size="lg"
              variant={micOn ? "default" : "destructive"}
              onClick={toggleMic}
              className="rounded-full h-14 w-14"
            >
              {micOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
            </Button>
            <Button
              size="lg"
              variant={cameraOn ? "default" : "destructive"}
              onClick={toggleCamera}
              className="rounded-full h-14 w-14"
            >
              {cameraOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            </Button>
          </div>

          {/* Waiting Message */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p>Waiting for host approval...</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Joined as <span className="font-semibold text-foreground">{userName}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
