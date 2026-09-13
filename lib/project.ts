"use client"

import { COMPONENTS, type ComponentName, type Dimensions } from "@/lib/estimate"

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
 * Projects the buyer chose to keep. The draft above is scratch space for one
 * calculation; these survive until they are deleted.
 */
export type SavedProject = ProjectDraft & { id: string; total: number }

const PROJECTS_KEY = "costruct.projects"

export function readProjects(): SavedProject[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(PROJECTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SavedProject[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const COMPONENT_NAMES = COMPONENTS.map(({ name }) => name)

function isComponentName(value: unknown): value is ComponentName {
  return typeof value === "string" && value.trim().length > 0
}

function normalizeSelected(
  selected: unknown,
  inputs: Record<string, { length?: string; width?: string; height?: string }>,
): ComponentName[] {
  if (Array.isArray(selected)) {
    return selected.filter(isComponentName)
  }

  return COMPONENT_NAMES.filter((name) => {
    const input = inputs[name]
    return Boolean(input?.length || input?.width || input?.height)
  })
}

function writeProjects(projects: SavedProject[]) {
  window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
}

/**
 * Saves a calculation, replacing the previous save of the same one. `savedAt`
 * is stamped when Calculate runs, so re-saving updates instead of duplicating.
 */
export function saveProject(draft: ProjectDraft, total: number) {
  const projects = readProjects()
  const existing = projects.findIndex(
    (project) => project.savedAt === draft.savedAt,
  )
  const entry: SavedProject = {
    ...draft,
    total,
    id: existing >= 0 ? projects[existing].id : newId(),
  }

  if (existing >= 0) projects[existing] = entry
  else projects.unshift(entry)

  writeProjects(projects)
  return entry
}

export function removeProject(id: string) {
  writeProjects(readProjects().filter((project) => project.id !== id))
}

function newId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `p${Date.now()}${Math.random().toString(16).slice(2, 8)}`
}

/**
 * The AR tool is a standalone page outside the router, so opening it unloads
 * the measurement form. The half-filled form is parked here first and restored
 * when the browser comes back.
 */
export type ArLockedFields = {
  length?: boolean
  width?: boolean
  height?: boolean
}

export type Workspace = {
  name: string
  supplierId: string | null
  selected: ComponentName[]
  inputs: Record<string, { length: string; width: string; height: string }>
  /** Fields written by AR stay read-only after save. */
  arLocked?: Record<string, ArLockedFields>
  customComponents?: { name: string; hint: string }[]
  hiddenComponents?: string[]
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
    return {
      ...parsed,
      selected: normalizeSelected(parsed.selected, parsed.inputs),
    }
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

/** Reads one AR save without touching the buyer workspace. */
export function consumeArResult() {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(AR_RESULT_KEY)
    if (!raw) return null
    const result = JSON.parse(raw) as ArResult
    window.localStorage.removeItem(AR_RESULT_KEY)
    const incoming = {
      length: measured(result.length),
      width: measured(result.width),
      height: measured(result.height),
    }
    const fields = (["length", "width", "height"] as const).filter(
      (field) => incoming[field] !== null,
    )
    return { ...incoming, fields }
  } catch {
    return null
  }
}

const SUPPLIER_CALC_KEY = "costruct.supplier-calc"

export type SupplierCalc = {
  length: string
  width: string
  height: string
  arLocked: ArLockedFields
}

export function readSupplierCalc(): SupplierCalc | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(SUPPLIER_CALC_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SupplierCalc
    if (!parsed || typeof parsed !== "object") return null
    return {
      length: String(parsed.length ?? ""),
      width: String(parsed.width ?? ""),
      height: String(parsed.height ?? ""),
      arLocked: parsed.arLocked ?? {},
    }
  } catch {
    return null
  }
}

export function saveSupplierCalc(calc: SupplierCalc) {
  window.localStorage.setItem(SUPPLIER_CALC_KEY, JSON.stringify(calc))
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
    selected: [],
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
  const locks = { ...(workspace.arLocked?.[result.component] ?? {}) }
  if (incoming.length) locks.length = true
  if (incoming.width) locks.width = true
  if (incoming.height) locks.height = true
  workspace.arLocked = {
    ...(workspace.arLocked ?? {}),
    [result.component]: locks,
  }
  if (isComponentName(result.component)) {
    workspace.selected = [
      result.component,
      ...workspace.selected.filter((name) => name !== result.component),
    ]
  }
  saveWorkspace(workspace)
  window.localStorage.removeItem(AR_RESULT_KEY)

  const fields = (["length", "width", "height"] as const).filter(
    (field) => incoming[field] !== null,
  )
  return { workspace, applied: { component: result.component, fields } }
}
