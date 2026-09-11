"use client"

import Link from "next/link"
import { ROLE_LABEL, useSession } from "@/lib/session"

const PILLARS = [
  {
    icon: "📐",
    title: "Measurement",
    body: "Capture floor dimensions, area, and height on site using your phone camera with AR, or type them in manually.",
    href: "/measurements",
  },
  {
    icon: "🧮",
    title: "Material Quantity & Cost Estimation",
    body: "Turn measured dimensions into material quantities and a priced estimate for every structural component.",
    href: "/measurements",
  },
  {
    icon: "🚚",
    title: "Procurement",
    body: "Match your bill of materials with registered suppliers and send requests without leaving the platform.",
    href: "/supplier",
  },
  {
    icon: "🧭",
    title: "Decision Support",
    body: "Compare supplier offers on price, availability, and distance so you can choose with confidence.",
    href: "/supplier",
  },
]

const STATS = [
  { value: "7", label: "Structural components" },
  { value: "AR", label: "On-site measurement" },
  { value: "₱", label: "Live cost estimate" },
  { value: "24/7", label: "Supplier catalog" },
]

export default function HomePage() {
  const { session } = useSession()
  const firstName = session?.name.split(" ")[0] ?? "there"
  const role = session ? ROLE_LABEL[session.role] : "Buyer"

  return (
    <>
      <section className="hero">
        <span className="eyebrow">{role} Home</span>
        <h1 className="hero-title">Welcome, {firstName}.</h1>
        <p className="hero-full-title">
          <strong>COSTruct</strong> is a web-based measurement, material
          quantity cost estimation and procurement system with decision support
          for construction projects. It brings site measurement, quantity
          take-off, pricing, and supplier sourcing into one simple workflow — so
          you can go from a room you just measured to a costed bill of materials
          and a supplier request in minutes.
        </p>
        <div className="hero-actions">
          <Link href="/measurements" className="btn btn-primary">
            Start a measurement
          </Link>
          <Link href="/projects" className="btn btn-secondary">
            View projects
          </Link>
        </div>
      </section>

      <section className="grid grid-2" style={{ gridAutoRows: "1fr" }}>
        {PILLARS.map((pillar) => (
          <Link key={pillar.title} href={pillar.href} className="card card-link">
            <div className="card-icon" aria-hidden>
              {pillar.icon}
            </div>
            <h3>{pillar.title}</h3>
            <p>{pillar.body}</p>
          </Link>
        ))}
      </section>

      <section>
        <h2 className="section-title">At a glance</h2>
        <p className="muted" style={{ fontSize: 14, marginBottom: 14 }}>
          What COSTruct handles for you on every project.
        </p>
        <div className="grid grid-3">
          {STATS.map((stat) => (
            <div key={stat.label} className="stat">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
