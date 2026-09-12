import { MATERIAL_PRICES } from "@/lib/estimate"

export type CatalogEntry = { material: string; price: number; unit: string }

export type Supplier = {
  id: string
  name: string
  location: string
  email: string
  phone: string
  lead: string
  priceIndex: string
  catalog: CatalogEntry[]
  best?: boolean
}

/**
 * Sample hardware stores with placeholder contacts. Swap these for real
 * records once suppliers register through the platform.
 */
export const SUPPLIERS: Supplier[] = [
  {
    id: "northgate",
    name: "Northgate Aggregates",
    location: "Quezon City",
    email: "orders@northgate-aggregates.ph",
    phone: "0917 555 0142",
    lead: "1–2 days",
    priceIndex: "Below reference",
    best: true,
    catalog: [
      { material: "Sand", price: 1280, unit: "m³" },
      { material: "Gravel", price: 1620, unit: "m³" },
      { material: 'CHB — 4"', price: 16, unit: "pc" },
      { material: 'CHB — 5"', price: 19, unit: "pc" },
    ],
  },
  {
    id: "pacific",
    name: "Pacific Cement Depot",
    location: "Caloocan",
    email: "sales@pacificcement.ph",
    phone: "(02) 8555 0178",
    lead: "Same day",
    priceIndex: "At reference",
    catalog: [
      { material: "Portland Cement", price: 245, unit: "bag" },
      { material: "Sand", price: 1350, unit: "m³" },
      { material: "Gravel", price: 1700, unit: "m³" },
    ],
  },
  {
    id: "southline",
    name: "Southline Hardware",
    location: "Parañaque",
    email: "hello@southlinehardware.ph",
    phone: "0918 555 0233",
    lead: "2–3 days",
    priceIndex: "Below reference",
    catalog: [
      { material: 'CHB — 4"', price: 15.5, unit: "pc" },
      { material: 'CHB — 5"', price: 18.5, unit: "pc" },
      { material: "Portland Cement", price: 238, unit: "bag" },
    ],
  },
  {
    id: "metro",
    name: "Metro Builders Supply",
    location: "Mandaluyong",
    email: "procurement@metrobuilders.ph",
    phone: "(02) 8555 0310",
    lead: "1 day",
    priceIndex: "Above reference",
    catalog: [
      { material: "Sand", price: 1420, unit: "m³" },
      { material: "Portland Cement", price: 258, unit: "bag" },
      { material: "Gravel", price: 1780, unit: "m³" },
      { material: 'CHB — 4"', price: 18, unit: "pc" },
      { material: 'CHB — 5"', price: 21, unit: "pc" },
    ],
  },
  {
    id: "eastbay",
    name: "Eastbay Construction Supply",
    location: "Antipolo",
    email: "eastbay.supply@gmail.com",
    phone: "0995 555 0467",
    lead: "2 days",
    priceIndex: "At reference",
    catalog: [
      { material: "Sand", price: 1350, unit: "m³" },
      { material: "Gravel", price: 1700, unit: "m³" },
      { material: "Portland Cement", price: 245, unit: "bag" },
    ],
  },
  {
    id: "riverside",
    name: "Riverside Hardware & Trading",
    location: "Marikina",
    email: "riverside.trading@yahoo.com",
    phone: "0927 555 0519",
    lead: "3–4 days",
    priceIndex: "Below reference",
    catalog: [
      { material: "Sand", price: 1320, unit: "m³" },
      { material: 'CHB — 4"', price: 16.5, unit: "pc" },
      { material: 'CHB — 5"', price: 19, unit: "pc" },
    ],
  },
]

export function supplierById(id: string | null | undefined) {
  if (!id) return null
  return SUPPLIERS.find((supplier) => supplier.id === id) ?? null
}

/** Reference price for a material, or null when it is not in the price list. */
export function referencePrice(material: string) {
  return MATERIAL_PRICES.find((item) => item.name === material)?.price ?? null
}

/** `tel:` links cannot contain spaces or formatting characters. */
export function dialable(phone: string) {
  return phone.replace(/[^\d+]/g, "")
}
