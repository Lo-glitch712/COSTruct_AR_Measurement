"use client"

import AdminDashboard from "@/components/AdminDashboard"
import BuyerHome from "@/components/BuyerHome"
import SupplierDashboard from "@/components/SupplierDashboard"
import { useSession } from "@/lib/session"

export default function HomePage() {
  const { session } = useSession()
  if (!session) return null

  if (session.role === "admin") return <AdminDashboard session={session} />
  if (session.role === "supplier") {
    return <SupplierDashboard session={session} />
  }
  return <BuyerHome session={session} />
}
