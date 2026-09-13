"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Icon from "@/components/Icon"
import { componentEstimate, peso, quantity } from "@/lib/estimate"
import { readDraft, saveProject, type ProjectDraft } from "@/lib/project"
import { readSession } from "@/lib/session"
import { supplierById } from "@/lib/suppliers"

export default function EstimatePage() {
  const router = useRouter()
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

  function save() {
    if (!draft) return
    saveProject(draft, total, readSession()?.email)
    router.push("/projects")
  }

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
  const supplier = supplierById(draft?.supplierId)

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
              {supplier ? ` · ${supplier.name}` : ""}
            </p>
            {draft?.address?.trim() ? (
              <p className="tiny" style={{ marginTop: 6 }}>
                {draft.address.trim()}
              </p>
            ) : null}
            {draft?.description?.trim() ? (
              <p className="muted" style={{ marginTop: 8, fontSize: 14 }}>
                {draft.description.trim()}
              </p>
            ) : null}
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

      <div className="estimate-actions">
        <Link href="/measurements" className="btn btn-secondary">
          Edit measurements
        </Link>
        <button type="button" className="btn btn-primary" onClick={save}>
          Save to projects
        </button>
      </div>
    </>
  )
}
