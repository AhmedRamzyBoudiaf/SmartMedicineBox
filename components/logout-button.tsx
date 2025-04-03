"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { logout } from "@/lib/auth"
import { clientLogout } from "@/lib/firebase-auth-client"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    try {
      // First logout from Firebase on the client side
      await clientLogout()

      // Then clear the session on the server side
      await logout()

      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
      <LogOut className="h-4 w-4" />
      Logout
    </Button>
  )
}

