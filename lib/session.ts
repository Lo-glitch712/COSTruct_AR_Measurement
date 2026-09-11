"use client"

import { useEffect, useState } from "react"

export type Role = "buyer" | "supplier"

export type Session = {
  name: string
  email: string
  role: Role
}

const STORAGE_KEY = "costruct.session"

export const ROLE_LABEL: Record<Role, string> = {
  buyer: "Buyer",
  supplier: "Supplier",
}

export function readSession(): Session | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Session
    if (parsed.role !== "buyer" && parsed.role !== "supplier") return null
    return parsed
  } catch {
    return null
  }
}

export function writeSession(session: Session) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function clearSession() {
  window.localStorage.removeItem(STORAGE_KEY)
}

export function nameFromEmail(email: string) {
  const handle = email.split("@")[0]?.replace(/[._-]+/g, " ").trim()
  if (!handle) return "COSTruct User"
  return handle
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
}

/** Reads the session on the client only, so server and first client render match. */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setSession(readSession())
    setLoaded(true)
  }, [])

  return { session, loaded }
}
