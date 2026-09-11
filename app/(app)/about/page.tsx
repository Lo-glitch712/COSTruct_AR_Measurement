const FLOW = [
  {
    step: "01",
    title: "Measure",
    body: "Capture length, width, and height on site with AR, or enter them manually per component.",
  },
  {
    step: "02",
    title: "Quantify",
    body: "Dimensions are converted into material quantities using standard estimating factors.",
  },
  {
    step: "03",
    title: "Cost",
    body: "Quantities are priced into a per-component and total project estimate.",
  },
  {
    step: "04",
    title: "Procure",
    body: "Send the bill of materials to suppliers and compare their responses side by side.",
  },
]

export default function AboutPage() {
  return (
    <>
      <header>
        <span className="eyebrow">About</span>
        <h1 className="page-title">COSTruct</h1>
        <p className="page-subtitle">
          A web-based measurement, material quantity cost estimation and
          procurement system with decision support for construction projects.
        </p>
      </header>

      <div className="card">
        <h3>Why it exists</h3>
        <p>
          Estimating a small construction job usually means measuring by hand,
          transferring numbers into a spreadsheet, guessing quantities from
          memory, and calling suppliers one at a time. COSTruct collapses that
          into a single flow: measure the space, get the quantities and cost
          automatically, then reach suppliers with a bill of materials that is
          already priced.
        </p>
      </div>

      <section>
        <h2 className="section-title">How it works</h2>
        <p className="muted" style={{ fontSize: 14, marginBottom: 14 }}>
          Four stages, one continuous workflow.
        </p>
        <div className="grid grid-2">
          {FLOW.map((item) => (
            <div key={item.step} className="card">
              <span className="eyebrow">{item.step}</span>
              <h3 style={{ marginTop: 8 }}>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="card">
        <h3>Built with</h3>
        <p>
          Next.js and React for the application shell, and 8th Wall with A-Frame
          for the camera-based AR measurement experience.
        </p>
      </div>
    </>
  )
}
