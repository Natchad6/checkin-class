"use client"

import React from "react"
import { FiUsers } from "react-icons/fi"

export interface GroupSummary {
  group: string
  count: number
}

interface GroupBreakdownProps {
  groupSummary: GroupSummary[]
  selectedGroupFilter: string
  onGroupClick: (groupName: string) => void
}

export function GroupBreakdown({
  groupSummary,
  selectedGroupFilter,
  onGroupClick,
}: GroupBreakdownProps) {
  if (groupSummary.length === 0) return null

  return (
    <div className="bg-white rounded-[20px] shadow-sm px-5 py-3 mb-6">
      <div className="flex items-center gap-1.5 mb-2.5">
        <FiUsers className="text-[13px] text-gray-400" />
        <p className="text-[11px] font-bold tracking-[0.2em] text-gray-400 uppercase">
          By Group
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {groupSummary.map((group) => {
          const isSelected = selectedGroupFilter === group.group
          return (
            <button
              key={group.group}
              onClick={() => onGroupClick(group.group)}
              className={`rounded-xl px-3 py-1 flex items-center gap-2 border transition-all cursor-pointer ${
                isSelected
                  ? "bg-black border-black text-white"
                  : "bg-[#F5F5F5] border-gray-100 text-black hover:bg-gray-200/50"
              }`}
            >
              <span className="text-[12px] font-semibold">
                Group {group.group}
              </span>
              <span
                className={`text-[11px] font-bold px-1.5 py-0.5 rounded-lg shadow-sm ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-white text-gray-400"
                }`}
              >
                {group.count}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
