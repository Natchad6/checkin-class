import { supabaseService } from "@/lib/supabase/service"
import { AppError, ErrorCode } from "@/lib/errors"
import { Database } from "@/types/database.types"

type TableName = keyof Database["public"]["Tables"]

interface StudentRow {
  student_id: string
  firstname: string | null
  lastname: string | null
  email: string
  group: string | null
  token: string
}

interface CheckInWithRelationsRow {
  created_at: string
  token: string
  event_id: string
  staff_id: string
  student: {
    id: string
  } | null
  staff: {
    username: string
  } | null
}

async function fetchAllRowsParallel<T, TTable extends TableName>(
  countTable: TTable,
  fetchPage: (
    from: number,
    to: number,
  ) => Promise<{ data: T[] | null; error: any }>,
): Promise<T[]> {
  const limit = 1000
  const finalData: T[] = []
  let from = 0
  let hasMore = true

  while (hasMore) {
    const to = from + limit - 1
    const { data, error } = await fetchPage(from, to)
    if (error) {
      console.error(`Page fetch failed for table ${countTable} range(${from}, ${to}):`, error)
      throw error
    }
    if (data && data.length > 0) {
      finalData.push(...data)
      if (data.length < limit) {
        hasMore = false
      } else {
        from += limit
      }
    } else {
      hasMore = false
    }
  }

  return finalData
}

export class AdminCheckInService {
  static async getDashboardData(eventId: string) {
    const supabase = supabaseService

    let checkins: CheckInWithRelationsRow[] = []

    try {
      checkins = await fetchAllRowsParallel<CheckInWithRelationsRow, "checkin">(
        "checkin",
        (from, to) =>
          supabase
            .from("checkin")
             .select(
              `
              created_at,
              token,
              event_id,
              staff_id,
              student:student!checkin_token_fkey (
                id
              ),
              staff:staff!checkin_staff_id_fkey (
                username
              )
            `,
            )
            .eq("event_id", eventId)
            .order("created_at", { ascending: false })
            .range(from, to) as any
      )
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        "ไม่สามารถดึงข้อมูลแดชบอร์ดได้",
      )
    }

    return {
      checkins,
    }
  }


  static async cancelCheckIn(token: string, eventId: string) {
    const supabase = supabaseService

    const { error: deleteError } = await supabase
      .from("checkin")
      .delete()
      .eq("token", token)
      .eq("event_id", eventId)

    if (deleteError) {
      console.error("Cancel check-in error:", deleteError)
      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        "ไม่สามารถยกเลิกการเช็คอินได้",
      )
    }

    return {
      token,
      event_id: eventId,
    }
  }
}
