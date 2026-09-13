"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import Icon from "@/components/Icon"
import { UNITS, useCatalog } from "@/lib/catalog"
import { peso } from "@/lib/estimate"
import type { Session } from "@/lib/session"

export default function SupplierDashboard({ session }: { session: Session }) {
  const { items, loaded, add, remove, toggleStock, update } = useCatalog(
    session.supplierId,
  )
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [unit, setUnit] = useState(UNITS[0])
  const [error, setError] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [armed, setArmed] = useState<string | null>(null)
  const [pressed, setPressed] = useState<string | null>(null)
  const pressTimer = useRef<number | null>(null)
  const holdFired = useRef(false)

  const firstName = session.name.split(" ")[0]

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
        (item) =>
          item.id !== editingId &&
          item.name.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      setError(`${trimmed} is already in your catalog.`)
      return
    }

    if (editingId) {
      update(editingId, { name: trimmed, price: value, unit })
    } else {
      add({ name: trimmed, price: value, unit, stock: true })
    }
    setName("")
    setPrice("")
    setUnit(UNITS[0])
    setEditingId(null)
    setError("")
  }

  function startEdit(id: string) {
    const item = items.find((entry) => entry.id === id)
    if (!item) return
    setEditingId(item.id)
    setName(item.name)
    setPrice(String(item.price))
    setUnit(item.unit)
    setError("")
    setArmed(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setName("")
    setPrice("")
    setUnit(UNITS[0])
    setError("")
  }

  function clearPress() {
    if (pressTimer.current !== null) {
      window.clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }

  function startPress(id: string) {
    clearPress()
    holdFired.current = false
    setPressed(id)
    pressTimer.current = window.setTimeout(() => {
      holdFired.current = true
      setArmed(id)
    }, 450)
  }

  function endPress() {
    clearPress()
    setPressed(null)
  }

  useEffect(() => {
    if (!armed) return
    function onPointerDown(event: Event) {
      const target = event.target as HTMLElement | null
      if (target?.closest("[data-armed='true']")) return
      setArmed(null)
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [armed])

  return (
    <>
      <section className="hero">
        <span className="eyebrow">Supplier Dashboard</span>
        <h1 className="hero-title">Welcome, {firstName}.</h1>
        <p className="hero-full-title">
          Signed in as {session.email}. Publish the materials you carry and keep
          their prices current. Buyers see your catalog when COSTruct ranks
          suppliers against their bill of materials.
        </p>
      </section>

      <section>
        <div className="stat">
          <div className="stat-value">{loaded ? items.length : "—"}</div>
          <div className="stat-label">Materials listed</div>
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">
          {editingId ? "Edit material" : "Add a material"}
        </h2>
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

          <div className="catalog-form-actions">
            {editingId ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            ) : null}
            <button type="submit" className="btn btn-primary">
              {editingId ? "Save" : "Add material"}
            </button>
          </div>
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
          Hold a material to edit it, change stock, or remove it.
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
              <div
                key={item.id}
                className="list-row catalog-hold-row"
                data-armed={armed === item.id}
                data-pressed={pressed === item.id}
                onPointerDown={() => startPress(item.id)}
                onPointerUp={endPress}
                onPointerCancel={endPress}
                onPointerLeave={endPress}
                onContextMenu={(event) => event.preventDefault()}
              >
                <div className="catalog-item">
                  <span className="list-row-title">{item.name}</span>
                  <span className="tiny">
                    {peso(item.price)} per {item.unit}
                  </span>
                </div>

                {armed === item.id ? (
                  <div className="catalog-row-actions">
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
                      className="btn btn-secondary btn-sm"
                      onClick={() => startEdit(item.id)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="icon-btn catalog-remove"
                      aria-label={`Remove ${item.name}`}
                      title={`Remove ${item.name}`}
                      onClick={() => {
                        if (editingId === item.id) cancelEdit()
                        remove(item.id)
                        setArmed(null)
                      }}
                    >
                      <Icon name="trash" size={17} />
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
