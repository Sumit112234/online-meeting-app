import { NextResponse } from "next/server"
import { ref, update } from "firebase/database"
import { database } from "@/lib/firebase"

export async function PATCH(request) {
  try {
    const { meetingId, userId, state } = await request.json()

    if (!meetingId || !userId || !state) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await update(ref(database, `meetings/${meetingId}/participants/${userId}`), state)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update participant API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
