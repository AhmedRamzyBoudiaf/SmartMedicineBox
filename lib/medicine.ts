"use server"

import { cookies } from "next/headers"
import { getRemindersFromFirebase, addReminderToFirebase, deleteReminderFromFirebase, syncWithESP32 } from "./firebase-db-client"

export interface MedicineReminder {
  id: string
  medicineName: string
  startDate: string | Date
  endDate: string | Date
  times: string[]
  pillCount: number
  instructions: string
}

export async function addMedicineReminder(reminder: Omit<MedicineReminder, "id">) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get("user-session")

    if (!session) {
      throw new Error("Not authenticated")
    }

    const user = JSON.parse(session.value)
    if (!user || !user.uid) {
      throw new Error("Invalid user session")
    }

    // Validate required fields
    if (!reminder.medicineName || !reminder.startDate || !reminder.endDate || !reminder.times || !reminder.times.length) {
      throw new Error("Missing required fields")
    }

    // Validate dates
    const startDate = new Date(reminder.startDate)
    const endDate = new Date(reminder.endDate)
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error("Invalid date format")
    }

    if (endDate < startDate) {
      throw new Error("End date must be after start date")
    }

    // Create a new reminder with a unique ID
    const newReminder: MedicineReminder = {
      ...reminder,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      id: crypto.randomUUID(),
      pillCount: Number(reminder.pillCount) || 1,
      times: Array.isArray(reminder.times) ? reminder.times : [reminder.times].filter(Boolean),
    }

    // Save to Firebase using client function
    await addReminderToFirebase(user.uid, newReminder)

    // Sync with ESP32
    await syncWithESP32(user.uid)

    return newReminder
  } catch (error) {
    console.error("Error adding medicine reminder:", error)
    throw error instanceof Error ? error : new Error("Failed to add reminder")
  }
}

export async function getMedicineReminders(): Promise<MedicineReminder[]> {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get("user-session")

    if (!session) {
      throw new Error("Not authenticated")
    }

    const user = JSON.parse(session.value)
    if (!user || !user.uid) {
      throw new Error("Invalid user session")
    }

    // Get reminders using client function
    return await getRemindersFromFirebase(user.uid)
  } catch (error) {
    console.error("Error getting medicine reminders:", error)
    throw new Error("Failed to get reminders. Please try logging out and back in.")
  }
}

export async function deleteMedicineReminder(id: string) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get("user-session")

    if (!session) {
      throw new Error("Not authenticated")
    }

    const user = JSON.parse(session.value)
    if (!user || !user.uid) {
      throw new Error("Invalid user session")
    }

    // Delete reminder using client function
    await deleteReminderFromFirebase(user.uid, id)

    // Sync with ESP32
    await syncWithESP32(user.uid)
  } catch (error) {
    console.error("Error deleting medicine reminder:", error)
    throw new Error("Failed to delete reminder")
  }
}

