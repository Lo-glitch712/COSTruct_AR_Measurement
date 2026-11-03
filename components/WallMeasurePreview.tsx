export default function WallMeasurePreview() {
  return (
    <div
      className="wall-measure"
      role="img"
      aria-label="Animated wall being measured. Length 4.20 meters, height 2.80 meters."
    >
      <svg className="wall-svg" viewBox="0 0 360 280" aria-hidden="true">
        <rect className="wall-scan" x="86" y="36" width="208" height="168" />
        <path
          className="wall-outline"
          pathLength="1"
          d="M86 36 h208 v168 h-78 v-70 h-52 v70 h-78 z"
        />
        <rect
          className="wall-window"
          pathLength="1"
          x="112"
          y="68"
          width="44"
          height="36"
        />
        <rect
          className="wall-window"
          pathLength="1"
          x="224"
          y="68"
          width="44"
          height="36"
        />
        <path className="wall-dim-l" pathLength="1" d="M86 224 v14 h208 v-14" />
        <path className="wall-dim-h" pathLength="1" d="M86 36 h-16 v168 h16" />
        <circle className="wall-dot" cx="86" cy="238" r="3" />
        <circle className="wall-dot" cx="294" cy="238" r="3" />
        <circle className="wall-dot wall-dot-h" cx="70" cy="36" r="3" />
        <circle className="wall-dot wall-dot-h" cx="70" cy="204" r="3" />
      </svg>
      <span className="wall-label wall-label-l">4.20 m</span>
      <span className="wall-label wall-label-h">2.80 m</span>
    </div>
  )
}
