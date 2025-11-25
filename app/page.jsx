"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, Users, Shield, Zap, MessageSquare, MonitorPlay } from "lucide-react"
import { useAuthContext } from "@/components/auth-provider"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

export default function HomePage() {
  const router = useRouter()
  const { user, profile } = useAuthContext()
  const { toast } = useToast()
  const [joinCode, setJoinCode] = useState("")
  const [creating, setCreating] = useState(false)

  const handleNewMeeting = async () => {
    if (!user) {
      router.push("/login")
      return
    }

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

  const handleJoinMeeting = (e) => {
    e.preventDefault()
    if (joinCode.trim()) {
      const meetingId = joinCode.includes("/meet/") ? joinCode.split("/meet/")[1] : joinCode.trim()
      router.push(`/meet/${meetingId}`)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-6 text-balance bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Premium Video Conferencing Made Simple
          </h1>
          <p className="text-xl text-muted-foreground mb-12 text-balance">
            Connect with anyone, anywhere. High-quality video meetings with advanced features for teams of all sizes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button size="lg" onClick={handleNewMeeting} disabled={creating} className="w-full sm:w-auto">
              <Video className="mr-2 h-5 w-5" />
              {creating ? "Creating..." : "New Meeting"}
            </Button>

            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="h-px w-8 bg-border" />
              <span className="text-sm">or</span>
              <div className="h-px w-8 bg-border" />
            </div>

            <form onSubmit={handleJoinMeeting} className="flex gap-2 w-full sm:w-auto">
              <Input
                placeholder="Enter meeting code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="w-full sm:w-64"
              />
              <Button type="submit" variant="outline">
                Join
              </Button>
            </form>
          </div>

          {!user && (
            <p className="text-sm text-muted-foreground">
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>{" "}
              to start a meeting or join as a guest
            </p>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <Video className="h-10 w-10 text-primary mb-2" />
                <CardTitle>HD Video & Audio</CardTitle>
                <CardDescription>
                  Crystal-clear video quality and noise-canceling audio for professional meetings
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <Users className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Waiting Room</CardTitle>
                <CardDescription>Control who joins with host approval and waiting room management</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <MonitorPlay className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Screen Sharing</CardTitle>
                <CardDescription>Share your screen for presentations, demos, and collaboration</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <MessageSquare className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Real-time Chat</CardTitle>
                <CardDescription>Send messages and share links with all participants instantly</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>Enterprise-grade security with end-to-end encryption</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <Zap className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>Low latency connections powered by WebRTC technology</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Create your first meeting in seconds. No downloads required.
          </p>
          <Button size="lg" onClick={handleNewMeeting} disabled={creating}>
            <Video className="mr-2 h-5 w-5" />
            Start a Meeting
          </Button>
        </div>
      </section>
    </div>
  )
}
