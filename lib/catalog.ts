"use client"

import { useCallback, useEffect, useState } from "react"
import { MATERIAL_PRICES } from "@/lib/estimate"
import { supabase, supabaseEnabled } from "@/lib/supabase"
import { supplierById } from "@/lib/suppliers"

export type CatalogItem = {
  id: string
  name: string
  price: number
  unit: string
  stock: boolean
}

export const UNITS = ["m³", "bag", "pc", "kg", "m", "sheet", "set", "L"]

const STORAGE_KEY = "costruct.catalogs"

type CatalogMap = Record<string, CatalogItem[]>

function seedFor(supplierId: string): CatalogItem[] {
  const supplier = supplierById(supplierId)
  if (supplier?.catalog.length) {
    return supplier.catalog.map((entry, index) => ({
      id: `${supplierId}-${index}`,
      name: entry.material,
      price: entry.price,
      unit: entry.unit,
      stock: true,
    }))
  }
  return MATERIAL_PRICES.map((material, index) => ({
    id: `seed-${supplierId}-${index}`,
    name: material.name,
    price: material.price,
    unit: material.unit,
    stock: true,
  }))
}

function readMap(): CatalogMap {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

function writeMap(map: CatalogMap) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

function normalize(items: unknown, supplierId: string): CatalogItem[] {
  if (!Array.isArray(items)) return seedFor(supplierId)
  const valid = items.filter(
    (item): item is CatalogItem =>
      typeof item?.id === "string" &&
      typeof item?.name === "string" &&
      typeof item?.price === "number" &&
      typeof item?.unit === "string",
  )
  return valid.length > 0 ? valid : seedFor(supplierId)
}

export function readCatalog(supplierId: string): CatalogItem[] {
  const map = readMap()
  if (!map[supplierId]) {
    const seeded = seedFor(supplierId)
    map[supplierId] = seeded
    if (typeof window !== "undefined") writeMap(map)
    return seeded
  }
  return normalize(map[supplierId], supplierId)
}

export function readAllCatalogs() {
  const map = readMap()
  const ids = new Set([
    ...Object.keys(map),
    ...[
      "johan",
      "hdc",
      "bong-chel",
      "st-claire",
      "three-28",
      "city-town",
      "nikki-kikko",
      "sm-goa",
      "kuya-pony",
      "marks",
      "barnuevo",
      "sm-lagonoy",
      "obias",
      "noah",
      "eugine",
      "siltrade",
      "mant",
      "highgate",
    ],
  ])
  const all: CatalogMap = {}
  for (const id of ids) all[id] = readCatalog(id)
  return all
}

function write(supplierId: string, items: CatalogItem[]) {
  const map = readMap()
  map[supplierId] = items
  writeMap(map)
}

async function pullCatalog(supplierId: string) {
  if (!supabaseEnabled) return null
  const { data, error } = await supabase
    .from("catalog_items")
    .select("id, material, price, unit, in_stock")
    .eq("supplier_id", supplierId)
  if (error || !data?.length) return null
  return data.map((row) => ({
    id: String(row.id),
    name: String(row.material),
    price: Number(row.price),
    unit: String(row.unit),
    stock: Boolean(row.in_stock),
  }))
}

async function pushCatalog(supplierId: string, items: CatalogItem[]) {
  if (!supabaseEnabled) return
  const { error } = await supabase.from("catalog_items").upsert(
    items.map((item) => ({
      supplier_id: supplierId,
      material: item.name,
      price: item.price,
      unit: item.unit,
      in_stock: item.stock,
    })),
    { onConflict: "supplier_id,material" },
  )
  if (error) console.warn("catalog sync failed", error.message)
}

export function useCatalog(supplierId?: string) {
  const [items, setItems] = useState<CatalogItem[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!supplierId) {
      setItems([])
      setLoaded(true)
      return
    }
    const local = readCatalog(supplierId)
    setItems(local)
    setLoaded(true)
    void pullCatalog(supplierId).then((remote) => {
      if (!remote) return
      write(supplierId, remote)
      setItems(remote)
    })
  }, [supplierId])

  const commit = useCallback(
    (next: CatalogItem[]) => {
      if (!supplierId) return
      setItems(next)
      write(supplierId, next)
      void pushCatalog(supplierId, next)
    },
    [supplierId],
  )

  const add = useCallback(
    (item: Omit<CatalogItem, "id">) => {
      if (!supplierId) return
      commit([
        ...readCatalog(supplierId),
        { ...item, id: `${Date.now()}-${Math.random().toString(36).slice(2)}` },
      ])
    },
    [commit, supplierId],
  )

  const remove = useCallback(
    (id: string) => {
      if (!supplierId) return
      commit(readCatalog(supplierId).filter((item) => item.id !== id))
    },
    [commit, supplierId],
  )

  const toggleStock = useCallback(
    (id: string) => {
      if (!supplierId) return
      commit(
        readCatalog(supplierId).map((item) =>
          item.id === id ? { ...item, stock: !item.stock } : item,
        ),
      )
    },
    [commit, supplierId],
  )

  const update = useCallback(
    (id: string, patch: Partial<Omit<CatalogItem, "id">>) => {
      if (!supplierId) return
      commit(
        readCatalog(supplierId).map((item) =>
          item.id === id ? { ...item, ...patch } : item,
        ),
      )
    },
    [commit, supplierId],
  )

  return { items, loaded, add, remove, toggleStock, update }
}
