import { type NextRequest, NextResponse } from "next/server"
import { GoogleSheetsService } from "@/lib/google-sheets"
import { generateId } from "@/lib/utils"
import type { IncomeTransaction } from "@/types"

export async function GET() {
  try {
    const sheetsService = new GoogleSheetsService()
    const rows = await sheetsService.readSheet("Income_Transactions!A:F")

    // Skip header row and convert to IncomeTransaction objects
    const incomeTransactions: IncomeTransaction[] = rows.slice(1).map((row: any) => ({
      id: row[0] || "",
      clientId: row[1] || "",
      amount: Number.parseFloat(row[2]) || 0,
      date: row[3] || new Date().toISOString().split("T")[0],
      description: row[4] || "",
      projectId: row[5] || "",
    }))

    return NextResponse.json(incomeTransactions)
  } catch (error) {
    console.error("Error fetching income transactions:", error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const { clientId, amount, date, description, projectId } = await request.json()

    if (!clientId || !amount || !date || !description) {
      return NextResponse.json({ error: "Client, amount, date, and description are required" }, { status: 400 })
    } else {
      console.log(clientId, amount, date, description, projectId);
    }

    const incomeTransaction: IncomeTransaction = {
      id: generateId(),
      clientId,
      amount: Number.parseFloat(amount),
      date,
      description,
      projectId: projectId || "",
    }

    const sheetsService = new GoogleSheetsService()
    await sheetsService.appendSheet("Income_Transactions!A:F", [
      [
        incomeTransaction.id,
        incomeTransaction.clientId,
        incomeTransaction.amount,
        incomeTransaction.date,
        incomeTransaction.description,
        incomeTransaction.projectId,
      ],
    ])

    return NextResponse.json(incomeTransaction, { status: 201 })
  } catch (error) {
    console.error("Error creating income transaction:", error)
    return NextResponse.json({ error: "Failed to create income transaction" }, { status: 500 })
  }
}
