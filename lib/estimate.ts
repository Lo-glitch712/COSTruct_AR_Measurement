/**
 * Quantity take-off and pricing for a structural component.
 *
 * Quantities use the same Class A / CHB factors as the AR build in
 * `public/ar/index.html`. Unit prices come from the chosen supplier catalog
 * (quantity × catalog price, no markup). MATERIAL_PRICES is only the fallback
 * when no store is attached.
 */

export type ComponentName = string

export type Dimensions = {
  length: number
  width: number
  height: number
}

export type MaterialLine = {
  material: string
  quantity: number
  unitPrice: number
  unit: string
  cost: number
}

/** A supplier catalog row. Accepts either `name` or `material`. */
export type PriceQuote = {
  name?: string
  material?: string
  price: number
  unit: string
}

export const COMPONENTS: { name: ComponentName; hint: string }[] = [
  { name: "Column", hint: "Vertical concrete support" },
  { name: "Beam", hint: "Horizontal concrete span" },
  { name: "Ground Floor Slab", hint: "Slab on grade" },
  { name: "Slab", hint: "Suspended floor or roof slab" },
  { name: "Mortar", hint: "Bedding and jointing mix" },
  { name: "Plastering", hint: "Wall finishing coat" },
  { name: "Walls", hint: "CHB masonry wall" },
]

/** Reference unit prices, superseded once a supplier quote is attached. */
export const MATERIAL_PRICES: { name: string; price: number; unit: string }[] =
  [
    { name: "Sand", price: 1350, unit: "m³" },
    { name: "Portland Cement", price: 245, unit: "bag" },
    { name: "Pozzolan Cement", price: 250, unit: "bag" },
    { name: "Gravel", price: 1700, unit: "m³" },
    { name: 'CHB — 4"', price: 17, unit: "pc" },
    { name: 'CHB — 5"', price: 20, unit: "pc" },
    { name: 'CHB — 6"', price: 20, unit: "pc" },
  ]

const CONCRETE_COMPONENTS: ComponentName[] = [
  "Column",
  "Beam",
  "Ground Floor Slab",
  "Slab",
]

export function floorArea({ length, width }: Dimensions) {
  return length * width
}

export function wallArea({ length, width, height }: Dimensions) {
  return 2 * (length + width) * height
}

export function concreteVolume({ length, width, height }: Dimensions) {
  return length * width * height
}

function quoteName(quote: PriceQuote) {
  return quote.name ?? quote.material ?? ""
}

function materialKey(name: string) {
  return name
    .toLowerCase()
    .replace(/[—“”"'′″]/g, '"')
    .replace(/[()]/g, " ")
    .replace(/[^a-z0-9."]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function materialFamily(key: string) {
  if (key.startsWith("chb")) return "chb"
  if (key.startsWith("sand")) return "sand"
  if (key.startsWith("gravel")) return "gravel"
  if (key.includes("portland")) return "portland"
  if (key.includes("pozzolan")) return "pozzolan"
  return key.split(" ")[0] ?? key
}

export function quotesFromCatalog(
  items: PriceQuote[] | null | undefined,
): PriceQuote[] {
  if (!items?.length) return []
  return items.filter(
    (item) =>
      typeof item.price === "number" &&
      Number.isFinite(item.price) &&
      Boolean(quoteName(item)),
  )
}

/**
 * Pick the supplier's unit price for a take-off line.
 * Cost is always quantity × this price — never a hidden markup.
 */
export function unitPriceFor(
  material: string,
  quotes: PriceQuote[] = [],
): { price: number; unit: string } {
  const fallback =
    MATERIAL_PRICES.find((item) => {
      const have = materialKey(item.name)
      const need = materialKey(material)
      return have === need || materialFamily(have) === materialFamily(need)
    }) ?? MATERIAL_PRICES[0]

  if (!quotes.length) {
    return { price: fallback.price, unit: fallback.unit }
  }

  const needKey = materialKey(material)
  const needFamily = materialFamily(needKey)
  const needInch = needKey.match(/(\d+)/)?.[1]

  let best: { score: number; quote: PriceQuote } | null = null
  for (const quote of quotes) {
    const haveKey = materialKey(quoteName(quote))
    const haveFamily = materialFamily(haveKey)
    if (haveFamily !== needFamily) continue

    let score = 1
    if (haveKey === needKey) score = 4
    else if (haveKey.startsWith(needKey) || needKey.startsWith(haveKey)) score = 3
    else if (needFamily === "chb") {
      const haveInch = haveKey.match(/(\d+)/)?.[1]
      if (needInch && needInch === haveInch) score = 3
      else continue
    }

    if (!best || score > best.score) best = { score, quote }
  }

  if (best) {
    return {
      price: best.quote.price,
      unit: best.quote.unit || fallback.unit,
    }
  }

  return { price: fallback.price, unit: fallback.unit }
}

export function componentEstimate(
  name: ComponentName,
  dimensions: Dimensions,
  quotes: PriceQuote[] = [],
): MaterialLine[] {
  const { length, width, height } = dimensions
  if (!(length > 0 && width > 0 && height > 0)) return []

  const volume = concreteVolume(dimensions)
  const walls = wallArea(dimensions)

  const qtyLines: [string, number][] = CONCRETE_COMPONENTS.includes(name)
    ? [
        ["Sand", volume * 0.5],
        ["Portland Cement", volume * 9],
        ["Gravel", volume * 0.8],
      ]
    : name === "Mortar"
      ? [
          ["Sand", volume * 1.0],
          ["Portland Cement", volume * 6],
        ]
      : name === "Plastering"
        ? [
            ["Sand", walls * 0.02],
            ["Portland Cement", walls * 0.18],
          ]
        : name === "Walls"
          ? [
              ['CHB — 4"', walls * 12.5],
              ["Sand (Mortar)", walls * 0.015],
              ["Portland Cement", walls * 0.14],
            ]
          : [
              ["Sand", volume * 0.5],
              ["Portland Cement", volume * 9],
              ["Gravel", volume * 0.8],
            ]

  return qtyLines.map(([material, quantity]) => {
    const { price, unit } = unitPriceFor(material, quotes)
    return {
      material,
      quantity,
      unitPrice: price,
      unit,
      cost: quantity * price,
    }
  })
}

export function componentCost(
  name: ComponentName,
  dimensions: Dimensions,
  quotes: PriceQuote[] = [],
) {
  return componentEstimate(name, dimensions, quotes).reduce(
    (total, line) => total + line.cost,
    0,
  )
}

export function peso(value: number) {
  return `₱${value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function quantity(value: number, decimals = 2) {
  return value.toLocaleString("en-PH", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}
