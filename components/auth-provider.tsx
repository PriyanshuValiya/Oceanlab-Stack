"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@/types"

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token")
      if (token) {
        try {
          const response = await fetch("/api/auth/verify", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })

          if (response.ok) {
            const data = await response.json()
            if (data.user) {
              setUser(data.user)
            } else {
              localStorage.removeItem("token")
            }
          } else {
            localStorage.removeItem("token")
          }
        } catch (error) {
          console.error("Auth verification error:", error)
          localStorage.removeItem("token")
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Invalid credentials")
      }

      const data = await response.json()
      localStorage.setItem("token", data.token)
      setUser(data.user)
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
    window.location.href = "/login"
  }

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
