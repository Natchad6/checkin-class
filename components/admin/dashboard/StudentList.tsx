"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import { Spinner } from "@heroui/react"
import { StudentRow, StudentWithStatus, Student } from "./StudentRow"

interface StudentListProps {
  displayList: StudentWithStatus[]
  isLoading: boolean
  selectedEventName: string
  searchQuery: string
  selectedGroupFilter: string
  selectedYearFilter: string
  statusFilter: string
  onStudentAction?: (student: Student, isCancel: boolean) => void
  isAdmin?: boolean
}

export function StudentList({
  displayList,
  isLoading,
  selectedEventName,
  searchQuery,
  selectedGroupFilter,
  selectedYearFilter,
  statusFilter,
  onStudentAction,
  isAdmin,
}: StudentListProps) {
  const [displayLimit, setDisplayLimit] = useState(50)

  // Reset display limit when any filter changes
  useEffect(() => {
    setDisplayLimit(50)
  }, [searchQuery, selectedGroupFilter, selectedYearFilter, statusFilter])

  // Get only the currently visible portion of the filtered list
  const visibleList = useMemo(() => {
    return displayList.slice(0, displayLimit)
  }, [displayList, displayLimit])

  // Intersection observer ref for infinite scroll
  const observerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (displayLimit >= displayList.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setDisplayLimit((prev) => Math.min(prev + 50, displayList.length))
        }
      },
      {
        rootMargin: "200px", // load more before reaching bottom
      }
    )

    const currentRef = observerRef.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [displayList.length, displayLimit])

  return (
    <div className="flex-1">
      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-bold tracking-[0.2em] text-gray-400 uppercase">
          {selectedEventName}
        </p>
        <span className="text-[11px] text-gray-400 font-medium">
          {displayList.length} shown
        </span>
      </div>

      <div className="space-y-2.5">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Spinner size="lg" color="current" />
              <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
                Loading...
              </p>
            </div>
          </div>
        ) : displayList.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white rounded-[20px] border border-dashed border-gray-200">
            <p className="text-gray-400 text-sm">
              {searchQuery ||
              selectedGroupFilter !== "all" ||
              selectedYearFilter !== "all"
                ? "ไม่พบผลการค้นหา"
                : statusFilter === "checked"
                  ? "ยังไม่มีข้อมูลการเช็คอิน"
                  : statusFilter === "not_checked"
                    ? "เช็คอินครบทุกคนแล้ว! 🎉"
                    : "ไม่มีข้อมูลนิสิต"}
            </p>
          </div>
        ) : (
          <>
            {visibleList.map((item) => (
              <StudentRow
                key={`${item.student.token || item.student.student_id}-${item.checkinTime || "not-checked"}`}
                item={item}
                onAction={onStudentAction}
                isAdmin={isAdmin}
              />
            ))}

            {/* Infinite Scroll Trigger */}
            {displayLimit < displayList.length && (
              <div ref={observerRef} className="flex justify-center py-4">
                <Spinner size="sm" color="current" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
