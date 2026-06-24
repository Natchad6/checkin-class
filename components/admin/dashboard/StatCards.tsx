"use client"

import React from "react"
import { Spinner } from "@heroui/react"

interface StatCardsProps {
  isLoading: boolean
  totalCheckins: number
  totalStudentsForYear: number
  groupsCount: number
}

export function StatCards({
  isLoading,
  totalCheckins,
  totalStudentsForYear,
  groupsCount,
}: StatCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      <div className="bg-white rounded-[20px] shadow-sm px-5 py-4">
        <p className="text-[11px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-1">
          Total
        </p>
        <div className="flex items-end gap-2">
          {isLoading ? (
            <Spinner size="sm" color="current" />
          ) : (
            <span className="text-[32px] font-semibold text-black leading-none">
              {totalCheckins}
              {totalStudentsForYear > 0 && (
                <span className="text-[18px] text-gray-400 font-normal">
                  {" "}
                  / {totalStudentsForYear}
                </span>
              )}
            </span>
          )}
          <span className="text-[13px] text-gray-400 mb-0.5">
            check-ins
          </span>
        </div>
      </div>

      <div className="bg-white rounded-[20px] shadow-sm px-5 py-4">
        <p className="text-[11px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-1">
          Groups
        </p>
        <div className="flex items-end gap-2">
          {isLoading ? (
            <Spinner size="sm" color="current" />
          ) : (
            <span className="text-[32px] font-semibold text-black leading-none">
              {groupsCount}
            </span>
          )}
          <span className="text-[13px] text-gray-400 mb-0.5">active</span>
        </div>
      </div>
    </div>
  )
}
