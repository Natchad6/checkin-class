"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { FiChevronLeft, FiArrowRight, FiLogOut } from "react-icons/fi"
import { HiOutlineSquares2X2 } from "react-icons/hi2"
import { Button, Spinner } from "@heroui/react"
import axiosInstance from "@/lib/axiosInstance"
import { useAuthStore } from "@/store/auth-store"
import { formatEventPeriod } from "@/lib/formatDate"

interface AppEvent {
  id: string
  name: string
  event_date: string | null
  event_end: string | null
  created_at: string
}

interface EventListProps {
  initialEvents: AppEvent[]
}

export default function EventList({ initialEvents }: EventListProps) {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

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
  const [selectedEventId, setSelectedEventId] = useState<string | null>(() => {
    return initialEvents.length > 0 ? initialEvents[0].id : null
  })

  return (
    <div className="bg-[#F5F5F5]">
      <div className="flex flex-col min-h-screen px-6 py-8 relative max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8 mt-2 relative">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors z-10"
          >
            <FiChevronLeft className="text-lg text-black" />
          </button>

          <div className="flex items-center gap-3">
            {user?.role === "admin" && (
              <button
                onClick={() => router.push("/admin/dashboard")}
                className="text-[13px] text-black font-semibold bg-white px-3 py-1.5 cursor-pointer rounded-full flex items-center justify-center shadow-sm hover:text-black transition-colors z-10"
              >
                <HiOutlineSquares2X2 className="size-4 mr-1 stroke-2" />
                Dashboard
              </button>
            )}
            {user?.username && (
              <span className="text-[13px] font-semibold text-black bg-white px-3 py-1.5 rounded-full shadow-sm">
                {user.username}
              </span>
            )}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-9 h-9 bg-white cursor-pointer rounded-full flex items-center justify-center shadow-sm  hover:text-red-500 transition-colors z-10 text-gray-600"
              title="Logout"
            >
              {isLoggingOut ? (
                <Spinner size="sm" color="current" />
              ) : (
                <FiLogOut className="text-lg" />
              )}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-[28px] sm:text-[32px] leading-tight text-black tracking-tight font-medium">
              Select an event.
            </h1>
          </div>

          <div className="space-y-3">
            {initialEvents.length === 0 ? (
              <div className="text-center py-12 px-4 bg-white rounded-[20px] border border-dashed border-gray-200">
                <p className="text-gray-400 text-sm">
                  ไม่พบกิจกรรมที่กำลังดำเนินอยู่
                </p>
              </div>
            ) : (
              initialEvents.map((event, index) => {
                const dateToUse = event.event_date || event.created_at
                const isSelected = selectedEventId === event.id
                const numStr = (index + 1).toString().padStart(2, "0")

                return (
                  <div
                    key={event.id}
                    onClick={() => setSelectedEventId(event.id)}
                    className="flex items-center p-2.5 rounded-[20px] bg-white transition-all border shadow-sm cursor-pointer border-transparent hover:border-gray-100"
                  >
                    {/* Number Box */}
                    <div
                      className={`w-[44px] h-[44px] flex items-center justify-center rounded-[14px] text-[13px] font-medium transition-colors ${
                        isSelected
                          ? "bg-[#1A1A1A] text-white"
                          : "border-[1.5px] border-gray-200 text-gray-400 bg-transparent"
                      }`}
                    >
                      {numStr}
                    </div>

                    {/* Text Content */}
                    <div className="ml-3 flex-1">
                      <h3 className="text-black font-semibold text-[14px] mb-0.5">
                        {event.name}
                      </h3>
                      <div className="flex flex-col">
                        <p className="text-gray-400 text-[11px] font-medium">
                          {formatEventPeriod(dateToUse, event.event_end)}
                        </p>
                      </div>
                    </div>

                    {/* Radio Circle */}
                    <div className="mr-3 ml-2 flex items-center justify-center">
                      <div
                        className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center transition-colors ${
                          isSelected ? "border-black" : "border-gray-200"
                        }`}
                      >
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-black"></div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Bottom Button */}
        <div className="mt-auto pt-6 pb-4">
          <Button
            onPress={() => {
              if (selectedEventId) {
                router.push(`/events/${selectedEventId}/scan`)
              }
            }}
            className="w-full h-[54px] rounded-[27px] text-[12px] font-bold tracking-widest transition-colors flex items-center justify-center gap-2 bg-[#1A1A1A] text-white"
            isDisabled={!selectedEventId || initialEvents.length === 0}
          >
            START SCANNING <FiArrowRight className="text-lg" />
          </Button>
        </div>
      </div>
    </div>
  )
}
