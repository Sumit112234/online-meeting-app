import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function generateMeetingId() {
  const chars = "abcdefghijklmnopqrstuvwxyz"
  let result = ""
  for (let i = 0; i < 9; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Format meeting ID for display (xxx-xxx-xxx)
export function formatMeetingId(id) {
  if (!id || id.length !== 9) return id
  return `${id.slice(0, 3)}-${id.slice(3, 6)}-${id.slice(6, 9)}`
}
