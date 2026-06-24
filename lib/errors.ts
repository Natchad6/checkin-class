export enum ErrorCode {
  UNAUTH = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  NOT_FOUND = "NOT_FOUND",
  USER_NOT_FOUND = "USER_NOT_FOUND",
}

export const ErrorStatusMap: Record<ErrorCode, number> = {
  [ErrorCode.UNAUTH]: 401,
  [ErrorCode.FORBIDDEN]: 403,
  [ErrorCode.TOKEN_EXPIRED]: 401,
  [ErrorCode.VALIDATION_ERROR]: 400,
  [ErrorCode.INTERNAL_SERVER_ERROR]: 500,
  [ErrorCode.NOT_FOUND]: 404,
  [ErrorCode.USER_NOT_FOUND]: 404,
}

export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number
  public readonly details?: unknown

  constructor(
    code: ErrorCode,
    message: string,
    statusCode?: number,
    details?: unknown,
  ) {
    super(message)
    this.code = code
    this.statusCode = statusCode ?? ErrorStatusMap[code] ?? 500
    this.details = details
    Object.setPrototypeOf(this, AppError.prototype)
  }
}
