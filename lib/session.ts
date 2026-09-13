"use client"

import { useCallback, useEffect, useState } from "react"

export type Role = "buyer" | "supplier" | "admin"

export type Session = {
  name: string
  email: string
  phone: string
  role: Role
  supplierId?: string
  firstName?: string
  middleName?: string
  lastName?: string
  birthday?: string
  street?: string
  city?: string
  province?: string
  zipCode?: string
}

const STORAGE_KEY = "costruct.session"

export const ROLE_LABEL: Record<Role, string> = {
  buyer: "Buyer",
  supplier: "Supplier",
  admin: "Admin",
}

export function readSession(): Session | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Session>
    if (
      parsed.role !== "buyer" &&
      parsed.role !== "supplier" &&
      parsed.role !== "admin"
    ) {
      return null
    }
    if (typeof parsed.name !== "string" || typeof parsed.email !== "string") {
      return null
    }
    return {
      name: parsed.name,
      email: parsed.email,
      phone: typeof parsed.phone === "string" ? parsed.phone : "",
      role: parsed.role,
      supplierId:
        typeof parsed.supplierId === "string" ? parsed.supplierId : undefined,
      firstName: typeof parsed.firstName === "string" ? parsed.firstName : "",
      middleName: typeof parsed.middleName === "string" ? parsed.middleName : "",
      lastName: typeof parsed.lastName === "string" ? parsed.lastName : "",
      birthday: typeof parsed.birthday === "string" ? parsed.birthday : "",
      street: typeof parsed.street === "string" ? parsed.street : "",
      city: typeof parsed.city === "string" ? parsed.city : "",
      province: typeof parsed.province === "string" ? parsed.province : "",
      zipCode: typeof parsed.zipCode === "string" ? parsed.zipCode : "",
    }
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
    let cancelled = false

    async function hydrate() {
      const local = readSession()
      if (!cancelled) setSession(local)
      try {
        const { loadProfile } = await import("@/lib/auth")
        const { supabase, supabaseEnabled } = await import("@/lib/supabase")
        if (supabaseEnabled) {
          const { data } = await supabase.auth.getUser()
          if (data.user) {
            const remote = await loadProfile(data.user.id)
            if (remote && !cancelled) {
              writeSession(remote)
              setSession(remote)
            }
          }
        }
      } catch {
        /* keep the local session if Supabase is unreachable */
      }
      if (!cancelled) setLoaded(true)
    }

    void hydrate()
    return () => {
      cancelled = true
    }
  }, [])

  const update = useCallback((patch: Partial<Session>) => {
    const current = readSession()
    if (!current) return
    const next = { ...current, ...patch }
    writeSession(next)
    setSession(next)
    void import("@/lib/auth").then(({ updateRemoteProfile }) =>
      updateRemoteProfile(next),
    )
  }, [])

  return { session, loaded, update }
}
