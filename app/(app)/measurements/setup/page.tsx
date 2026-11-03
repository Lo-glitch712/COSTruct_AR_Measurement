"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { COMPONENTS, type ComponentName } from "@/lib/estimate"
import { readWorkspace, saveWorkspace } from "@/lib/project"
import { readSession } from "@/lib/session"

const BUILD_TYPES = [
  "House / residence",
  "Extension / renovation",
  "Fence / perimeter",
  "Commercial",
  "Other",
] as const

type BuildType = (typeof BUILD_TYPES)[number]

const EMPTY_INPUT = { length: "", width: "", height: "" }

export default function MeasurementSetupPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [name, setName] = useState("")
  const [address, setAddress] = useState("")
  const [buildType, setBuildType] = useState<BuildType | "">("")
  const [notes, setNotes] = useState("")
  const [selected, setSelected] = useState<ComponentName[]>([])
  const [error, setError] = useState("")
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const workspace = readWorkspace()
    const session = readSession()
    if (workspace?.name) setName(workspace.name)
    if (workspace?.address) {
      setAddress(workspace.address)
    } else if (session) {
      const fromProfile = [
        session.street,
        session.city,
        session.province,
        session.zipCode,
      ]
        .filter(Boolean)
        .join(", ")
      if (fromProfile) setAddress(fromProfile)
    }
    if (workspace?.description) {
      const match = BUILD_TYPES.find((type) =>
        workspace.description.startsWith(type),
      )
      if (match) {
        setBuildType(match)
        setNotes(workspace.description.slice(match.length).replace(/^[:\s]+/, ""))
      } else {
        setNotes(workspace.description)
      }
    }
    if (workspace?.selected?.length) setSelected(workspace.selected)
    setReady(true)
  }, [])

  const totalSteps = 4

  function toggleComponent(name: ComponentName) {
    setSelected((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    )
  }

  function next() {
    setError("")
    if (step === 0 && !name.trim()) {
      setError("Give this project a name to continue.")
      return
    }
    if (step === 1 && !address.trim()) {
      setError("Add the site address so the estimate is tied to a location.")
      return
    }
    if (step < totalSteps - 1) {
      setStep((current) => current + 1)
      return
    }

    const description = [buildType, notes.trim()].filter(Boolean).join(": ")
    const workspace = readWorkspace()
    const inputs = { ...(workspace?.inputs ?? {}) }
    for (const component of selected) {
      if (!inputs[component]) inputs[component] = { ...EMPTY_INPUT }
    }
    saveWorkspace({
      name: name.trim(),
      address: address.trim(),
      description,
      supplierId: workspace?.supplierId ?? null,
      selected,
      inputs,
      arLocked: workspace?.arLocked ?? {},
      customComponents: workspace?.customComponents ?? [],
      hiddenComponents: workspace?.hiddenComponents ?? [],
    })
    router.push("/measurements")
  }

  if (!ready) return null

  return (
    <>
      <header>
        <span className="eyebrow">Step {step + 1} of {totalSteps}</span>
        <h1 className="page-title">A few questions before you measure</h1>
        <p className="page-subtitle">
          Fill this in so the project, site, and components are ready when you
          open the measuring tools.
        </p>
      </header>

      <div className="intake-progress" aria-hidden="true">
        {Array.from({ length: totalSteps }, (_, index) => (
          <span
            key={index}
            className="intake-dot"
            data-on={index <= step ? "true" : "false"}
          />
        ))}
      </div>

      <form
        className="card stack intake-card"
        onSubmit={(event) => {
          event.preventDefault()
          next()
        }}
      >
        {step === 0 ? (
          <label className="field">
            <span className="field-label">What should we call this project?</span>
            <input
              className="input"
              autoFocus
              placeholder="e.g. Two-storey residence in Goa"
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                setError("")
              }}
            />
          </label>
        ) : null}

        {step === 1 ? (
          <label className="field">
            <span className="field-label">Where is the construction site?</span>
            <input
              className="input"
              autoFocus
              autoComplete="street-address"
              placeholder="Street, barangay, city, province"
              value={address}
              onChange={(event) => {
                setAddress(event.target.value)
                setError("")
              }}
            />
          </label>
        ) : null}

        {step === 2 ? (
          <>
            <div className="field">
              <span className="field-label">What are you building?</span>
              <div className="choice-row">
                {BUILD_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    className="choice-chip"
                    aria-pressed={buildType === type}
                    onClick={() =>
                      setBuildType((current) => (current === type ? "" : type))
                    }
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <label className="field">
              <span className="field-label">Anything else we should know? (optional)</span>
              <textarea
                className="input input-area"
                rows={3}
                placeholder="Scope, number of floors, or site notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </label>
          </>
        ) : null}

        {step === 3 ? (
          <div className="field">
            <span className="field-label">What do you want to measure first?</span>
            <p className="tiny" style={{ marginBottom: 12 }}>
              Pick one or more. You can add the rest later.
            </p>
            <div className="choice-row">
              {COMPONENTS.map((component) => (
                <button
                  key={component.name}
                  type="button"
                  className="choice-chip"
                  aria-pressed={selected.includes(component.name)}
                  onClick={() => toggleComponent(component.name)}
                >
                  {component.name}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {error ? <p className="notice-error">{error}</p> : null}

        <div className="intake-actions">
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
          <button type="submit" className="btn btn-primary">
            {step === totalSteps - 1 ? "Start measuring" : "Continue"}
          </button>
        </div>
      </form>
    </>
  )
}
