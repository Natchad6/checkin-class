import { z } from "zod"

export const getCheckInDashboardSchema = z.object({
  event_id: z.uuid("รหัสกิจกรรมไม่ถูกต้อง"),
})

export type GetCheckInDashboardInput = z.infer<typeof getCheckInDashboardSchema>

export const adminActionSchema = z.object({
  token: z.string().min(1, "Token is required"),
  event_id: z.uuid("รหัสกิจกรรมไม่ถูกต้อง"),
})

export type AdminActionInput = z.infer<typeof adminActionSchema>

