export default function HouseMeasurePreview() {
  return (
    <div
      className="house-measure"
      role="img"
      aria-label="Animated house plan being measured. Length 12.40 meters, width 8.60 meters, floor area 106.64 square meters."
    >
      <svg className="house-svg" viewBox="0 0 360 300" aria-hidden="true">
        <rect className="house-scan" x="90" y="48" width="200" height="140" />
        <path
          className="house-outline"
          pathLength="1"
          d="M90 48 h200 v140 h-84 v-22 h-32 v22 h-84 z"
        />
        <path className="house-partition" pathLength="1" d="M190 48 v88" />
        <path className="house-dim-l" pathLength="1" d="M90 208 v16 h200 v-16" />
        <path className="house-dim-w" pathLength="1" d="M90 48 h-18 v140 h18" />
        <circle className="house-dot" cx="90" cy="224" r="3" />
        <circle className="house-dot" cx="290" cy="224" r="3" />
        <circle className="house-dot house-dot-w" cx="72" cy="48" r="3" />
        <circle className="house-dot house-dot-w" cx="72" cy="188" r="3" />
      </svg>
      <span className="house-label house-label-l">12.40 m</span>
      <span className="house-label house-label-w">8.60 m</span>
      <span className="house-area">
        <small>Floor area</small>
        106.64 m²
      </span>
    </div>
  )
}
