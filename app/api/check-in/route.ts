import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/middleware/auth"
import { CreateSuccessResponse, HandleError } from "@/lib/response"
import { CheckInSchema } from "./schema"
import { CheckInService } from "./service"

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth()

    const body = await req.json()
    const validatedData = CheckInSchema.parse(body)

    const result = await CheckInService.checkIn(validatedData, user.id)

    return NextResponse.json(CreateSuccessResponse(result))
  } catch (error) {
    return HandleError(error)
  }
}
