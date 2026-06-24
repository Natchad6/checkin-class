import React from "react"
import { supabaseService } from "@/lib/supabase/service"
import AdminDashboard from "@/components/admin/Dashboard"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const { data: events } = await supabaseService
    .from("event")
    .select("id, name, event_date, event_end, created_at")
    .order("event_date", { ascending: false })

  return <AdminDashboard initialEvents={events || []} />
}
