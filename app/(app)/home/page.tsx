"use client"

import BuyerHome from "@/components/BuyerHome"
import SupplierDashboard from "@/components/SupplierDashboard"
import { useSession } from "@/lib/session"

export default function HomePage() {
  const { session } = useSession()
  if (!session) return null

  return session.role === "supplier" ? (
    <SupplierDashboard session={session} />
  ) : (
    <BuyerHome session={session} />
  )
}
