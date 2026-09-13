"use client"

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import Carousel from "@/components/Carousel"
import Icon from "@/components/Icon"
import { arUrlFor } from "@/lib/ar"
import {
  COMPONENTS,
  concreteVolume,
  floorArea,
  peso,
  quantity,
  wallArea,
  type ComponentName,
  type Dimensions,
} from "@/lib/estimate"
import {
  mergeArResult,
  saveDraft,
  saveWorkspace,
  type ArLockedFields,
} from "@/lib/project"
import { dialable, SUPPLIERS, type Supplier } from "@/lib/suppliers"

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

const LONG_PRESS_MS = 450

export default function MeasurementsPage() {
  const router = useRouter()
  const [projectName, setProjectName] = useState("")
  const [supplierId, setSupplierId] = useState<string | null>(null)
  const [inputs, setInputs] = useState<Record<string, DimensionInput>>(() =>
    Object.fromEntries(COMPONENTS.map(({ name }) => [name, EMPTY])),
  )
  const [selected, setSelected] = useState<ComponentName[]>([])
  const [customComponents, setCustomComponents] = useState<
    { name: string; hint: string }[]
  >([])
  const [addingCustom, setAddingCustom] = useState(false)
  const [customName, setCustomName] = useState("")
  const [hiddenComponents, setHiddenComponents] = useState<string[]>([])
  const [armed, setArmed] = useState<string | null>(null)
  const pressTimer = useRef<number | null>(null)
  const holdFired = useRef(false)
  const [catalog, setCatalog] = useState<Supplier | null>(null)
  const [arLocked, setArLocked] = useState<Record<string, ArLockedFields>>({})
  const [restored, setRestored] = useState(false)
  const [arNote, setArNote] = useState<string | null>(null)

  // Opening the AR tool unloads this page, so the form is parked in
  // localStorage and picked back up here, along with anything AR measured.
  useEffect(() => {
    const { workspace, applied } = mergeArResult()
    if (workspace) {
      setProjectName(workspace.name)
      setSupplierId(workspace.supplierId)
      setSelected(workspace.selected)
      setInputs((current) => ({ ...current, ...workspace.inputs }))
      setArLocked(workspace.arLocked ?? {})
      setCustomComponents(workspace.customComponents ?? [])
      setHiddenComponents(workspace.hiddenComponents ?? [])
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
    if (!catalog) return
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setCatalog(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [catalog])

  useEffect(() => {
    if (!restored) return
    saveWorkspace({
      name: projectName,
      supplierId,
      selected,
      inputs,
      arLocked,
      customComponents,
      hiddenComponents,
    })
  }, [
    restored,
    projectName,
    supplierId,
    selected,
    inputs,
    arLocked,
    customComponents,
    hiddenComponents,
  ])

  function toggle(name: ComponentName) {
    setSelected((current) =>
      current[0] === name
        ? current.slice(1)
        : [name, ...current.filter((item) => item !== name)],
    )
  }

  function clearPress() {
    if (pressTimer.current !== null) {
      window.clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }

  function startPress(name: ComponentName) {
    clearPress()
    holdFired.current = false
    pressTimer.current = window.setTimeout(() => {
      holdFired.current = true
      setArmed(name)
    }, LONG_PRESS_MS)
  }

  function onCardPointerDown(name: ComponentName) {
    startPress(name)
  }

  function onCardPointerUp() {
    clearPress()
  }

  function onToggleClick(name: ComponentName) {
    if (holdFired.current) {
      holdFired.current = false
      return
    }
    if (armed) {
      setArmed(null)
      return
    }
    toggle(name)
  }

  function removeComponent(name: ComponentName) {
    setHiddenComponents((current) =>
      current.includes(name) ? current : [...current, name],
    )
    setCustomComponents((current) =>
      current.filter((item) => item.name !== name),
    )
    setSelected((current) => current.filter((item) => item !== name))
    setInputs((current) => {
      const next = { ...current }
      delete next[name]
      return next
    })
    setArLocked((current) => {
      const next = { ...current }
      delete next[name]
      return next
    })
    setArmed(null)
  }

  function update(name: ComponentName, field: keyof DimensionInput, value: string) {
    if (arLocked[name]?.[field]) return
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return
    setInputs((current) => ({
      ...current,
      [name]: { ...current[name], [field]: value },
    }))
  }

  const catalogItems = useMemo(
    () =>
      [...COMPONENTS, ...customComponents].filter(
        (item) => !hiddenComponents.includes(item.name),
      ),
    [customComponents, hiddenComponents],
  )

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

  const rows = useMemo(
    () =>
      catalogItems
        .filter(({ name }) => selected.includes(name))
        .map(({ name, hint }) => {
          const dimensions = toDimensions(inputs[name] ?? EMPTY)
          return { name, hint, dimensions, measured: isComplete(dimensions) }
        }),
    [catalogItems, inputs, selected],
  )

  const measured = rows.filter((row) => row.measured)
  const ready = measured.length > 0 && supplierId !== null
  const ordered = [
    ...selected,
    ...catalogItems
      .map(({ name }) => name)
      .filter((name) => !selected.includes(name)),
  ]

  function addCustom(event: FormEvent) {
    event.preventDefault()
    const name = customName.trim()
    if (!name) return
    const builtIn = COMPONENTS.find(
      (item) => item.name.toLowerCase() === name.toLowerCase(),
    )
    if (builtIn && hiddenComponents.includes(builtIn.name)) {
      setHiddenComponents((current) =>
        current.filter((item) => item !== builtIn.name),
      )
      setInputs((current) => ({
        ...current,
        [builtIn.name]: current[builtIn.name] ?? { ...EMPTY },
      }))
      setSelected((current) => [
        builtIn.name,
        ...current.filter((item) => item !== builtIn.name),
      ])
      setCustomName("")
      setAddingCustom(false)
      return
    }
    const taken = catalogItems.some(
      (item) => item.name.toLowerCase() === name.toLowerCase(),
    )
    if (taken) return
    setCustomComponents((current) => [
      ...current,
      { name, hint: "Custom component" },
    ])
    setInputs((current) => ({ ...current, [name]: { ...EMPTY } }))
    setSelected((current) => [name, ...current.filter((item) => item !== name)])
    setCustomName("")
    setAddingCustom(false)
  }

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
          Name the project, pick the hardware, then tap a component to measure
          it. The form opens in place — no extra section below.
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
            const chosen = supplier.id === supplierId
            return (
              <article
                key={supplier.id}
                className="carousel-item"
                role="radio"
                aria-checked={chosen}
              >
                <button
                  type="button"
                  className="choose-item-toggle"
                  onClick={() => setSupplierId(supplier.id)}
                >
                  <div className="card-head">
                    <span className="card-icon">
                      <Icon name="store" size={20} />
                    </span>
                    <h3>{supplier.name}</h3>
                    {chosen ? (
                      <span className="carousel-check">
                        <Icon name="check" size={15} />
                      </span>
                    ) : null}
                  </div>
                  <p>
                    {supplier.location} · {supplier.catalog.length} materials
                  </p>
                </button>
                <div className="carousel-actions">
                  <span className="badge badge-muted">Lead {supplier.lead}</span>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={(event) => {
                      event.stopPropagation()
                      setCatalog(supplier)
                    }}
                  >
                    View
                  </button>
                </div>
              </article>
            )
          })}
        </Carousel>
      </section>

      <section>
        <h2 className="section-title">Choose to measure</h2>
        <p className="muted" style={{ fontSize: 14, marginBottom: 14 }}>
          Tap a component to move it to the top and measure it. Tap it again to
          close.
        </p>
        <div className="choose-grid" role="group" aria-label="Components to measure">
          {ordered.map((name) => {
            const hint =
              catalogItems.find((component) => component.name === name)?.hint ??
              "Custom component"
            const on = selected[0] === name
            const dimensions = toDimensions(inputs[name] ?? EMPTY)
            const measuredHere = isComplete(dimensions)
            const lockedFields = arLocked[name] ?? {}
            const fromAr = Boolean(
              lockedFields.length || lockedFields.width || lockedFields.height,
            )
            return (
              <article
                key={name}
                className="choose-item"
                data-open={on}
                data-measured={measuredHere}
                data-armed={armed === name}
                onPointerDown={() => onCardPointerDown(name)}
                onPointerUp={onCardPointerUp}
                onPointerCancel={onCardPointerUp}
                onPointerLeave={onCardPointerUp}
                onContextMenu={(event) => event.preventDefault()}
              >
                <div className="choose-item-head">
                  <button
                    type="button"
                    className="choose-item-toggle"
                    aria-expanded={on}
                    onClick={() => onToggleClick(name)}
                  >
                    <span className="choose-item-top">
                      <strong>{name}</strong>
                      {!on && selected.includes(name) && armed !== name ? (
                        <span className="carousel-check">
                          <Icon name="check" size={14} />
                        </span>
                      ) : null}
                    </span>
                    {fromAr ? (
                      <span className="badge">Measured with AR</span>
                    ) : (
                      <span className="tiny">{hint}</span>
                    )}
                  </button>
                  {armed === name ? (
                    <button
                      type="button"
                      className="choose-remove"
                      onClick={() => removeComponent(name)}
                    >
                      Remove
                    </button>
                  ) : on ? (
                    <a
                      className="ar-measure-btn"
                      href={arUrlFor(name)}
                      aria-label="Measure with AR"
                      title="Measure with AR"
                    >
                      <Icon name="camera" size={22} />
                    </a>
                  ) : null}
                </div>

                {on ? (
                  <div className="choose-item-body">
                    <div className="dims">
                      {FIELDS.map((field) => {
                        const locked = Boolean(lockedFields[field.key])
                        return (
                          <label key={field.key} className="field">
                            <span className="field-label">{field.label}</span>
                            <input
                              className="input"
                              inputMode="decimal"
                              placeholder="0.00"
                              value={(inputs[name] ?? EMPTY)[field.key]}
                              readOnly={locked}
                              aria-readonly={locked}
                              onChange={(event) =>
                                update(name, field.key, event.target.value)
                              }
                            />
                          </label>
                        )
                      })}
                    </div>

                    {measuredHere ? (
                      <div className="component-metrics">
                        <span>
                          Floor area{" "}
                          <strong>{quantity(floorArea(dimensions))} m²</strong>
                        </span>
                        <span>
                          Wall area{" "}
                          <strong>{quantity(wallArea(dimensions))} m²</strong>
                        </span>
                        <span>
                          Volume{" "}
                          <strong>
                            {quantity(concreteVolume(dimensions))} m³
                          </strong>
                        </span>
                      </div>
                    ) : null}

                    <div className="choose-calculate">
                      <p className="tiny">
                        {supplierId === null
                          ? "Choose a hardware above first."
                          : ready
                            ? `${measured.length} component${measured.length === 1 ? "" : "s"} ready.`
                            : "Fill length, width, and height to calculate."}
                      </p>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={calculate}
                        disabled={!ready}
                      >
                        Estimate project
                      </button>
                    </div>
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>

        {addingCustom ? (
          <form className="choose-add" onSubmit={addCustom}>
            <label className="field">
              <span className="field-label">Name your component</span>
              <input
                className="input"
                autoFocus
                placeholder="e.g. Staircase"
                value={customName}
                onChange={(event) => setCustomName(event.target.value)}
              />
            </label>
            <div className="choose-add-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setAddingCustom(false)
                  setCustomName("")
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!customName.trim()}
              >
                Add
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            className="choose-add-btn"
            onClick={() => setAddingCustom(true)}
          >
            Add custom component
          </button>
        )}
      </section>

      {catalog
        ? createPortal(
            <div
              className="sheet-scrim"
              role="presentation"
              onClick={() => setCatalog(null)}
            >
              <div
                className="sheet"
                role="dialog"
                aria-modal="true"
                aria-labelledby="hardware-catalog-title"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="sheet-head">
                  <div>
                    <h2 id="hardware-catalog-title">{catalog.name}</h2>
                    <p className="tiny">{catalog.location}</p>
                  </div>
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label="Close catalog"
                    onClick={() => setCatalog(null)}
                  >
                    ×
                  </button>
                </div>

                <div className="supplier-contact">
                  <a href={`mailto:${catalog.email}`}>
                    <Icon name="mail" size={15} />
                    {catalog.email}
                  </a>
                  <a href={`tel:${dialable(catalog.phone)}`}>
                    <Icon name="phone" size={15} />
                    {catalog.phone}
                  </a>
                </div>

                <div className="supplier-catalog">
                  <span className="field-label">Catalog</span>
                  {catalog.catalog.map((entry) => (
                    <div key={entry.material} className="catalog-row">
                      <span>{entry.material}</span>
                      <span className="catalog-price">
                        {peso(entry.price)}
                        <small> / {entry.unit}</small>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
