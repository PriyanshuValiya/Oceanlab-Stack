import { type NextRequest, NextResponse } from "next/server"
import { GoogleSheetsService } from "@/lib/google-sheets"
import { generateId } from "@/lib/utils"
import type { Client } from "@/types"

export async function GET() {
  try {
    const sheetsService = new GoogleSheetsService()
    const rows = await sheetsService.readSheet("Clients!A:E")

    // Skip header row and convert to Client objects
    const clients: Client[] = rows.slice(1).map((row: any) => ({
      id: row[0] || "",
      nickname: row[1] || "",
      address: row[2] || "",
      city: row[3] || "",
      createdAt: row[4] || new Date().toISOString(),
    }))

    return NextResponse.json(clients)
  } catch (error) {
    console.error("Error fetching clients:", error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nickname, address, city } = await request.json()

    if (!nickname || !address || !city) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const client: Client = {
      id: generateId(),
      nickname,
      address,
      city,
      createdAt: new Date().toISOString(),
    }

    const sheetsService = new GoogleSheetsService()
    await sheetsService.appendSheet("Clients!A:E", [
      [client.id, client.nickname, client.address, client.city, client.createdAt],
    ])

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error("Error creating client:", error)
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 })
  }
}
