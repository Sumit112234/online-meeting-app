// Helper functions for Firebase Realtime Database operations
import { ref, set, get, update, remove, onValue, push } from "firebase/database"
import { database } from "./firebase"

// Meeting operations
export const createMeeting = async (hostId, hostName, title = "Untitled Meeting") => {
  try {
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
    return { meetingId, error: null }
  } catch (error) {
    console.error("Create meeting error:", error)
    return { meetingId: null, error: error.message }
  }
}

export const getMeeting = async (meetingId) => {
  try {
    const snapshot = await get(ref(database, `meetings/${meetingId}`))
    if (snapshot.exists()) {
      return { meeting: snapshot.val(), error: null }
    }
    return { meeting: null, error: "Meeting not found" }
  } catch (error) {
    console.error("Get meeting error:", error)
    return { meeting: null, error: error.message }
  }
}

export const updateMeetingStatus = async (meetingId, isActive) => {
  try {
    await update(ref(database, `meetings/${meetingId}`), { isActive })
    return { error: null }
  } catch (error) {
    console.error("Update meeting status error:", error)
    return { error: error.message }
  }
}

// Waiting room operations
export const joinWaitingRoom = async (meetingId, user, deviceStates = {}) => {
  try {
    const waitingRoomRef = ref(database, `meetings/${meetingId}/waitingRoom/${user.uid}`)
    await set(waitingRoomRef, {
      uid: user.uid,
      name: user.name,
      email: user.email || null,
      photoURL: user.photoURL || null,
      isGuest: user.isGuest || false,
      avatarColor: user.avatarColor || "bg-blue-500",
      role: user.isGuest ? "guest" : "member",
      requestedAt: Date.now(),
      cameraOn: deviceStates.cameraOn || false,
      micOn: deviceStates.micOn || false,
    })
    return { error: null }
  } catch (error) {
    console.error("Join waiting room error:", error)
    return { error: error.message }
  }
}

export const removeFromWaitingRoom = async (meetingId, userId) => {
  try {
    await remove(ref(database, `meetings/${meetingId}/waitingRoom/${userId}`))
    return { error: null }
  } catch (error) {
    console.error("Remove from waiting room error:", error)
    return { error: error.message }
  }
}

// Participant operations
export const addParticipant = async (meetingId, user, isHost = false) => {
  try {
    const participantRef = ref(database, `meetings/${meetingId}/participants/${user.uid}`)
    await set(participantRef, {
      uid: user.uid,
      name: user.name,
      email: user.email || null,
      photoURL: user.photoURL || null,
      isGuest: user.isGuest || false,
      avatarColor: user.avatarColor || "bg-blue-500",
      role: isHost ? "host" : user.isGuest ? "guest" : "member",
      joinedAt: Date.now(),
      isVideoOn: true,
      isMicOn: true,
      isPresenting: false,
      hasRaisedHand: false,
    })
    return { error: null }
  } catch (error) {
    console.error("Add participant error:", error)
    return { error: error.message }
  }
}

export const removeParticipant = async (meetingId, userId) => {
  try {
    await remove(ref(database, `meetings/${meetingId}/participants/${userId}`))
    return { error: null }
  } catch (error) {
    console.error("Remove participant error:", error)
    return { error: error.message }
  }
}

export const updateParticipantState = async (meetingId, userId, state) => {
  try {
    await update(ref(database, `meetings/${meetingId}/participants/${userId}`), state)
    return { error: null }
  } catch (error) {
    console.error("Update participant state error:", error)
    return { error: error.message }
  }
}

// Real-time listeners
export const onWaitingRoomChange = (meetingId, callback) => {
  const waitingRoomRef = ref(database, `meetings/${meetingId}/waitingRoom`)
  return onValue(waitingRoomRef, (snapshot) => {
    const data = snapshot.val()
    callback(data ? Object.values(data) : [])
  })
}

export const onParticipantsChange = (meetingId, callback) => {
  const participantsRef = ref(database, `meetings/${meetingId}/participants`)
  return onValue(participantsRef, (snapshot) => {
    const data = snapshot.val()
    callback(data ? Object.values(data) : [])
  })
}

export const onMeetingChange = (meetingId, callback) => {
  const meetingRef = ref(database, `meetings/${meetingId}`)
  return onValue(meetingRef, (snapshot) => {
    callback(snapshot.val())
  })
}

// Chat operations
export const sendChatMessage = async (meetingId, senderId, senderName, text) => {
  try {
    const messageRef = push(ref(database, `meetings/${meetingId}/chatMessages`))
    await set(messageRef, {
      id: messageRef.key,
      senderId,
      senderName,
      text,
      createdAt: Date.now(),
    })
    return { error: null }
  } catch (error) {
    console.error("Send chat message error:", error)
    return { error: error.message }
  }
}

export const onChatMessagesChange = (meetingId, callback) => {
  const chatRef = ref(database, `meetings/${meetingId}/chatMessages`)
  return onValue(chatRef, (snapshot) => {
    const data = snapshot.val()
    const messages = data ? Object.values(data).sort((a, b) => a.createdAt - b.createdAt) : []
    callback(messages)
  })
}
