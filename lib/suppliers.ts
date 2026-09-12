export type Supplier = {
  id: string
  name: string
  location: string
  items: string
  lead: string
  priceIndex: string
  best?: boolean
}

export const SUPPLIERS: Supplier[] = [
  {
    id: "northgate",
    name: "Northgate Aggregates",
    location: "Quezon City",
    items: "Sand, Gravel, CHB",
    lead: "1–2 days",
    priceIndex: "Below reference",
    best: true,
  },
  {
    id: "pacific",
    name: "Pacific Cement Depot",
    location: "Caloocan",
    items: "Portland Cement, Mortar mix",
    lead: "Same day",
    priceIndex: "At reference",
  },
  {
    id: "southline",
    name: "Southline Hardware",
    location: "Parañaque",
    items: 'CHB 4", CHB 5", Rebar',
    lead: "2–3 days",
    priceIndex: "Below reference",
  },
  {
    id: "metro",
    name: "Metro Builders Supply",
    location: "Mandaluyong",
    items: "Full range",
    lead: "1 day",
    priceIndex: "Above reference",
  },
  {
    id: "eastbay",
    name: "Eastbay Construction Supply",
    location: "Antipolo",
    items: "Sand, Gravel, Cement",
    lead: "2 days",
    priceIndex: "At reference",
  },
  {
    id: "riverside",
    name: "Riverside Hardware & Trading",
    location: "Marikina",
    items: "CHB, Rebar, Finishing materials",
    lead: "3–4 days",
    priceIndex: "Below reference",
  },
]

export function supplierById(id: string | null | undefined) {
  if (!id) return null
  return SUPPLIERS.find((supplier) => supplier.id === id) ?? null
}
