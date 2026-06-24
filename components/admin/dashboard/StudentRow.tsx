"use client"

import React from "react"
import { FiCheckCircle } from "react-icons/fi"
import { useAuthStore } from "@/store/auth-store"

export interface Student {
  student_id: string
  firstname: string | null
  lastname: string | null
  email: string
  group: string | null
  token?: string
}

export interface StudentWithStatus {
  student: Student
  isCheckedIn: boolean
  checkinTime?: string | null
  checkedInBy?: string | null
  isNewCheckIn: boolean
}

interface StudentRowProps {
  item: StudentWithStatus
  onAction?: (student: Student, isCancel: boolean) => void
  isAdmin?: boolean
}

export function StudentRow({ item, onAction, isAdmin = false }: StudentRowProps) {

  const student = item.student
  const isCheckedIn = item.isCheckedIn
  const firstName = student?.firstname || ""
  const lastName = student?.lastname || ""
  const fullName =
    firstName || lastName
      ? `${firstName} ${lastName}`.trim()
      : "Unknown"
  const studentId = student?.student_id || "-"
  const group = student?.group || "ไม่มีกลุ่ม"
  const time = (() => {
    if (!item.checkinTime) return ""
    const checkinDate = new Date(item.checkinTime)
    if (isNaN(checkinDate.getTime())) return ""

    const now = new Date()
    const formatterKey = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "Asia/Bangkok",
    })
    const isSameDay = formatterKey.format(checkinDate) === formatterKey.format(now)

    const timeStr = checkinDate.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })

    if (isSameDay) {
      return timeStr
    } else {
      const dateStr = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        timeZone: "Asia/Bangkok",
      }).format(checkinDate)
      return `${dateStr} · ${timeStr}`
    }
  })()
  const staff = item.checkedInBy || "-"

  return (
    <div
      className={`flex items-center p-2.5 rounded-[20px] bg-white transition-all border shadow-sm ${
        item.isNewCheckIn
          ? "border-black"
          : isCheckedIn
            ? "border-transparent"
            : "border-transparent opacity-75"
      }`}
    >
      {/* Status Icon */}
      <div
        className={`w-[44px] h-[44px] flex items-center justify-center rounded-[14px] flex-shrink-0 transition-colors ${
          item.isNewCheckIn
            ? "bg-[#1A1A1A]"
            : isCheckedIn
              ? "border-[1.5px] border-green-500/30 bg-green-500/10"
              : "border-[1.5px] border-dashed border-gray-200 bg-gray-50"
        }`}
      >
        {isCheckedIn ? (
          <FiCheckCircle
            className={`text-[18px] ${item.isNewCheckIn ? "text-white" : "text-green-500"}`}
          />
        ) : (
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
        )}
      </div>

      {/* Info */}
      <div className="ml-3 flex-1 min-w-0">
        <h3
          className={`font-semibold text-[14px] truncate ${isCheckedIn ? "text-black" : "text-gray-500 font-medium"}`}
        >
          {fullName}
        </h3>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-gray-400 text-[11px] font-medium">
            {studentId}
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-200" />
          <span className="text-gray-400 text-[11px] font-medium">
            {student.token || "-"}
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-200" />
          <span className="text-gray-400 text-[11px] font-medium">
            G - {group}
          </span>
          {isCheckedIn && (
            <>
              <span className="w-1 h-1 rounded-full bg-gray-200" />
              <span className="text-gray-400 text-[11px] font-medium">
                @{staff}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Time / Status Label & Actions */}
      <div className="ml-3 flex items-center gap-2.5 flex-shrink-0">
        {isCheckedIn ? (
          <>
            <span className="text-[12px] font-semibold text-gray-400">
              {time}
            </span>
            {isAdmin && onAction && (
              <button
                onClick={() => onAction(student, true)}
                className="px-3 py-1.5 text-[11px] font-bold rounded-full bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white transition-all cursor-pointer shadow-xs border border-red-500/10"
              >
                ยกเลิก
              </button>
            )}
          </>
        ) : (
          <>
            <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
              ยังไม่เช็คอิน
            </span>
            {isAdmin && onAction && (
              <button
                onClick={() => onAction(student, false)}
                className="px-3 py-1.5 text-[11px] font-bold rounded-full bg-green-500 text-white hover:bg-green-600 transition-all cursor-pointer shadow-xs"
              >
                เช็คอิน
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
