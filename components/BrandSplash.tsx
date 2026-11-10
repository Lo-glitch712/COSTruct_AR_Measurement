import BlockStack from "@/components/BlockStack"

export const BRAND_LOAD_MS = 8000

export default function BrandSplash() {
  return (
    <main className="brand-splash" role="status" aria-live="polite">
      <BlockStack />
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
