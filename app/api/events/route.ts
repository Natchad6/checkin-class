import { NextResponse } from "next/server"
import { requireAuth } from "@/middleware/auth"
import { CreateSuccessResponse, HandleError } from "@/lib/response"
import { EventService } from "./service"

export async function GET() {
  try {
    await requireAuth()

    const events = await EventService.getEvents()

    return NextResponse.json(CreateSuccessResponse(events))
  } catch (error) {
    return HandleError(error)
  }
}
