import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  SUPPLIER_PASSWORD,
  authenticate,
  findAccount,
  type Account,
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

/** Browser TypeError when the Supabase host is down, paused, or DNS-missing. */
export function isRemoteUnreachable(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error && "message" in error
        ? String((error as { message?: string }).message)
        : String(error ?? "")
  const lower = message.toLowerCase()
  return (
    lower.includes("failed to fetch") ||
    lower.includes("fetch failed") ||
    lower.includes("networkerror") ||
    lower.includes("network request failed") ||
    lower.includes("load failed") ||
    lower.includes("authretryablefetch") ||
    lower.includes("err_name_not_resolved")
  )
}

export function isMissingRelation(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error && "message" in error
        ? String((error as { message?: string }).message)
        : String(error ?? "")
  const lower = message.toLowerCase()
  return (
    lower.includes("could not find the table") ||
    lower.includes("schema cache") ||
    lower.includes("does not exist") ||
    lower.includes("pgrst205")
  )
}

function sessionFromAccount(account: Account): Session {
  return {
    name: account.name,
    email: account.email,
    phone: account.phone,
    role: account.role,
    supplierId: account.supplierId,
    firstName: account.firstName,
    middleName: account.middleName,
    lastName: account.lastName,
    birthday: account.birthday,
    street: account.street,
    city: account.city,
    province: account.province,
    zipCode: account.zipCode,
  }
}

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
  const { error } = await supabase.from("profiles").upsert({
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
  if (error) {
    if (isMissingRelation(error) || isRemoteUnreachable(error)) return
    throw new Error(error.message)
  }
}

function localSession(
  email: string,
  password: string,
  role: Role,
): Session | null {
  const account = authenticate(email, password)
  if (!account || account.role !== role) return null
  return sessionFromAccount(account)
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
  let data: Awaited<
    ReturnType<typeof supabase.auth.signInWithPassword>
  >["data"] | null = null
  let error: Awaited<
    ReturnType<typeof supabase.auth.signInWithPassword>
  >["error"] = null

  try {
    const result = await supabase.auth.signInWithPassword({
      email: trimmed,
      password,
    })
    data = result.data
    error = result.error
  } catch (err) {
    error = {
      message: err instanceof Error ? err.message : "Failed to fetch",
      name: "AuthRetryableFetchError",
      status: 0,
    } as typeof error
  }

  if (error && !isRemoteUnreachable(error)) {
    const created = await ensureAuthUser(trimmed, password, role)
    if (created) {
      try {
        const result = await supabase.auth.signInWithPassword({
          email: trimmed,
          password,
        })
        data = result.data
        error = result.error
      } catch (err) {
        error = {
          message: err instanceof Error ? err.message : "Failed to fetch",
          name: "AuthRetryableFetchError",
          status: 0,
        } as typeof error
      }
    }
  }

  if (error || !data?.user) {
    const local = localSession(trimmed, password, role)
    if (local) {
      await supabase.auth.signOut().catch(() => {})
      writeSession(local)
      return local
    }
    const message = error?.message ?? "Email or password is incorrect."
    if (isRemoteUnreachable(error)) {
      throw new Error("Email or password is incorrect.")
    }
    if (message.toLowerCase().includes("not confirmed")) {
      throw new Error(
        "That email is not confirmed yet. Open the confirmation mail, then sign in again.",
      )
    }
    throw new Error(message)
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
      `That account is a ${session.role}. Go back and choose ${session.role}.`,
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
  let data: Awaited<ReturnType<typeof supabase.auth.signUp>>["data"]
  try {
    const result = await supabase.auth.signUp({
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
    data = result.data
    if (result.error) throw new Error(result.error.message)
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Failed to fetch")
  }
  if (!data.user) {
    throw new Error("Could not create the account in the database.")
  }

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

  // Email confirmation can leave no session; the DB trigger still writes profiles.
  if (data.session) {
    try {
      await upsertProfile(data.user.id, session)
    } catch (err) {
      if (!isRemoteUnreachable(err) && !isMissingRelation(err)) throw err
    }
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
