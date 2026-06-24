import { createServerClient } from "@supabase/ssr"
import { cookies, headers } from "next/headers"
import { Database } from "../../types/database.types"

export async function createClient() {
  const cookieStore = await cookies()
  const headerStore = await headers()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      global: {
        headers: {
          "x-forwarded-for":
            headerStore.get("x-real-ip") ??
            headerStore.get("x-forwarded-for")?.split(",")[0] ??
            "",
          "user-agent": headerStore.get("user-agent") ?? "",
        },
      },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {}
        },
      },
    },
  )
}
