"use client"

import React from "react"
import { FiWifi, FiWifiOff } from "react-icons/fi"
import { Autocomplete, ListBox, SearchField, useFilter } from "@heroui/react"

export interface AppEvent {
  id: string
  name: string
  event_date: string | null
  event_end: string | null
  created_at: string
}

interface EventSelectorProps {
  events: AppEvent[]
  selectedEventId: string
  onEventSelect: (id: string) => void
  connectionStatus: "connecting" | "live" | "disconnected"
  lastPing: Date | null
}

export function EventSelector({
  events,
  selectedEventId,
  onEventSelect,
  connectionStatus,
  lastPing,
}: EventSelectorProps) {
  const { contains } = useFilter({ sensitivity: "base" })

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      {/* Event Select */}
      <div className="flex-1 bg-white rounded-[20px] shadow-sm px-4 py-3 flex items-center gap-3">
        <span className="text-[11px] font-bold tracking-[0.2em] text-gray-400 uppercase whitespace-nowrap">
          EVENT
        </span>
        <Autocomplete
          aria-label="Select event"
          className="flex-1"
          selectionMode="single"
          value={selectedEventId || null}
          onChange={(key) => {
            if (key) {
              onEventSelect(String(key))
            }
          }}
        >
          <Autocomplete.Trigger className="flex-1 flex items-center justify-between gap-1 outline-none border-none shadow-none cursor-pointer bg-transparent p-0">
            <Autocomplete.Value className="text-black text-[14px] font-semibold text-left" />
            <Autocomplete.Indicator className="text-gray-400 text-[14px]" />
          </Autocomplete.Trigger>
          <Autocomplete.Popover className="w-[300px] bg-white border border-gray-100 rounded-xl shadow-lg">
            <Autocomplete.Filter filter={contains}>
              <SearchField
                autoFocus
                name="search"
                aria-label="Search events"
                className="p-2 border-b border-gray-100"
              >
                <SearchField.Group className="bg-gray-50 border-0 rounded-lg p-1.5 flex items-center gap-2">
                  <SearchField.SearchIcon className="text-gray-400 text-sm" />
                  <SearchField.Input
                    placeholder="Search event..."
                    className="text-xs bg-transparent outline-none text-black w-full"
                  />
                  <SearchField.ClearButton className="text-gray-400 text-xs" />
                </SearchField.Group>
              </SearchField>
              <ListBox
                aria-label="Events list"
                className="p-1 max-h-[250px] overflow-y-auto"
              >
                {events.length === 0 ? (
                  <ListBox.Item
                    id=""
                    textValue="No events"
                    className="px-3 py-2 text-xs text-gray-400"
                  >
                    No events
                  </ListBox.Item>
                ) : (
                  events.map((event) => (
                    <ListBox.Item
                      key={event.id}
                      id={event.id}
                      textValue={event.name}
                      className="px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer flex items-center justify-between"
                    >
                      <span>{event.name}</span>
                      <ListBox.ItemIndicator className="text-black ml-2" />
                    </ListBox.Item>
                  ))
                )}
              </ListBox>
            </Autocomplete.Filter>
          </Autocomplete.Popover>
        </Autocomplete>
      </div>

      {/* Connection Status */}
      <div className="bg-white rounded-[20px] shadow-sm px-4 py-3 flex items-center gap-2.5 min-w-[160px]">
        <span className="relative flex h-2.5 w-2.5">
          {connectionStatus === "live" && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-30" />
          )}
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              connectionStatus === "live"
                ? "bg-black"
                : connectionStatus === "connecting"
                  ? "bg-gray-400 animate-pulse"
                  : "bg-gray-300"
            }`}
          />
        </span>
        {connectionStatus === "live" ? (
          <FiWifi className="text-[13px] text-black" />
        ) : (
          <FiWifiOff className="text-[13px] text-gray-400" />
        )}
        <span className="text-[12px] font-semibold text-black">
          {connectionStatus === "live"
            ? "Live"
            : connectionStatus === "connecting"
              ? "Connecting..."
              : "Offline"}
        </span>
        {lastPing && connectionStatus === "live" && (
          <span className="text-[10px] text-gray-400 ml-auto">
            {lastPing.toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  )
}
