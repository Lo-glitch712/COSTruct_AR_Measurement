"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ROLE_LABEL, clearSession, useSession } from "@/lib/session"

export default function SettingsPage() {
  const router = useRouter()
  const { session } = useSession()
  const [metric, setMetric] = useState(true)
  const [arSnap, setArSnap] = useState(true)
  const [alerts, setAlerts] = useState(false)

  function signOut() {
    clearSession()
    router.push("/")
  }

  return (
    <>
      <header>
        <span className="eyebrow">Settings</span>
        <h1 className="page-title">Preferences</h1>
        <p className="page-subtitle">
          Account details and defaults applied to new measurements and
          estimates.
        </p>
      </header>

      <section>
        <h2 className="section-title">Account</h2>
        <div className="list" style={{ marginTop: 12 }}>
          <div className="list-row">
            <span className="list-row-title">Name</span>
            <span className="list-row-value">{session?.name ?? "—"}</span>
          </div>
          <div className="list-row">
            <span className="list-row-title">Email</span>
            <span className="list-row-value">{session?.email ?? "—"}</span>
          </div>
          <div className="list-row">
            <span className="list-row-title">Account type</span>
            <span className="list-row-value">
              {session ? ROLE_LABEL[session.role] : "—"}
            </span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="section-title">Measurement</h2>
        <div className="list" style={{ marginTop: 12 }}>
          <div className="list-row">
            <span className="list-row-title">Metric units (m, m², m³)</span>
            <button
              type="button"
              className="switch"
              role="switch"
              aria-checked={metric}
              aria-label="Metric units"
              onClick={() => setMetric((value) => !value)}
            />
          </div>
          <div className="list-row">
            <span className="list-row-title">Snap to existing AR points</span>
            <button
              type="button"
              className="switch"
              role="switch"
              aria-checked={arSnap}
              aria-label="Snap to existing AR points"
              onClick={() => setArSnap((value) => !value)}
            />
          </div>
          <div className="list-row">
            <span className="list-row-title">Supplier price alerts</span>
            <button
              type="button"
              className="switch"
              role="switch"
              aria-checked={alerts}
              aria-label="Supplier price alerts"
              onClick={() => setAlerts((value) => !value)}
            />
          </div>
        </div>
      </section>

      <div>
        <button type="button" className="btn btn-secondary" onClick={signOut}>
          Sign out
        </button>
      </div>
    </>
  )
}
