"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/components/auth-provider"
import { PreJoin } from "@/components/pre-join"
import { WaitingRoom } from "@/components/waiting-room"
import { MeetingRoom } from "@/components/meeting-room"
import { useMeetingState } from "@/hooks/use-meeting-state"
import { joinWaitingRoom, addParticipant } from "@/lib/realtime"
import { generateGuestUser } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function MeetingPage({ params }) {
  const unwrappedParams = use(params)
  const meetingId = unwrappedParams.meetingId
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuthContext()
  const { meeting, participants, waitingRoom, loading: meetingLoading } = useMeetingState(meetingId)
  const { toast } = useToast()

  const [currentUser, setCurrentUser] = useState(null)
  const [stage, setStage] = useState("loading") // loading, pre-join, waiting, admitted, meeting
  const [deviceStates, setDeviceStates] = useState({ cameraOn: true, micOn: true })

  // Check if user is authenticated or guest
  useEffect(() => {
    if (!authLoading) {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          name: user.displayName || profile?.name || "User",
          email: user.email,
          photoURL: user.photoURL,
          isGuest: false,
        })
      }
      // If no user, we'll handle guest flow in pre-join
    }
  }, [user, profile, authLoading])

  // Check if meeting exists
  useEffect(() => {
    const checkMeeting = async () => {
      if (!meetingLoading && !meeting) {
        toast({
          variant: "destructive",
          title: "Meeting not found",
          description: "This meeting does not exist or has ended.",
        })
        router.push("/")
      } else if (meeting && !authLoading) {
        // Check if meeting is active
        if (!meeting.isActive) {
          toast({
            variant: "destructive",
            title: "Meeting ended",
            description: "This meeting has ended.",
          })
          router.push("/")
          return
        }

        // Determine initial stage
        if (currentUser) {
          // Check if user is already a participant
          const isParticipant = participants.some((p) => p.uid === currentUser.uid)
          const isInWaitingRoom = waitingRoom.some((w) => w.uid === currentUser.uid)

          if (isParticipant) {
            setStage("meeting")
          } else if (isInWaitingRoom) {
            setStage("waiting")
          } else {
            setStage("pre-join")
          }
        } else {
          // Guest user needs to provide name
          setStage("pre-join")
        }
      }
    }

    checkMeeting()
  }, [meeting, meetingLoading, authLoading, currentUser, participants, waitingRoom, router, toast])

  // Listen for admission from waiting room
  useEffect(() => {
    if (stage === "waiting" && currentUser) {
      const isAdmitted = participants.some((p) => p.uid === currentUser.uid)
      const stillWaiting = waitingRoom.some((w) => w.uid === currentUser.uid)

      if (isAdmitted) {
        setStage("meeting")
        toast({
          title: "Admitted to meeting",
          description: "You have been admitted to the meeting",
        })
      } else if (!stillWaiting && !isAdmitted) {
        // User was rejected
        toast({
          variant: "destructive",
          title: "Entry denied",
          description: "Your request to join was denied",
        })
        router.push("/")
      }
    }
  }, [stage, currentUser, participants, waitingRoom, router, toast])

  const handleJoin = async ({ name, cameraOn, micOn }) => {
    let userToJoin = currentUser

    // If guest, generate guest user
    if (!currentUser) {
      userToJoin = generateGuestUser(name)
      setCurrentUser(userToJoin)
    }

    setDeviceStates({ cameraOn, micOn })

    // Check if user is the host
    const isHost = meeting.hostId === userToJoin.uid

    if (isHost) {
      // Host joins directly
      await addParticipant(meetingId, userToJoin, true)
      setStage("meeting")
    } else {
      // Others join waiting room
      await joinWaitingRoom(meetingId, userToJoin, { cameraOn, micOn })
      setStage("waiting")
    }
  }

  if (authLoading || meetingLoading || stage === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading meeting...</p>
        </div>
      </div>
    )
  }

  if (stage === "pre-join") {
    return <PreJoin meeting={meeting} onJoin={handleJoin} isGuest={!user} userName={currentUser?.name} />
  }

  if (stage === "waiting") {
    return <WaitingRoom userName={currentUser?.name} onDeviceChange={setDeviceStates} initialStates={deviceStates} />
  }

  if (stage === "meeting") {
    return <MeetingRoom meetingId={meetingId} currentUser={currentUser} />
  }

  return null
}
