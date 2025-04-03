"use client"

import { ref, get, set, remove } from "firebase/database"
import { initializeApp } from "firebase/app"
import { getDatabase } from "firebase/database"
import type { MedicineReminder } from "./medicine"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBzS-xx7OP9ytioI-cjnH5C3dDA6g3ME6w",
  authDomain: "medicinereminder-f62b8.firebaseapp.com",
  databaseURL: "https://medicinereminder-f62b8-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "medicinereminder-f62b8",
  storageBucket: "medicinereminder-f62b8.firebasestorage.app",
  messagingSenderId: "642797379404",
  appId: "1:642797379404:web:37bb1085db41658e85b9e9",
  measurementId: "G-XBZVWNM9N3",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const database = getDatabase(app)

export async function getRemindersFromFirebase(userId: string): Promise<MedicineReminder[]> {
  const remindersRef = ref(database, `users/${userId}/reminders`)
  const snapshot = await get(remindersRef)

  if (!snapshot.exists()) {
    return []
  }

  return Object.values(snapshot.val())
}

export async function addReminderToFirebase(userId: string, reminder: MedicineReminder) {
  const reminderRef = ref(database, `users/${userId}/reminders/${reminder.id}`)
  await set(reminderRef, reminder)
  
  // Verify the data was saved
  const savedData = await get(reminderRef)
  if (!savedData.exists()) {
    throw new Error("Failed to save reminder to database")
  }

  return reminder
}

export async function deleteReminderFromFirebase(userId: string, reminderId: string) {
  await remove(ref(database, `users/${userId}/reminders/${reminderId}`))
}

export async function syncWithESP32(userId: string) {
  try {
    // Get all reminders for the user
    const reminders = await getRemindersFromFirebase(userId)

    // Get current date
    const now = new Date()
    const activeReminders = reminders.filter((reminder) => {
      const startDate = new Date(reminder.startDate)
      const endDate = new Date(reminder.endDate)
      return startDate <= now && endDate >= now
    })

    // Format data for ESP32
    const esp32Schedules: Record<string, any> = {}

    // Initialize with empty schedules
    for (let i = 1; i <= 3; i++) {
      esp32Schedules[`schedule${i}`] = {
        hour: "0",
        minute: "0",
        tablet1: "false",
        tablet2: "false",
        tablet3: "false",
        tablet4: "false",
      }
    }

    // Fill in active reminders (up to 3)
    activeReminders.slice(0, 3).forEach((reminder, index) => {
      if (reminder.times.length > 0) {
        const [hour, minute] = reminder.times[0].split(":")
        esp32Schedules[`schedule${index + 1}`] = {
          hour,
          minute,
          tablet1: reminder.pillCount >= 1 ? "true" : "false",
          tablet2: reminder.pillCount >= 2 ? "true" : "false",
          tablet3: reminder.pillCount >= 3 ? "true" : "false",
          tablet4: reminder.pillCount >= 4 ? "true" : "false",
        }
      }

      if (reminder.times.length > 1 && index < 2) {
        const [hour, minute] = reminder.times[1].split(":")
        esp32Schedules[`schedule${index + 2}`] = {
          hour,
          minute,
          tablet1: reminder.pillCount >= 1 ? "true" : "false",
          tablet2: reminder.pillCount >= 2 ? "true" : "false",
          tablet3: reminder.pillCount >= 3 ? "true" : "false",
          tablet4: reminder.pillCount >= 4 ? "true" : "false",
        }
      }
    })

    // Update Firebase
    await set(ref(database, "schedules"), esp32Schedules)
  } catch (error) {
    console.error("Error syncing with ESP32:", error)
    throw error
  }
} 