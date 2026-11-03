export const TOWNS = [
  "Tigaon",
  "Goa",
  "Lagonoy",
  "San Jose",
  "Sagnay",
] as const

export type Town = (typeof TOWNS)[number]

export type CatalogKey =
  | "portland"
  | "pozzolan"
  | "sand"
  | "sand-as"
  | "sand-gr"
  | "gravel"
  | "gravel-cr"
  | "gravel-gr"
  | "chb4"
  | "chb5"
  | "chb6"

export type CatalogItem = {
  key: CatalogKey
  name: string
  amount: number | [number, number]
  unit: string
}

export type Supplier = {
  name: string
  town: Town
  catalog: CatalogItem[]
}

export const REFERENCE_MATERIALS: {
  key: CatalogKey
  name: string
  amount: number
  unit: string
}[] = [
  { key: "portland", name: "Portland Cement", amount: 245, unit: "per bag" },
  { key: "pozzolan", name: "Pozzolan Cement", amount: 250, unit: "per bag" },
  { key: "sand", name: "Sand", amount: 1350, unit: "per m³" },
  { key: "gravel", name: "Gravel", amount: 1700, unit: "per m³" },
  { key: "chb4", name: 'CHB — 4"', amount: 17, unit: "per pc" },
  { key: "chb5", name: 'CHB — 5"', amount: 20, unit: "per pc" },
  { key: "chb6", name: 'CHB — 6"', amount: 20, unit: "per pc" },
]

const REFERENCE_BY_KEY: Record<CatalogKey, number> = {
  portland: 245,
  pozzolan: 250,
  sand: 1350,
  "sand-as": 1350,
  "sand-gr": 1350,
  gravel: 1700,
  "gravel-cr": 1700,
  "gravel-gr": 1700,
  chb4: 17,
  chb5: 20,
  chb6: 20,
}

export function formatPeso(amount: number | [number, number]) {
  const peso = (value: number) =>
    `₱${value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`

  return Array.isArray(amount)
    ? `${peso(amount[0])}–${peso(amount[1])}`
    : peso(amount)
}

export function isCheaperThanReference(item: CatalogItem) {
  const reference = REFERENCE_BY_KEY[item.key]
  const low = Array.isArray(item.amount) ? item.amount[0] : item.amount
  return low < reference
}

export function catalogSummary(catalog: CatalogItem[]) {
  const labels = new Set<string>()
  for (const item of catalog) {
    if (item.key.startsWith("sand")) labels.add("Sand")
    else if (item.key.startsWith("gravel")) labels.add("Gravel")
    else if (item.key.startsWith("chb")) labels.add("CHB")
    else labels.add(item.name)
  }
  return [...labels].join(", ")
}

