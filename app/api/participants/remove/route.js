import { NextResponse } from "next/server"
import { ref, remove } from "firebase/database"
import { database } from "@/lib/firebase"

export async function POST(request) {
  try {
    const { meetingId, userId } = await request.json()

    if (!meetingId || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await remove(ref(database, `meetings/${meetingId}/participants/${userId}`))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Remove participant API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
