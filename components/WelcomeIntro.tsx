"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import BrandSplash, { BRAND_LOAD_MS } from "@/components/BrandSplash"
import EstimatePreview from "@/components/EstimatePreview"
import PointMeasurePreview from "@/components/PointMeasurePreview"
import ProcurePreview from "@/components/ProcurePreview"
import TrackPreview from "@/components/TrackPreview"
import WallMeasurePreview from "@/components/WallMeasurePreview"
import { useRulerNav } from "@/components/RulerLoader"
import { readSession, type Role } from "@/lib/session"

const ROLES: { value: Role; label: string; hint: string }[] = [
  { value: "buyer", label: "Buyer", hint: "Measure a project and estimate materials." },
  { value: "supplier", label: "Supplier", hint: "Manage a hardware catalog." },
  { value: "admin", label: "Admin", hint: "Monitor buyers, stores, and projects." },
]

export default function WelcomeIntro() {
  const router = useRouter()
  const { go, loading, overlay } = useRulerNav()
  const [ready, setReady] = useState(false)
  const [step, setStep] = useState(0)
  const [role, setRole] = useState<Role | null>(null)
  const [hasAccount, setHasAccount] = useState<boolean | null>(null)
  const [error, setError] = useState("")
  const totalSteps = 6

  useEffect(() => {
    if (readSession()) {
      router.replace("/home")
      return
    }
    const id = window.setTimeout(() => setReady(true), BRAND_LOAD_MS)
    return () => window.clearTimeout(id)
  }, [router])

  function next() {
    setError("")
    setStep((current) => Math.min(current + 1, totalSteps - 1))
  }

  function start() {
    setError("")
    if (!role) {
      setError("Choose which user you are.")
      return
    }
    if (role === "buyer" && hasAccount === false) {
      go("/signup", "Opening your account")
      return
    }
    go(`/login?role=${role}`, "Opening sign in")
  }

  if (!ready) return <BrandSplash />

  return (
    <>
      {overlay}
    <main className="intro">
      <section className="intro-content">
        <div className="intake-progress" aria-hidden="true">
          {Array.from({ length: totalSteps }, (_, index) => (
            <span
              key={index}
              className="intake-dot"
              data-on={index <= step ? "true" : "false"}
            />
          ))}
        </div>

        {step === 0 ? (
          <>
            <h1 className="intro-title">Welcome to COSTruct</h1>
            <p className="intro-copy">
              Aim, tap Place, then the next corner. COSTruct draws each run and
              labels L1 and L2 the same way the AR module measures on site.
            </p>
            <PointMeasurePreview />
          </>
        ) : null}

        {step === 1 ? (
          <>
            <h1 className="intro-title">Watch a wall get measured</h1>
            <p className="intro-copy">
              COSTruct traces length and height along the wall, the same way you
              will on site.
            </p>
            <WallMeasurePreview />
          </>
        ) : null}

        {step === 2 ? (
          <>
            <h1 className="intro-title">Watch an estimate add up</h1>
            <p className="intro-copy">
              Dimensions become quantities. The chips light up the same way they
              will on the estimate — names stay plain, the amounts stand out.
            </p>
            <EstimatePreview />
          </>
        ) : null}

        {step === 3 ? (
          <>
            <h1 className="intro-title">Then pick a hardware</h1>
            <p className="intro-copy">
              COSTruct ranks stores on price, availability, and lead time, then
              marks the best match for the bill.
            </p>
            <ProcurePreview />
          </>
        ) : null}

        {step === 4 ? (
          <>
            <h1 className="intro-title">See your materials and projects</h1>
            <p className="intro-copy">
              Every bill you save stays listed. Open a project to track the
              materials you are buying — quantities, the store, and where each
              line stands.
            </p>
            <TrackPreview />
          </>
        ) : null}

        {step === 5 ? (
          <div className="intro-start">
            <h1 className="intro-title">Get started</h1>
            <p className="intro-copy">
              Tell us which user you are, and whether you already have an
              account.
            </p>

            <div className="field">
              <span className="field-label">Which user are you?</span>
              <div className="choice-row">
                {ROLES.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    className="choice-chip"
                    aria-pressed={role === item.value}
                    onClick={() => {
                      setRole(item.value)
                      setError("")
                      if (item.value !== "buyer") setHasAccount(true)
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              {role ? (
                <p className="tiny" style={{ marginTop: 8 }}>
                  {ROLES.find((item) => item.value === role)?.hint}
                </p>
              ) : null}
            </div>

            <div className="field">
              <span className="field-label">Do you already have an account?</span>
              <div className="choice-row">
                <button
                  type="button"
                  className="choice-chip"
                  aria-pressed={hasAccount === true}
                  onClick={() => {
                    setHasAccount(true)
                    setError("")
                  }}
                >
                  Yes, sign me in
                </button>
                <button
                  type="button"
                  className="choice-chip"
                  aria-pressed={hasAccount === false}
                  onClick={() => {
                    setHasAccount(false)
                    setError("")
                  }}
                >
                  No, I&apos;m new
                </button>
              </div>
              {role && role !== "buyer" && hasAccount === false ? (
                <p className="tiny" style={{ marginTop: 8 }}>
                  Supplier and admin accounts are already issued. Continue to
                  sign in.
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        {error ? <p className="notice-error">{error}</p> : null}

        <div className="intro-actions">
          {step > 0 ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setError("")
                setStep((current) => current - 1)
              }}
            >
              Back
            </button>
          ) : null}
          {step < totalSteps - 1 ? (
            <button type="button" className="btn btn-primary" onClick={next}>
              Next
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={start}
              disabled={loading}
            >
              Get started
            </button>
          )}
        </div>
      </section>
    </main>
    </>
  )
}
