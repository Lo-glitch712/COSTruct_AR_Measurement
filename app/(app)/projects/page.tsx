import Link from "next/link"

export default function ProjectsPage() {
  return (
    <>
      <header>
        <span className="eyebrow">Projects</span>
        <h1 className="page-title">Your projects</h1>
        <p className="page-subtitle">
          Every project keeps its own components, measurements, quantities, and
          cost estimate so you can revisit or revise it later.
        </p>
      </header>

      <div
        className="card"
        style={{ textAlign: "center", padding: "52px 24px" }}
      >
        <div
          className="card-icon"
          aria-hidden
          style={{ margin: "0 auto 16px" }}
        >
          🗂️
        </div>
        <h3>No projects yet</h3>
        <p style={{ maxWidth: "42ch", margin: "0 auto" }}>
          Create your first project by measuring a space. COSTruct will save the
          dimensions, quantities, and estimate together.
        </p>
        <div
          className="hero-actions"
          style={{ justifyContent: "center", marginTop: 22 }}
        >
          <Link href="/measurements" className="btn btn-primary">
            New measurement
          </Link>
        </div>
      </div>
    </>
  )
}
