import { NextResponse } from "next/server"
import { ref, push, set } from "firebase/database"
import { database } from "@/lib/firebase"

export async function POST(request) {
  try {
    const { meetingId, senderId, senderName, text } = await request.json()

    if (!meetingId || !senderId || !senderName || !text) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const messageRef = push(ref(database, `meetings/${meetingId}/chatMessages`))
    await set(messageRef, {
      id: messageRef.key,
      senderId,
      senderName,
      text,
      createdAt: Date.now(),
    })

    return NextResponse.json({ success: true, messageId: messageRef.key })
  } catch (error) {
    console.error("Send chat message API error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
