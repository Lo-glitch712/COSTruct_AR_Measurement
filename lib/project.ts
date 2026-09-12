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

/**
 * One dimension set written by `public/ar/index.html`. Anything the camera did
 * not capture is absent rather than zero, so it never clears a typed value.
 */
export type ArResult = {
  component: string
  length?: number
  width?: number
  height?: number
}

const AR_RESULT_KEY = "costruct.ar-result"

export type ArMerge = {
  workspace: Workspace | null
  /** Which component was filled in and which of its fields AR supplied. */
  applied: { component: string; fields: string[] } | null
}

function measured(value: number | undefined) {
  return typeof value === "number" && value > 0 ? value.toFixed(2) : null
}

/**
 * Folds an AR reading into the stored workspace and clears it. The merge runs
 * entirely through localStorage so it is idempotent — a repeated effect cannot
 * drop the reading the way a read-once-into-state handoff can.
 */
export function mergeArResult(): ArMerge {
  if (typeof window === "undefined") return { workspace: null, applied: null }

  let result: ArResult | null = null
  try {
    const raw = window.localStorage.getItem(AR_RESULT_KEY)
    if (raw) result = JSON.parse(raw) as ArResult
  } catch {
    result = null
  }

  if (!result?.component) return { workspace: readWorkspace(), applied: null }

  const workspace: Workspace = readWorkspace() ?? {
    name: "",
    supplierId: null,
    inputs: {},
  }
  const existing = workspace.inputs[result.component] ?? {
    length: "",
    width: "",
    height: "",
  }
  const incoming = {
    length: measured(result.length),
    width: measured(result.width),
    height: measured(result.height),
  }

  workspace.inputs[result.component] = {
    length: incoming.length ?? existing.length,
    width: incoming.width ?? existing.width,
    height: incoming.height ?? existing.height,
  }
  saveWorkspace(workspace)
  window.localStorage.removeItem(AR_RESULT_KEY)

  const fields = (["length", "width", "height"] as const).filter(
    (field) => incoming[field] !== null,
  )
  return { workspace, applied: { component: result.component, fields } }
}
