import Icon from "@/components/Icon"

const LINES = [
  { name: "Sand", qty: "0.50 m³" },
  { name: "Portland Cement", qty: "9.00 bag" },
  { name: "Gravel", qty: "0.80 m³" },
]

export default function EstimatePreview() {
  return (
    <div
      className="est-preview"
      role="img"
      aria-label="Animated estimate. Sand 0.50 cubic meters, Portland Cement 9.00 bags, Gravel 0.80 cubic meters, total 4,240 pesos."
    >
      <div className="est-head">
        <span className="est-icon" aria-hidden="true">
          <Icon name="calculator" size={22} />
        </span>
        <div>
          <strong>Column</strong>
          <span>4.20 × 0.40 × 2.80 m</span>
        </div>
      </div>
      <ul className="est-lines">
        {LINES.map((line, index) => (
          <li key={line.name} className={`est-line est-line-${index + 1}`}>
            <span className="est-name">{line.name}</span>
            <span className="est-qty">{line.qty}</span>
          </li>
        ))}
      </ul>
      <div className="est-total">
        <span>Estimated total</span>
        <strong>₱4,240.00</strong>
      </div>
    </div>
  )
}
