import { NextResponse } from "next/server"
import { requireAuth } from "@/middleware/auth"
import { createClient } from "@/lib/supabase/server"
import { CreateSuccessResponse, HandleError } from "@/lib/response"

export async function GET() {
  try {
    const user = await requireAuth()
    const supabase = await createClient()

    const { data: staff } = await supabase
      .from("staff")
      .select("role, username")
      .eq("id", user.id)
      .single()

    const username = staff?.username || user.email?.split("@")[0] || ""
    const role = staff?.role || "staff"

    return NextResponse.json(
      CreateSuccessResponse({
        username,
        email: user.email,
        role,
      }),
    )
  } catch (error) {
    return HandleError(error)
  }
}
