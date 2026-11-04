"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  COST_GUIDE_TABS,
  costGuideHref,
  hashForTab,
  pesoRange,
  tabFromHash,
  typicalMaterialRanges,
  type CostGuideTab,
} from "@/lib/costGuide"
import { peso } from "@/lib/estimate"

const USE_CASES = [
  {
    title: "Before you start building",
    body: "Price CHB, cement, sand, gravel, and plaster from the take-off so the budget is set by the list, not the first trip to the hardware.",
  },
  {
    title: "Comparing hardware stores",
    body: "Use one store’s unit prices, then swap in another Partido quote and see which bill of materials really costs less. Pickup only — COSTruct does not add a delivery fee.",
  },
  {
    title: "Builder budgets",
    body: "One running total for every material, with a waste allowance included. No extra tax line: hardware tags in the Philippines are usually already VAT-inclusive.",
  },
  {
    title: "Tracking spend on site",
    body: "Keep the list as bags, CHB, and aggregates are bought so the remaining budget stays visible.",
  },
  {
    title: "Preparing a client quote",
    body: "Contractors can take the material estimate, add their own markup, and keep labor as a separate line so the client can see both.",
  },
  {
    title: "Rechecking an old price",
    body: "Local hardware quotes often hold for about 7 to 15 days. If a bid has sat longer than that, rerun the list with fresh peso prices before you sign.",
  },
  {
    title: "Small and large jobs alike",
    body: "A single CHB wall or a whole house — the same quantity × unit price, plus waste.",
  },
]

function scrollToGuide() {
  document
    .getElementById("cost-guide")
    ?.scrollIntoView({ behavior: "smooth", block: "start" })
}

export function openCostGuide(tab: CostGuideTab = "answer") {
  const href = costGuideHref(tab)
  if (window.location.pathname === "/home") {
    const nextHash = `#${hashForTab(tab)}`
    if (window.location.hash !== nextHash) {
      window.location.hash = hashForTab(tab)
    }
    scrollToGuide()
    return
  }
  window.location.assign(href)
}

export function CostGuideBar() {
  const pathname = usePathname()
  const router = useRouter()
  const [active, setActive] = useState<CostGuideTab>("answer")

  useEffect(() => {
    function sync() {
      setActive(tabFromHash(window.location.hash))
    }
    sync()
    window.addEventListener("hashchange", sync)
    return () => window.removeEventListener("hashchange", sync)
  }, [pathname])

  function go(tab: CostGuideTab) {
    if (pathname === "/home") {
      openCostGuide(tab)
      return
    }
    router.push(costGuideHref(tab))
  }

  return (
    <div className="guide-bar" aria-label="Cost guide meanings">
      <div className="container guide-bar-inner">
        {COST_GUIDE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className="guide-chip"
            aria-current={
              pathname === "/home" && active === tab.id ? "true" : undefined
            }
            onClick={() => go(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function CostGuide() {
  const [tab, setTab] = useState<CostGuideTab>("answer")
  const ranges = typicalMaterialRanges()

  useEffect(() => {
    setTab(tabFromHash(window.location.hash))
    if (window.location.hash.replace(/^#/, "").startsWith("cost-")) {
      scrollToGuide()
    }
    function onHash() {
      setTab(tabFromHash(window.location.hash))
    }
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [])

  return (
    <section id="cost-guide" className="cost-guide">
      <header className="cost-guide-head">
        <span className="eyebrow">Philippine cost guide</span>
        <h2 className="section-title">How material cost is figured</h2>
        <p className="muted" style={{ fontSize: 14 }}>
          COSTruct prices a bill of materials the way Partido hardware stores
          sell it: quantity × unit price, plus a waste allowance. No delivery
          fee and no extra tax line — buying here is pickup, and shelf prices
          are already VAT-inclusive.
        </p>
      </header>

      {tab === "answer" ? (
        <article className="cost-guide-answer">
          <span className="eyebrow">Quick answer</span>
          <p>
            Material cost is <strong>quantity × unit price</strong> for each
            item, plus waste. Add about <strong>5% to 10%</strong> waste on most
            building materials in the Philippines; CHB is usually closer to{" "}
            <strong>10%</strong> for breakage and cuts. Contractors then mark
            materials up by about <strong>10% to 20%</strong>. COSTruct does not
            add delivery or a second tax pass.
          </p>
          <p>
            For reference in Partido, Camarines Sur: a 40&nbsp;kg bag of Portland
            cement runs about <strong>₱235 to ₱270</strong>, 4″ CHB about{" "}
            <strong>₱14 to ₱20</strong> a piece, and washed sand about{" "}
            <strong>₱1,240 to ₱1,650</strong> per cubic meter.
          </p>
        </article>
      ) : null}

      {tab === "formula" ? (
        <div className="guide-formula">
          <article className="guide-formula-col">
            <header>
              <strong>Buying materials</strong>
              <span>builders</span>
            </header>
            <dl>
              <div>
                <dt>Material cost</dt>
                <dd>Quantity × unit price for every item on the list</dd>
              </div>
              <div>
                <dt>Waste</dt>
                <dd>
                  Material cost × waste %, about 10% when you are unsure
                </dd>
              </div>
              <div>
                <dt>Markup</dt>
                <dd>None</dd>
              </div>
              <div>
                <dt>Final price</dt>
                <dd>Material cost + Waste</dd>
              </div>
            </dl>
          </article>

          <article className="guide-formula-col">
            <header>
              <strong>Billing materials</strong>
              <span>contractors</span>
            </header>
            <dl>
              <div>
                <dt>Material cost</dt>
                <dd>
                  Quantity × the unit price you actually pay at the hardware
                </dd>
              </div>
              <div>
                <dt>Waste</dt>
                <dd>
                  A waste % set per line — CHB, cement, and aggregates waste
                  differently
                </dd>
              </div>
              <div>
                <dt>Markup</dt>
                <dd>(Material cost + Waste) × your markup %</dd>
              </div>
              <div>
                <dt>Final price</dt>
                <dd>Material cost + Waste + Markup</dd>
              </div>
            </dl>
          </article>
        </div>
      ) : null}

      {tab === "uses" ? (
        <div className="cost-guide-uses">
          <p className="cost-guide-lead">
            Any time a project needs a materials budget, a hardware comparison,
            or the materials line of a quote.
          </p>
          <ul>
            {USE_CASES.map((item) => (
              <li key={item.title}>
                <strong>{item.title}:</strong> {item.body}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {tab === "average" ? (
        <div className="cost-guide-average">
          <p className="muted" style={{ fontSize: 14, marginBottom: 14 }}>
            COSTruct reference prices, with the range canvassed from hardware
            stores in Tigaon, Goa, Lagonoy, San Jose, and Sagnay. Pickup prices
            in Philippine pesos.
          </p>
          <div className="list">
            {ranges.map((item) => (
              <div key={item.name} className="list-row">
                <div className="catalog-item">
                  <span className="list-row-title">{item.name}</span>
                  <span className="tiny">
                    Typical {pesoRange(item.min, item.max)} per {item.unit}
                  </span>
                </div>
                <span className="catalog-price">
                  {peso(item.reference)}
                  <small> / {item.unit}</small>
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  )
}
