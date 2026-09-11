import Link from "next/link"

export default function LandingPage() {
  return (
    <main className="landing">
      <div className="landing-card">
        <div className="landing-brand">COSTruct</div>
        <h1 className="landing-title">AR Measurement</h1>
        <p className="landing-subtitle">
          Measure floor dimensions, area, and height with your phone camera.
        </p>
        <Link href="/login" className="btn btn-primary btn-lg btn-block">
          Start Measuring
        </Link>
        <div className="landing-note">
          For better tracking, use the app in a well-lit area.
        </div>
      </div>
    </main>
  )
}
