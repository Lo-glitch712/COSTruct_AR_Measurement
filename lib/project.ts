"use client"

import type { ComponentName, Dimensions } from "@/lib/estimate"

/**
 * The measurement form hands its dimensions to the estimate page through
 * `localStorage`, the same way the session and supplier catalog persist.
 */
export type ProjectDraft = {
  name: string
  savedAt: string
  supplierId: string | null
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

/**
 * The AR tool is a standalone page outside the router, so opening it unloads
 * the measurement form. The half-filled form is parked here first and restored
 * when the browser comes back.
 */
export type Workspace = {
  name: string
  supplierId: string | null
  inputs: Record<string, { length: string; width: string; height: string }>
}

const WORKSPACE_KEY = "costruct.workspace"

export function saveWorkspace(workspace: Workspace) {
  window.localStorage.setItem(WORKSPACE_KEY, JSON.stringify(workspace))
}

export function readWorkspace(): Workspace | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(WORKSPACE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Workspace
    if (!parsed || typeof parsed.inputs !== "object") return null
    return parsed
  } catch {
    return null
  }
}

/** One dimension set written by `public/ar/index.html`, read exactly once. */
export type ArResult = {
  component: string
  length: number
  width: number
  height: number
}

const AR_RESULT_KEY = "costruct.ar-result"

export function takeArResult(): ArResult | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(AR_RESULT_KEY)
    if (!raw) return null
    window.localStorage.removeItem(AR_RESULT_KEY)
    const parsed = JSON.parse(raw) as ArResult
    if (!parsed?.component) return null
    return parsed
  } catch {
    return null
  }
}
