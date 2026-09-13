"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import TopNav from "@/components/TopNav"
import { useSession } from "@/lib/session"

/** Measuring, projects, and browsing suppliers only apply to a buyer. */
const BUYER_ONLY = ["/measurements", "/projects", "/supplier"]

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { session, loaded } = useSession()

  const blocked =
    session != null &&
    session.role !== "buyer" &&
    BUYER_ONLY.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    )

  useEffect(() => {
    if (!loaded) return
    if (!session) router.replace("/login")
    else if (blocked) router.replace("/home")
  }, [loaded, session, blocked, router])

  if (!session || blocked) return null

  return (
    <div className="shell">
      <TopNav session={session} />
      <main className="page">
        <div className="container stack" style={{ gap: 26 }}>
          {children}
        </div>
      </main>
      <footer className="footer">
        COSTruct — Measurement, Cost Estimation & Procurement with Decision
        Support
      </footer>
    </div>
  )
}
