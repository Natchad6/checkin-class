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

export class AdminStudentService {
  static async getAllStudents(): Promise<StudentRow[]> {
    const supabase = supabaseService

    try {
      const students = await fetchAllRowsParallel<StudentRow, "student">(
        "student",
        (from, to) =>
          supabase
            .from("student")
            .select("student_id, firstname, lastname, email, group, token")
            .order("student_id", { ascending: true })
            .range(from, to) as any,
      )
      return students
    } catch (error) {
      console.error("Error fetching students:", error)
      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        "ไม่สามารถดึงข้อมูลนิสิตทั้งหมดได้",
      )
    }
  }
}
