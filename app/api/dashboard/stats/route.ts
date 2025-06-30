import { NextResponse } from "next/server"
import { GoogleSheetsService } from "@/lib/google-sheets"
import type { DashboardStats } from "@/types"

export async function GET() {
  try {
    const sheetsService = new GoogleSheetsService()

    // Fetch data from all sheets
    const [clients, incomeTransactions, expenses, projects] = await Promise.all([
      sheetsService.readSheet("Clients!A:E"),
      sheetsService.readSheet("Income_Transactions!A:F"),
      sheetsService.readSheet("Expenses!A:G"),
      sheetsService.readSheet("Projects!A:G"),
    ])

    // Calculate stats
    const totalClients = Math.max(0, clients.length - 1) // Subtract header row
    const totalProjects = Math.max(0, projects.length - 1)

    // Calculate total income (skip header row)
    const totalIncome = incomeTransactions.slice(1).reduce((sum, row) => {
      const amount = Number.parseFloat(row[2]) || 0
      return sum + amount
    }, 0)

    // Calculate total expenses (skip header row)
    const totalExpenses = expenses.slice(1).reduce((sum, row) => {
      const amount = Number.parseFloat(row[2]) || 0
      return sum + amount
    }, 0)

    const totalProfit = totalIncome - totalExpenses

    // Count active projects (In Progress status)
    const activeProjects = projects.slice(1).filter((row) => row[6] === "In Progress" || row[6] === "Planning").length

    const stats: DashboardStats = {
      totalClients,
      totalProjects,
      totalIncome,
      totalExpenses,
      totalProfit,
      activeProjects,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)

    // Return default stats if Google Sheets is not configured
    const defaultStats: DashboardStats = {
      totalClients: 0,
      totalProjects: 0,
      totalIncome: 0,
      totalExpenses: 0,
      totalProfit: 0,
      activeProjects: 0,
    }

    return NextResponse.json(defaultStats)
  }
}
