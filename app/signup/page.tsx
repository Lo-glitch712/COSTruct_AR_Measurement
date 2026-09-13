"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import DatePicker from "@/components/DatePicker"
import Icon from "@/components/Icon"
import { registerBuyer } from "@/lib/accounts"
import { signUpBuyerRemote } from "@/lib/auth"
import { EMPTY_PROFILE, type ProfileDetails } from "@/lib/profile"
import { supabaseEnabled } from "@/lib/supabase"

export default function SignupPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileDetails>(EMPTY_PROFILE)
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [pending, setPending] = useState(false)

  function set<K extends keyof ProfileDetails>(key: K, value: ProfileDetails[K]) {
    setProfile((current) => ({ ...current, [key]: value }))
    setError("")
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const digits = profile.phone.replace(/\D/g, "")
    const zip = profile.zipCode.replace(/\D/g, "")
    if (
      !profile.firstName.trim() ||
      !profile.lastName.trim() ||
      !profile.birthday ||
      !profile.street.trim() ||
      !profile.city.trim() ||
      !profile.province.trim() ||
      !profile.email.trim() ||
      !password
    ) {
      setError("Fill in all required fields.")
      return
    }
    if (zip.length < 4) {
      setError("Enter a valid ZIP code.")
      return
    }
    if (digits.length < 10 || digits.length > 13) {
      setError("Enter a valid contact number.")
      return
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    setPending(true)
    setError("")
    try {
      const payload = { ...profile, email: profile.email.trim(), password }
      if (supabaseEnabled) {
        await signUpBuyerRemote(payload)
      }
      try {
        registerBuyer(payload)
      } catch {
        // already stored locally
      }
      router.push("/login?created=1")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create account.")
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="auth">
      <div className="auth-card auth-card-wide">
        <div className="auth-brand">COSTruct</div>
        <p className="auth-tagline">Create a buyer account</p>

        <form className="stack" onSubmit={handleSubmit} noValidate>
          <h2 className="form-section-title">Personal information</h2>
          <div className="field-row field-row-3">
            <label className="field">
              <span className="field-label">First name</span>
              <input
                className="input"
                autoComplete="given-name"
                placeholder="Juan"
                value={profile.firstName}
                onChange={(event) => set("firstName", event.target.value)}
              />
            </label>
            <label className="field">
              <span className="field-label">Middle name</span>
              <input
                className="input"
                autoComplete="additional-name"
                placeholder="Santos"
                value={profile.middleName}
                onChange={(event) => set("middleName", event.target.value)}
              />
            </label>
            <label className="field">
              <span className="field-label">Last name</span>
              <input
                className="input"
                autoComplete="family-name"
                placeholder="Dela Cruz"
                value={profile.lastName}
                onChange={(event) => set("lastName", event.target.value)}
              />
            </label>
          </div>

          <label className="field">
            <span className="field-label">Birthday</span>
            <DatePicker
              id="birthday"
              value={profile.birthday}
              onChange={(next) => set("birthday", next)}
            />
          </label>

          <h2 className="form-section-title">Address</h2>
          <label className="field">
            <span className="field-label">Street</span>
            <input
              className="input"
              autoComplete="street-address"
              placeholder="House no., street, barangay"
              value={profile.street}
              onChange={(event) => set("street", event.target.value)}
            />
          </label>
          <div className="field-row">
            <label className="field">
              <span className="field-label">City</span>
              <input
                className="input"
                autoComplete="address-level2"
                placeholder="Goa"
                value={profile.city}
                onChange={(event) => set("city", event.target.value)}
              />
            </label>
            <label className="field">
              <span className="field-label">Province</span>
              <input
                className="input"
                autoComplete="address-level1"
                placeholder="Camarines Sur"
                value={profile.province}
                onChange={(event) => set("province", event.target.value)}
              />
            </label>
          </div>
          <label className="field">
            <span className="field-label">ZIP code</span>
            <input
              className="input"
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="4422"
              value={profile.zipCode}
              onChange={(event) => {
                const next = event.target.value
                if (next !== "" && !/^\d{0,4}$/.test(next)) return
                set("zipCode", next)
              }}
            />
          </label>

          <h2 className="form-section-title">Contact</h2>
          <label className="field">
            <span className="field-label">Contact number</span>
            <input
              className="input"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="09XX XXX XXXX"
              value={profile.phone}
              onChange={(event) => set("phone", event.target.value)}
            />
          </label>
          <label className="field">
            <span className="field-label">Email address</span>
            <input
              className="input"
              type="email"
              autoComplete="email"
              placeholder="you@gmail.com"
              value={profile.email}
              onChange={(event) => set("email", event.target.value)}
            />
          </label>

          <h2 className="form-section-title">Password</h2>
          <label className="field">
            <span className="field-label">Password</span>
            <input
              className="input"
              type="password"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                setError("")
              }}
            />
          </label>
          <label className="field">
            <span className="field-label">Confirm password</span>
            <input
              className="input"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat password"
              value={confirm}
              onChange={(event) => {
                setConfirm(event.target.value)
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
            {pending ? "Creating…" : "Create account"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link href="/login">Sign in</Link>
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
