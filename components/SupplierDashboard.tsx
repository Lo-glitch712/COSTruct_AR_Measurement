"use client"

import { useState, type FormEvent } from "react"
import Icon from "@/components/Icon"
import { UNITS, useCatalog } from "@/lib/catalog"
import { peso } from "@/lib/estimate"
import type { Session } from "@/lib/session"

export default function SupplierDashboard({ session }: { session: Session }) {
  const { items, loaded, add, remove, toggleStock } = useCatalog()
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [unit, setUnit] = useState(UNITS[0])
  const [error, setError] = useState("")

  const firstName = session.name.split(" ")[0]
  const inStock = items.filter((item) => item.stock).length

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmed = name.trim()
    const value = Number(price)

    if (!trimmed) {
      setError("Enter a material name.")
      return
    }
    if (!(value > 0)) {
      setError("Enter a unit price greater than zero.")
      return
    }
    if (
      items.some(
        (item) => item.name.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      setError(`${trimmed} is already in your catalog.`)
      return
    }

    add({ name: trimmed, price: value, unit, stock: true })
    setName("")
    setPrice("")
    setError("")
  }

  return (
    <>
      <section className="hero">
        <span className="eyebrow">Supplier Dashboard</span>
        <h1 className="hero-title">Welcome, {firstName}.</h1>
        <p className="hero-full-title">
          Publish the materials you carry and keep their prices current. Buyers
          see your catalog when COSTruct ranks suppliers against their bill of
          materials.
        </p>
      </section>

      <section className="grid grid-3">
        <div className="stat">
          <div className="stat-value">{loaded ? items.length : "—"}</div>
          <div className="stat-label">Materials listed</div>
        </div>
        <div className="stat">
          <div className="stat-value">{loaded ? inStock : "—"}</div>
          <div className="stat-label">In stock</div>
        </div>
        <div className="stat">
          <div className="stat-value">0</div>
          <div className="stat-label">Open requests</div>
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">Add a material</h2>
        <p className="muted" style={{ fontSize: 14, marginBottom: 16 }}>
          Set your own unit price. It replaces the reference price once a buyer
          attaches your quote.
        </p>

        <form className="catalog-form" onSubmit={handleSubmit}>
          <label className="field">
            <span className="field-label">Material</span>
            <input
              className="input"
              placeholder="e.g. Rebar 10mm"
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                setError("")
              }}
            />
          </label>

          <label className="field">
            <span className="field-label">Unit price (₱)</span>
            <input
              className="input"
              inputMode="decimal"
              placeholder="0.00"
              value={price}
              onChange={(event) => {
                const next = event.target.value
                if (next !== "" && !/^\d*\.?\d*$/.test(next)) return
                setPrice(next)
                setError("")
              }}
            />
          </label>

          <label className="field">
            <span className="field-label">Unit</span>
            <select
              className="input"
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            >
              {UNITS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" className="btn btn-primary">
            Add material
          </button>
        </form>

        {error ? (
          <p className="notice" style={{ marginTop: 14 }}>
            {error}
          </p>
        ) : null}
      </section>

      <section>
        <h2 className="section-title">Your catalog</h2>
        <p className="muted" style={{ fontSize: 14, marginBottom: 14 }}>
          Toggle a material off when you run out — it stays listed but is
          skipped when buyers are matched.
        </p>

        {loaded && items.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 40 }}>
            <h3>No materials listed</h3>
            <p style={{ maxWidth: "38ch", margin: "8px auto 0" }}>
              Add your first material above and it will appear here.
            </p>
          </div>
        ) : (
          <div className="list">
            {items.map((item) => (
              <div key={item.id} className="list-row">
                <div className="catalog-item">
                  <span className="list-row-title">{item.name}</span>
                  <span className="tiny">
                    {peso(item.price)} per {item.unit}
                  </span>
                </div>

                <button
                  type="button"
                  className={`badge ${item.stock ? "" : "badge-muted"}`}
                  onClick={() => toggleStock(item.id)}
                  style={{ border: 0, cursor: "pointer" }}
                >
                  {item.stock ? "In stock" : "Out of stock"}
                </button>

                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Remove ${item.name}`}
                  title={`Remove ${item.name}`}
                  onClick={() => remove(item.id)}
                >
                  <Icon name="trash" size={17} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="card">
        <h3>Procurement requests</h3>
        <p>
          When a buyer sends you a bill of materials, it will show up here with
          the quantities they need and a deadline to respond.
        </p>
      </section>
    </>
  )
}
