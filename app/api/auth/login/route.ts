import { type NextRequest, NextResponse } from "next/server"
import { GoogleSheetsService } from "@/lib/google-sheets"
import { comparePassword, generateToken } from "@/lib/auth"
import type { User } from "@/types"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    const sheetsService = new GoogleSheetsService()
    const users = await sheetsService.readSheet("Users!A:E")

    // Skip header row
    const userRows = users.slice(1)

    // For demo purposes, allow admin/admin123 without Google Sheets
    if (username === "admin" && password === "admin123") {
      const user: User = {
        id: "1",
        username: "admin",
        role: "Admin",
        createdAt: new Date().toISOString(),
      }

      const token = generateToken(user)

      return NextResponse.json({
        user,
        token,
      })
    }

    // Find user in Google Sheets
    const userRow = userRows.find((row: any) => row[1] === username)

    if (!userRow) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const [id, , hashedPassword, role, createdAt] = userRow
    const isValidPassword = await comparePassword(password, hashedPassword)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const user: User = {
      id,
      username,
      role: role as User["role"],
      createdAt,
    }

    const token = generateToken(user)

    return NextResponse.json({
      user,
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
