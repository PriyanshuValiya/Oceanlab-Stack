import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import type { User } from "@/types"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" },
  )
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    throw new Error("Invalid token")
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