export const SUPPLIERS: Supplier[] = [
  {
    name: "Johan Hardware",
    town: "Tigaon",
    catalog: [
      { key: "portland", name: "Portland Cement", amount: 255, unit: "per bag" },
      { key: "pozzolan", name: "Pozzolan Cement", amount: 250, unit: "per bag" },
      { key: "sand", name: "Sand", amount: 1400, unit: "per m³" },
      { key: "gravel", name: "Gravel", amount: 1800, unit: "per m³" },
      { key: "chb4", name: 'CHB — 4"', amount: 16, unit: "per pc" },
      { key: "chb5", name: 'CHB — 5"', amount: 18, unit: "per pc" },
      { key: "chb6", name: 'CHB — 6"', amount: 20, unit: "per pc" },
    ],
  },
  {
    name: "HDC Hardware",
    town: "Tigaon",
    catalog: [
      { key: "portland", name: "Portland Cement", amount: 270, unit: "per bag" },
      { key: "pozzolan", name: "Pozzolan Cement", amount: 265, unit: "per bag" },
      { key: "sand", name: "Sand", amount: 1650, unit: "per m³" },
      { key: "gravel-cr", name: "Gravel (CR)", amount: 2100, unit: "per m³" },
      { key: "chb4", name: 'CHB — 4"', amount: 20, unit: "per pc" },
      { key: "chb5", name: 'CHB — 5"', amount: 26, unit: "per pc" },
      { key: "chb6", name: 'CHB — 6"', amount: 31, unit: "per pc" },
    ],
  },
  {
    name: "Bong & Chel Hardware",
    town: "Tigaon",
    catalog: [
      { key: "portland", name: "Portland Cement", amount: 245, unit: "per bag" },
      { key: "sand", name: "Sand", amount: 1400, unit: "per m³" },
      { key: "gravel", name: "Gravel", amount: 1800, unit: "per m³" },
      { key: "chb4", name: 'CHB — 4"', amount: 18, unit: "per pc" },
    ],
  },
  {
    name: "St. Claire Hardware",
    town: "Tigaon",
    catalog: [
      { key: "portland", name: "Portland Cement", amount: 245, unit: "per bag" },
      { key: "pozzolan", name: "Pozzolan Cement", amount: 240, unit: "per bag" },
      { key: "sand", name: "Sand", amount: 1400, unit: "per m³" },
      { key: "gravel", name: "Gravel", amount: 1800, unit: "per m³" },
      { key: "chb4", name: 'CHB — 4"', amount: 17, unit: "per pc" },
      { key: "chb5", name: 'CHB — 5"', amount: 20, unit: "per pc" },
    ],
  },
  {
    name: "Three 28 Hardware",
    town: "Tigaon",
    catalog: [
      { key: "portland", name: "Portland Cement", amount: 245, unit: "per bag" },
      { key: "sand", name: "Sand", amount: 1500, unit: "per m³" },
      { key: "gravel", name: "Gravel", amount: 1800, unit: "per m³" },
      { key: "chb4", name: 'CHB — 4"', amount: 18, unit: "per pc" },
      { key: "chb5", name: 'CHB — 5"', amount: 21, unit: "per pc" },
    ],
  },
  {
    name: "City Town Hardware",
    town: "Goa",
    catalog: [
      { key: "portland", name: "Portland Cement", amount: 240, unit: "per bag" },
      { key: "sand", name: "Sand", amount: 1600, unit: "per m³" },
      { key: "gravel", name: "Gravel", amount: 1400, unit: "per m³" },
      { key: "chb4", name: 'CHB — 4"', amount: [14, 16], unit: "per pc" },
    ],
  },
  {
    name: "Nikki & Kikko Hardware",
    town: "Goa",
    catalog: [
      { key: "portland", name: "Portland Cement", amount: 235, unit: "per bag" },
      { key: "sand-as", name: "Sand (AS)", amount: 1240, unit: "per m³" },
      { key: "gravel", name: "Gravel", amount: 1635, unit: "per m³" },
      { key: "chb4", name: 'CHB — 4"', amount: 17, unit: "per pc" },
    ],
  },
  {
    name: "S & M Hardware",
    town: "Goa",
    catalog: [
      { key: "portland", name: "Portland Cement", amount: 245, unit: "per bag" },
      { key: "sand", name: "Sand", amount: 1483, unit: "per m³" },
      { key: "gravel", name: "Gravel", amount: 1700, unit: "per m³" },
      { key: "chb4", name: 'CHB — 4"', amount: 16, unit: "per pc" },
      { key: "chb5", name: 'CHB — 5"', amount: 18, unit: "per pc" },
    ],
  },
  {
    name: "Kuya Pony Hardware",
    town: "Lagonoy",
    catalog: [
      { key: "portland", name: "Portland Cement", amount: 240, unit: "per bag" },
      { key: "sand", name: "Sand", amount: 1350, unit: "per m³" },
      { key: "gravel", name: "Gravel", amount: 1750, unit: "per m³" },
      { key: "chb4", name: 'CHB — 4"', amount: 16, unit: "per pc" },
      { key: "chb5", name: 'CHB — 5"', amount: 18, unit: "per pc" },
    ],
  },
  {
    name: "Marks Hardware",
    town: "Lagonoy",
    catalog: [
      { key: "portland", name: "Portland Cement", amount: 245, unit: "per bag" },
      { key: "sand", name: "Sand", amount: 1350, unit: "per m³" },
      { key: "gravel", name: "Gravel", amount: 1700, unit: "per m³" },
      { key: "chb4", name: 'CHB — 4"', amount: 17, unit: "per pc" },
      { key: "chb5", name: 'CHB — 5"', amount: 20, unit: "per pc" },
    ],
  },
  {
    name: "Barnuevo Hardware",
    town: "Lagonoy",
    catalog: [
      { key: "portland", name: "Portland Cement", amount: [245, 265], unit: "per bag" },
      { key: "sand-as", name: "Sand (AS)", amount: 1600, unit: "per m³" },
      { key: "gravel-cr", name: "Gravel (CR)", amount: 2200, unit: "per m³" },
      { key: "gravel-gr", name: "Gravel (GR)", amount: 2000, unit: "per m³" },
      { key: "chb4", name: 'CHB — 4"', amount: 4, unit: "per pc" },
    ],
  },
  {
    name: "S & M Hardware",
    town: "Lagonoy",
    catalog: [
      { key: "portland", name: "Portland Cement", amount: 240, unit: "per bag" },
      { key: "sand", name: "Sand", amount: 1240, unit: "per m³" },
      { key: "gravel", name: "Gravel", amount: 1980, unit: "per m³" },
      { key: "chb4", name: 'CHB — 4"', amount: 17, unit: "per pc" },
      { key: "chb5", name: 'CHB — 5"', amount: 18, unit: "per pc" },
      { key: "chb6", name: 'CHB — 6"', amount: 19, unit: "per pc" },
    ],
  },
  {
    name: "Obias Hardware",
    town: "Lagonoy",
    catalog: [
      { key: "portland", name: "Portland Cement", amount: 240, unit: "per bag" },
      { key: "sand-as", name: "Sand (AS)", amount: 1250, unit: "per m³" },
      { key: "gravel-cr", name: "Gravel (CR)", amount: 1950, unit: "per m³" },
      { key: "gravel-gr", name: "Gravel (GR)", amount: 1350, unit: "per m³" },
      { key: "chb4", name: 'CHB — 4"', amount: 17, unit: "per pc" },
      { key: "chb5", name: 'CHB — 5"', amount: 19.5, unit: "per pc" },
      { key: "chb6", name: 'CHB — 6"', amount: 21, unit: "per pc" },
    ],
  },
  {
    name: "Noah Hardware",
    town: "San Jose",
    catalog: [
      { key: "portland", name: "Portland Cement", amount: 245, unit: "per bag" },
      { key: "sand-as", name: "Sand (AS)", amount: 1350, unit: "per m³" },
      { key: "sand-gr", name: "Sand (GR)", amount: 750, unit: "per m³" },
      { key: "gravel-cr", name: "Gravel (CR)", amount: 1750, unit: "per m³" },
      { key: "gravel-gr", name: "Gravel (GR)", amount: 1100, unit: "per m³" },
      { key: "chb4", name: 'CHB — 4"', amount: 17, unit: "per pc" },
      { key: "chb5", name: 'CHB — 5"', amount: 21, unit: "per pc" },
      { key: "chb6", name: 'CHB — 6"', amount: 19, unit: "per pc" },
    ],
  },
  {
    name: "Eugine Hardware",
    town: "San Jose",
    catalog: [
      { key: "portland", name: "Portland Cement", amount: 245, unit: "per bag" },
      { key: "sand-as", name: "Sand (AS)", amount: 1450, unit: "per m³" },
      { key: "sand-gr", name: "Sand (GR)", amount: 700, unit: "per m³" },
      { key: "gravel", name: "Gravel", amount: 1000, unit: "per m³" },
      { key: "chb4", name: 'CHB — 4"', amount: 17, unit: "per pc" },
    ],
  },
  {
    name: "Siltrade",
    town: "San Jose",
    catalog: [
      { key: "portland", name: "Portland Cement", amount: 240, unit: "per bag" },
      { key: "sand-as", name: "Sand (AS)", amount: 1650, unit: "per m³" },
      { key: "gravel-cr", name: "Gravel (CR)", amount: 1950, unit: "per m³" },
      { key: "chb4", name: 'CHB — 4"', amount: 16, unit: "per pc" },
    ],
  },
  {
    name: "Mant Hardware",
    town: "San Jose",
    catalog: [
      { key: "portland", name: "Portland Cement", amount: 240, unit: "per bag" },
      { key: "sand-as", name: "Sand (AS)", amount: 1350, unit: "per m³" },
      { key: "gravel", name: "Gravel", amount: 1950, unit: "per m³" },
      { key: "chb4", name: 'CHB — 4"', amount: 16, unit: "per pc" },
    ],
  },
  {
    name: "HighGate Hardware",
    town: "Sagnay",
    catalog: [
      { key: "portland", name: "Portland Cement", amount: 250, unit: "per bag" },
      { key: "sand-as", name: "Sand (AS)", amount: 1650, unit: "per m³" },
      { key: "gravel-cr", name: "Gravel (CR)", amount: 2100, unit: "per m³" },
    ],
  },
]
