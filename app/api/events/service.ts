import { supabaseService } from "@/lib/supabase/service"
import { AppError, ErrorCode } from "@/lib/errors"

// This Event Service is for event that are happening now
export class EventService {
  static async getEvents() {
    const now = new Date().toISOString()
    const { data: events, error } = await supabaseService
      .from("event")
      .select("id, name, event_date, event_end, created_at")
      .lte("event_date", now)
      .or(`event_end.is.null,event_end.gte.${now}`)
      .order("event_date", { ascending: true })

    if (error) {
      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        "ไม่สามารถดึงข้อมูลกิจกรรมได้",
      )
    }

    return events
  }

  static async getEventById(id: string) {
    const now = new Date().toISOString()
    const { data: event, error } = await supabaseService
      .from("event")
      .select("id, name, event_date, event_end, created_at")
      .eq("id", id)
      .lte("event_date", now)
      .or(`event_end.is.null,event_end.gte.${now}`)
      .single()

    if (error || !event) {
      throw new AppError(
        ErrorCode.NOT_FOUND,
        "ไม่พบข้อมูลกิจกรรม หรือกิจกรรมยังไม่เริ่ม/สิ้นสุดแล้ว",
      )
    }

    return event
  }
}
