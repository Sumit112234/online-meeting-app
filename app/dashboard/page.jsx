"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, Clock, Users, Copy, Plus } from "lucide-react"
import { useAuthContext } from "@/components/auth-provider"
import { apiClient } from "@/lib/api-client"
import { ref, get } from "firebase/database"
import { database } from "@/lib/firebase"
import { useToast } from "@/hooks/use-toast"

export default function DashboardPage() {
  const router = useRouter()
  const { user, profile, loading } = useAuthContext()
  const { toast } = useToast()
  const [meetings, setMeetings] = useState([])
  const [creating, setCreating] = useState(false)
  const [loadingMeetings, setLoadingMeetings] = useState(true)

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

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {user.displayName || profile?.name || "User"}</p>
            </div>
            <Button size="lg" onClick={handleNewMeeting} disabled={creating}>
              <Plus className="mr-2 h-5 w-5" />
              {creating ? "Creating..." : "New Meeting"}
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card
              className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all"
              onClick={handleNewMeeting}
            >
              <CardHeader>
                <Video className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Start Instant Meeting</CardTitle>
                <CardDescription>Begin a meeting right now</CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all"
              onClick={() => router.push("/")}
            >
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Join Meeting</CardTitle>
                <CardDescription>Enter a code to join</CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg hover:border-primary/50 transition-all">
              <CardHeader>
                <Clock className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Schedule Meeting</CardTitle>
                <CardDescription>Coming soon</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Recent Meetings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Meetings</CardTitle>
              <CardDescription>Your meeting history</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingMeetings ? (
                <p className="text-center text-muted-foreground py-8">Loading meetings...</p>
              ) : meetings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No meetings yet. Start your first meeting!</p>
              ) : (
                <div className="space-y-4">
                  {meetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 hover:border-primary/30 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <Video className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{meeting.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(meeting.createdAt).toLocaleDateString()} at{" "}
                            {new Date(meeting.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => copyMeetingLink(meeting.id)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Link
                        </Button>
                        <Button size="sm" onClick={() => router.push(`/meet/${meeting.id}`)}>
                          Rejoin
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
    </div>
  )
}
