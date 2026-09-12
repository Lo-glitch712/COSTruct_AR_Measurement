"use client"

import type { ComponentName, Dimensions } from "@/lib/estimate"

/**
 * The measurement form hands its dimensions to the estimate page through
 * `localStorage`, the same way the session and supplier catalog persist.
 */
export type ProjectDraft = {
  name: string
  savedAt: string
  components: { name: ComponentName; dimensions: Dimensions }[]
}

const STORAGE_KEY = "costruct.draft"

export function saveDraft(draft: ProjectDraft) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
}

export function readDraft(): ProjectDraft | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ProjectDraft
    if (!Array.isArray(parsed?.components)) return null
    return parsed
  } catch {
    return null
  }
}

export function clearDraft() {
  window.localStorage.removeItem(STORAGE_KEY)
}
