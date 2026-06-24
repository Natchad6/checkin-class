"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { FiChevronLeft } from "react-icons/fi"
import { Button, InputOTP, Spinner } from "@heroui/react"
import axios from "axios"
import axiosInstance from "@/lib/axiosInstance"
import Link from "next/link"
import { useEventStore } from "@/store/event-store"

export default function EnterTokenPage() {
  const params = useParams()
  const event_id = params.event_id as string

  const [token, setToken] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { eventName } = useEventStore()
  const [status, setStatus] = useState<
    "idle" | "success" | "error" | "already_checked_in"
  >("idle")
  const [studentData, setStudentData] = useState<{
    firstname: string | null
    lastname: string | null
    email: string
    student_id: string
  } | null>(null)
  const [errorMessage, setErrorMessage] = useState("")

  const handleCheckIn = async () => {
    if (token.length !== 4) return

    setIsLoading(true)
    setStatus("idle")
    setErrorMessage("")

    try {
      const response = await axiosInstance.post("/api/check-in", {
        token,
        event_id,
      })

      if (response.data.success) {
        const { alreadyCheckedIn, student } = response.data.data
        setStudentData(student)
        setToken("")

        if (alreadyCheckedIn) {
          setStatus("already_checked_in")
        } else {
          setStatus("success")
        }
      }
    } catch (error) {
      setStatus("error")
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        setErrorMessage(error.response.data.error.message)
      } else {
        setErrorMessage("เกิดข้อผิดพลาดในการเช็คอิน")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleTokenChange = (val: string) => {
    setToken(val)
    if (status !== "idle") {
      setStatus("idle")
      setStudentData(null)
      setErrorMessage("")
    }
  }

  const isComplete = token.length === 4

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="flex flex-col min-h-screen px-7 pt-10 pb-10 max-w-md mx-auto">
        <div className="flex items-center mb-10">
          <Link
            href={`/events/${event_id}/scan`}
            className=" w-fit px-4 py-2 h-10 rounded-full bg-white flex items-center justify-center shadow-sm hover:shadow-md transition-all"
          >
            <FiChevronLeft className="text-xl text-black" />
            Back to Scan
          </Link>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="mb-8">
            <p className="text-[11px] font-bold text-black/30 uppercase tracking-wider mb-2">
              Event: {eventName || "Loading..."}
            </p>
            <h1 className="text-[28px] leading-tight text-black tracking-tight">
              <span className="font-medium">Enter the student's</span>
              <br />
              <span className="font-light">token.</span>
            </h1>
          </div>

          <div className="w-full mb-10">
            <InputOTP
              maxLength={4}
              value={token}
              onChange={handleTokenChange}
              className="gap-3.5"
              inputMode="text"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
            >
              <InputOTP.Group className="gap-3.5 w-full justify-between">
                {[0, 1, 2, 3].map((index) => (
                  <InputOTP.Slot
                    key={index}
                    index={index}
                    className="w-[72px] h-[72px]  font-bold leading-none rounded-2xl bg-white border-none shadow-[0_4px_12px_rgba(0,0,0,0.03)] ring-1 ring-black/3"
                  />
                ))}
              </InputOTP.Group>
            </InputOTP>
          </div>

          {/* Feedback Message Area */}
          <div className="min-h-[100px] flex flex-col items-center justify-start pt-2 text-center">
            {status === "success" && studentData && (
              <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 bg-green-50/50 px-6 py-4 rounded-2xl border border-green-100">
                <p className="text-green-600 font-bold text-lg">
                  Check-in สำเร็จ!
                </p>
                <p className="text-black text-md mt-0.5">
                  ยินดีต้อนรับคุณ{" "}
                  <span className="font-bold">
                    {studentData.firstname} {studentData.lastname}
                  </span>
                </p>
                <p className="text-black/50 text-sm mt-0.5 font-medium">
                  รหัสนิสิต: {studentData.student_id}
                </p>
              </div>
            )}

            {status === "already_checked_in" && studentData && (
              <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 bg-amber-50/50 px-6 py-4 rounded-2xl border border-amber-100">
                <p className="text-amber-600 font-bold text-lg">
                  เช็คอินไปแล้ว
                </p>
                <p className="text-black text-md mt-0.5">
                  คุณ{" "}
                  <span className="font-bold">
                    {studentData.firstname} {studentData.lastname}
                  </span>{" "}
                  ได้เข้าร่วมกิจกรรมแล้ว
                </p>
                <p className="text-black/50 text-sm mt-0.5 font-medium">
                  รหัสนิสิต: {studentData.student_id}
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="w-full px-5 py-3 bg-red-50 rounded-xl animate-in fade-in zoom-in-95 duration-300 border border-red-100">
                <p className="text-red-500 text-sm font-semibold">
                  {errorMessage}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-auto">
          <Button
            onPress={handleCheckIn}
            isDisabled={!isComplete || isLoading}
            isPending={isLoading}
            className={`w-full h-[60px] rounded-full text-[16px] font-bold transition-all duration-500 ${
              isComplete
                ? "bg-black text-white shadow-lg shadow-black/20"
                : "bg-[#F3F4F6] text-[#D1D5DB] cursor-not-allowed"
            }`}
          >
            {({ isPending }) => (
              <>
                {isPending ? <Spinner color="current" size="sm" /> : null}
                Check-in
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
