import { NextResponse } from "next/server"
import { ref, update } from "firebase/database"
import { database } from "@/lib/firebase"

export async function PATCH(request, { params }) {
  try {
    const { meetingId } = params
    const { isActive } = await request.json()

    await update(ref(database, `meetings/${meetingId}`), { isActive })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Update meeting status API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
