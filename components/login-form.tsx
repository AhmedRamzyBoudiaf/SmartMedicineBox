"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { login, signup } from "@/lib/auth"
import { clientLogin, clientSignup } from "@/lib/firebase-auth-client"
import { AuthErrorToast } from "@/components/auth-error-toast"

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      // First authenticate with Firebase on the client side
      const result = await clientLogin(email, password)

      // Then create a session on the server side
      const serverFormData = new FormData()
      serverFormData.append("userData", JSON.stringify(result.user))
      await login(serverFormData)

      router.push("/dashboard")
      router.refresh()
    } catch (error: any) {
      setError(error.message || "Invalid email or password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSignup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError("")

    const formData = new FormData(event.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("signup-email") as string
    const password = formData.get("signup-password") as string

    try {
      // First create account with Firebase on the client side
      const result = await clientSignup(name, email, password)

      // Then create a session on the server side
      const serverFormData = new FormData()
      serverFormData.append("userData", JSON.stringify(result.user))
      await signup(serverFormData)

      router.push("/dashboard")
      router.refresh()
    } catch (error: any) {
      setError(error.message || "Failed to create account. Please check your information and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="signup">Sign up</TabsTrigger>
      </TabsList>
      <TabsContent value="login">
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Enter your email and password to access your account</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="m@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              {error && <div className="p-3 mt-2 text-sm text-white bg-red-500 rounded-md">{error}</div>}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
      <TabsContent value="signup">
        <Card>
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>Enter your details to create a new account</CardDescription>
          </CardHeader>
          <form onSubmit={handleSignup}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="John Doe" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input id="signup-email" name="signup-email" type="email" placeholder="m@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input id="signup-password" name="signup-password" type="password" required minLength={6} />
                <p className="text-xs text-muted-foreground">Password must be at least 6 characters</p>
              </div>
              {error && <div className="p-3 mt-2 text-sm text-white bg-red-500 rounded-md">{error}</div>}
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </TabsContent>
      <AuthErrorToast error={error} />
    </Tabs>
  )
}

