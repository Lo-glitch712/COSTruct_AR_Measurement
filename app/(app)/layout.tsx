"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import TopNav from "@/components/TopNav"
import { useSession } from "@/lib/session"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { session, loaded } = useSession()

  useEffect(() => {
    if (loaded && !session) router.replace("/login")
  }, [loaded, session, router])

  if (!session) return null

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
