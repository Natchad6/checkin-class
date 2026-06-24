import { z } from "zod"

export const CheckInSchema = z.object({
  token: z.string().min(1, "Token is required"),
  event_id: z.uuid("Invalid Event ID"),
})

export type CheckInInput = z.infer<typeof CheckInSchema>
