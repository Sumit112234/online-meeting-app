"use client"

import { useState, useEffect } from "react"
import { onMeetingChange, onParticipantsChange, onWaitingRoomChange } from "@/lib/realtime"

export function useMeetingState(meetingId) {
  const [meeting, setMeeting] = useState(null)
  const [participants, setParticipants] = useState([])
  const [waitingRoom, setWaitingRoom] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!meetingId) return

    setLoading(true)

    // Listen to meeting changes
    const unsubscribeMeeting = onMeetingChange(meetingId, (data) => {
      setMeeting(data)
      setLoading(false)
    })

    // Listen to participants changes
    const unsubscribeParticipants = onParticipantsChange(meetingId, (data) => {
      setParticipants(data)
    })

    // Listen to waiting room changes
    const unsubscribeWaitingRoom = onWaitingRoomChange(meetingId, (data) => {
      setWaitingRoom(data)
    })

    return () => {
      unsubscribeMeeting()
      unsubscribeParticipants()
      unsubscribeWaitingRoom()
    }
  }, [meetingId])

  return { meeting, participants, waitingRoom, loading }
}
