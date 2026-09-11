"use client"

import Link from "next/link"
import Icon, { type IconName } from "@/components/Icon"
import { ROLE_LABEL, useSession } from "@/lib/session"

const PILLARS: {
  icon: IconName
  title: string
  body: string
  href: string
}[] = [
  {
    icon: "ruler",
    title: "Measurement",
    body: "Enter length, width, and height for each structural component and COSTruct computes the areas and volumes for you.",
    href: "/measurements",
  },
  {
    icon: "calculator",
    title: "Material Quantity & Cost Estimation",
    body: "Dimensions become material quantities and a priced bill of materials for every component, updated as you type.",
    href: "/measurements",
  },
  {
    icon: "truck",
    title: "Procurement",
    body: "Match your bill of materials with registered hardware suppliers and send requests without leaving the platform.",
    href: "/supplier",
  },
  {
    icon: "compass",
    title: "Decision Support",
    body: "Compare hardware suppliers on price, availability, and lead time so you can choose with confidence.",
    href: "/supplier",
  },
]

const STATS = [
  { value: "7", label: "Structural components" },
  { value: "5", label: "Priced materials" },
  { value: "₱", label: "Live cost estimate" },
  { value: "6", label: "Hardware suppliers" },
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
          for construction projects. Enter your dimensions, get a costed bill of
          materials, and reach hardware suppliers — all in one workflow.
        </p>
        <div className="hero-actions">
          <Link href="/measurements" className="btn btn-primary">
            Start a measurement
            <Icon name="arrowRight" size={18} />
          </Link>
          <Link href="/projects" className="btn btn-secondary">
            View projects
          </Link>
        </div>
      </section>

      <section className="grid grid-2" style={{ gridAutoRows: "1fr" }}>
        {PILLARS.map((pillar) => (
          <Link key={pillar.title} href={pillar.href} className="card card-link">
            <span className="card-icon">
              <Icon name={pillar.icon} size={20} />
            </span>
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
