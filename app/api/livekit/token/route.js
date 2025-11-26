import { NextResponse } from "next/server"
import { AccessToken } from "livekit-server-sdk"

export const revalidate = 0

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const room = searchParams.get("room")
    const username = searchParams.get("username")
    const participantId = searchParams.get("participantId")

    if (!room) {
      return NextResponse.json({ error: 'Missing "room" query parameter' }, { status: 400 })
    }

    if (!username) {
      return NextResponse.json({ error: 'Missing "username" query parameter' }, { status: 400 })
    }

    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET
    const wsUrl = process.env.LIVEKIT_URL

    if (!apiKey || !apiSecret || !wsUrl) {
      return NextResponse.json({ error: "Server misconfigured - Missing Livekit credentials" }, { status: 500 })
    }

    // Create access token
    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantId || username,
      name: username,
    })

    // Grant permissions
    at.addGrant({
      room,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    })

    const token = await at.toJwt()

    return NextResponse.json({ token, wsUrl }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    console.error("[v0] Error generating Livekit token:", error)
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 })
  }
}
