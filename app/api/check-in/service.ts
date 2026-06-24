import { supabaseService } from "@/lib/supabase/service";
import { AppError, ErrorCode } from "@/lib/errors";
import { CheckInInput } from "./schema";

export class CheckInService {
  static async checkIn(input: CheckInInput, staffId: string) {
    const supabase = supabaseService;

    const { data: student, error: studentError } = await supabase
      .from("student")
      .select("id, student_id, firstname, lastname, email")
      .eq("token", input.token)
      .single();

    if (studentError || !student) {
      throw new AppError(ErrorCode.NOT_FOUND, "ไม่พบข้อมูลนิสิตจาก Token นี้");
    }

    const { data: existingCheckIn, error: existingError } = await supabase
      .from("checkin")
      .select("created_at")
      .eq("token", input.token)
      .eq("event_id", input.event_id)
      .maybeSingle();

    if (existingCheckIn) {
      return {
        alreadyCheckedIn: true,
        student: {
          firstname: student.firstname,
          lastname: student.lastname,
          email: student.email,
          student_id: student.student_id,
        },
        checkedInAt: existingCheckIn.created_at,
      };
    }

    const { error: insertError } = await supabase.from("checkin").insert({
      token: input.token,
      event_id: input.event_id,
      staff_id: staffId,
    });

    if (insertError) {
      console.error("Check-in error:", insertError);
      throw new AppError(
        ErrorCode.INTERNAL_SERVER_ERROR,
        "ไม่สามารถบันทึกการเช็คอินได้",
      );
    }

    return {
      alreadyCheckedIn: false,
      student: {
        firstname: student.firstname,
        lastname: student.lastname,
        email: student.email,
        student_id: student.student_id,
      },
      checkedInAt: new Date().toISOString(),
    };
  }
}
