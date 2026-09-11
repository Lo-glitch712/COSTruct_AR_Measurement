const SUPPLIERS = [
  {
    name: "Northgate Aggregates",
    location: "Quezon City",
    items: "Sand, Gravel, CHB",
    lead: "1–2 days",
  },
  {
    name: "Pacific Cement Depot",
    location: "Caloocan",
    items: "Portland Cement, Mortar mix",
    lead: "Same day",
  },
  {
    name: "Southline Hardware",
    location: "Parañaque",
    items: "CHB 4\", CHB 5\", Rebar",
    lead: "2–3 days",
  },
  {
    name: "Metro Builders Supply",
    location: "Mandaluyong",
    items: "Full range",
    lead: "1 day",
  },
]

const MATERIALS = [
  { name: "Sand", price: "₱1,350.00", unit: "per m³" },
  { name: "Portland Cement", price: "₱245.00", unit: "per bag" },
  { name: "Gravel", price: "₱1,700.00", unit: "per m³" },
  { name: 'CHB — 4"', price: "₱17.00", unit: "per pc" },
  { name: 'CHB — 5"', price: "₱20.00", unit: "per pc" },
]

export default function SupplierPage() {
  return (
    <>
      <header>
        <span className="eyebrow">Procurement</span>
        <h1 className="page-title">Suppliers</h1>
        <p className="page-subtitle">
          Registered suppliers and their reference pricing. Decision support
          ranks them against your bill of materials by price, availability, and
          lead time.
        </p>
      </header>

      <section className="grid grid-2">
        {SUPPLIERS.map((supplier) => (
          <div key={supplier.name} className="card">
            <div className="card-icon" aria-hidden>
              🏬
            </div>
            <h3>{supplier.name}</h3>
            <p>
              {supplier.location} · {supplier.items}
            </p>
            <div style={{ marginTop: 14 }}>
              <span className="badge">Lead time {supplier.lead}</span>
            </div>
          </div>
        ))}
      </section>

      <section>
        <h2 className="section-title">Reference material pricing</h2>
        <p className="muted" style={{ fontSize: 14, marginBottom: 14 }}>
          Starter estimating prices used until a supplier quote is attached.
        </p>
        <div className="list">
          {MATERIALS.map((material) => (
            <div key={material.name} className="list-row">
              <span className="list-row-title">{material.name}</span>
              <span className="list-row-value">
                {material.price} {material.unit}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
