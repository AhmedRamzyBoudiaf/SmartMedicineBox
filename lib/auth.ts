"use server"

import { cookies } from "next/headers"

// Server-side session management
export async function login(formData: FormData) {
  // This function now only handles session creation after client-side authentication
  const userData = JSON.parse(formData.get("userData") as string)

  // Set a session cookie with user info
  const cookieStore = await cookies()
  cookieStore.set(
    "user-session",
    JSON.stringify({
      uid: userData.uid,
      email: userData.email,
      name: userData.name,
    }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    },
  )

  return { success: true }
}

export async function signup(formData: FormData) {
  // This function now only handles session creation after client-side signup
  const userData = JSON.parse(formData.get("userData") as string)

  // Set a session cookie with user info
  const cookieStore = await cookies()
  cookieStore.set(
    "user-session",
    JSON.stringify({
      uid: userData.uid,
      email: userData.email,
      name: userData.name,
    }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    },
  )

  return { success: true }
}

export async function logout() {
  // Clear the session cookie
  const cookieStore = await cookies()
  cookieStore.delete("user-session")
  return { success: true }
}

export async function getSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get("user-session")

  if (!session) {
    return null
  }

  return JSON.parse(session.value)
}

