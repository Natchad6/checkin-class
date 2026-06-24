import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      global: {
        headers: {
          "x-forwarded-for":
            (request as any).ip ??
            request.headers.get("x-forwarded-for")?.split(",")[0] ??
            request.headers.get("x-real-ip") ??
            "",
          "user-agent": request.headers.get("user-agent") ?? "",
        },
      },
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith("/login")
  const isProtectedPage = request.nextUrl.pathname.startsWith("/events")
  const isAdminPage = request.nextUrl.pathname.startsWith("/admin")

  if (!user && (isProtectedPage || isAdminPage)) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/events", request.url))
  }

  if (user && isAdminPage) {
    const { data: staff } = await supabase
      .from("staff")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!staff || staff.role !== "admin") {
      return NextResponse.redirect(new URL("/events", request.url))
    }
  }

  return response
}

export const config = {
  matcher: ["/events/:path*", "/events", "/login", "/admin/:path*", "/admin"],
}
