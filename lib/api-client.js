// API client for making requests to our backend
export const apiClient = {
  // Meeting APIs
  async createMeeting(hostId, hostName, title = "Untitled Meeting") {
    try {
      const response = await fetch("/api/meetings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostId, hostName, title }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to create meeting")
      return { meetingId: data.meetingId, error: null }
    } catch (error) {
      console.error("Create meeting error:", error)
      return { meetingId: null, error: error.message }
    }
  },

  async getMeeting(meetingId) {
    try {
      const response = await fetch(`/api/meetings/${meetingId}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to get meeting")
      return { meeting: data.meeting, error: null }
    } catch (error) {
      console.error("Get meeting error:", error)
      return { meeting: null, error: error.message }
    }
  },

  async updateMeetingStatus(meetingId, isActive) {
    try {
      const response = await fetch(`/api/meetings/${meetingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to update meeting status")
      return { error: null }
    } catch (error) {
      console.error("Update meeting status error:", error)
      return { error: error.message }
    }
  },

  async deleteMeeting(meetingId) {
    try {
      const response = await fetch("/api/meetings/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to delete meeting")
      return { error: null }
    } catch (error) {
      console.error("Delete meeting error:", error)
      return { error: error.message }
    }
  },

  // Participant APIs
  async addParticipant(meetingId, user, isHost = false) {
    try {
      const response = await fetch("/api/participants/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId, user, isHost }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to add participant")
      return { error: null }
    } catch (error) {
      console.error("Add participant error:", error)
      return { error: error.message }
    }
  },

  async removeParticipant(meetingId, userId) {
    try {
      const response = await fetch("/api/participants/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId, userId }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to remove participant")
      return { error: null }
    } catch (error) {
      console.error("Remove participant error:", error)
      return { error: error.message }
    }
  },

  async updateParticipantState(meetingId, userId, state) {
    try {
      const response = await fetch("/api/participants/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId, userId, state }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to update participant state")
      return { error: null }
    } catch (error) {
      console.error("Update participant state error:", error)
      return { error: error.message }
    }
  },

  // Waiting Room APIs
  async joinWaitingRoom(meetingId, user, deviceStates = {}) {
    try {
      const response = await fetch("/api/waiting-room/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId, user, deviceStates }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to join waiting room")
      return { error: null }
    } catch (error) {
      console.error("Join waiting room error:", error)
      return { error: error.message }
    }
  },

  async removeFromWaitingRoom(meetingId, userId) {
    try {
      const response = await fetch("/api/waiting-room/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId, userId }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to remove from waiting room")
      return { error: null }
    } catch (error) {
      console.error("Remove from waiting room error:", error)
      return { error: error.message }
    }
  },

  // Chat APIs
  async sendChatMessage(meetingId, senderId, senderName, text) {
    try {
      const response = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId, senderId, senderName, text }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to send message")
      return { error: null, messageId: data.messageId }
    } catch (error) {
      console.error("Send chat message error:", error)
      return { error: error.message, messageId: null }
    }
  },
}
