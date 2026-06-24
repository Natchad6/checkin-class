import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/middleware/auth"
import { AdminStudentService } from "./service"
import { CreateSuccessResponse, HandleError } from "@/lib/response"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const students = await AdminStudentService.getAllStudents()
    return NextResponse.json(CreateSuccessResponse(students))
  } catch (error) {
    return HandleError(error)
  }
}
