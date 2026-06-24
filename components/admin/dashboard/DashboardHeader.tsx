"use client"

import React from "react"
import { FiChevronLeft, FiLogOut } from "react-icons/fi"
import { Spinner } from "@heroui/react"

interface DashboardHeaderProps {
  username?: string | null
  isLoggingOut: boolean
  onLogout: () => void
  onBack: () => void
}

export function DashboardHeader({
  username,
  isLoggingOut,
  onLogout,
  onBack,
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8 mt-2">
      <button
        onClick={onBack}
        className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
        aria-label="Back to events"
      >
        <FiChevronLeft className="text-lg text-black" />
      </button>

      <div className="flex items-center gap-3">
        {username && (
          <span className="text-[13px] font-semibold text-black bg-white px-3 py-1.5 rounded-full shadow-sm">
            {username}
          </span>
        )}
        <button
          onClick={onLogout}
          disabled={isLoggingOut}
          className="w-9 h-9 bg-white cursor-pointer rounded-full flex items-center justify-center shadow-sm hover:text-red-500 transition-colors text-gray-600"
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
  )
}
