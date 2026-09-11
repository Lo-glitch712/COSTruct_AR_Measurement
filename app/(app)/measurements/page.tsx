import { AR_APP_URL } from "@/lib/ar"

const COMPONENTS = [
  "Column",
  "Beam",
  "Ground Floor Slab",
  "Slab",
  "Mortar",
  "Plastering",
  "Walls",
]

export default function MeasurementsPage() {
  return (
    <>
      <header>
        <span className="eyebrow">Measurements</span>
        <h1 className="page-title">Measure and estimate</h1>
        <p className="page-subtitle">
          Open the AR measurement tool to capture length, width, and height on
          site, then let COSTruct compute material quantities and cost for each
          structural component.
        </p>
      </header>

      <div className="card">
        <div className="card-icon" aria-hidden>
          📱
        </div>
        <h3>AR Measurement & Cost Estimation</h3>
        <p>
          Runs the camera-based measurement experience. Best on a phone, in a
          well-lit area, over HTTPS or localhost so the browser can grant camera
          access.
        </p>
        <div className="hero-actions" style={{ marginTop: 20 }}>
          <a className="btn btn-primary" href={AR_APP_URL}>
            Open AR Measurement
          </a>
          <a
            className="btn btn-secondary"
            href={AR_APP_URL}
            target="_blank"
            rel="noreferrer"
          >
            Open in new tab
          </a>
        </div>
      </div>

      <section>
        <h2 className="section-title">Components you can measure</h2>
        <p className="muted" style={{ fontSize: 14, marginBottom: 14 }}>
          Each component keeps its own dimensions and can use manual input or AR
          independently.
        </p>
        <div className="list">
          {COMPONENTS.map((name, index) => (
            <div key={name} className="list-row">
              <span className="badge">{String(index + 1).padStart(2, "0")}</span>
              <span className="list-row-title">{name}</span>
              <span className="list-row-value">Not measured</span>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
