import { NextResponse } from "next/server"
import { ref, get } from "firebase/database"
import { database } from "@/lib/firebase"

export async function GET(request, { params }) {
  try {
    const { meetingId } = params

    const snapshot = await get(ref(database, `meetings/${meetingId}`))

    if (!snapshot.exists()) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 })
    }

    return NextResponse.json({ meeting: snapshot.val(), success: true })
  } catch (error) {
    console.error("Get meeting API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
