import { NextResponse } from "next/server"
import { ref, set } from "firebase/database"
import { database } from "@/lib/firebase"

export async function POST(request) {
  try {
    const { meetingId, user, deviceStates = {} } = await request.json()

    if (!meetingId || !user) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const waitingRoomRef = ref(database, `meetings/${meetingId}/waitingRoom/${user.uid}`)
    await set(waitingRoomRef, {
      uid: user.uid,
      name: user.name,
      email: user.email || null,
      photoURL: user.photoURL || null,
      isGuest: user.isGuest || false,
      avatarColor: user.avatarColor || "bg-purple-500",
      role: user.isGuest ? "guest" : "member",
      requestedAt: Date.now(),
      cameraOn: deviceStates.cameraOn || false,
      micOn: deviceStates.micOn || false,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Join waiting room API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
