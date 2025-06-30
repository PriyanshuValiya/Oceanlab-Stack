"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MainLayout } from "@/components/layout/main-layout"
import { DollarSign, Users, FolderOpen, TrendingUp, Activity, Calendar } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { DashboardStats, ProjectProfit } from "@/types"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [topProjects, setTopProjects] = useState<ProjectProfit[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const fetchDashboardData = async () => {
      try {
        const [statsRes, profitsRes] = await Promise.all([fetch("/api/dashboard/stats"), fetch("/api/profits")])

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        }

        if (profitsRes.ok) {
          const profitsData = await profitsRes.json()
          setTopProjects(profitsData.slice(0, 5))
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [user, router])

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    )
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats?.totalIncome || 0),
      icon: DollarSign,
      description: "Total income from all projects",
      color: "text-green-600",
    },
    {
      title: "Total Expenses",
      value: formatCurrency(stats?.totalExpenses || 0),
      icon: TrendingUp,
      description: "All business expenses",
      color: "text-red-600",
    },
    {
      title: "Net Profit",
      value: formatCurrency(stats?.totalProfit || 0),
      icon: Activity,
      description: "Revenue minus expenses",
      color: stats?.totalProfit && stats.totalProfit >= 0 ? "text-green-600" : "text-red-600",
    },
    {
      title: "Active Clients",
      value: stats?.totalClients || 0,
      icon: Users,
      description: "Total registered clients",
      color: "text-blue-600",
    },
    {
      title: "Total Projects",
      value: stats?.totalProjects || 0,
      icon: FolderOpen,
      description: "All projects in system",
      color: "text-purple-600",
    },
    {
      title: "Active Projects",
      value: stats?.activeProjects || 0,
      icon: Calendar,
      description: "Currently running projects",
      color: "text-orange-600",
    },
  ]

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.username}! Here's your business overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Top Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Projects</CardTitle>
            <CardDescription>Projects ranked by profit margin</CardDescription>
          </CardHeader>
          <CardContent>
            {topProjects.length > 0 ? (
              <div className="space-y-4">
                {topProjects.map((project, index) => (
                  <div key={project.projectId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{project.projectName}</h3>
                      <p className="text-sm text-gray-500">{project.clientName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(project.profit)}</p>
                      <p className={`text-sm ${project.profitMargin >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {project.profitMargin.toFixed(1)}% margin
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No project data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
