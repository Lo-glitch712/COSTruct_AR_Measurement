"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Carousel from "@/components/Carousel"
import Icon from "@/components/Icon"
import { arUrlFor } from "@/lib/ar"
import {
  COMPONENTS,
  concreteVolume,
  floorArea,
  quantity,
  wallArea,
  type ComponentName,
  type Dimensions,
} from "@/lib/estimate"
import { mergeArResult, saveDraft, saveWorkspace } from "@/lib/project"
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

function listFields(fields: string[]) {
  if (fields.length === 1) return fields[0]
  return `${fields.slice(0, -1).join(", ")} and ${fields[fields.length - 1]}`
}

export default function MeasurementsPage() {
  const router = useRouter()
  const [projectName, setProjectName] = useState("")
  const [supplierId, setSupplierId] = useState<string | null>(null)
  const [inputs, setInputs] = useState<Record<string, DimensionInput>>(() =>
    Object.fromEntries(COMPONENTS.map(({ name }) => [name, EMPTY])),
  )
  const [restored, setRestored] = useState(false)
  const [arNote, setArNote] = useState<string | null>(null)

  // Opening the AR tool unloads this page, so the form is parked in
  // localStorage and picked back up here, along with anything AR measured.
  useEffect(() => {
    const { workspace, applied } = mergeArResult()
    if (workspace) {
      setProjectName(workspace.name)
      setSupplierId(workspace.supplierId)
      setInputs((current) => ({ ...current, ...workspace.inputs }))
    }
    if (applied) {
      setArNote(
        applied.fields.length === 0
          ? `AR did not capture any dimension for ${applied.component}.`
          : `AR filled in ${listFields(applied.fields)} for ${applied.component}.`,
      )
    }
    setRestored(true)
  }, [])

  useEffect(() => {
    if (!restored) return
    saveWorkspace({ name: projectName, supplierId, inputs })
  }, [restored, projectName, supplierId, inputs])

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

      {arNote ? (
        <div className="notice" role="status">
          <Icon name="check" size={16} />
          <p>{arNote}</p>
          <button
            type="button"
            className="icon-btn notice-close"
            onClick={() => setArNote(null)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ) : null}

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

        <Carousel label="Hardware supplier">
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
                  {supplier.location} · {supplier.catalog.length} materials
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
        </Carousel>
      </section>

      <section className="stack">
        <div>
          <h2 className="section-title">Components</h2>
          <p className="muted" style={{ fontSize: 14 }}>
            Fill in only the components your project needs. Leave the rest
            blank. Each one can optionally be captured with AR instead of a tape
            measure — your entries are kept while you are in the camera.
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
              <div className="component-actions">
                {row.measured ? <span className="badge">Measured</span> : null}
                <a
                  className="btn btn-secondary btn-sm"
                  href={arUrlFor(row.name)}
                  title="Optional: capture this component with the camera. Saving in AR brings the dimensions back here."
                >
                  <Icon name="camera" size={15} />
                  Measure with AR
                </a>
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
    </>
  )
}
