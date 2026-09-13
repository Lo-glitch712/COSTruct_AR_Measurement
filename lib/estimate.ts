/**
 * Quantity take-off and pricing for a structural component.
 *
 * The factors and unit prices here are the same ones the AR build in
 * `public/ar/index.html` uses, so a component measured manually and the same
 * component measured with AR always produce an identical estimate.
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

export function componentEstimate(
  name: ComponentName,
  dimensions: Dimensions,
): MaterialLine[] {
  const { length, width, height } = dimensions
  if (!(length > 0 && width > 0 && height > 0)) return []

  const volume = concreteVolume(dimensions)
  const walls = wallArea(dimensions)

  const raw: [string, number, number, string][] = CONCRETE_COMPONENTS.includes(
    name,
  )
    ? [
        ["Sand", volume * 0.5, 1350, "m³"],
        ["Portland Cement", volume * 9, 245, "bag"],
        ["Gravel", volume * 0.8, 1700, "m³"],
      ]
    : name === "Mortar"
      ? [
          ["Sand", volume * 1.0, 1350, "m³"],
          ["Portland Cement", volume * 6, 245, "bag"],
        ]
      : name === "Plastering"
        ? [
            ["Sand", walls * 0.02, 1350, "m³"],
            ["Portland Cement", walls * 0.18, 245, "bag"],
          ]
        : name === "Walls"
          ? [
              ['CHB — 4"', walls * 12.5, 17, "pc"],
              ["Sand (Mortar)", walls * 0.015, 1350, "m³"],
              ["Portland Cement", walls * 0.14, 245, "bag"],
            ]
          : [
              ["Sand", volume * 0.5, 1350, "m³"],
              ["Portland Cement", volume * 9, 245, "bag"],
              ["Gravel", volume * 0.8, 1700, "m³"],
            ]

  return raw.map(([material, quantity, unitPrice, unit]) => ({
    material,
    quantity,
    unitPrice,
    unit,
    cost: quantity * unitPrice,
  }))
}

export function componentCost(name: ComponentName, dimensions: Dimensions) {
  return componentEstimate(name, dimensions).reduce(
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
