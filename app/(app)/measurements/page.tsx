"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Icon from "@/components/Icon"
import { AR_APP_URL } from "@/lib/ar"
import {
  COMPONENTS,
  concreteVolume,
  floorArea,
  quantity,
  wallArea,
  type ComponentName,
  type Dimensions,
} from "@/lib/estimate"
import { saveDraft } from "@/lib/project"
import { SUPPLIERS } from "@/lib/suppliers"

type DimensionInput = { length: string; width: string; height: string }

const EMPTY: DimensionInput = { length: "", width: "", height: "" }

const FIELDS = [
  { key: "length", label: "Length (m)" },
  { key: "width", label: "Width (m)" },
  { key: "height", label: "Height (m)" },
] as const

function toDimensions(input: DimensionInput): Dimensions {
  return {
    length: Number(input.length) || 0,
    width: Number(input.width) || 0,
    height: Number(input.height) || 0,
  }
}

function isComplete({ length, width, height }: Dimensions) {
  return length > 0 && width > 0 && height > 0
}

export default function MeasurementsPage() {
  const router = useRouter()
  const [projectName, setProjectName] = useState("")
  const [supplierId, setSupplierId] = useState<string | null>(null)
  const [inputs, setInputs] = useState<Record<string, DimensionInput>>(() =>
    Object.fromEntries(COMPONENTS.map(({ name }) => [name, EMPTY])),
  )

  function update(name: ComponentName, field: keyof DimensionInput, value: string) {
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return
    setInputs((current) => ({
      ...current,
      [name]: { ...current[name], [field]: value },
    }))
  }

  const rows = useMemo(
    () =>
      COMPONENTS.map(({ name, hint }) => {
        const dimensions = toDimensions(inputs[name])
        return { name, hint, dimensions, measured: isComplete(dimensions) }
      }),
    [inputs],
  )

  const measured = rows.filter((row) => row.measured)
  const ready = measured.length > 0 && supplierId !== null

  function calculate() {
    saveDraft({
      name: projectName.trim(),
      savedAt: new Date().toISOString(),
      supplierId,
      components: measured.map((row) => ({
        name: row.name,
        dimensions: row.dimensions,
      })),
    })
    router.push("/measurements/estimate")
  }

  return (
    <>
      <header>
        <span className="eyebrow">Measurements</span>
        <h1 className="page-title">Measure and estimate</h1>
        <p className="page-subtitle">
          Name the project, pick the hardware you are sourcing from, then enter
          the dimensions of each structural component.
        </p>
      </header>

      <div className="card">
        <label className="field">
          <span className="field-label">Project name</span>
          <input
            className="input"
            placeholder="e.g. Two-storey residence, Naga City"
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
          />
        </label>
      </div>

      <section>
        <h2 className="section-title">Choose a hardware</h2>
        <p className="muted" style={{ fontSize: 14, marginBottom: 14 }}>
          Swipe through the registered hardware stores and pick the one you want
          to source from.
        </p>

        <div
          className="carousel"
          role="radiogroup"
          aria-label="Hardware supplier"
        >
          {SUPPLIERS.map((supplier) => {
            const selected = supplier.id === supplierId
            return (
              <button
                key={supplier.id}
                type="button"
                role="radio"
                aria-checked={selected}
                className="carousel-item"
                onClick={() => setSupplierId(supplier.id)}
              >
                <div className="card-head">
                  <span className="card-icon">
                    <Icon name="store" size={20} />
                  </span>
                  <h3>{supplier.name}</h3>
                  {selected ? (
                    <span className="carousel-check">
                      <Icon name="check" size={15} />
                    </span>
                  ) : null}
                </div>
                <p>
                  {supplier.location} · {supplier.items}
                </p>
                <div className="supplier-meta">
                  <span className="badge badge-muted">
                    Lead time {supplier.lead}
                  </span>
                  <span className="badge badge-muted">
                    {supplier.priceIndex}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <section className="stack">
        <div>
          <h2 className="section-title">Components</h2>
          <p className="muted" style={{ fontSize: 14 }}>
            Fill in only the components your project needs. Leave the rest
            blank.
          </p>
        </div>

        {rows.map((row, index) => (
          <article
            key={row.name}
            className="card component"
            data-measured={row.measured}
          >
            <div className="component-head">
              <span className="component-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="component-heading">
                <h3>{row.name}</h3>
                <p className="tiny">{row.hint}</p>
              </div>
              {row.measured ? (
                <span className="badge" style={{ marginLeft: "auto" }}>
                  Measured
                </span>
              ) : null}
            </div>

            <div className="dims">
              {FIELDS.map((field) => (
                <label key={field.key} className="field">
                  <span className="field-label">{field.label}</span>
                  <input
                    className="input"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={inputs[row.name][field.key]}
                    onChange={(event) =>
                      update(row.name, field.key, event.target.value)
                    }
                  />
                </label>
              ))}
            </div>

            {row.measured ? (
              <div className="component-detail">
                <div className="component-metrics">
                  <span>
                    Floor area{" "}
                    <strong>{quantity(floorArea(row.dimensions))} m²</strong>
                  </span>
                  <span>
                    Wall area{" "}
                    <strong>{quantity(wallArea(row.dimensions))} m²</strong>
                  </span>
                  <span>
                    Volume{" "}
                    <strong>
                      {quantity(concreteVolume(row.dimensions))} m³
                    </strong>
                  </span>
                </div>
              </div>
            ) : null}
          </article>
        ))}
      </section>

      <section className="card calculate">
        <div>
          <h3>
            {ready
              ? `${measured.length} component${
                  measured.length === 1 ? "" : "s"
                } ready`
              : "Not ready yet"}
          </h3>
          <p>
            {supplierId === null
              ? "Choose a hardware above to continue."
              : measured.length === 0
                ? "Enter length, width, and height for at least one component."
                : "Calculate the project to see the full bill of materials and the estimated cost."}
          </p>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={calculate}
          disabled={!ready}
        >
          Calculate project
          <Icon name="arrowRight" size={18} />
        </button>
      </section>

      <aside className="card optional-tool">
        <div className="optional-tool-head">
          <span className="optional-icon">
            <Icon name="camera" size={20} />
          </span>
          <div>
            <h3>
              AR measurement <span className="badge badge-muted">Optional</span>
            </h3>
            <p>
              An experimental camera-based way to capture the same dimensions
              without a tape measure. It is an add-on for future development —
              manual entry above stays the primary workflow, and both produce
              identical estimates.
            </p>
          </div>
        </div>
        <div className="hero-actions">
          <a
            className="btn btn-secondary"
            href={AR_APP_URL}
            target="_blank"
            rel="noreferrer"
          >
            Try AR measurement
          </a>
        </div>
        <p className="tiny" style={{ marginTop: 12 }}>
          Works best on a phone in a well-lit area, and needs HTTPS so the
          browser can grant camera access.
        </p>
      </aside>
    </>
  )
}
