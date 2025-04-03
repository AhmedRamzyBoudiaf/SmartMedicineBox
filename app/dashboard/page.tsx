import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { MedicineForm } from "@/components/medicine-form"
import { MedicineList } from "@/components/medicine-list"
import { LogoutButton } from "@/components/logout-button"
import { ESP32Status } from "@/components/esp32-status"

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect("/")
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 p-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-green-700">MedicineReminder</h1>
            <p className="text-gray-600">Welcome, {session.name || session.email}</p>
          </div>
          <LogoutButton />
        </div>

        <div className="mb-6">
          <ESP32Status />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Add New Reminder</h2>
            <MedicineForm />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Reminders</h2>
            <MedicineList />
          </div>
        </div>
      </div>
    </main>
  )
}

