import { NextResponse } from "next/server"
import { AppError, ErrorCode } from "./errors"
import { z, ZodError } from "zod"

export interface SuccessResponse<T> {
  success: true
  data: T
}

export const CreateSuccessResponse = <T>(data: T): SuccessResponse<T> => {
  return {
    success: true,
    data,
  }
}

export interface ErrorDetail {
  code: string
  message: string
  details?: unknown
}

export interface ErrorResponse {
  success: false
  error: ErrorDetail
}

export const CreateErrorResponse = (
  code: string,
  message: string,
  details?: unknown,
): ErrorResponse => {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  }
}

export const HandleError = (error: unknown) => {
  if (error instanceof AppError) {
    return NextResponse.json(
      CreateErrorResponse(error.code, error.message, error.details),
      { status: error.statusCode },
    )
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      CreateErrorResponse(ErrorCode.VALIDATION_ERROR, "ข้อมูลไม่ถูกต้อง"),
      { status: 400 },
    )
  }

  return NextResponse.json(
    CreateErrorResponse(
      ErrorCode.INTERNAL_SERVER_ERROR,
      error instanceof Error ? error.message : "เกิดข้อผิดพลาดภายในระบบ",
    ),
    { status: 500 },
  )
}
