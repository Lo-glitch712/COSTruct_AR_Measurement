"use client"

import { useCallback, useEffect, useState } from "react"
import { MATERIAL_PRICES } from "@/lib/estimate"

export type CatalogItem = {
  id: string
  name: string
  price: number
  unit: string
  stock: boolean
}

export const UNITS = ["m³", "bag", "pc", "kg", "m", "sheet", "set", "L"]

const STORAGE_KEY = "costruct.catalog"

/** A new supplier starts with the reference materials already listed. */
function seed(): CatalogItem[] {
  return MATERIAL_PRICES.map((material, index) => ({
    id: `seed-${index}`,
    name: material.name,
    price: material.price,
    unit: material.unit,
    stock: true,
  }))
}

function read(): CatalogItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return seed()
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return seed()
    return parsed.filter(
      (item): item is CatalogItem =>
        typeof item?.id === "string" &&
        typeof item?.name === "string" &&
        typeof item?.price === "number" &&
        typeof item?.unit === "string",
    )
  } catch {
    return seed()
  }
}

function write(items: CatalogItem[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

/**
 * Reads on the client only, so the server render and the first client render
 * agree. `loaded` tells callers whether `items` reflects stored data yet.
 */
export function useCatalog() {
  const [items, setItems] = useState<CatalogItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setItems(read())
    setLoaded(true)
  }, [])

  const commit = useCallback((next: CatalogItem[]) => {
    setItems(next)
    write(next)
  }, [])

  const add = useCallback(
    (item: Omit<CatalogItem, "id">) => {
      commit([
        ...read(),
        { ...item, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` },
      ])
    },
    [commit],
  )

  const remove = useCallback(
    (id: string) => commit(read().filter((item) => item.id !== id)),
    [commit],
  )

  const toggleStock = useCallback(
    (id: string) =>
      commit(
        read().map((item) =>
          item.id === id ? { ...item, stock: !item.stock } : item,
        ),
      ),
    [commit],
  )

  return { items, loaded, add, remove, toggleStock }
}
