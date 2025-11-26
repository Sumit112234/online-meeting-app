// WebRTC helper functions and utilities
import { ref, set, onValue, remove, push } from "firebase/database"
import { database } from "./firebase"

// STUN/TURN servers configuration
const iceServers = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
}

// Create offer and store in Firebase
export const createOffer = async (meetingId, fromUserId, toUserId, peerConnection) => {
  try {
    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)

    const offerRef = ref(database, `meetings/${meetingId}/signaling/${toUserId}/offers/${fromUserId}`)
    await set(offerRef, {
      type: offer.type,
      sdp: offer.sdp,
      from: fromUserId,
      timestamp: Date.now(),
    })

    return { error: null }
  } catch (error) {
    console.error("Create offer error:", error)
    return { error: error.message }
  }
}

// Create answer and store in Firebase
export const createAnswer = async (meetingId, fromUserId, toUserId, peerConnection) => {
  try {
    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    const answerRef = ref(database, `meetings/${meetingId}/signaling/${toUserId}/answers/${fromUserId}`)
    await set(answerRef, {
      type: answer.type,
      sdp: answer.sdp,
      from: fromUserId,
      timestamp: Date.now(),
    })

    return { error: null }
  } catch (error) {
    console.error("Create answer error:", error)
    return { error: error.message }
  }
}

// Add ICE candidate to Firebase
export const addIceCandidate = async (meetingId, fromUserId, toUserId, candidate) => {
  try {
    const candidateRef = push(ref(database, `meetings/${meetingId}/signaling/${toUserId}/iceCandidates/${fromUserId}`))
    await set(candidateRef, {
      candidate: candidate.candidate,
      sdpMLineIndex: candidate.sdpMLineIndex,
      sdpMid: candidate.sdpMid,
      from: fromUserId,
      timestamp: Date.now(),
    })
    return { error: null }
  } catch (error) {
    console.error("Add ICE candidate error:", error)
    return { error: error.message }
  }
}


export const listenForOffers = (meetingId, userId, callback) => {
  const offersRef = ref(database, `meetings/${meetingId}/signaling/${userId}/offers`)
  return onValue(offersRef, (snapshot) => {
    const data = snapshot.val()
    if (data) {
      Object.entries(data).forEach(([fromUserId, offer]) => {
        callback(fromUserId, offer)

        // ❗ IMPORTANT: remove the offer after consuming it
        remove(ref(database, `meetings/${meetingId}/signaling/${userId}/offers/${fromUserId}`))
      })
    }
  })
}

// Listen for offers
// export const listenForOffers = (meetingId, userId, callback) => {
//   const offersRef = ref(database, `meetings/${meetingId}/signaling/${userId}/offers`)
//   return onValue(offersRef, (snapshot) => {
//     const data = snapshot.val()
//     if (data) {
//       Object.entries(data).forEach(([fromUserId, offer]) => {
//         callback(fromUserId, offer)
//       })
//     }
//   })
// }



export const listenForAnswers = (meetingId, userId, callback) => {
  const answersRef = ref(database, `meetings/${meetingId}/signaling/${userId}/answers`)
  return onValue(answersRef, (snapshot) => {
    const data = snapshot.val()
    if (data) {
      Object.entries(data).forEach(([fromUserId, answer]) => {
        callback(fromUserId, answer)

        // ❗ IMPORTANT: remove answer after consuming it
        remove(ref(database, `meetings/${meetingId}/signaling/${userId}/answers/${fromUserId}`))
      })
    }
  })
}

// Listen for answers
// export const listenForAnswers = (meetingId, userId, callback) => {
//   const answersRef = ref(database, `meetings/${meetingId}/signaling/${userId}/answers`)
//   return onValue(answersRef, (snapshot) => {
//     const data = snapshot.val()
//     if (data) {
//       Object.entries(data).forEach(([fromUserId, answer]) => {
//         callback(fromUserId, answer)
//       })
//     }
//   })
// }


export const listenForIceCandidates = (meetingId, userId, callback) => {
  const candidatesRef = ref(database, `meetings/${meetingId}/signaling/${userId}/iceCandidates`)
  return onValue(candidatesRef, (snapshot) => {
    const data = snapshot.val()
    if (data) {
      Object.entries(data).forEach(([fromUserId, candidates]) => {
        Object.entries(candidates).forEach(([candidateId, candidate]) => {
          callback(fromUserId, candidate)

          // ❗ remove each candidate after processing
          remove(
            ref(
              database,
              `meetings/${meetingId}/signaling/${userId}/iceCandidates/${fromUserId}/${candidateId}`
            )
          )
        })
      })
    }
  })
}

// Listen for ICE candidates
// export const listenForIceCandidates = (meetingId, userId, callback) => {
//   const candidatesRef = ref(database, `meetings/${meetingId}/signaling/${userId}/iceCandidates`)
//   return onValue(candidatesRef, (snapshot) => {
//     const data = snapshot.val()
//     if (data) {
//       Object.entries(data).forEach(([fromUserId, candidates]) => {
//         Object.values(candidates).forEach((candidate) => {
//           callback(fromUserId, candidate)
//         })
//       })
//     }
//   })
// }

// Cleanup signaling data
export const cleanupSignaling = async (meetingId, userId) => {
  try {
    await remove(ref(database, `meetings/${meetingId}/signaling/${userId}`))
    return { error: null }
  } catch (error) {
    console.error("Cleanup signaling error:", error)
    return { error: error.message }
  }
}

// Get user media stream
export const getUserMedia = async (quality = "720p") => {
  try {
    const videoConstraints = getVideoConstraints(quality)
    const stream = await navigator.mediaDevices.getUserMedia({
      video: videoConstraints,
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    })
    return { stream, error: null }
  } catch (error) {
    console.error("Get user media error:", error)
    return { stream: null, error: error.message }
  }
}

// Get display media (screen share)
export const getDisplayMedia = async () => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
    return { stream, error: null }
  } catch (error) {
    console.error("Get display media error:", error)
    return { stream: null, error: error.message }
  }
}

// Get video quality constraints with 720p default
export const getVideoConstraints = (quality = "720p") => {
  const constraints = {
    "360p": { width: { ideal: 640 }, height: { ideal: 360 }, frameRate: { ideal: 30 } },
    "480p": { width: { ideal: 854 }, height: { ideal: 480 }, frameRate: { ideal: 30 } },
    "720p": { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
    "1080p": { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } },
  }
  return constraints[quality] || constraints["720p"]
}

export { iceServers }
