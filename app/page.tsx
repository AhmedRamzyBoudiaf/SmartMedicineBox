import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import { LoginForm } from "@/components/login-form"

export default function Home() {
  // Check if user is already logged in
  const isLoggedIn = cookies().has("user-session")

  if (isLoggedIn) {
    redirect("/dashboard")
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-green-50 to-blue-50">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-700">MedicineReminder</h1>
          <p className="text-gray-600 mt-2">Never miss your medication again</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}

