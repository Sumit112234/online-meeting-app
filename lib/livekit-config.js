export const LIVEKIT_CONFIG = {
  connectOptions: {
    autoSubscribe: true,
    adaptiveStream: true,
    dynacast: true,
  },
  audioPresets: {
    publishDefaults: {
      audioBitrate: 64000,
      dtx: true,
      red: true,
    },
  },
  videoPresets: {
    "360p": {
      width: 640,
      height: 360,
      frameRate: 15,
      bitrate: 400000,
    },
    "480p": {
      width: 854,
      height: 480,
      frameRate: 20,
      bitrate: 800000,
    },
    "720p": {
      width: 1280,
      height: 720,
      frameRate: 30,
      bitrate: 2500000,
    },
    "1080p": {
      width: 1920,
      height: 1080,
      frameRate: 30,
      bitrate: 4000000,
    },
  },
}

export function getVideoPreset(quality = "720p") {
  return LIVEKIT_CONFIG.videoPresets[quality] || LIVEKIT_CONFIG.videoPresets["720p"]
}

export async function getLivekitToken(roomName, username, participantId) {
  try {
    const response = await fetch(
      `/api/livekit/token?room=${encodeURIComponent(roomName)}&username=${encodeURIComponent(username)}&participantId=${encodeURIComponent(participantId)}`,
    )

    if (!response.ok) {
      throw new Error("Failed to fetch token")
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("[v0] Error fetching Livekit token:", error)
    throw error
  }
}
