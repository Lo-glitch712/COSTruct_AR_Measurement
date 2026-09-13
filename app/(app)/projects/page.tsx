"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Icon from "@/components/Icon"
import { peso } from "@/lib/estimate"
import {
  readProjects,
  removeProject,
  saveDraft,
  type SavedProject,
} from "@/lib/project"
import { supplierById } from "@/lib/suppliers"

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<SavedProject[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setProjects(readProjects())
    setLoaded(true)
  }, [])

  function open(project: SavedProject) {
    saveDraft({
      name: project.name,
      savedAt: project.savedAt,
      supplierId: project.supplierId,
      components: project.components,
    })
    router.push("/measurements/estimate")
  }

  function remove(id: string) {
    removeProject(id)
    setProjects(readProjects())
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
            <Link href="/measurements" className="btn btn-primary">
              Start a measurement
            </Link>
          </div>
        </div>
      ) : (
        <section className="stack">
          {projects.map((project) => {
            const supplier = supplierById(project.supplierId)
            const savedAt = new Date(project.savedAt)
            return (
              <article key={project.id} className="card">
                <div className="card-head">
                  <span className="card-icon">
                    <Icon name="folder" size={20} />
                  </span>
                  <h3>{project.name.trim() || "Untitled project"}</h3>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => remove(project.id)}
                    aria-label={`Delete ${project.name.trim() || "untitled project"}`}
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>
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
                    <Icon name="arrowRight" size={14} />
                  </button>
                </div>
              </article>
            )
          })}
        </section>
      )}
    </>
  )
}
