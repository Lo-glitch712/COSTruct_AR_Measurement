"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Icon from "@/components/Icon"
import { arUrlFor } from "@/lib/ar"
import { useCatalog } from "@/lib/catalog"
import {
  componentEstimate,
  concreteVolume,
  floorArea,
  peso,
  quantity,
  wallArea,
  type Dimensions,
} from "@/lib/estimate"
import {
  consumeArResult,
  readSupplierCalc,
  saveSupplierCalc,
  type ArLockedFields,
} from "@/lib/project"
import { useSession } from "@/lib/session"

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

export default function CalculatorPage() {
  const router = useRouter()
  const { session } = useSession()
  const { items } = useCatalog()
  const [inputs, setInputs] = useState<DimensionInput>(EMPTY)
  const [arLocked, setArLocked] = useState<ArLockedFields>({})
  const [restored, setRestored] = useState(false)

  useEffect(() => {
    const stored = readSupplierCalc()
    const next = stored
      ? {
          length: stored.length,
          width: stored.width,
          height: stored.height,
        }
      : EMPTY
    const locks = { ...(stored?.arLocked ?? {}) }
    const ar = consumeArResult()
    if (ar) {
      if (ar.length) {
        next.length = ar.length
        locks.length = true
      }
      if (ar.width) {
        next.width = ar.width
        locks.width = true
      }
      if (ar.height) {
        next.height = ar.height
        locks.height = true
      }
    }
    setInputs(next)
    setArLocked(locks)
    setRestored(true)
  }, [])

  useEffect(() => {
    if (!restored) return
    saveSupplierCalc({ ...inputs, arLocked })
  }, [restored, inputs, arLocked])

  function update(field: keyof DimensionInput, value: string) {
    if (arLocked[field]) return
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return
    setInputs((current) => ({ ...current, [field]: value }))
  }

  const dimensions = toDimensions(inputs)
  const ready = isComplete(dimensions)

  const lines = useMemo(() => {
    if (!ready) return []
    return componentEstimate("Column", dimensions).map((line) => {
      const match = items.find(
        (item) => item.name.toLowerCase() === line.material.toLowerCase(),
      )
      const unitPrice = match?.price ?? line.unitPrice
      return {
        ...line,
        unitPrice,
        cost: line.quantity * unitPrice,
      }
    })
  }, [dimensions, items, ready])

  const total = lines.reduce((sum, line) => sum + line.cost, 0)

  useEffect(() => {
    if (session && session.role !== "supplier") router.replace("/home")
  }, [session, router])

  if (session?.role !== "supplier") return null

  return (
    <>
      <header>
        <span className="eyebrow">Supplier</span>
        <h1 className="page-title">Measurement calculator</h1>
        <p className="page-subtitle">
          Measure for a buyer on site or type the dimensions. There is no
          component list — just length, width, and height.
        </p>
      </header>

      <section className="card">
        <div className="choose-item-head">
          <div>
            <h2 className="section-title">Dimensions</h2>
            <p className="tiny">Use the camera or enter the three sides.</p>
          </div>
          <a
            className="ar-measure-btn"
            href={arUrlFor("Calculator")}
            aria-label="Measure with AR"
            title="Measure with AR"
          >
            <Icon name="camera" size={22} />
          </a>
        </div>

        <div className="dims" style={{ marginTop: 16 }}>
          {FIELDS.map((field) => {
            const locked = Boolean(arLocked[field.key])
            return (
              <label key={field.key} className="field">
                <span className="field-label">{field.label}</span>
                <input
                  className="input"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={inputs[field.key]}
                  readOnly={locked}
                  aria-readonly={locked}
                  onChange={(event) => update(field.key, event.target.value)}
                />
              </label>
            )
          })}
        </div>

        {ready ? (
          <div className="component-metrics" style={{ marginTop: 18 }}>
            <span>
              Floor area <strong>{quantity(floorArea(dimensions))} m²</strong>
            </span>
            <span>
              Wall area <strong>{quantity(wallArea(dimensions))} m²</strong>
            </span>
            <span>
              Volume{" "}
              <strong>{quantity(concreteVolume(dimensions))} m³</strong>
            </span>
          </div>
        ) : null}
      </section>

      {ready ? (
        <section className="card">
          <h2 className="section-title">Estimate for the buyer</h2>
          <p className="muted" style={{ fontSize: 14, marginBottom: 14 }}>
            Quantities from the measured volume, priced from your catalog when
            the material is listed.
          </p>
          <ul className="material-lines">
            {lines.map((line) => (
              <li key={line.material}>
                <span className="material-name">{line.material}</span>
                <span className="material-qty">
                  {quantity(line.quantity)} {line.unit} × {peso(line.unitPrice)}
                </span>
                <span className="material-cost">{peso(line.cost)}</span>
              </li>
            ))}
          </ul>
          <div className="receipt-grand">
            <span>ESTIMATED TOTAL</span>
            <strong>{peso(total)}</strong>
          </div>
        </section>
      ) : null}
    </>
  )
}
