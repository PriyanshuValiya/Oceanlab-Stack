import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    return NextResponse.json({
      user: {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role,
        createdAt: decoded.createdAt,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}
