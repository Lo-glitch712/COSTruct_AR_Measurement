"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import Icon from "@/components/Icon"
import {
  componentEstimate,
  peso,
  quantity,
  type MaterialLine,
} from "@/lib/estimate"
import { readDraft, type ProjectDraft } from "@/lib/project"

export default function EstimatePage() {
  const [draft, setDraft] = useState<ProjectDraft | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setDraft(readDraft())
    setLoaded(true)
  }, [])

  const components = useMemo(
    () =>
      (draft?.components ?? []).map((component) => {
        const lines = componentEstimate(component.name, component.dimensions)
        return {
          ...component,
          lines,
          cost: lines.reduce((total, line) => total + line.cost, 0),
        }
      }),
    [draft],
  )

  const total = components.reduce((sum, component) => sum + component.cost, 0)

  const billOfMaterials = useMemo(() => {
    const totals = new Map<string, MaterialLine>()

    for (const component of components) {
      for (const line of component.lines) {
        const existing = totals.get(line.material)
        totals.set(line.material, {
          ...line,
          quantity: (existing?.quantity ?? 0) + line.quantity,
          cost: (existing?.cost ?? 0) + line.cost,
        })
      }
    }

    return [...totals.values()]
  }, [components])

  if (!loaded) return null

  if (components.length === 0) {
    return (
      <>
        <header>
          <span className="eyebrow">Estimate</span>
          <h1 className="page-title">Nothing to calculate yet</h1>
          <p className="page-subtitle">
            Measure at least one component first and the estimate will appear
            here.
          </p>
        </header>
        <div>
          <Link href="/measurements" className="btn btn-primary">
            <Icon name="arrowLeft" size={18} />
            Back to measurements
          </Link>
        </div>
      </>
    )
  }

  const savedAt = draft?.savedAt ? new Date(draft.savedAt) : new Date()

  return (
    <>
      <header>
        <span className="eyebrow">Estimate</span>
        <h1 className="page-title">Project estimate</h1>
        <p className="page-subtitle">
          Material quantities and cost for every component you measured.
        </p>
      </header>

      <article className="receipt">
        <div className="receipt-head">
          <div>
            <h2 className="section-title">
              {draft?.name?.trim() || "Untitled project"}
            </h2>
            <p className="tiny">
              {savedAt.toLocaleDateString("en-PH", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}{" "}
              · {components.length} component
              {components.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="receipt-total">
            <div className="tiny">Estimated total</div>
            <div className="receipt-total-value">{peso(total)}</div>
          </div>
        </div>

        {components.map((component) => (
          <section key={component.name} className="receipt-component">
            <div className="receipt-component-head">
              <h3>{component.name}</h3>
              <span className="tiny">
                {quantity(component.dimensions.length)} ×{" "}
                {quantity(component.dimensions.width)} ×{" "}
                {quantity(component.dimensions.height)} m
              </span>
              <span className="receipt-component-cost">
                {peso(component.cost)}
              </span>
            </div>
            <ul className="material-lines">
              {component.lines.map((line) => (
                <li key={line.material}>
                  <span className="material-name">{line.material}</span>
                  <span className="material-qty">
                    {quantity(line.quantity)} {line.unit} ×{" "}
                    {peso(line.unitPrice)}
                  </span>
                  <span className="material-cost">{peso(line.cost)}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <div className="receipt-grand">
          <span>ESTIMATED TOTAL</span>
          <strong>{peso(total)}</strong>
        </div>
      </article>

      <section className="card">
        <h2 className="section-title">Bill of materials</h2>
        <p className="muted" style={{ fontSize: 14, marginBottom: 14 }}>
          Every component combined, ready to send to a supplier.
        </p>
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
          against your project specifications. Prices are replaced by the real
          figure once you attach a supplier quote in Procurement.
        </p>
      </section>

      <div className="hero-actions">
        <Link href="/supplier" className="btn btn-primary">
          Send to suppliers
          <Icon name="arrowRight" size={18} />
        </Link>
        <Link href="/measurements" className="btn btn-secondary">
          <Icon name="arrowLeft" size={18} />
          Edit measurements
        </Link>
      </div>
    </>
  )
}
