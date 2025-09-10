import { createClient } from "@/lib/supabase/client"
import type { Event } from "@/lib/types/database"

export async function getEvents(): Promise<Event[]> {
  const supabase = createClient()

  const { data, error } = await supabase.from("events").select("*").order("start", { ascending: true })

  if (error) {
    console.error("Error fetching events:", error)
    throw error
  }

  return data || []
}

export async function createEvent(
  event: Omit<Event, "id" | "created_at" | "updated_at" | "created_by">,
): Promise<Event> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  const { data, error } = await supabase
    .from("events")
    .insert({
      ...event,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating event:", error)
    throw error
  }

  return data
}

export async function updateEvent(
  id: string,
  updates: Partial<Omit<Event, "id" | "created_at" | "updated_at" | "created_by">>,
): Promise<Event> {
  const supabase = createClient()

  const { data, error } = await supabase.from("events").update(updates).eq("id", id).select().single()

  if (error) {
    console.error("Error updating event:", error)
    throw error
  }

  return data
}

export async function deleteEvent(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from("events").delete().eq("id", id)

  if (error) {
    console.error("Error deleting event:", error)
    throw error
  }
}
