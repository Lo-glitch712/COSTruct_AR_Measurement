import { createClient } from "@supabase/supabase-js"

const NEW_URL = "https://robmfnfvgmgoasllyphd.supabase.co"
const NEW_KEY = "sb_publishable_lWZvjWnR5Fkq6lIcg3Au3w_PBEBgqIH"

const fromEnvUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const url =
  fromEnvUrl && !fromEnvUrl.includes("nhjsadyqgygfffjyisjg")
    ? fromEnvUrl
    : NEW_URL
const fromEnvKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const key =
  fromEnvKey && !fromEnvKey.includes("ZyUqnzZYmWHoY3sLR1kZmg")
    ? fromEnvKey
    : NEW_KEY

export const supabaseEnabled = Boolean(url && key)

export const supabase = createClient(url ?? "https://placeholder.supabase.co", key ?? "public-anon-key", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

/** Separate client so seeding users does not steal the signed-in session. */
export const supabaseSeed = createClient(url ?? "https://placeholder.supabase.co", key ?? "public-anon-key", {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})
