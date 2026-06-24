import React from "react"
import { EventService } from "@/app/api/events/service"
import EventList from "@/components/events/EventList"

export const dynamic = "force-dynamic"

export default async function SelectEventPage() {
  const events = await EventService.getEvents()

  return <EventList initialEvents={events} />
}
