import { NextResponse } from "next/server"
import { loginSchema } from "./schema"
import { authService } from "./service"
import { CreateSuccessResponse, HandleError } from "@/lib/response"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const validatedData = loginSchema.parse(body)

    const session = await authService.login(validatedData)

    return NextResponse.json(CreateSuccessResponse({ email: session?.user.email }))
  } catch (error) {
    return HandleError(error)
  }
}
