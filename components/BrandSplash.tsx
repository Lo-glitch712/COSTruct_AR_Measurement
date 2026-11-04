import Icon from "@/components/Icon"

export const BRAND_LOAD_MS = 8000

export default function BrandSplash() {
  return (
    <main className="brand-splash" role="status" aria-live="polite">
      <div className="brand-splash-mark" aria-hidden="true">
        <span className="ruler-ring" />
        <span className="ruler-ring ruler-ring-inner" />
        <span className="ruler-spin">
          <Icon name="ruler" size={52} />
        </span>
      </div>
      <h1 className="brand-splash-name">COSTruct</h1>
      <p className="brand-splash-tag">
        Measurement, cost estimation &amp; procurement
      </p>
      <div className="brand-splash-bar" aria-hidden="true">
        <span className="brand-splash-fill" />
      </div>
    </main>
  )
}
