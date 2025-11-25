import { NextResponse } from "next/server"
import { ref, set } from "firebase/database"
import { database } from "@/lib/firebase"

export async function POST(request) {
  try {
    const { meetingId, user, isHost = false } = await request.json()

    if (!meetingId || !user) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const participantRef = ref(database, `meetings/${meetingId}/participants/${user.uid}`)
    await set(participantRef, {
      uid: user.uid,
      name: user.name,
      email: user.email || null,
      photoURL: user.photoURL || null,
      isGuest: user.isGuest || false,
      avatarColor: user.avatarColor || "bg-purple-500",
      role: isHost ? "host" : user.isGuest ? "guest" : "member",
      joinedAt: Date.now(),
      isVideoOn: true,
      isMicOn: true,
      isPresenting: false,
      hasRaisedHand: false,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Add participant API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
