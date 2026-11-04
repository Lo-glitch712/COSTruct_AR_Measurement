import Icon from "@/components/Icon"

const STEPS = ["Measured", "Estimated", "Ordered", "On site"]

const LINES = [
  { name: "Sand", qty: "0.50 m³", status: "On site" },
  { name: "Portland Cement", qty: "9.00 bag", status: "Picked up" },
  { name: "Gravel", qty: "0.80 m³", status: "Ordered" },
]

export default function TrackPreview() {
  return (
    <div
      className="track-preview"
      role="img"
      aria-label="Animated project listing and material tracking. Tigaon residence is saved, then Sand is on site, Portland Cement is picked up, and Gravel is ordered."
    >
      <div className="track-project">
        <span className="track-icon" aria-hidden="true">
          <Icon name="folder" size={20} />
        </span>
        <div>
          <strong>Tigaon residence</strong>
          <span>4 Nov 2026 · Nikki &amp; Kikko Hardware</span>
        </div>
        <strong className="track-sum">₱4,240.00</strong>
      </div>
      <div className="track-steps" aria-hidden="true">
        {STEPS.map((step, index) => (
          <span key={step} className={`track-step track-step-${index + 1}`}>
            {step}
          </span>
        ))}
      </div>
      <ul className="track-lines">
        {LINES.map((line, index) => (
          <li key={line.name} className={`track-line track-line-${index + 1}`}>
            <span className="track-name">{line.name}</span>
            <span className="track-qty">{line.qty}</span>
            <span className="track-status">{line.status}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
