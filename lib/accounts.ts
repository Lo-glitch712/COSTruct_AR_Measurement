import { fullName, type ProfileDetails } from "@/lib/profile"
import { SUPPLIERS, supplierEmail } from "@/lib/suppliers"

export type AccountRole = "buyer" | "supplier" | "admin"

export type Account = {
  id: string
  name: string
  email: string
  phone: string
  password: string
  role: AccountRole
  supplierId?: string
  createdAt: string
  profileId?: string
  firstName?: string
  middleName?: string
  lastName?: string
  birthday?: string
  street?: string
  city?: string
  province?: string
  zipCode?: string
}

export const ADMIN_EMAIL = "admin@gmail.com"
export const ADMIN_PASSWORD = "admin123"
export const SUPPLIER_PASSWORD = "supplier123"

const STORAGE_KEY = "costruct.accounts"

function supplierAccounts(): Account[] {
  return SUPPLIERS.map((supplier, index) => ({
    id: `supplier-${supplier.id}`,
    name: supplier.name,
    email: supplierEmail(supplier.id),
    phone: "",
    password: SUPPLIER_PASSWORD,
    role: "supplier",
    supplierId: supplier.id,
    createdAt: new Date(2026, 0, 1 + index).toISOString(),
  }))
}

function seedAccounts(): Account[] {
  return [
    {
      id: "admin",
      name: "COSTruct Admin",
      email: ADMIN_EMAIL,
      phone: "",
      password: ADMIN_PASSWORD,
      role: "admin",
      createdAt: new Date(2026, 0, 1).toISOString(),
    },
    ...supplierAccounts(),
  ]
}

function mergeSeed(stored: Account[]): Account[] {
  const seeded = seedAccounts()
  const removed = readRemoved()
  const byEmail = new Map(stored.map((account) => [account.email.toLowerCase(), account]))
  for (const account of seeded) {
    const key = account.email.toLowerCase()
    if (removed.has(key)) continue
    const existing = byEmail.get(key)
    if (!existing) {
      byEmail.set(key, account)
      continue
    }
    if (account.role === "supplier" || account.role === "admin") {
      byEmail.set(key, {
        ...existing,
        name: account.name,
        password: account.password,
        role: account.role,
        supplierId: account.supplierId,
      })
    }
  }
  return [...byEmail.values()]
}

export function readAccounts(): Account[] {
  if (typeof window === "undefined") return seedAccounts()
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const seeded = seedAccounts()
      writeAccounts(seeded)
      return seeded
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return seedAccounts()
    const merged = mergeSeed(parsed)
    writeAccounts(merged)
    return merged
  } catch {
    return seedAccounts()
  }
}

const REMOVED_KEY = "costruct.removed-accounts"

function readRemoved() {
  if (typeof window === "undefined") return new Set<string>()
  try {
    const raw = window.localStorage.getItem(REMOVED_KEY)
    const parsed = raw ? (JSON.parse(raw) as string[]) : []
    return new Set(parsed.map((email) => email.toLowerCase()))
  } catch {
    return new Set<string>()
  }
}

function writeRemoved(emails: Set<string>) {
  window.localStorage.setItem(REMOVED_KEY, JSON.stringify([...emails]))
}

function writeAccounts(accounts: Account[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts))
}

export function findAccount(email: string) {
  return (
    readAccounts().find(
      (account) => account.email.toLowerCase() === email.trim().toLowerCase(),
    ) ?? null
  )
}

export function authenticate(email: string, password: string) {
  const account = findAccount(email)
  if (!account || account.password !== password) return null
  return account
}

export function registerBuyer(
  input: ProfileDetails & { password: string },
) {
  const email = input.email.trim().toLowerCase()
  if (findAccount(email)) {
    throw new Error("That email is already registered.")
  }
  const account: Account = {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `buyer-${Date.now()}`,
    name: fullName(input),
    email,
    phone: input.phone.trim(),
    password: input.password,
    role: "buyer",
    createdAt: new Date().toISOString(),
    firstName: input.firstName.trim(),
    middleName: input.middleName.trim(),
    lastName: input.lastName.trim(),
    birthday: input.birthday,
    street: input.street.trim(),
    city: input.city.trim(),
    province: input.province.trim(),
    zipCode: input.zipCode.trim(),
  }
  writeAccounts([...readAccounts(), account])
  return account
}

export function buyers() {
  return readAccounts().filter((account) => account.role === "buyer")
}

export function suppliers() {
  return readAccounts().filter((account) => account.role === "supplier")
}

export function removeAccount(email: string) {
  const key = email.trim().toLowerCase()
  const removed = readRemoved()
  removed.add(key)
  writeRemoved(removed)
  writeAccounts(
    readAccounts().filter((account) => account.email.toLowerCase() !== key),
  )
}
