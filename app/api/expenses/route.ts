import { type NextRequest, NextResponse } from "next/server"
import { GoogleSheetsService } from "@/lib/google-sheets"
import { generateId } from "@/lib/utils"
import type { Expense } from "@/types"

export async function GET() {
  try {
    const sheetsService = new GoogleSheetsService()
    const rows = await sheetsService.readSheet("Expenses!A:G")

    // Skip header row and convert to Expense objects
    const expenses: Expense[] = rows.slice(1).map((row) => ({
      id: row[0] || "",
      category: row[1] || "",
      amount: Number.parseFloat(row[2]) || 0,
      projectId: row[3] || "",
      date: row[4] || new Date().toISOString().split("T")[0],
      description: row[5] || "",
    }))

    return NextResponse.json(expenses)
  } catch (error) {
    console.error("Error fetching expenses:", error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const { category, amount, projectId, date, description } = await request.json()

    if (!category || !amount || !description) {
      return NextResponse.json({ error: "Category, amount, and description are required" }, { status: 400 })
    }

    const expense: Expense = {
      id: generateId(),
      category,
      amount: Number.parseFloat(amount),
      projectId: projectId || "",
      date,
      description,
    }

    const sheetsService = new GoogleSheetsService()
    await sheetsService.appendSheet("Expenses!A:G", [
      [expense.id, expense.category, expense.amount, expense.projectId, expense.date, expense.description],
    ])

    return NextResponse.json(expense, { status: 201 })
  } catch (error) {
    console.error("Error creating expense:", error)
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 })
  }
}
