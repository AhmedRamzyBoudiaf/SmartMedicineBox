"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pill, Calendar, Clock, Trash2 } from "lucide-react"
import { format, parseISO } from "date-fns"
import { useRouter } from "next/navigation"
import { getRemindersFromFirebase, deleteReminderFromFirebase, syncWithESP32 } from "@/lib/firebase-db-client"
import type { MedicineReminder } from "@/lib/medicine"

export function MedicineList() {
  const router = useRouter()
  const [reminders, setReminders] = useState<MedicineReminder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadReminders() {
      try {
        // Get user session from cookie
        const response = await fetch("/api/auth/session")
        const session = await response.json()

        if (!session || !session.user) {
          throw new Error("Not authenticated")
        }

        const data = await getRemindersFromFirebase(session.user.uid)
        setReminders(data)
        setError(null)
      } catch (error) {
        console.error("Failed to load reminders:", error)
        setError("Failed to load reminders. Please try logging out and back in.")
      } finally {
        setIsLoading(false)
      }
    }

    loadReminders()
  }, [])

  async function handleDelete(id: string) {
    try {
      // Get user session from cookie
      const response = await fetch("/api/auth/session")
      const session = await response.json()

      if (!session || !session.user) {
        throw new Error("Not authenticated")
      }

      await deleteReminderFromFirebase(session.user.uid, id)
      await syncWithESP32(session.user.uid)
      setReminders(reminders.filter((reminder) => reminder.id !== id))
      router.refresh()
    } catch (error) {
      console.error("Failed to delete reminder:", error)
      setError("Failed to delete reminder. Please try again.")
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Loading reminders...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (reminders.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No reminders added yet</p>
        </CardContent>
      </Card>
    )
  }

  // Helper function to safely format dates
  const formatDate = (dateValue: string | Date) => {
    try {
      // If it's already a Date object
      if (dateValue instanceof Date) {
        return format(dateValue, "MMM d, yyyy")
      }

      // If it's an ISO string
      if (typeof dateValue === "string" && dateValue.includes("T")) {
        return format(parseISO(dateValue), "MMM d, yyyy")
      }

      // If it's a simple date string (YYYY-MM-DD)
      if (typeof dateValue === "string") {
        return format(new Date(dateValue), "MMM d, yyyy")
      }

      return "Invalid date"
    } catch (error) {
      console.error("Date formatting error:", error, dateValue)
      return "Invalid date"
    }
  }

  return (
    <div className="space-y-4">
      {reminders.map((reminder) => (
        <Card key={reminder.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-green-100 p-3 border-b">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">{reminder.medicineName}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                  onClick={() => handleDelete(reminder.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-2 text-green-600" />
                <span>
                  {formatDate(reminder.startDate)} - {formatDate(reminder.endDate)}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-green-600" />
                <span>{reminder.times.join(", ")}</span>
              </div>
              <div className="flex items-center text-sm">
                <Pill className="h-4 w-4 mr-2 text-green-600" />
                <span>
                  {reminder.pillCount} pill{reminder.pillCount > 1 ? "s" : ""} ({reminder.instructions} eating)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

