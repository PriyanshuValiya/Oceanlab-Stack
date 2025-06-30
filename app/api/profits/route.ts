import { NextResponse } from "next/server"
import { GoogleSheetsService } from "@/lib/google-sheets"
import { calculateProfitMargin } from "@/lib/utils"
import type { ProjectProfit } from "@/types"

export async function GET() {
  try {
    const sheetsService = new GoogleSheetsService()

    // Fetch data from all relevant sheets
    const [projects, clients, incomeTransactions, expenses] = await Promise.all([
      sheetsService.readSheet("Projects!A:G"),
      sheetsService.readSheet("Clients!A:E"),
      sheetsService.readSheet("Income_Transactions!A:F"),
      sheetsService.readSheet("Expenses!A:G"),
    ])

    // Create lookup maps
    const clientMap = new Map()
    clients.slice(1).forEach((row) => {
      clientMap.set(row[0], row[1]) // id -> nickname
    })

    // Calculate profits for each project
    const projectProfits: ProjectProfit[] = projects.slice(1).map((projectRow) => {
      const [projectId, projectName, clientId, , , , status] = projectRow
      const clientName = clientMap.get(clientId) || "Unknown Client"

      // Calculate total income for this project
      const projectIncome = incomeTransactions
        .slice(1)
        .filter((row) => row[5] === projectId) // projectId column
        .reduce((sum, row) => sum + (Number.parseFloat(row[2]) || 0), 0)

      // Calculate total expenses for this project
      const projectExpenses = expenses
        .slice(1)
        .filter((row) => row[3] === projectId) // projectId column
        .reduce((sum, row) => sum + (Number.parseFloat(row[2]) || 0), 0)

      const profit = projectIncome - projectExpenses
      const profitMargin = calculateProfitMargin(projectIncome, projectExpenses)

      return {
        projectId,
        projectName,
        clientName,
        totalIncome: projectIncome,
        totalExpenses: projectExpenses,
        profit,
        profitMargin,
      }
    })

    // Sort by profit descending
    projectProfits.sort((a, b) => b.profit - a.profit)

    return NextResponse.json(projectProfits)
  } catch (error) {
    console.error("Error calculating profits:", error)
    return NextResponse.json([])
  }
}
