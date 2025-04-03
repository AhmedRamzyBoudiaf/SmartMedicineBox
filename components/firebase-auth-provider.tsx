"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { useRouter } from "next/navigation"

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
const auth = getAuth(app)

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthInitialized, setIsAuthInitialized] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // If no user is signed in and we're not on the login page, redirect to login
        if (window.location.pathname !== "/") {
          router.push("/")
        }
      } else {
        // Get the ID token to ensure Firebase is properly initialized
        try {
          await user.getIdToken(true)
        } catch (error) {
          console.error("Error refreshing token:", error)
          router.push("/")
        }
      }
      
      // Mark auth as initialized after first check
      if (!isAuthInitialized) {
        setIsAuthInitialized(true)
      }
    })

    return () => unsubscribe()
  }, [router, isAuthInitialized])

  // Don't render children until auth is initialized
  if (!isAuthInitialized) {
    return <div>Loading...</div>
  }

  return <>{children}</>
} 