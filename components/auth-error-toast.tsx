"use client"

import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface AuthErrorToastProps {
  error: string | null
}

export function AuthErrorToast({ error }: AuthErrorToastProps) {
  const { toast } = useToast()

  useEffect(() => {
    if (error) {
      toast({
        title: "Authentication Error",
        description: error,
        variant: "destructive",
      })
    }
  }, [error, toast])

  return null
}

