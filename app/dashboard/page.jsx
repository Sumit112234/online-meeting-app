"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, Clock, Users, Copy, Plus, Trash2 } from "lucide-react"
import { useAuthContext } from "@/components/auth-provider"
import { apiClient } from "@/lib/api-client"
import { ref, get } from "firebase/database"
import { database } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"
import { formatMeetingId } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function DashboardPage() {
  const router = useRouter()
  const { user, profile, loading } = useAuthContext()
  const { toast } = useToast()
  const [meetings, setMeetings] = useState([])
  const [creating, setCreating] = useState(false)
  const [loadingMeetings, setLoadingMeetings] = useState(true)
  const [deletingMeetingId, setDeletingMeetingId] = useState(null)
  const [meetingToDelete, setMeetingToDelete] = useState(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadUserMeetings()
    }
  }, [user])

  const loadUserMeetings = async () => {
    try {
      const meetingsRef = ref(database, "meetings")
      const snapshot = await get(meetingsRef)

      if (snapshot.exists()) {
        const allMeetings = snapshot.val()
        const userMeetings = Object.values(allMeetings)
          .filter((m) => m.hostId === user.uid)
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, 10)

        setMeetings(userMeetings)
      }
    } catch (error) {
      console.error("Load meetings error:", error)
    } finally {
      setLoadingMeetings(false)
    }
  }

  const handleNewMeeting = async () => {
    setCreating(true)
    const { meetingId, error } = await apiClient.createMeeting(
      user.uid,
      user.displayName || profile?.name || "Anonymous",
    )
    setCreating(false)

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      })
    } else {
      router.push(`/meet/${meetingId}`)
    }
  }

  const handleDeleteMeeting = async () => {
    if (!meetingToDelete) return

    setDeletingMeetingId(meetingToDelete.id)
    const { error } = await apiClient.deleteMeeting(meetingToDelete.id)
    setDeletingMeetingId(null)
    setMeetingToDelete(null)

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      })
    } else {
      toast({
        title: "Meeting deleted",
        description: "The meeting has been successfully deleted",
      })
      // Refresh the meetings list
      loadUserMeetings()
    }
  }

  const copyMeetingLink = (meetingId) => {
    const link = `${window.location.origin}/meet/${meetingId}`
    navigator.clipboard.writeText(link)
    toast({
      title: "Link copied",
      description: "Meeting link copied to clipboard",
    })
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Welcome back, {user.displayName || profile?.name || "User"}
              </p>
            </div>
            <Button size="lg" onClick={handleNewMeeting} disabled={creating} className="w-full sm:w-auto">
              <Plus className="mr-2 h-5 w-5" />
              {creating ? "Creating..." : "New Meeting"}
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card
              className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all"
              onClick={handleNewMeeting}
            >
              <CardHeader>
                <Video className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-2" />
                <CardTitle className="text-base sm:text-lg">Start Instant Meeting</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Begin a meeting right now</CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all"
              onClick={() => router.push("/")}
            >
              <CardHeader>
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-2" />
                <CardTitle className="text-base sm:text-lg">Join Meeting</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Enter a code to join</CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg hover:border-primary/50 transition-all sm:col-span-2 md:col-span-1">
              <CardHeader>
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-primary mb-2" />
                <CardTitle className="text-base sm:text-lg">Schedule Meeting</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Coming soon</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Recent Meetings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Recent Meetings</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Your meeting history</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingMeetings ? (
                <p className="text-center text-muted-foreground py-8 text-sm">Loading meetings...</p>
              ) : meetings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">
                  No meetings yet. Start your first meeting!
                </p>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {meetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 border border-border rounded-lg hover:bg-muted/50 hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <Video className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base truncate">{meeting.title}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            <span className="font-mono">{formatMeetingId(meeting.id)}</span>
                            {" • "}
                            {new Date(meeting.createdAt).toLocaleDateString()} at{" "}
                            {new Date(meeting.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyMeetingLink(meeting.id)}
                          className="flex-1 sm:flex-none text-xs sm:text-sm"
                        >
                          <Copy className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Copy Link</span>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => router.push(`/meet/${meeting.id}`)}
                          className="flex-1 sm:flex-none text-xs sm:text-sm"
                        >
                          Rejoin
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setMeetingToDelete(meeting)}
                          disabled={deletingMeetingId === meeting.id}
                          className="flex-none text-xs sm:text-sm"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={!!meetingToDelete} onOpenChange={() => setMeetingToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Meeting?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this meeting? This action cannot be undone and will remove all meeting
              data including chat messages and participant history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMeeting} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
