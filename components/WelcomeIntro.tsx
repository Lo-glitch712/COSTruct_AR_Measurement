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
import { markIntroSeen, readIntroSeen } from "@/lib/intro"
import { readSession, type Role } from "@/lib/session"

const ROLES: { value: Role; label: string; hint: string }[] = [
  { value: "buyer", label: "Buyer", hint: "Measure a project and estimate materials." },
  { value: "supplier", label: "Supplier", hint: "Manage a hardware catalog." },
  { value: "admin", label: "Admin", hint: "Monitor accounts, projects, and catalogs." },
]

const INTRO_STEPS = 5

export default function WelcomeIntro() {
  const router = useRouter()
  const { go, loading, overlay } = useRulerNav()
  const [ready, setReady] = useState(false)
  const [mode, setMode] = useState<"tour" | "return">("tour")
  const [step, setStep] = useState(0)
  const [gate, setGate] = useState<null | "role" | "account">(null)
  const [role, setRole] = useState<Role | null>(null)
  const [hasAccount, setHasAccount] = useState<boolean | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (readSession()) {
      router.replace("/home")
      return
    }
    if (readIntroSeen()) {
      setMode("return")
      setReady(true)
      return
    }
    const id = window.setTimeout(() => {
      setMode("tour")
      setReady(true)
    }, BRAND_LOAD_MS)
    return () => window.clearTimeout(id)
  }, [router])

  function openStart() {
    setError("")
    markIntroSeen()
    setGate("role")
  }

  function continueRole() {
    setError("")
    if (!role) {
      setError("Choose which user you are.")
      return
    }
    setGate("account")
  }

  function start() {
    setError("")
    if (!role) {
      setError("Choose which user you are.")
      setGate("role")
      return
    }
    if (hasAccount === null) {
      setError("Tell us if you already have an account.")
      return
    }
    if (role === "buyer" && hasAccount === false) {
      go("/signup", "Opening your account")
      return
    }
    go(`/login?role=${role}`, "Opening sign in")
  }

  if (!ready) return <BrandSplash />

  const lastSlide = step === INTRO_STEPS - 1

  return (
    <>
      {overlay}
      <main className="intro">
        {mode === "return" ? (
          <section className="intro-content intro-return">
            <h1 className="intro-title">COSTruct</h1>
            <p className="intro-copy">
              Measurement, cost estimation &amp; procurement
            </p>
            <div className="intro-actions">
              <button type="button" className="btn btn-primary" onClick={openStart}>
                Get started
              </button>
            </div>
          </section>
        ) : (
          <section className="intro-content">
            <div className="intake-progress" aria-hidden="true">
              {Array.from({ length: INTRO_STEPS }, (_, index) => (
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

            <div className="intro-actions">
              {step > 0 ? (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStep((current) => current - 1)}
                >
                  Back
                </button>
              ) : null}
              {lastSlide ? (
                <button type="button" className="btn btn-primary" onClick={openStart}>
                  Get started
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setStep((current) => current + 1)}
                >
                  Next
                </button>
              )}
            </div>
          </section>
        )}
      </main>

      {gate ? (
        <div
          className="logout-scrim"
          role="presentation"
          onClick={() => {
            setError("")
            setGate(null)
          }}
        >
          <div
            className="logout-dialog start-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="start-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            {gate === "role" ? (
              <>
                <h2 id="start-dialog-title" className="section-title">
                  Which user are you?
                </h2>
                <p className="muted" style={{ fontSize: 14 }}>
                  Choose how you will use COSTruct.
                </p>
                <div className="choice-row" style={{ marginTop: 14 }}>
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
                  <p className="tiny" style={{ marginTop: 10 }}>
                    {ROLES.find((item) => item.value === role)?.hint}
                  </p>
                ) : null}
                {error ? <p className="notice-error">{error}</p> : null}
                <div className="logout-dialog-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setError("")
                      setGate(null)
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={continueRole}
                  >
                    Continue
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 id="start-dialog-title" className="section-title">
                  Do you already have an account?
                </h2>
                <p className="muted" style={{ fontSize: 14 }}>
                  {role === "buyer"
                    ? "We'll send you to sign in or create a buyer account."
                    : role === "admin"
                      ? "Admin accounts are already issued. Continue to sign in."
                      : "We'll send you to sign in with your store account."}
                </p>
                <div className="choice-row" style={{ marginTop: 14 }}>
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
                  <p className="tiny" style={{ marginTop: 10 }}>
                    {role === "admin"
                      ? "Admin accounts are already issued. Continue to sign in."
                      : "Supplier accounts are already issued. Continue to sign in."}
                  </p>
                ) : null}
                {error ? <p className="notice-error">{error}</p> : null}
                <div className="logout-dialog-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setError("")
                      setGate("role")
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={start}
                    disabled={loading}
                  >
                    Continue
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </>
  )
}
