import Icon from "@/components/Icon"
import { MATERIAL_PRICES, peso } from "@/lib/estimate"
import { dialable, referencePrice, SUPPLIERS } from "@/lib/suppliers"

const CRITERIA = [
  {
    title: "Price",
    body: "Each supplier's quote is compared line by line against the reference pricing below.",
  },
  {
    title: "Availability",
    body: "Suppliers that stock every material in your bill of materials rank above partial matches.",
  },
  {
    title: "Lead time",
    body: "Faster delivery breaks the tie when price and availability are close.",
  },
]

export default function SupplierPage() {
  return (
    <>
      <header>
        <span className="eyebrow">Procurement</span>
        <h1 className="page-title">Hardware suppliers</h1>
        <p className="page-subtitle">
          Registered hardware stores, what they carry, and how to reach them.
          Decision support ranks them against your bill of materials by price,
          availability, and lead time. Prices below the reference figure are
          highlighted.
        </p>
      </header>

      <section className="grid grid-2">
        {SUPPLIERS.map((supplier) => (
          <div key={supplier.id} className="card">
            <div className="card-head">
              <span className="card-icon">
                <Icon name="store" size={20} />
              </span>
              <h3>{supplier.name}</h3>
              {supplier.best ? (
                <span className="badge" style={{ marginLeft: "auto" }}>
                  Best match
                </span>
              ) : null}
            </div>
            <p>{supplier.location}</p>

            <div className="supplier-contact">
              <a href={`mailto:${supplier.email}`}>
                <Icon name="mail" size={15} />
                {supplier.email}
              </a>
              <a href={`tel:${dialable(supplier.phone)}`}>
                <Icon name="phone" size={15} />
                {supplier.phone}
              </a>
            </div>

            <div className="supplier-catalog">
              <span className="field-label">Catalog</span>
              {supplier.catalog.map((entry) => {
                const reference = referencePrice(entry.material)
                return (
                  <div key={entry.material} className="catalog-row">
                    <span>{entry.material}</span>
                    <span
                      className="catalog-price"
                      data-cheaper={
                        reference !== null && entry.price < reference
                      }
                    >
                      {peso(entry.price)}
                      <small> / {entry.unit}</small>
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="supplier-meta">
              <span className="badge badge-muted">
                Lead time {supplier.lead}
              </span>
              <span className="badge badge-muted">{supplier.priceIndex}</span>
            </div>
          </div>
        ))}
      </section>

      <section>
        <h2 className="section-title">How suppliers are ranked</h2>
        <p className="muted" style={{ fontSize: 14, marginBottom: 14 }}>
          Three criteria, applied to every quote you receive.
        </p>
        <div className="grid grid-3">
          {CRITERIA.map((criterion) => (
            <div key={criterion.title} className="card">
              <h3>{criterion.title}</h3>
              <p>{criterion.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title">Reference material pricing</h2>
        <p className="muted" style={{ fontSize: 14, marginBottom: 14 }}>
          Starter estimating prices used until a supplier quote is attached.
        </p>
        <div className="list">
          {MATERIAL_PRICES.map((material) => (
            <div key={material.name} className="list-row">
              <span className="list-row-title">{material.name}</span>
              <span className="list-row-value">
                {peso(material.price)} per {material.unit}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
