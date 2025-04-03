"use client"

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  getAuth,
} from "firebase/auth"
import { initializeApp } from "firebase/app"

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

// Client-side Firebase Authentication functions
export async function clientLogin(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        name: user.displayName || email.split("@")[0],
      },
    }
  } catch (error: any) {
    console.error("Login error:", error.message)
    throw new Error(error.message || "Invalid credentials")
  }
}

export async function clientSignup(name: string, email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    return {
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        name,
      },
    }
  } catch (error: any) {
    console.error("Signup error:", error.message)
    if (error.code === "auth/email-already-in-use") {
      throw new Error("Email already registered")
    }
    throw new Error(error.message || "Failed to create account")
  }
}

export async function clientLogout() {
  try {
    await signOut(auth)
    return { success: true }
  } catch (error: any) {
    console.error("Logout error:", error)
    throw error
  }
}

export async function signIn(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    console.error("Error signing in:", error)
    throw error
  }
}

export async function signUp(email: string, password: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    console.error("Error signing up:", error)
    throw error
  }
}

export async function logOut() {
  try {
    await signOut(auth)
  } catch (error) {
    console.error("Error signing out:", error)
    throw error
  }
}

