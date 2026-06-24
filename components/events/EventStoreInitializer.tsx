"use client"

import { useEffect, useRef } from "react"
import { useEventStore } from "@/store/event-store"

interface EventStoreInitializerProps {
  eventName: string
}

export default function EventStoreInitializer({
  eventName,
}: EventStoreInitializerProps) {
  const initialized = useRef(false)

  if (!initialized.current) {
    useEventStore.setState({ eventName })
    initialized.current = true
  }

  useEffect(() => {
    useEventStore.setState({ eventName })
  }, [eventName])

  return null
}
