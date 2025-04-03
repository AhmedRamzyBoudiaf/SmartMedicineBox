import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get("user-session")

    if (!session) {
      return NextResponse.json({ user: null })
    }

    const user = JSON.parse(session.value)
    return NextResponse.json({ user })
  } catch (error) {
    console.error("Session error:", error)
    return NextResponse.json({ user: null })
  }
} 