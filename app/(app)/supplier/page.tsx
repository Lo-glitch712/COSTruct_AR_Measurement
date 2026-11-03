"use client"

import { useMemo, useState } from "react"
import {
  REFERENCE_MATERIALS,
  SUPPLIERS,
  TOWNS,
  catalogSummary,
  formatPeso,
  isCheaperThanReference,
  type Town,
} from "@/lib/suppliers"

type TownFilter = "All" | Town

export default function SupplierPage() {
  const [town, setTown] = useState<TownFilter>("All")

  const visible = useMemo(
    () =>
      town === "All"
        ? SUPPLIERS
        : SUPPLIERS.filter((supplier) => supplier.town === town),
    [town],
  )

  const grouped = useMemo(() => {
    return TOWNS.map((place) => ({
      place,
      stores: visible.filter((supplier) => supplier.town === place),
    })).filter((group) => group.stores.length > 0)
  }, [visible])

  return (
    <>
      <header>
        <span className="eyebrow">Procurement</span>
        <h1 className="page-title">Suppliers</h1>
        <p className="page-subtitle">
          Local hardware stores in the Partido Area and their baseline retail
          prices. Decision support highlights items priced below the reference
          estimate so you can compare towns side by side.
        </p>
      </header>

      <div
        className="town-filters"
        role="toolbar"
        aria-label="Filter by municipality"
      >
        {(["All", ...TOWNS] as TownFilter[]).map((place) => (
          <button
            key={place}
            type="button"
            className="town-filter"
            aria-pressed={town === place}
            onClick={() => setTown(place)}
          >
            {place}
          </button>
        ))}
      </div>

      {grouped.map((group) => (
        <section key={group.place} className="stack" style={{ gap: 12 }}>
          <h2 className="town-heading">
            {group.place}
            <span>
              {group.stores.length}{" "}
              {group.stores.length === 1 ? "store" : "stores"}
            </span>
          </h2>
          <div className="grid grid-2">
            {group.stores.map((supplier) => (
              <article
                key={`${supplier.town}-${supplier.name}`}
                className="card"
              >
                <div className="card-icon" aria-hidden>
                  🏬
                </div>
                <h3>{supplier.name}</h3>
                <p>
                  {supplier.town}, Camarines Sur ·{" "}
                  {catalogSummary(supplier.catalog)}
                </p>
                <div className="supplier-catalog">
                  {supplier.catalog.map((item) => (
                    <div key={item.key} className="catalog-row">
                      <span>{item.name}</span>
                      <span
                        className="catalog-price"
                        data-cheaper={isCheaperThanReference(item)}
                      >
                        {formatPeso(item.amount)} <small>{item.unit}</small>
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}

      <section>
        <h2 className="section-title">Reference material pricing</h2>
        <p className="muted" style={{ fontSize: 14, marginBottom: 14 }}>
          Typical Partido baseline used for estimates until a store quote is
          chosen. Green prices on the cards are cheaper than this reference.
        </p>
        <div className="list">
          {REFERENCE_MATERIALS.map((material) => (
            <div key={material.key} className="list-row">
              <span className="list-row-title">{material.name}</span>
              <span className="list-row-value">
                {formatPeso(material.amount)} {material.unit}
              </span>
            </div>
          ))}
        </div>
        <p className="muted" style={{ fontSize: 13, marginTop: 16 }}>
          Prices from Table 1 — Baseline Construction Material Retail Prices in
          Selected Municipalities of Partido Area (Tigaon, Goa, Lagonoy, San
          Jose, and Sagnay). AS = all-in sand, CR = crushed rock, GR = river
          gravel or grit, as recorded at each store. A dash in the survey means
          that item was not offered.
        </p>
      </section>
    </>
  )
}
