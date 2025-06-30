import { NextResponse } from "next/server"
import { GoogleSheetsService } from "@/lib/google-sheets"
import { calculateProfitMargin } from "@/lib/utils"
import type { ProjectProfit } from "@/types"

export async function GET() {
  try {
    const sheetsService = new GoogleSheetsService()

    const [projects, clients, incomeTransactions, expenses] = await Promise.all([
      sheetsService.readSheet("Projects!A:G"),
      sheetsService.readSheet("Clients!A:E"),
      sheetsService.readSheet("Income_Transactions!A:F"),
      sheetsService.readSheet("Expenses!A:G"),
    ])

    const clientMap = new Map()
    clients.slice(1).forEach((row) => {
      clientMap.set(row[0], row[1]) // id -> nickname
    })

    const projectProfits: ProjectProfit[] = projects.slice(1).map((projectRow) => {
      const [projectId, projectName, clientId, , , , status] = projectRow
      const clientName = clientMap.get(clientId) || "Unknown Client"

      const projectIncome = incomeTransactions
        .slice(1)
        .filter((row) => row[5] === projectId) 
        .reduce((sum, row) => sum + (Number.parseFloat(row[2]) || 0), 0)

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

    projectProfits.sort((a, b) => b.profit - a.profit)

    return NextResponse.json(projectProfits)
  } catch (error) {
    console.error("Error calculating profits:", error)
    return NextResponse.json([])
  }
}
