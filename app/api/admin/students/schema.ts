import { z } from "zod"

export const getStudentsSchema = z.object({}).optional()

export type GetStudentsInput = z.infer<typeof getStudentsSchema>
