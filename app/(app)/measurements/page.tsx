"use client"

import { useMemo, useState } from "react"
import Icon from "@/components/Icon"
import { AR_APP_URL } from "@/lib/ar"
import {
  COMPONENTS,
  componentEstimate,
  floorArea,
  peso,
  quantity,
  wallArea,
  type ComponentName,
  type Dimensions,
} from "@/lib/estimate"

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

export default function MeasurementsPage() {
  const [projectName, setProjectName] = useState("")
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

  function reset() {
    setInputs(Object.fromEntries(COMPONENTS.map(({ name }) => [name, EMPTY])))
    setProjectName("")
  }

  const rows = useMemo(
    () =>
      COMPONENTS.map(({ name, hint }) => {
        const dimensions = toDimensions(inputs[name])
        const lines = componentEstimate(name, dimensions)
        return {
          name,
          hint,
          dimensions,
          lines,
          cost: lines.reduce((total, line) => total + line.cost, 0),
        }
      }),
    [inputs],
  )

  const measured = rows.filter((row) => row.lines.length > 0)
  const total = measured.reduce((sum, row) => sum + row.cost, 0)

  const billOfMaterials = useMemo(() => {
    const totals = new Map<
      string,
      { quantity: number; unit: string; unitPrice: number; cost: number }
    >()

    for (const row of measured) {
      for (const line of row.lines) {
        const existing = totals.get(line.material)
        totals.set(line.material, {
          unit: line.unit,
          unitPrice: line.unitPrice,
          quantity: (existing?.quantity ?? 0) + line.quantity,
          cost: (existing?.cost ?? 0) + line.cost,
        })
      }
    }

    return [...totals.entries()].map(([material, value]) => ({
      material,
      ...value,
    }))
  }, [measured])

  return (
    <>
      <header>
        <span className="eyebrow">Measurements</span>
        <h1 className="page-title">Measure and estimate</h1>
        <p className="page-subtitle">
          Enter the length, width, and height of each structural component.
          COSTruct converts them into material quantities and a priced estimate
          as you type.
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

      <section className="stack">
        <div className="section-heading">
          <div>
            <h2 className="section-title">Components</h2>
            <p className="muted" style={{ fontSize: 14 }}>
              Fill in only the components your project needs. Leave the rest
              blank.
            </p>
          </div>
          <button type="button" className="btn btn-secondary" onClick={reset}>
            Clear all
          </button>
        </div>

        {rows.map((row, index) => (
          <article
            key={row.name}
            className="card component"
            data-measured={row.lines.length > 0}
          >
            <div className="component-head">
              <span className="component-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="component-heading">
                <h3>{row.name}</h3>
                <p className="tiny">{row.hint}</p>
              </div>
              <div className="component-cost">
                <div className="component-cost-value">{peso(row.cost)}</div>
                <div className="tiny">estimated</div>
              </div>
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

            {row.lines.length > 0 ? (
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
                </div>
                <ul className="material-lines">
                  {row.lines.map((line) => (
                    <li key={line.material}>
                      <span className="material-name">{line.material}</span>
                      <span className="material-qty">
                        {quantity(line.quantity)} {line.unit}
                      </span>
                      <span className="material-cost">{peso(line.cost)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </article>
        ))}
      </section>

      <section className="card summary">
        <div className="summary-head">
          <div>
            <span className="eyebrow">Estimate</span>
            <h2 className="section-title" style={{ marginTop: 6 }}>
              {projectName.trim() || "Untitled project"}
            </h2>
          </div>
          <div className="summary-total">
            <div className="tiny">Estimated total</div>
            <div className="summary-total-value">{peso(total)}</div>
          </div>
        </div>

        {billOfMaterials.length > 0 ? (
          <>
            <ul className="material-lines material-lines-lg">
              {billOfMaterials.map((line) => (
                <li key={line.material}>
                  <span className="material-name">{line.material}</span>
                  <span className="material-qty">
                    {quantity(line.quantity)} {line.unit} × {peso(line.unitPrice)}
                  </span>
                  <span className="material-cost">{peso(line.cost)}</span>
                </li>
              ))}
            </ul>
            <p className="tiny" style={{ marginTop: 16 }}>
              Quantities use starter estimating factors and should be verified
              against your project specifications. Prices are replaced by the
              real figure once you attach a supplier quote in Procurement.
            </p>
            <div className="hero-actions">
              <a href="/supplier" className="btn btn-primary">
                Send to suppliers
                <Icon name="arrowRight" />
              </a>
            </div>
          </>
        ) : (
          <p className="muted" style={{ fontSize: 14 }}>
            Enter dimensions above and the bill of materials will build itself
            here.
          </p>
        )}
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
