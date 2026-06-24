import React from "react"
import { redirect } from "next/navigation"
import { EventService } from "@/app/api/events/service"
import EventStoreInitializer from "@/components/events/EventStoreInitializer"

interface EventLayoutProps {
  children: React.ReactNode
  params: Promise<{ event_id: string }>
}

export default async function EventDetailLayout({
  children,
  params,
}: EventLayoutProps) {
  const { event_id } = await params

  let event
  try {
    event = await EventService.getEventById(event_id)
  } catch (error) {
    redirect("/events")
  }

  return (
    <>
      <EventStoreInitializer eventName={event.name} />
      {children}
    </>
  )
}
