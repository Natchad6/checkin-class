import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { CreateSuccessResponse, HandleError } from "@/lib/response"

export async function POST() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()

    return NextResponse.json(CreateSuccessResponse({ message: "Logged out successfully" }))
  } catch (error) {
    return HandleError(error)
  }
}
