export default function PointMeasurePreview() {
  return (
    <div
      className="pt-measure"
      role="img"
      aria-label="Animated point-to-point measurement. Four floor points are placed, then L1 through L4 and the floor area appear."
    >
      <div className="pt-viewport">
        <div className="pt-floor" aria-hidden="true" />

        <svg className="pt-svg" viewBox="0 0 360 280" aria-hidden="true">
          <polygon
            className="pt-fill"
            points="70,168 290,168 236,96 124,96"
          />
          <path className="pt-seg pt-seg-1" pathLength="1" d="M70 168 H290" />
          <path className="pt-seg pt-seg-2" pathLength="1" d="M290 168 L236 96" />
          <path className="pt-seg pt-seg-3" pathLength="1" d="M236 96 H124" />
          <path className="pt-seg pt-seg-4" pathLength="1" d="M124 96 L70 168" />

          <g className="pt-mark pt-mark-1">
            <circle className="pt-ripple" cx="70" cy="168" r="14" />
            <circle className="pt-dot" cx="70" cy="168" r="5" />
          </g>
          <g className="pt-mark pt-mark-2">
            <circle className="pt-ripple" cx="290" cy="168" r="14" />
            <circle className="pt-dot" cx="290" cy="168" r="5" />
          </g>
          <g className="pt-mark pt-mark-3">
            <circle className="pt-ripple" cx="236" cy="96" r="14" />
            <circle className="pt-dot" cx="236" cy="96" r="5" />
          </g>
          <g className="pt-mark pt-mark-4">
            <circle className="pt-ripple" cx="124" cy="96" r="14" />
            <circle className="pt-dot" cx="124" cy="96" r="5" />
          </g>
        </svg>

        <span className="pt-chip pt-chip-l1">L1  3.20 m</span>
        <span className="pt-chip pt-chip-l2">L2  2.10 m</span>
        <span className="pt-chip pt-chip-l3">L3  3.20 m</span>
        <span className="pt-chip pt-chip-l4">L4  2.10 m</span>
        <span className="pt-area">Area 6.72 m²</span>

        <div className="pt-crosshair" aria-hidden="true">
          <span className="pt-reticle" />
          +
        </div>

        <div className="pt-prompt">
          <span className="pt-prompt-line pt-prompt-1">
            Aim at the first point, then tap Place
          </span>
          <span className="pt-prompt-line pt-prompt-2">
            Aim at the next point, then tap Place
          </span>
          <span className="pt-prompt-line pt-prompt-3">
            Floor area complete. You can switch to Height.
          </span>
        </div>

        <div className="pt-place" aria-hidden="true">
          Place
          <br />
          Point
        </div>
      </div>
    </div>
  )
}
