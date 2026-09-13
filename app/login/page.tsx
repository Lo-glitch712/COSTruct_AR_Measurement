"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Icon from "@/components/Icon"
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  SUPPLIER_PASSWORD,
  authenticate,
} from "@/lib/accounts"
import { signInRemote } from "@/lib/auth"
import { supabaseEnabled } from "@/lib/supabase"
import { writeSession, type Role } from "@/lib/session"

const ROLE_HINT: Record<Role, string> = {
  buyer:
    "Sign in with the email and password you created. New here? Create a buyer account first.",
  supplier: `Use your store Gmail and the shared password ${SUPPLIER_PASSWORD}. Example: johan.hardware@gmail.com`,
  admin: `Monitor buyers, suppliers, projects, and catalogs. ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`,
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const created = useSearchParams().get("created") === "1"
  const [role, setRole] = useState<Role>("buyer")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!email.trim() || !password) {
      setError("Enter your email and password to continue.")
      return
    }

    setPending(true)
    setError("")

    try {
      if (supabaseEnabled) {
        await signInRemote(email, password, role)
      } else {
        const account = authenticate(email, password)
        if (!account) throw new Error("Email or password is incorrect.")
        if (account.role !== role) {
          throw new Error(
            `That account is a ${account.role}. Switch the tab and try again.`,
          )
        }
        writeSession({
          name: account.name,
          email: account.email,
          phone: account.phone,
          role: account.role,
          supplierId: account.supplierId,
        })
      }
      router.push("/home")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.")
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="auth">
      <div className="auth-card">
        <div className="auth-brand">COSTruct</div>
        <p className="auth-tagline">Sign in to continue to your workspace</p>

        <div className="segmented" role="tablist" aria-label="Account type">
          {(["buyer", "supplier", "admin"] as Role[]).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              className="segment"
              aria-selected={role === value}
              onClick={() => {
                setRole(value)
                setError("")
              }}
            >
              {value.toUpperCase()}
            </button>
          ))}
        </div>

        {created ? (
          <p className="auth-role-hint">
            Account created. Sign in with your email and password.
          </p>
        ) : (
          <p className="auth-role-hint">{ROLE_HINT[role]}</p>
        )}

        <form className="stack" onSubmit={handleSubmit} noValidate>
          <label className="field">
            <span className="field-label">Email</span>
            <input
              className="input"
              type="email"
              autoComplete="email"
              placeholder={
                role === "admin"
                  ? ADMIN_EMAIL
                  : role === "supplier"
                    ? "johan.hardware@gmail.com"
                    : "you@example.com"
              }
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
              placeholder={
                role === "supplier"
                  ? SUPPLIER_PASSWORD
                  : role === "admin"
                    ? ADMIN_PASSWORD
                    : "••••••••"
              }
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                setError("")
              }}
            />
          </label>

          {error ? <p className="notice-error">{error}</p> : null}

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-block"
            disabled={pending}
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="auth-footer">
          {role === "buyer" ? (
            <>
              New buyer? <Link href="/signup">Create an account</Link>
            </>
          ) : (
            <>Supplier and admin accounts are already issued.</>
          )}
          <div className="tiny back-link" style={{ marginTop: 10 }}>
            <Link href="/">
              <Icon name="arrowLeft" size={14} />
              Back
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
