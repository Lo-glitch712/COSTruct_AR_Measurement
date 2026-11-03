import { createClient } from "@supabase/supabase-js"

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://nhjsadyqgygfffjyisjg.supabase.co"
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "sb_publishable_ZyUqnzZYmWHoY3sLR1kZmg_O-gp7UeQ"

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
