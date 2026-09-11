"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { nameFromEmail, writeSession, type Role } from "@/lib/session"

const ROLE_HINT: Record<Role, string> = {
  buyer:
    "Measure your site, generate material quantities and cost estimates, then send requests to suppliers.",
  supplier:
    "Publish your material catalog and pricing, and respond to buyer procurement requests.",
}

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<Role>("buyer")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!email.trim() || !password) {
      setError("Enter your email and password to continue.")
      return
    }

    writeSession({ name: nameFromEmail(email), email: email.trim(), role })
    router.push("/home")
  }

  return (
    <main className="auth">
      <div className="auth-card">
        <div className="auth-brand">COSTruct</div>
        <p className="auth-tagline">Sign in to continue to your workspace</p>

        <div className="segmented" role="tablist" aria-label="Account type">
          <button
            type="button"
            role="tab"
            className="segment"
            aria-selected={role === "buyer"}
            onClick={() => setRole("buyer")}
          >
            BUYER
          </button>
          <button
            type="button"
            role="tab"
            className="segment"
            aria-selected={role === "supplier"}
            onClick={() => setRole("supplier")}
          >
            SUPPLIER
          </button>
        </div>

        <p className="auth-role-hint">{ROLE_HINT[role]}</p>

        <form className="stack" onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span className="field-label">Email</span>
            <input
              className="input"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setError("")
              }}
            />
          </label>

          <label className="field">
            <span className="field-label">Password</span>
            <input
              className="input"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                setError("")
              }}
            />
          </label>

          {error ? <p className="notice">{error}</p> : null}

          <button type="submit" className="btn btn-primary btn-lg btn-block">
            Sign in as {role === "buyer" ? "Buyer" : "Supplier"}
          </button>
        </form>

        <div className="auth-footer">
          New to COSTruct? <Link href="/login">Create an account</Link>
          <div className="tiny" style={{ marginTop: 10 }}>
            <Link href="/">← Back</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
