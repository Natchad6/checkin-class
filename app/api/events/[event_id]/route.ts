import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/middleware/auth"
import { CreateSuccessResponse, HandleError } from "@/lib/response"
import { EventService } from "../service"
import { EventIdSchema } from "../schema"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ event_id: string }> },
) {
  try {
    await requireAuth()
    const { event_id } = EventIdSchema.parse(await params)

    const event = await EventService.getEventById(event_id)

    return NextResponse.json(CreateSuccessResponse(event))
  } catch (error) {
    return HandleError(error)
  }
}
