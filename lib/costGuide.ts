import { MATERIAL_PRICES, peso } from "@/lib/estimate"
import { SUPPLIERS } from "@/lib/suppliers"

export const COST_GUIDE_TABS = [
  { id: "answer", label: "Quick answer", hash: "cost-guide" },
  { id: "formula", label: "Formula", hash: "cost-formula" },
  { id: "uses", label: "Use cases", hash: "cost-uses" },
  { id: "average", label: "Average cost", hash: "cost-average" },
] as const

export type CostGuideTab = (typeof COST_GUIDE_TABS)[number]["id"]

export function tabFromHash(hash: string): CostGuideTab {
  const value = hash.replace(/^#/, "")
  const match = COST_GUIDE_TABS.find((tab) => tab.hash === value)
  return match?.id ?? "answer"
}

export function hashForTab(id: CostGuideTab) {
  return COST_GUIDE_TABS.find((tab) => tab.id === id)?.hash ?? "cost-guide"
}

export function costGuideHref(id: CostGuideTab = "answer") {
  return `/home#${hashForTab(id)}`
}

export function typicalMaterialRanges() {
  const buckets = new Map<string, { min: number; max: number; unit: string }>()

  for (const supplier of SUPPLIERS) {
    for (const item of supplier.catalog) {
      if (item.unit === "pc" && item.price < 10) continue
      const current = buckets.get(item.material)
      if (!current) {
        buckets.set(item.material, {
          min: item.price,
          max: item.price,
          unit: item.unit,
        })
        continue
      }
      current.min = Math.min(current.min, item.price)
      current.max = Math.max(current.max, item.price)
    }
  }

  return MATERIAL_PRICES.map((material) => {
    const range = buckets.get(material.name)
    return {
      name: material.name,
      unit: material.unit,
      reference: material.price,
      min: range?.min ?? material.price,
      max: range?.max ?? material.price,
    }
  })
}

export function pesoRange(min: number, max: number) {
  if (min === max) return peso(min)
  return `${peso(min)} – ${peso(max)}`
}
