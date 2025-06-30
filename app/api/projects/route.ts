import { type NextRequest, NextResponse } from "next/server"
import { GoogleSheetsService } from "@/lib/google-sheets"
import { generateId } from "@/lib/utils"
import type { Project } from "@/types"

export async function GET() {
  try {
    const sheetsService = new GoogleSheetsService()
    const rows = await sheetsService.readSheet("Projects!A:G")

    // Skip header row and convert to Project objects
    const projects: Project[] = rows.slice(1).map((row) => ({
      id: row[0] || "",
      name: row[1] || "",
      clientId: row[2] || "",
      startDate: row[3] || new Date().toISOString().split("T")[0],
      endDate: row[4] || "",
      status: row[5] || "Planning",
    }))

    return NextResponse.json(projects)
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, clientId, startDate, endDate, status } = await request.json()

    if (!name || !clientId) {
      return NextResponse.json({ error: "Name and client ID are required" }, { status: 400 })
    }

    const project: Project = {
      id: generateId(),
      name,
      clientId,
      startDate,
      endDate: endDate || "",
      status: status || "Planning",
    }

    const sheetsService = new GoogleSheetsService()
    await sheetsService.appendSheet("Projects!A:G", [
      [project.id, project.name, project.clientId, project.startDate, project.endDate, project.status],
    ])

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}
