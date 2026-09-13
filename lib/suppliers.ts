import { MATERIAL_PRICES } from "@/lib/estimate"

export type CatalogEntry = { material: string; price: number; unit: string }

export type Town = "Tigaon" | "Goa" | "Lagonoy" | "San Jose" | "Sagnay"

export type Supplier = {
  id: string
  name: string
  town: Town
  location: string
  email?: string
  phone?: string
  lead: string
  priceIndex: string
  catalog: CatalogEntry[]
  best?: boolean
}

export const TOWNS: Town[] = ["Tigaon", "Goa", "Lagonoy", "San Jose", "Sagnay"]

export function supplierEmail(id: string) {
  return `${id.replace(/-/g, "")}.hardware@gmail.com`
}

function located(town: Town): string {
  return `${town}, Camarines Sur`
}

/**
 * Baseline retail prices from Table 1, Chapter 5 — canvassed hardware stores
 * in Tigaon, Goa, Lagonoy, San Jose, and Sagnay.
 */
export const SUPPLIERS: Supplier[] = [
  {
    id: "johan",
    name: "Johan Hardware",
    town: "Tigaon",
    location: located("Tigaon"),
    lead: "Local pickup",
    priceIndex: "Above reference",
    catalog: [
      { material: "Portland Cement", price: 255, unit: "bag" },
      { material: "Pozzolan Cement", price: 250, unit: "bag" },
      { material: "Sand", price: 1400, unit: "m³" },
      { material: "Gravel", price: 1800, unit: "m³" },
      { material: 'CHB — 4"', price: 16, unit: "pc" },
      { material: 'CHB — 5"', price: 18, unit: "pc" },
      { material: 'CHB — 6"', price: 20, unit: "pc" },
    ],
  },
  {
    id: "hdc",
    name: "HDC Hardware",
    town: "Tigaon",
    location: located("Tigaon"),
    lead: "Local pickup",
    priceIndex: "Above reference",
    catalog: [
      { material: "Portland Cement", price: 270, unit: "bag" },
      { material: "Pozzolan Cement", price: 265, unit: "bag" },
      { material: "Sand", price: 1650, unit: "m³" },
      { material: "Gravel (CR)", price: 2100, unit: "m³" },
      { material: 'CHB — 4"', price: 20, unit: "pc" },
      { material: 'CHB — 5"', price: 26, unit: "pc" },
      { material: 'CHB — 6"', price: 31, unit: "pc" },
    ],
  },
  {
    id: "bong-chel",
    name: "Bong & Chel Hardware",
    town: "Tigaon",
    location: located("Tigaon"),
    lead: "Local pickup",
    priceIndex: "At reference",
    catalog: [
      { material: "Portland Cement", price: 245, unit: "bag" },
      { material: "Sand", price: 1400, unit: "m³" },
      { material: "Gravel", price: 1800, unit: "m³" },
      { material: 'CHB — 4"', price: 18, unit: "pc" },
    ],
  },
  {
    id: "st-claire",
    name: "St. Claire Hardware",
    town: "Tigaon",
    location: located("Tigaon"),
    lead: "Local pickup",
    priceIndex: "At reference",
    catalog: [
      { material: "Portland Cement", price: 245, unit: "bag" },
      { material: "Pozzolan Cement", price: 240, unit: "bag" },
      { material: "Sand", price: 1400, unit: "m³" },
      { material: "Gravel", price: 1800, unit: "m³" },
      { material: 'CHB — 4"', price: 17, unit: "pc" },
      { material: 'CHB — 5"', price: 20, unit: "pc" },
    ],
  },
  {
    id: "three-28",
    name: "Three 28 Hardware",
    town: "Tigaon",
    location: located("Tigaon"),
    lead: "Local pickup",
    priceIndex: "Above reference",
    catalog: [
      { material: "Portland Cement", price: 245, unit: "bag" },
      { material: "Sand", price: 1500, unit: "m³" },
      { material: "Gravel", price: 1800, unit: "m³" },
      { material: 'CHB — 4"', price: 18, unit: "pc" },
      { material: 'CHB — 5"', price: 21, unit: "pc" },
    ],
  },
  {
    id: "city-town",
    name: "City Town Hardware",
    town: "Goa",
    location: located("Goa"),
    lead: "Local pickup",
    priceIndex: "Below reference",
    catalog: [
      { material: "Portland Cement", price: 240, unit: "bag" },
      { material: "Sand", price: 1600, unit: "m³" },
      { material: "Gravel", price: 1400, unit: "m³" },
      { material: 'CHB — 4"', price: 14, unit: "pc" },
    ],
  },
  {
    id: "nikki-kikko",
    name: "Nikki & Kikko Hardware",
    town: "Goa",
    location: located("Goa"),
    lead: "Local pickup",
    priceIndex: "Below reference",
    best: true,
    catalog: [
      { material: "Portland Cement", price: 235, unit: "bag" },
      { material: "Sand (AS)", price: 1240, unit: "m³" },
      { material: "Gravel", price: 1635, unit: "m³" },
      { material: 'CHB — 4"', price: 17, unit: "pc" },
    ],
  },
  {
    id: "sm-goa",
    name: "S & M Hardware",
    town: "Goa",
    location: located("Goa"),
    lead: "Local pickup",
    priceIndex: "At reference",
    catalog: [
      { material: "Portland Cement", price: 245, unit: "bag" },
      { material: "Sand", price: 1483, unit: "m³" },
      { material: "Gravel", price: 1700, unit: "m³" },
      { material: 'CHB — 4"', price: 16, unit: "pc" },
      { material: 'CHB — 5"', price: 18, unit: "pc" },
    ],
  },
  {
    id: "kuya-pony",
    name: "Kuya Pony Hardware",
    town: "Lagonoy",
    location: located("Lagonoy"),
    lead: "Local pickup",
    priceIndex: "Below reference",
    catalog: [
      { material: "Portland Cement", price: 240, unit: "bag" },
      { material: "Sand", price: 1350, unit: "m³" },
      { material: "Gravel", price: 1750, unit: "m³" },
      { material: 'CHB — 4"', price: 16, unit: "pc" },
      { material: 'CHB — 5"', price: 18, unit: "pc" },
    ],
  },
  {
    id: "marks",
    name: "Marks Hardware",
    town: "Lagonoy",
    location: located("Lagonoy"),
    lead: "Local pickup",
    priceIndex: "At reference",
    catalog: [
      { material: "Portland Cement", price: 245, unit: "bag" },
      { material: "Sand", price: 1350, unit: "m³" },
      { material: "Gravel", price: 1700, unit: "m³" },
      { material: 'CHB — 4"', price: 17, unit: "pc" },
      { material: 'CHB — 5"', price: 20, unit: "pc" },
    ],
  },
  {
    id: "barnuevo",
    name: "Barnuevo Hardware",
    town: "Lagonoy",
    location: located("Lagonoy"),
    lead: "Local pickup",
    priceIndex: "Above reference",
    catalog: [
      { material: "Portland Cement", price: 245, unit: "bag" },
      { material: "Sand (AS)", price: 1600, unit: "m³" },
      { material: "Gravel (CR)", price: 2200, unit: "m³" },
      { material: "Gravel (GR)", price: 2000, unit: "m³" },
      { material: 'CHB — 4"', price: 4, unit: "pc" },
    ],
  },
  {
    id: "sm-lagonoy",
    name: "S & M Hardware",
    town: "Lagonoy",
    location: located("Lagonoy"),
    lead: "Local pickup",
    priceIndex: "Below reference",
    catalog: [
      { material: "Portland Cement", price: 240, unit: "bag" },
      { material: "Sand", price: 1240, unit: "m³" },
      { material: "Gravel", price: 1980, unit: "m³" },
      { material: 'CHB — 4"', price: 17, unit: "pc" },
      { material: 'CHB — 5"', price: 18, unit: "pc" },
      { material: 'CHB — 6"', price: 19, unit: "pc" },
    ],
  },
  {
    id: "obias",
    name: "Obias Hardware",
    town: "Lagonoy",
    location: located("Lagonoy"),
    lead: "Local pickup",
    priceIndex: "Below reference",
    catalog: [
      { material: "Portland Cement", price: 240, unit: "bag" },
      { material: "Sand (AS)", price: 1250, unit: "m³" },
      { material: "Gravel (CR)", price: 1950, unit: "m³" },
      { material: "Gravel (GR)", price: 1350, unit: "m³" },
      { material: 'CHB — 4"', price: 17, unit: "pc" },
      { material: 'CHB — 5"', price: 19.5, unit: "pc" },
      { material: 'CHB — 6"', price: 21, unit: "pc" },
    ],
  },
  {
    id: "noah",
    name: "Noah Hardware",
    town: "San Jose",
    location: located("San Jose"),
    lead: "Local pickup",
    priceIndex: "Below reference",
    catalog: [
      { material: "Portland Cement", price: 245, unit: "bag" },
      { material: "Sand (AS)", price: 1350, unit: "m³" },
      { material: "Sand (GR)", price: 750, unit: "m³" },
      { material: "Gravel (CR)", price: 1750, unit: "m³" },
      { material: "Gravel (GR)", price: 1100, unit: "m³" },
      { material: 'CHB — 4"', price: 17, unit: "pc" },
      { material: 'CHB — 5"', price: 21, unit: "pc" },
      { material: 'CHB — 6"', price: 19, unit: "pc" },
    ],
  },
  {
    id: "eugine",
    name: "Eugine Hardware",
    town: "San Jose",
    location: located("San Jose"),
    lead: "Local pickup",
    priceIndex: "Below reference",
    catalog: [
      { material: "Portland Cement", price: 245, unit: "bag" },
      { material: "Sand (AS)", price: 1450, unit: "m³" },
      { material: "Sand (GR)", price: 700, unit: "m³" },
      { material: "Gravel", price: 1000, unit: "m³" },
      { material: 'CHB — 4"', price: 17, unit: "pc" },
    ],
  },
  {
    id: "siltrade",
    name: "Siltrade",
    town: "San Jose",
    location: located("San Jose"),
    lead: "Local pickup",
    priceIndex: "At reference",
    catalog: [
      { material: "Portland Cement", price: 240, unit: "bag" },
      { material: "Sand (AS)", price: 1650, unit: "m³" },
      { material: "Gravel (CR)", price: 1950, unit: "m³" },
      { material: 'CHB — 4"', price: 16, unit: "pc" },
    ],
  },
  {
    id: "mant",
    name: "Mant Hardware",
    town: "San Jose",
    location: located("San Jose"),
    lead: "Local pickup",
    priceIndex: "At reference",
    catalog: [
      { material: "Portland Cement", price: 240, unit: "bag" },
      { material: "Sand (AS)", price: 1350, unit: "m³" },
      { material: "Gravel", price: 1950, unit: "m³" },
      { material: 'CHB — 4"', price: 16, unit: "pc" },
    ],
  },
  {
    id: "highgate",
    name: "HighGate Hardware",
    town: "Sagnay",
    location: located("Sagnay"),
    lead: "Local pickup",
    priceIndex: "Above reference",
    catalog: [
      { material: "Portland Cement", price: 250, unit: "bag" },
      { material: "Sand (AS)", price: 1650, unit: "m³" },
      { material: "Gravel (CR)", price: 2100, unit: "m³" },
    ],
  },
]

for (const supplier of SUPPLIERS) {
  supplier.email = supplierEmail(supplier.id)
}

export function supplierById(id: string | null | undefined) {
  if (!id) return null
  return SUPPLIERS.find((supplier) => supplier.id === id) ?? null
}

/** Reference price for a material, or null when it is not in the price list. */
export function referencePrice(material: string) {
  const exact = MATERIAL_PRICES.find((item) => item.name === material)?.price
  if (exact != null) return exact
  if (material.startsWith("Sand")) {
    return MATERIAL_PRICES.find((item) => item.name === "Sand")?.price ?? null
  }
  if (material.startsWith("Gravel")) {
    return MATERIAL_PRICES.find((item) => item.name === "Gravel")?.price ?? null
  }
  return null
}

/** `tel:` links cannot contain spaces or formatting characters. */
export function dialable(phone: string) {
  return phone.replace(/[^\d+]/g, "")
}
