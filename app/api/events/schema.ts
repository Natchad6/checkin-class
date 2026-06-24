import { z } from "zod"

export const GetEventsSchema = z.object({})
export type GetEventsInput = z.infer<typeof GetEventsSchema>

export const EventIdSchema = z.object({
  event_id: z.uuid("Invalid Event ID"),
})
export type EventIdInput = z.infer<typeof EventIdSchema>
