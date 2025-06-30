"use client"

import type React from "react"

import { useAuth } from "@/components/auth-provider"
import { Sidebar } from "./sidebar"

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 lg:ml-64 overflow-auto">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
