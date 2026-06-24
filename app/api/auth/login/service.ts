import { supabaseService } from "@/lib/supabase/service"
import { LoginInput } from "./schema"
import { createClient } from "@/lib/supabase/server"
import { AppError, ErrorCode } from "@/lib/errors"

class AuthService {
  async login(input: LoginInput) {
    const { username, password } = input

    const { data: staff, error: staffError } = await supabaseService
      .from("staff")
      .select("id")
      .eq("username", username)
      .single()

    if (staffError || !staff) {
      throw new AppError(
        ErrorCode.USER_NOT_FOUND,
        "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
      )
    }

    const { data: userEmail, error: emailError } = await supabaseService
      .from("user_emails")
      .select("*")
      .eq("id", staff.id)
      .single()

    if (emailError || !userEmail?.email) {
      throw new AppError(
        ErrorCode.USER_NOT_FOUND,
        "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
      )
    }

    const supabase = await createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: userEmail.email,
      password: password,
    })

    if (authError) {
      const message =
        authError.message === "Invalid login credentials"
          ? "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
          : authError.message
      throw new AppError(ErrorCode.UNAUTH, message, 401, authError)
    }

    return data.session
  }
}

export const authService = new AuthService()
