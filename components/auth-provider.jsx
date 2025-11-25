"use client"

import { createContext, useContext } from "react"
import { useAuth } from "@/hooks/use-auth"

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const auth = useAuth()

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => useContext(AuthContext)
