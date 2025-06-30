"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { MainLayout } from "@/components/layout/main-layout"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/dashboard")
      } else {
        router.push("/login")
      }
    }
  }, [user, loading, router])

  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    </MainLayout>
  )
}
