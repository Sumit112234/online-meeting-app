"use client"

import { useState, useEffect } from "react"
import { onChatMessagesChange, sendChatMessage } from "@/lib/realtime"

export function useChat(meetingId, currentUser) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!meetingId) return

    setLoading(true)
    const unsubscribe = onChatMessagesChange(meetingId, (chatMessages) => {
      setMessages(chatMessages)
      setLoading(false)
    })

    return unsubscribe
  }, [meetingId])

  const sendMessage = async (text) => {
    if (!currentUser || !text.trim()) return

    const { error } = await sendChatMessage(meetingId, currentUser.uid, currentUser.name, text.trim())

    return { error }
  }

  return { messages, loading, sendMessage }
}
