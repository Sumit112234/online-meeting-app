// Authentication helper functions
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth"
import { ref, set, get } from "firebase/database"
import { auth, googleProvider, database } from "./firebase"

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user

    // Store user profile in database
    await set(ref(database, `users/${user.uid}`), {
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      createdAt: Date.now(),
      lastSeen: Date.now(),
    })

    return { user, error: null }
  } catch (error) {
    console.error("Google sign-in error:", error)
    return { user: null, error: error.message }
  }
}

// Sign in with email and password
export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password)

    // Update last seen
    await set(ref(database, `users/${result.user.uid}/lastSeen`), Date.now())

    return { user: result.user, error: null }
  } catch (error) {
    console.error("Email sign-in error:", error)
    return { user: null, error: error.message }
  }
}

// Sign up with email and password
export const signUpWithEmail = async (email, password, name) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password)

    // Update profile with name
    await updateProfile(result.user, { displayName: name })

    // Store user profile in database
    await set(ref(database, `users/${result.user.uid}`), {
      uid: result.user.uid,
      name: name,
      email: email,
      photoURL: null,
      createdAt: Date.now(),
      lastSeen: Date.now(),
    })

    return { user: result.user, error: null }
  } catch (error) {
    console.error("Email sign-up error:", error)
    return { user: null, error: error.message }
  }
}

// Sign out
export const signOut = async () => {
  try {
    await firebaseSignOut(auth)
    return { error: null }
  } catch (error) {
    console.error("Sign-out error:", error)
    return { error: error.message }
  }
}

// Get user profile from database
export const getUserProfile = async (uid) => {
  try {
    const snapshot = await get(ref(database, `users/${uid}`))
    return snapshot.exists() ? snapshot.val() : null
  } catch (error) {
    console.error("Get user profile error:", error)
    return null
  }
}

// Generate guest user
export const generateGuestUser = (name) => {
  const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-red-500"]
  const color = colors[Math.floor(Math.random() * colors.length)]

  return {
    uid: guestId,
    name: name,
    email: null,
    photoURL: null,
    isGuest: true,
    avatarColor: color,
  }
}
