"use client"

import React from "react"
import { FiSearch } from "react-icons/fi"
import { Tabs, Autocomplete, ListBox, useFilter } from "@heroui/react"

interface FilterControlsProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedYearFilter: string
  setSelectedYearFilter: (year: string) => void
  selectedGroupFilter: string
  setSelectedGroupFilter: (group: string) => void
  statusFilter: "all" | "checked" | "not_checked"
  setStatusFilter: (status: "all" | "checked" | "not_checked") => void
  uniqueGroups: string[]
  checkedCount: number
  notCheckedCount: number
  totalCount: number
}

export function FilterControls({
  searchQuery,
  setSearchQuery,
  selectedYearFilter,
  setSelectedYearFilter,
  selectedGroupFilter,
  setSelectedGroupFilter,
  statusFilter,
  setStatusFilter,
  uniqueGroups,
  checkedCount,
  notCheckedCount,
  totalCount,
}: FilterControlsProps) {
  const { contains } = useFilter({ sensitivity: "base" })

  return (
    <>
      {/* ── Status Tabs ─────────────────────────────────── */}
      <div className="mb-4">
        <Tabs
          selectedKey={statusFilter}
          onSelectionChange={(key) => setStatusFilter(key as any)}
          className="w-full max-w-md"
        >
          <Tabs.ListContainer className="bg-gray-200/50 rounded-xl">
            <Tabs.List
              aria-label="Status Filter"
              className="flex w-full justify-between items-center bg-transparent gap-1 border-0"
            >
              <Tabs.Tab
                id="checked"
                className="flex-1 py-1.5 text-xs font-semibold rounded-lg text-center cursor-pointer data-[selected=true]:text-black text-gray-500 hover:text-black transition-all flex items-center justify-center"
              >
                เช็คอินแล้ว ({checkedCount})
                <Tabs.Indicator className="bg-white rounded-lg shadow-sm" />
              </Tabs.Tab>
              <Tabs.Tab
                id="not_checked"
                className="flex-1 py-1.5 text-xs font-semibold rounded-lg text-center cursor-pointer data-[selected=true]:text-black text-gray-500 hover:text-black transition-all flex items-center justify-center"
              >
                ยังไม่เช็คอิน ({notCheckedCount})
                <Tabs.Indicator className="bg-white rounded-lg shadow-sm" />
              </Tabs.Tab>
              <Tabs.Tab
                id="all"
                className="flex-1 py-1.5 text-xs font-semibold rounded-lg text-center cursor-pointer data-[selected=true]:text-black text-gray-500 hover:text-black transition-all flex items-center justify-center"
              >
                ทั้งหมด ({totalCount})
                <Tabs.Indicator className="bg-white rounded-lg shadow-sm" />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>
      </div>

      {/* ── Search & Filter ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[14px]" />
          <input
            type="text"
            placeholder="Search name, student ID, or token..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white rounded-[16px] shadow-sm pl-10 pr-4 py-3 text-[13px] text-black placeholder:text-gray-400 outline-none"
          />
        </div>

        <div className="flex gap-2">
          {/* Year Filter */}
          <Autocomplete
            aria-label="Filter year"
            className="min-w-[130px]"
            selectionMode="single"
            value={selectedYearFilter}
            onChange={(key) => {
              if (key !== undefined && key !== null) {
                setSelectedYearFilter(String(key))
              }
            }}
          >
            <Autocomplete.Trigger className="bg-white rounded-[16px] shadow-sm px-4 py-3 text-[13px] font-semibold text-black outline-none cursor-pointer flex items-center justify-between gap-2 border-none">
              <Autocomplete.Value className="text-black text-[13px] font-semibold text-left">
                {selectedYearFilter === "all"
                  ? "All years"
                  : selectedYearFilter === "66"
                    ? "66 - ปี 4"
                    : selectedYearFilter === "67"
                      ? "67 - ปี 3"
                      : selectedYearFilter === "68"
                        ? "68 - ปี 2"
                        : selectedYearFilter === "69"
                          ? "69 - ปี 1"
                          : selectedYearFilter}
              </Autocomplete.Value>
              <Autocomplete.Indicator className="text-gray-400 text-[12px]" />
            </Autocomplete.Trigger>
            <Autocomplete.Popover className="w-[150px] bg-white border border-gray-100 rounded-xl shadow-lg">
              <Autocomplete.Filter filter={contains}>
                <ListBox
                  aria-label="Years list"
                  className="p-1 max-h-[200px] overflow-y-auto"
                >
                  <ListBox.Item
                    key="all"
                    id="all"
                    textValue="All years"
                    className="px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer flex items-center justify-between"
                  >
                    <span>All years</span>
                    <ListBox.ItemIndicator className="text-black ml-2" />
                  </ListBox.Item>
                  <ListBox.Item
                    key="66"
                    id="66"
                    textValue="66 - ปี 4"
                    className="px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer flex items-center justify-between"
                  >
                    <span>66 - ปี 4</span>
                    <ListBox.ItemIndicator className="text-black ml-2" />
                  </ListBox.Item>
                  <ListBox.Item
                    key="67"
                    id="67"
                    textValue="67 - ปี 3"
                    className="px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer flex items-center justify-between"
                  >
                    <span>67 - ปี 3</span>
                    <ListBox.ItemIndicator className="text-black ml-2" />
                  </ListBox.Item>
                  <ListBox.Item
                    key="68"
                    id="68"
                    textValue="68 - ปี 2"
                    className="px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer flex items-center justify-between"
                  >
                    <span>68 - ปี 2</span>
                    <ListBox.ItemIndicator className="text-black ml-2" />
                  </ListBox.Item>
                  <ListBox.Item
                    key="69"
                    id="69"
                    textValue="69 - ปี 1"
                    className="px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer flex items-center justify-between"
                  >
                    <span>69 - ปี 1</span>
                    <ListBox.ItemIndicator className="text-black ml-2" />
                  </ListBox.Item>
                </ListBox>
              </Autocomplete.Filter>
            </Autocomplete.Popover>
          </Autocomplete>

          {/* Group Filter */}
          {uniqueGroups.length > 0 && (
            <Autocomplete
              aria-label="Filter group"
              className="min-w-[130px]"
              selectionMode="single"
              value={selectedGroupFilter}
              onChange={(key) => {
                if (key !== undefined && key !== null) {
                  setSelectedGroupFilter(String(key))
                }
              }}
            >
              <Autocomplete.Trigger className="bg-white rounded-[16px] shadow-sm px-4 py-3 text-[13px] font-semibold text-black outline-none cursor-pointer flex items-center justify-between gap-2 border-none">
                <Autocomplete.Value className="text-black text-[13px] font-semibold text-left">
                  {selectedGroupFilter === "all"
                    ? "All groups"
                    : selectedGroupFilter === "ไม่มีกลุ่ม"
                      ? "ไม่มีกลุ่ม"
                      : `Group ${selectedGroupFilter}`}
                </Autocomplete.Value>
                <Autocomplete.Indicator className="text-gray-400 text-[12px]" />
              </Autocomplete.Trigger>
              <Autocomplete.Popover className="w-[150px] bg-white border border-gray-100 rounded-xl shadow-lg">
                <Autocomplete.Filter filter={contains}>
                  <ListBox
                    aria-label="Groups list"
                    className="p-1 max-h-[200px] overflow-y-auto"
                  >
                    <ListBox.Item
                      key="all"
                      id="all"
                      textValue="All groups"
                      className="px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer flex items-center justify-between"
                    >
                      <span>All groups</span>
                      <ListBox.ItemIndicator className="text-black ml-2" />
                    </ListBox.Item>
                    {uniqueGroups.map((g) => (
                      <ListBox.Item
                        key={g}
                        id={g}
                        textValue={g === "ไม่มีกลุ่ม" ? "ไม่มีกลุ่ม" : `Group ${g}`}
                        className="px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer flex items-center justify-between"
                      >
                        <span>
                          {g === "ไม่มีกลุ่ม" ? "ไม่มีกลุ่ม" : `Group ${g}`}
                        </span>
                        <ListBox.ItemIndicator className="text-black ml-2" />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Autocomplete.Filter>
              </Autocomplete.Popover>
            </Autocomplete>
          )}
        </div>
      </div>
    </>
  )
}
