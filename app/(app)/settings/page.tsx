"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { signOutRemote } from "@/lib/auth"
import { ROLE_LABEL, useSession } from "@/lib/session"

export default function SettingsPage() {
  const router = useRouter()
  const { session, update } = useSession()
  const [phone, setPhone] = useState("")
  const [metric, setMetric] = useState(true)
  const [arEnabled, setArEnabled] = useState(false)
  const [alerts, setAlerts] = useState(false)
  const isSupplier = session?.role === "supplier"
  const isAdmin = session?.role === "admin"

  useEffect(() => {
    if (session) setPhone(session.phone)
  }, [session])

  function savePhone() {
    update({ phone: phone.trim() })
  }

  function signOut() {
    void signOutRemote().then(() => router.push("/"))
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
          {session?.firstName || session?.lastName ? (
            <>
              <div className="list-row">
                <span className="list-row-title">First name</span>
                <span className="list-row-value">{session.firstName || "—"}</span>
              </div>
              <div className="list-row">
                <span className="list-row-title">Middle name</span>
                <span className="list-row-value">
                  {session.middleName || "—"}
                </span>
              </div>
              <div className="list-row">
                <span className="list-row-title">Last name</span>
                <span className="list-row-value">{session.lastName || "—"}</span>
              </div>
            </>
          ) : null}
          {session?.birthday ? (
            <div className="list-row">
              <span className="list-row-title">Birthday</span>
              <span className="list-row-value">{session.birthday}</span>
            </div>
          ) : null}
          {session?.street || session?.city ? (
            <div className="list-row">
              <span className="list-row-title">Address</span>
              <span className="list-row-value">
                {[
                  session.street,
                  session.city,
                  session.province,
                  session.zipCode,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
          ) : null}
          <div className="list-row">
            <span className="list-row-title">Email</span>
            <span className="list-row-value">{session?.email ?? "—"}</span>
          </div>
          <div className="list-row">
            <label className="list-row-title" htmlFor="account-phone">
              Contact number
            </label>
            <input
              id="account-phone"
              className="list-row-input"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="09XX XXX XXXX"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              onBlur={savePhone}
            />
          </div>
          <div className="list-row">
            <span className="list-row-title">Account type</span>
            <span className="list-row-value">
              {session ? ROLE_LABEL[session.role] : "—"}
            </span>
          </div>
          {session?.supplierId ? (
            <div className="list-row">
              <span className="list-row-title">Hardware store</span>
              <span className="list-row-value">{session.name}</span>
            </div>
          ) : null}
        </div>
      </section>

      {isAdmin ? null : (
      <section>
        <h2 className="section-title">
          {isSupplier ? "Catalog" : "Measurement"}
        </h2>
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

          {isSupplier ? null : (
            <div className="list-row">
              <div>
                <div className="list-row-title">Show AR measurement option</div>
                <div className="tiny">
                  Experimental camera capture, off by default
                </div>
              </div>
              <button
                type="button"
                className="switch"
                role="switch"
                aria-checked={arEnabled}
                aria-label="Show AR measurement option"
                onClick={() => setArEnabled((value) => !value)}
              />
            </div>
          )}

          <div className="list-row">
            <span className="list-row-title">
              {isSupplier
                ? "Notify me of new procurement requests"
                : "Supplier price alerts"}
            </span>
            <button
              type="button"
              className="switch"
              role="switch"
              aria-checked={alerts}
              aria-label={
                isSupplier
                  ? "Notify me of new procurement requests"
                  : "Supplier price alerts"
              }
              onClick={() => setAlerts((value) => !value)}
            />
          </div>
        </div>
      </section>
      )}

      <div>
        <button type="button" className="btn btn-secondary" onClick={signOut}>
          Sign out
        </button>
      </div>
    </>
  )
}
