import { createClient } from "../lib/supabase/server"
import { AppError, ErrorCode } from "../lib/errors"

export async function requireAuth() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new AppError(ErrorCode.UNAUTH, "ไม่พบเซสชันการใช้งาน", 401)
  }

  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: staff, error } = await supabase
    .from("staff")
    .select("role")
    .eq("id", user.id)
    .single()

  if (error || !staff || staff.role !== "admin") {
    throw new AppError(ErrorCode.FORBIDDEN, "ไม่มีสิทธิ์ในการเข้าถึง", 403)
  }

  return user
}
