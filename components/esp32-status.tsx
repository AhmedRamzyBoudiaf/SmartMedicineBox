"use client"

import { useEffect, useState } from "react"
import { ref, onValue, getDatabase } from "firebase/database"
import { initializeApp } from "firebase/app"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wifi, WifiOff, Clock } from "lucide-react"

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

export function ESP32Status() {
  const [isOnline, setIsOnline] = useState(false)
  const [lastSeen, setLastSeen] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const statusRef = ref(database, "esp32/status")
    const unsubscribe = onValue(statusRef, (snapshot) => {
      setIsLoading(false)
      const data = snapshot.val()
      if (data) {
        setIsOnline(data.online || false)
        setLastSeen(data.lastSeen || null)
      }
    })

    return () => unsubscribe()
  }, [])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">ESP32 Device Status</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <span className="text-sm">Connecting to device...</span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <>
                  <Wifi className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4 text-red-500" />
                  <span className="text-sm">Offline</span>
                </>
              )}
            </div>

            {lastSeen && !isOnline && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Clock className="mr-1 h-3 w-3" />
                <span>Last seen: {new Date(lastSeen).toLocaleString()}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

