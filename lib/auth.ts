import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  SUPPLIER_PASSWORD,
  findAccount,
} from "@/lib/accounts"
import {
  clearSession,
  writeSession,
  type Role,
  type Session,
} from "@/lib/session"
import { fullName, type ProfileDetails } from "@/lib/profile"
import { supabase, supabaseEnabled, supabaseSeed } from "@/lib/supabase"
import { SUPPLIERS, supplierEmail } from "@/lib/suppliers"

type ProfileRow = {
  id: string
  role: Role
  name: string
  email: string
  phone: string | null
  supplier_id: string | null
  first_name?: string | null
  middle_name?: string | null
  last_name?: string | null
  birthday?: string | null
  street?: string | null
  city?: string | null
  province?: string | null
  zip_code?: string | null
}

export type RemoteProfile = Session & { id: string }

function sessionFromProfile(row: ProfileRow): RemoteProfile {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? "",
    role: row.role,
    supplierId: row.supplier_id ?? undefined,
    firstName: row.first_name ?? "",
    middleName: row.middle_name ?? "",
    lastName: row.last_name ?? "",
    birthday: row.birthday ?? "",
    street: row.street ?? "",
    city: row.city ?? "",
    province: row.province ?? "",
    zipCode: row.zip_code ?? "",
  }
}

export async function loadProfile(userId: string): Promise<Session | null> {
  if (!supabaseEnabled) return null
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, role, name, email, phone, supplier_id, first_name, middle_name, last_name, birthday, street, city, province, zip_code",
    )
    .eq("id", userId)
    .maybeSingle()
  if (error || !data) return null
  return sessionFromProfile(data as ProfileRow)
}

async function upsertProfile(userId: string, session: Session) {
  if (!supabaseEnabled) return
  await supabase.from("profiles").upsert({
    id: userId,
    role: session.role,
    name: session.name,
    email: session.email,
    phone: session.phone || null,
    supplier_id: session.supplierId ?? null,
    first_name: session.firstName || null,
    middle_name: session.middleName || null,
    last_name: session.lastName || null,
    birthday: session.birthday || null,
    street: session.street || null,
    city: session.city || null,
    province: session.province || null,
    zip_code: session.zipCode || null,
  })
}

function seededMeta(email: string, role: Role) {
  const lower = email.trim().toLowerCase()
  if (lower === ADMIN_EMAIL) {
    return { role: "admin" as const, name: "COSTruct Admin", supplier_id: null }
  }
  const store = SUPPLIERS.find(
    (supplier) => supplierEmail(supplier.id) === lower,
  )
  if (store) {
    return {
      role: "supplier" as const,
      name: store.name,
      supplier_id: store.id,
    }
  }
  if (role === "supplier" || role === "admin") {
    const local = findAccount(email)
    if (local) {
      return {
        role: local.role,
        name: local.name,
        supplier_id: local.supplierId ?? null,
      }
    }
  }
  return null
}

async function ensureAuthUser(email: string, password: string, role: Role) {
  const meta = seededMeta(email, role)
  if (!meta) return false

  const { error } = await supabaseSeed.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { data: meta },
  })

  if (!error) return true
  const message = error.message.toLowerCase()
  return (
    message.includes("already") ||
    message.includes("registered") ||
    message.includes("exists")
  )
}

export async function signInRemote(
  email: string,
  password: string,
  role: Role,
): Promise<Session> {
  if (!supabaseEnabled) {
    throw new Error("Supabase is not configured.")
  }

  const trimmed = email.trim().toLowerCase()
  let { data, error } = await supabase.auth.signInWithPassword({
    email: trimmed,
    password,
  })

  if (error) {
    const created = await ensureAuthUser(trimmed, password, role)
    if (created) {
      ;({ data, error } = await supabase.auth.signInWithPassword({
        email: trimmed,
        password,
      }))
    }
  }

  if (error || !data.user) {
    throw new Error(error?.message ?? "Email or password is incorrect.")
  }

  let session = await loadProfile(data.user.id)
  if (!session) {
    const meta = seededMeta(trimmed, role) ?? {
      role,
      name: data.user.user_metadata?.name ?? trimmed.split("@")[0],
      supplier_id: data.user.user_metadata?.supplier_id ?? null,
    }
    session = {
      name: String(meta.name),
      email: trimmed,
      phone: String(data.user.user_metadata?.phone ?? ""),
      role: meta.role,
      supplierId: meta.supplier_id ?? undefined,
    }
    await upsertProfile(data.user.id, session)
  }

  if (session.role !== role) {
    await supabase.auth.signOut()
    throw new Error(
      `That account is a ${session.role}. Switch the tab and try again.`,
    )
  }

  writeSession(session)
  return session
}

export async function signUpBuyerRemote(
  input: ProfileDetails & { password: string },
): Promise<void> {
  if (!supabaseEnabled) {
    throw new Error("Supabase is not configured.")
  }

  const email = input.email.trim().toLowerCase()
  const name = fullName(input)
  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      data: {
        role: "buyer",
        name,
        phone: input.phone.trim(),
        first_name: input.firstName.trim(),
        middle_name: input.middleName.trim(),
        last_name: input.lastName.trim(),
        birthday: input.birthday,
        street: input.street.trim(),
        city: input.city.trim(),
        province: input.province.trim(),
        zip_code: input.zipCode.trim(),
      },
    },
  })

  if (error) throw new Error(error.message)

  if (data.user) {
    const session: Session = {
      name,
      email,
      phone: input.phone.trim(),
      role: "buyer",
      firstName: input.firstName.trim(),
      middleName: input.middleName.trim(),
      lastName: input.lastName.trim(),
      birthday: input.birthday,
      street: input.street.trim(),
      city: input.city.trim(),
      province: input.province.trim(),
      zipCode: input.zipCode.trim(),
    }
    await upsertProfile(data.user.id, session)
  }

  await supabase.auth.signOut()
  clearSession()
}

export async function updateRemoteProfile(patch: Partial<Session>) {
  if (!supabaseEnabled) return
  const { data } = await supabase.auth.getUser()
  if (!data.user) return
  await supabase
    .from("profiles")
    .update({
      name: patch.name,
      phone: patch.phone,
    })
    .eq("id", data.user.id)
}

export async function signOutRemote() {
  if (supabaseEnabled) await supabase.auth.signOut()
  clearSession()
}

export async function fetchProfiles(): Promise<RemoteProfile[]> {
  if (!supabaseEnabled) return []
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, role, name, email, phone, supplier_id, first_name, middle_name, last_name, birthday, street, city, province, zip_code",
    )
    .order("created_at", { ascending: false })
  if (error || !data) return []
  return (data as ProfileRow[]).map(sessionFromProfile)
}

export async function deleteAccountRemote(profileId: string) {
  if (!supabaseEnabled) return
  const { error } = await supabase.rpc("admin_delete_account", {
    target_id: profileId,
  })
  if (error) {
    const fallback = await supabase.from("profiles").delete().eq("id", profileId)
    if (fallback.error) throw new Error(fallback.error.message)
  }
}

export { ADMIN_EMAIL, ADMIN_PASSWORD, SUPPLIER_PASSWORD }
