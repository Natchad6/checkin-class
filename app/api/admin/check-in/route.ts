import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/middleware/auth"
import { AdminCheckInService } from "./service"
import { getCheckInDashboardSchema, adminActionSchema } from "./schema"
import { CheckInService } from "@/app/api/check-in/service"
import { CreateSuccessResponse, HandleError } from "@/lib/response"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("event_id")
    const validated = getCheckInDashboardSchema.parse({ event_id: eventId })

    const dashboardData = await AdminCheckInService.getDashboardData(
      validated.event_id,
    )
    return NextResponse.json(CreateSuccessResponse(dashboardData))
  } catch (error) {
    return HandleError(error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const validatedData = adminActionSchema.parse(body)

    const result = await AdminCheckInService.cancelCheckIn(
      validatedData.token,
      validatedData.event_id,
    )

    return NextResponse.json(CreateSuccessResponse(result))
  } catch (error) {
    return HandleError(error)
  }
}

