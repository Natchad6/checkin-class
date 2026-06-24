"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import axiosInstance from "@/lib/axiosInstance"
import axios from "axios"
import { useAuthStore } from "@/store/auth-store"
import { createClient } from "@/lib/supabase/client"
import { Button, Spinner } from "@heroui/react"

import { DashboardHeader } from "./dashboard/DashboardHeader"
import { EventSelector, AppEvent } from "./dashboard/EventSelector"
import { StatCards } from "./dashboard/StatCards"
import { GroupBreakdown } from "./dashboard/GroupBreakdown"
import { FilterControls } from "./dashboard/FilterControls"
import { StudentList } from "./dashboard/StudentList"
import { CheckInActionModal } from "./dashboard/CheckInActionModal"

interface Student {
  student_id: string
  firstname: string | null
  lastname: string | null
  email: string
  group: string | null
  token?: string
}

interface Staff {
  username: string
}

interface CheckIn {
  created_at: string
  token: string
  event_id: string
  staff_id?: string
  student: Student | null
  staff: Staff | null
  isNew?: boolean
}

interface DashboardProps {
  initialEvents: AppEvent[]
}

export default function AdminDashboard({ initialEvents }: DashboardProps) {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [selectedEventId, setSelectedEventId] = useState<string>(
    initialEvents.length > 0 ? initialEvents[0].id : "",
  )

  const [checkins, setCheckins] = useState<CheckIn[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [staffCache, setStaffCache] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Confirmation and Result modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [modalAction, setModalAction] = useState<{
    student: Student
    isCancel: boolean
  } | null>(null)
  const [isProcessingAction, setIsProcessingAction] = useState(false)
  const [actionResult, setActionResult] = useState<{
    type: "success" | "warning" | "danger"
    title: string
    message: string | React.ReactNode
  } | null>(null)

  const handleStudentAction = (student: Student, isCancel: boolean) => {
    setModalAction({ student, isCancel })
    setActionResult(null)
    setModalOpen(true)
  }

  // Refs to allow real-time handlers to access latest data without stale closures
  const studentsRef = React.useRef(students)
  const staffCacheRef = React.useRef(staffCache)

  useEffect(() => {
    studentsRef.current = students
  }, [students])

  useEffect(() => {
    staffCacheRef.current = staffCache
  }, [staffCache])

  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "live" | "disconnected"
  >("disconnected")
  const [lastPing, setLastPing] = useState<Date | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGroupFilter, setSelectedGroupFilter] = useState("all")
  const [selectedYearFilter, setSelectedYearFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState<
    "all" | "checked" | "not_checked"
  >("checked")

  const populatedCheckins = useMemo(() => {
    const studentMap = new Map(students.map((s) => [s.token, s]))
    return checkins.map((c) => ({
      ...c,
      student: c.token ? studentMap.get(c.token) || c.student : c.student,
    }))
  }, [checkins, students])

  const totalCheckins = useMemo(() => {
    return populatedCheckins.filter((c) => {
      const studentId = (c.student?.student_id || "").toLowerCase()
      return (
        selectedYearFilter === "all" ||
        studentId.startsWith(selectedYearFilter.toLowerCase())
      )
    }).length
  }, [populatedCheckins, selectedYearFilter])

  const totalStudentsForYear = useMemo(() => {
    return students.filter((s) => {
      const studentId = (s.student_id || "").toLowerCase()
      return (
        selectedYearFilter === "all" ||
        studentId.startsWith(selectedYearFilter.toLowerCase())
      )
    }).length
  }, [students, selectedYearFilter])

  const groupSummary = useMemo(() => {
    const stats: Record<string, number> = {}
    populatedCheckins.forEach((c) => {
      const std = c.student
      const studentId = (std?.student_id || "").toLowerCase()
      const matchesYear =
        selectedYearFilter === "all" ||
        studentId.startsWith(selectedYearFilter.toLowerCase())

      if (matchesYear) {
        const groupName = std?.group || "ไม่มีกลุ่ม"
        stats[groupName] = (stats[groupName] || 0) + 1
      }
    })
    return Object.entries(stats)
      .map(([group, count]) => ({
        group,
        count,
      }))
      .sort((a, b) =>
        a.group.localeCompare(b.group, undefined, { numeric: true }),
      )
  }, [populatedCheckins, selectedYearFilter])

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      await axiosInstance.post("/api/auth/logout")
      logout()
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleGroupClick = (groupName: string) => {
    setSelectedGroupFilter((prev) => (prev === groupName ? "all" : groupName))
  }

  const executeStudentAction = async () => {
    if (!modalAction || isProcessingAction) return
    setIsProcessingAction(true)

    const { student, isCancel } = modalAction
    const token = student.token
    if (!token) {
      setActionResult({
        type: "danger",
        title: "เกิดข้อผิดพลาด",
        message: "ไม่พบ Token ของนิสิตรายนี้",
      })
      setIsProcessingAction(false)
      return
    }

    try {
      if (isCancel) {
        const response = await axiosInstance.delete("/api/admin/check-in", {
          data: { token, event_id: selectedEventId },
        })

        if (response.data.success) {
          // Instantly update local state to be snappy
          setCheckins((prev) => prev.filter((c) => c.token !== token))

          setActionResult({
            type: "success",
            title: "ยกเลิกเช็คอินสำเร็จ",
            message: (
              <>
                <div>
                  ยกเลิกการเช็คอินของ คุณ{" "}
                  <span className="font-bold text-white">
                    {student.firstname} {student.lastname}
                  </span>{" "}
                  เรียบร้อยแล้ว
                </div>
                <div className="mt-0.5">
                  รหัสนิสิต:{" "}
                  <span className="text-white">{student.student_id}</span>
                </div>
              </>
            ),
          })
        }
      } else {
        const response = await axiosInstance.post("/api/check-in", {
          token,
          event_id: selectedEventId,
        })

        if (response.data.success) {
          const {
            alreadyCheckedIn,
            student: updatedStudent,
            checkedInAt,
          } = response.data.data
          const studentName = `${updatedStudent.firstname} ${updatedStudent.lastname}`
          const studentId = updatedStudent.student_id

          // Instantly update local state to be snappy
          const matchedStudent: Student = {
            student_id: studentId,
            firstname: updatedStudent.firstname,
            lastname: updatedStudent.lastname,
            email: updatedStudent.email,
            group: student.group,
            token: token,
          }

          const newCheckin: CheckIn = {
            created_at: checkedInAt || new Date().toISOString(),
            token: token,
            event_id: selectedEventId,
            student: matchedStudent,
            staff: user?.username ? { username: user.username } : null,
            isNew: true,
          }

          setCheckins((prev) => {
            if (
              prev.some(
                (c) => c.token === token && c.event_id === selectedEventId,
              )
            )
              return prev
            return [newCheckin, ...prev]
          })

          if (alreadyCheckedIn) {
            setActionResult({
              type: "warning",
              title: "เช็คอินไปแล้ว",
              message: (
                <div className="space-y-0.5">
                  <div>
                    คุณ{" "}
                    <span className="font-bold text-white">
                      {studentName}
                    </span>{" "}
                  </div>
                  <div>
                    รหัสนิสิต: <span className="text-white">{studentId}</span>
                  </div>
                  <div>
                    <span className="block text-white/50">
                      ได้เช็คอินเข้าร่วมกิจกรรมแล้ว
                    </span>
                  </div>
                </div>
              ),
            })
          } else {
            setActionResult({
              type: "success",
              title: "Check-in สำเร็จ!",
              message: (
                <>
                  <div>
                    ยินดีต้อนรับคุณ{" "}
                    <span className="font-bold text-white">{studentName}</span>
                  </div>
                  <div className="mt-0.5">
                    รหัสนิสิต: <span className="text-white">{studentId}</span>
                  </div>
                </>
              ),
            })
          }
        }
      }
    } catch (error) {
      const errorMessage =
        axios.isAxiosError(error) && error.response?.data?.error
          ? error.response.data.error.message
          : "เกิดข้อผิดพลาดในการทำรายการ"

      setActionResult({
        type: "danger",
        title: "เกิดข้อผิดพลาด",
        message: errorMessage,
      })
    } finally {
      setIsProcessingAction(false)
    }
  }

  useEffect(() => {
    let isMounted = true
    const fetchStudents = async () => {
      try {
        const response = await axiosInstance.get("/api/admin/students")
        if (response.data.success && isMounted) {
          setStudents(response.data.data || [])
        }
      } catch (error) {
        console.error("Failed to fetch student database:", error)
      }
    }
    fetchStudents()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!selectedEventId) return
    setIsLoading(true)
    setCheckins([])
    setSearchQuery("")
    setSelectedGroupFilter("all")
    setSelectedYearFilter("all")

    const fetchInitialData = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/admin/check-in?event_id=${selectedEventId}`,
        )
        if (response.data.success) {
          const { checkins } = response.data.data
          setCheckins(checkins || [])

          // Populate staffCache from initial check-ins
          const cache: Record<string, string> = {}
          if (checkins) {
            checkins.forEach((c: any) => {
              if (c.staff_id && c.staff?.username) {
                cache[c.staff_id] = c.staff.username
              }
            })
          }
          setStaffCache(cache)
        }
      } catch (error) {
        console.error("Failed to fetch initial data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchInitialData()
  }, [selectedEventId])

  useEffect(() => {
    if (!selectedEventId) return
    setConnectionStatus("connecting")

    const supabase = createClient()

    const channel = supabase
      .channel(`admin-checkins-${selectedEventId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "checkin",
          filter: `event_id=eq.${selectedEventId}`,
        },
        async (payload) => {
          try {
            const checkin = payload.new as any
            if (!checkin) return

            // 1. Resolve student locally using our latest students ref
            const student =
              studentsRef.current.find((s) => s.token === checkin.token) || null

            // 2. Resolve staff username (check local cache first)
            let staffUsername = staffCacheRef.current[checkin.staff_id]
            let staffObj = staffUsername ? { username: staffUsername } : null

            if (!staffUsername && checkin.staff_id) {
              const { data: staff } = await supabase
                .from("staff")
                .select("username")
                .eq("id", checkin.staff_id)
                .single()

              if (staff?.username) {
                staffUsername = staff.username
                staffObj = { username: staff.username }
                // Update local staff cache
                setStaffCache((prev) => ({
                  ...prev,
                  [checkin.staff_id]: staff.username,
                }))
              }
            }

            const newCheckin: CheckIn = {
              created_at: checkin.created_at,
              token: checkin.token,
              event_id: checkin.event_id,
              staff_id: checkin.staff_id,
              student: student,
              staff: staffObj,
              isNew: true,
            }

            setCheckins((prev) => {
              if (
                prev.some(
                  (c) =>
                    c.token === newCheckin.token &&
                    c.event_id === newCheckin.event_id,
                )
              )
                return prev
              return [newCheckin, ...prev]
            })
          } catch (err) {
            console.error("Error processing real-time payload:", err)
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "checkin",
          filter: `event_id=eq.${selectedEventId}`,
        },
        async (payload) => {
          try {
            const oldCheckin = payload.old as any
            if (!oldCheckin || !oldCheckin.token) return

            setCheckins((prev) =>
              prev.filter((c) => c.token !== oldCheckin.token),
            )
          } catch (err) {
            console.error("Error processing real-time DELETE payload:", err)
          }
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setConnectionStatus("live")
          setLastPing(new Date())
        } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          setConnectionStatus("disconnected")
        }
      })

    // Setup an interval to update liveness based on the channel state
    const pingInterval = setInterval(() => {
      if (channel.state === "joined") {
        setLastPing(new Date())
        setConnectionStatus("live")
      }
    }, 15000)

    return () => {
      clearInterval(pingInterval)
      supabase.removeChannel(channel)
    }
  }, [selectedEventId])

  useEffect(() => {
    const hasNew = checkins.some((c) => c.isNew)
    if (!hasNew) return
    const timer = setTimeout(() => {
      setCheckins((prev) => prev.map((c) => ({ ...c, isNew: false })))
    }, 2000)
    return () => clearTimeout(timer)
  }, [checkins])

  const uniqueGroups = useMemo(() => {
    const groups = new Set<string>()
    let hasNoGroup = false
    students.forEach((s) => {
      if (s.group) {
        groups.add(s.group)
      } else {
        hasNoGroup = true
      }
    })
    populatedCheckins.forEach((c) => {
      if (c.student?.group) {
        groups.add(c.student.group)
      } else {
        hasNoGroup = true
      }
    })
    const sorted = Array.from(groups).sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
    )
    if (hasNoGroup) {
      sorted.push("ไม่มีกลุ่ม")
    }
    return sorted
  }, [students, populatedCheckins])

  const checkinsMap = useMemo(() => {
    const map = new Map<string, CheckIn>()
    populatedCheckins.forEach((c) => {
      if (c.token) {
        map.set(c.token, c)
      } else if (c.student?.student_id) {
        map.set(c.student.student_id, c)
      }
    })
    return map
  }, [populatedCheckins])

  const checkinTokens = useMemo(
    () => new Set(students.map((s) => s.token || "")),
    [students],
  )

  const unmatchedCheckins = useMemo(() => {
    return populatedCheckins
      .filter((c) => c.token && !checkinTokens.has(c.token))
      .map((c) => ({
        student: c.student || {
          student_id: "-",
          firstname: "Unknown",
          lastname: "Student",
          email: "-",
          group: null,
          token: c.token,
        },
        isCheckedIn: true,
        checkinTime: c.created_at,
        checkedInBy: c.staff?.username,
        isNewCheckIn: c.isNew || false,
      }))
  }, [populatedCheckins, checkinTokens])

  const allStudentsWithStatus = useMemo(() => {
    const matched = students.map((std) => {
      const checkin = std.token ? checkinsMap.get(std.token) : undefined
      return {
        student: std,
        isCheckedIn: !!checkin,
        checkinTime: checkin?.created_at,
        checkedInBy: checkin?.staff?.username,
        isNewCheckIn: checkin?.isNew || false,
      }
    })
    return [...matched, ...unmatchedCheckins]
  }, [students, checkinsMap, unmatchedCheckins])

  const filteredStudentsWithStatus = useMemo(() => {
    return allStudentsWithStatus.filter((item) => {
      const std = item.student
      const fullName =
        `${std.firstname || ""} ${std.lastname || ""}`.toLowerCase()
      const studentId = (std.student_id || "").toLowerCase()
      const query = searchQuery.toLowerCase()
      const token = (std.token || "").toLowerCase()

      const matchesSearch =
        !query ||
        fullName.includes(query) ||
        studentId.includes(query) ||
        token.includes(query)
      const matchesGroup =
        selectedGroupFilter === "all" ||
        (selectedGroupFilter === "ไม่มีกลุ่ม"
          ? !std.group
          : std.group === selectedGroupFilter)
      const matchesYear =
        selectedYearFilter === "all" || studentId.startsWith(selectedYearFilter)

      return matchesSearch && matchesGroup && matchesYear
    })
  }, [
    allStudentsWithStatus,
    searchQuery,
    selectedGroupFilter,
    selectedYearFilter,
  ])

  const displayList = useMemo(() => {
    if (statusFilter === "checked") {
      return filteredStudentsWithStatus
        .filter((item) => item.isCheckedIn)
        .sort((a, b) => {
          const timeA = a.checkinTime ? new Date(a.checkinTime).getTime() : 0
          const timeB = b.checkinTime ? new Date(b.checkinTime).getTime() : 0
          return timeB - timeA
        })
    } else if (statusFilter === "not_checked") {
      return filteredStudentsWithStatus
        .filter((item) => !item.isCheckedIn)
        .sort((a, b) =>
          a.student.student_id.localeCompare(b.student.student_id),
        )
    } else {
      return filteredStudentsWithStatus.sort((a, b) =>
        a.student.student_id.localeCompare(b.student.student_id),
      )
    }
  }, [filteredStudentsWithStatus, statusFilter])

  const selectedEventName = useMemo(
    () =>
      initialEvents.find((e) => e.id === selectedEventId)?.name ||
      "Select Event",
    [initialEvents, selectedEventId],
  )

  return (
    <div className="bg-[#F5F5F5] min-h-screen">
      <div className="flex flex-col min-h-screen px-6 py-8 max-w-4xl mx-auto">
        {/* ── Top Bar ────────────────────────────────────── */}
        <DashboardHeader
          username={user?.username}
          isLoggingOut={isLoggingOut}
          onLogout={handleLogout}
          onBack={() => router.push("/events")}
        />

        {/* ── Page Title ─────────────────────────────────── */}
        <div className="mb-6">
          <h1 className="text-[28px] sm:text-[32px] leading-tight text-black tracking-tight font-medium">
            Check-in dashboard.
          </h1>
          <p className="text-[13px] text-gray-400 mt-1 font-medium">
            Realtime monitoring
          </p>
        </div>

        {/* ── Event Selector + Connection ─────────────────── */}
        <EventSelector
          events={initialEvents}
          selectedEventId={selectedEventId}
          onEventSelect={setSelectedEventId}
          connectionStatus={connectionStatus}
          lastPing={lastPing}
        />

        {/* ── Stat Cards ─────────────────────────────────── */}
        <StatCards
          isLoading={isLoading}
          totalCheckins={totalCheckins}
          totalStudentsForYear={totalStudentsForYear}
          groupsCount={groupSummary.length}
        />

        {/* ── Group Breakdown ─────────────────────────────── */}
        <GroupBreakdown
          groupSummary={groupSummary}
          selectedGroupFilter={selectedGroupFilter}
          onGroupClick={handleGroupClick}
        />

        {/* ── Filter Controls ─────────────────────────────── */}
        <FilterControls
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedYearFilter={selectedYearFilter}
          setSelectedYearFilter={setSelectedYearFilter}
          selectedGroupFilter={selectedGroupFilter}
          setSelectedGroupFilter={setSelectedGroupFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          uniqueGroups={uniqueGroups}
          checkedCount={
            filteredStudentsWithStatus.filter((s) => s.isCheckedIn).length
          }
          notCheckedCount={
            filteredStudentsWithStatus.filter((s) => !s.isCheckedIn).length
          }
          totalCount={filteredStudentsWithStatus.length}
        />

        {/* ── Check-in List ───────────────────────────────── */}
        <StudentList
          displayList={displayList}
          isLoading={isLoading}
          selectedEventName={selectedEventName}
          searchQuery={searchQuery}
          selectedGroupFilter={selectedGroupFilter}
          selectedYearFilter={selectedYearFilter}
          statusFilter={statusFilter}
          onStudentAction={handleStudentAction}
          isAdmin={user?.role === "admin"}
        />
      </div>

      {/* Action Confirmation & Result Modal */}
      <CheckInActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        modalAction={modalAction}
        isProcessingAction={isProcessingAction}
        actionResult={actionResult}
        onConfirm={executeStudentAction}
      />
    </div>
  )
}
