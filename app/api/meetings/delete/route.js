import { NextResponse } from "next/server"
import { deleteMeeting } from "@/lib/realtime"

export async function POST(request) {
  try {
    const { meetingId } = await request.json()

    if (!meetingId) {
      return NextResponse.json({ error: "Meeting ID is required" }, { status: 400 })
    }

    const { error } = await deleteMeeting(meetingId)

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete meeting API error:", error)
    return NextResponse.json({ error: "Failed to delete meeting" }, { status: 500 })
  }
}
