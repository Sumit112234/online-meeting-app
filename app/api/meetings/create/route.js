import { NextResponse } from "next/server"
import { ref, push, set } from "firebase/database"
import { database } from "@/lib/firebase"

export async function POST(request) {
  try {
    const { hostId, hostName, title = "Untitled Meeting" } = await request.json()

    if (!hostId || !hostName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const meetingRef = push(ref(database, "meetings"))
    const meetingId = meetingRef.key

    const meetingData = {
      id: meetingId,
      hostId,
      hostName,
      title,
      createdAt: Date.now(),
      isActive: true,
      settings: {
        allowGuests: true,
        chatEnabled: true,
        maxParticipants: 50,
        requireApproval: true,
      },
    }

    await set(meetingRef, meetingData)

    return NextResponse.json({ meetingId, success: true })
  } catch (error) {
    console.error("Create meeting API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
