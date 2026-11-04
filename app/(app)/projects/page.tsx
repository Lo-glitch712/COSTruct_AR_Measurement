"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import Icon from "@/components/Icon"
import { useRulerNav } from "@/components/RulerLoader"
import { peso } from "@/lib/estimate"
import {
  readProjectsFor,
  removeProject,
  saveDraft,
  type SavedProject,
} from "@/lib/project"
import { useSession } from "@/lib/session"
import { supplierById } from "@/lib/suppliers"

const HOLD_MS = 520
const MOVE_PX = 12

export default function ProjectsPage() {
  const router = useRouter()
  const { session } = useSession()
  const [projects, setProjects] = useState<SavedProject[]>([])
  const { go, overlay } = useRulerNav()
  const [loaded, setLoaded] = useState(false)
  const [armedId, setArmedId] = useState<string | null>(null)
  const [pending, setPending] = useState<SavedProject | null>(null)
  const holdTimer = useRef<number | null>(null)
  const holdOrigin = useRef<{ x: number; y: number } | null>(null)
  const suppressClick = useRef(false)

  useEffect(() => {
    if (!session) return
    setProjects(readProjectsFor(session.email))
    setLoaded(true)
  }, [session])

  useEffect(() => {
    if (!armedId) return
    function onPointerDown(event: PointerEvent) {
      const node = event.target as HTMLElement | null
      if (node?.closest(`[data-project-id="${armedId}"]`)) return
      if (node?.closest(".logout-dialog")) return
      setArmedId(null)
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [armedId])

  function clearHold() {
    if (holdTimer.current != null) {
      window.clearTimeout(holdTimer.current)
      holdTimer.current = null
    }
    holdOrigin.current = null
  }

  function startHold(id: string, event: React.PointerEvent) {
    if (event.pointerType === "mouse" && event.button !== 0) return
    clearHold()
    suppressClick.current = false
    holdOrigin.current = { x: event.clientX, y: event.clientY }
    holdTimer.current = window.setTimeout(() => {
      suppressClick.current = true
      setArmedId(id)
      holdTimer.current = null
      try {
        navigator.vibrate?.(20)
      } catch {
        /* ignore */
      }
    }, HOLD_MS)
  }

  function onHoldMove(event: React.PointerEvent) {
    const origin = holdOrigin.current
    if (!origin || holdTimer.current == null) return
    const dx = event.clientX - origin.x
    const dy = event.clientY - origin.y
    if (Math.hypot(dx, dy) > MOVE_PX) clearHold()
  }

  function open(project: SavedProject) {
    if (suppressClick.current) {
      suppressClick.current = false
      return
    }
    saveDraft({
      name: project.name,
      address: project.address,
      description: project.description,
      savedAt: project.savedAt,
      supplierId: project.supplierId,
      components: project.components,
    })
    router.push("/measurements/estimate")
  }

  function confirmRemove() {
    if (!pending) return
    removeProject(pending.id)
    setProjects(session ? readProjectsFor(session.email) : [])
    setPending(null)
    setArmedId(null)
  }

  if (!loaded) return null

  return (
    <>
      <header>
        <span className="eyebrow">Projects</span>
        <h1 className="page-title">Your projects</h1>
        <p className="page-subtitle">
          Estimates you chose to keep. Open one to review the receipt, or start
          a new measurement.
        </p>
      </header>

      {overlay}
      {projects.length === 0 ? (
        <div
          className="card"
          style={{ textAlign: "center", padding: "52px 24px" }}
        >
          <div className="card-head" style={{ justifyContent: "center" }}>
            <span className="card-icon">
              <Icon name="folder" size={20} />
            </span>
            <h3>No projects yet</h3>
          </div>
          <p style={{ maxWidth: "42ch", margin: "0 auto" }}>
            Calculate a project from your measurements, then save it here.
          </p>
          <div
            className="hero-actions"
            style={{ justifyContent: "center", marginTop: 22 }}
          >
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => go("/measurements/setup", "Setting up your measurement")}
            >
              Start a measurement
            </button>
          </div>
        </div>
      ) : (
        <section className="stack">
          {projects.map((project) => {
            const supplier = supplierById(project.supplierId)
            const savedAt = new Date(project.savedAt)
            const title = project.name.trim() || "Untitled project"
            const armed = armedId === project.id
            return (
              <article
                key={project.id}
                className={`card project-card${armed ? " is-armed" : ""}`}
                data-project-id={project.id}
                onPointerDown={(event) => startHold(project.id, event)}
                onPointerUp={clearHold}
                onPointerCancel={clearHold}
                onPointerMove={onHoldMove}
                onContextMenu={(event) => event.preventDefault()}
              >
                <div className="card-head">
                  <span className="card-icon">
                    <Icon name="folder" size={20} />
                  </span>
                  <h3>{title}</h3>
                </div>
                {project.address?.trim() ? (
                  <p className="tiny">{project.address.trim()}</p>
                ) : null}
                {project.description?.trim() ? (
                  <p className="muted" style={{ fontSize: 14, marginTop: 6 }}>
                    {project.description.trim()}
                  </p>
                ) : null}
                <p className="tiny">
                  {savedAt.toLocaleDateString("en-PH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  · {project.components.length} component
                  {project.components.length === 1 ? "" : "s"}
                  {supplier ? ` · ${supplier.name}` : ""}
                </p>
                <div className="project-row">
                  <strong>{peso(project.total)}</strong>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => open(project)}
                  >
                    View estimate
                  </button>
                </div>
                {armed ? (
                  <button
                    type="button"
                    className="btn btn-danger project-delete"
                    onClick={() => setPending(project)}
                  >
                    Delete
                  </button>
                ) : null}
              </article>
            )
          })}
        </section>
      )}

      {pending
        ? createPortal(
            <div
              className="logout-scrim"
              role="presentation"
              onClick={() => setPending(null)}
            >
              <div
                className="logout-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-project-title"
                onClick={(event) => event.stopPropagation()}
              >
                <h2 id="delete-project-title" className="section-title">
                  Delete this project?
                </h2>
                <p className="muted" style={{ fontSize: 14 }}>
                  This removes{" "}
                  <strong>{pending.name.trim() || "Untitled project"}</strong>{" "}
                  from Your projects. You can&apos;t undo this.
                </p>
                <div className="logout-dialog-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setPending(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={confirmRemove}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
