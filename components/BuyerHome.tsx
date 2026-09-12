"use client"

import Link from "next/link"
import Icon, { type IconName } from "@/components/Icon"
import type { Session } from "@/lib/session"

const PILLARS: { icon: IconName; title: string; body: string }[] = [
  {
    icon: "ruler",
    title: "Measurement",
    body: "Enter length, width, and height for each structural component and COSTruct computes the areas and volumes for you.",
  },
  {
    icon: "calculator",
    title: "Material Quantity & Cost Estimation",
    body: "Dimensions become material quantities and a priced bill of materials for every component, updated as you type.",
  },
  {
    icon: "truck",
    title: "Procurement",
    body: "Match your bill of materials with registered hardware suppliers and send requests without leaving the platform.",
  },
  {
    icon: "compass",
    title: "Decision Support",
    body: "Compare hardware suppliers on price, availability, and lead time so you can choose with confidence.",
  },
]

export default function BuyerHome({ session }: { session: Session }) {
  const firstName = session.name.split(" ")[0]

  return (
    <>
      <section className="hero">
        <span className="eyebrow">Buyer Home</span>
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
        </div>
      </section>

      <section className="grid grid-2" style={{ gridAutoRows: "1fr" }}>
        {PILLARS.map((pillar) => (
          <article key={pillar.title} className="card">
            <span className="card-icon">
              <Icon name={pillar.icon} size={20} />
            </span>
            <h3>{pillar.title}</h3>
            <p>{pillar.body}</p>
          </article>
        ))}
      </section>
    </>
  )
}
