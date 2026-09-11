import Link from "next/link"
import Icon, { type IconName } from "@/components/Icon"

const CAPABILITIES: { icon: IconName; label: string }[] = [
  { icon: "ruler", label: "Measurement" },
  { icon: "calculator", label: "Cost estimation" },
  { icon: "truck", label: "Procurement" },
  { icon: "compass", label: "Decision support" },
]

export default function LandingPage() {
  return (
    <main className="landing">
      <div className="landing-glow" aria-hidden />

      <section className="landing-card">
        <p className="landing-eyebrow">Construction estimating platform</p>
        <h1 className="landing-brand">COSTruct</h1>
        <p className="landing-title">
          A web-based measurement, material quantity cost estimation and
          procurement system with decision support for construction projects.
        </p>

        <ul className="landing-capabilities">
          {CAPABILITIES.map((capability) => (
            <li key={capability.label}>
              <Icon name={capability.icon} size={17} />
              {capability.label}
            </li>
          ))}
        </ul>

        <Link href="/login" className="btn btn-primary btn-lg btn-block">
          Get started
          <Icon name="arrowRight" size={18} />
        </Link>

        <p className="landing-note">
          Measure by hand or with your phone camera, price the bill of
          materials, then compare hardware suppliers in one place.
        </p>
      </section>
    </main>
  )
}
