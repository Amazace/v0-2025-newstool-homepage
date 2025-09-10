import { createClient } from "@/lib/supabase/client"
import type { Lead } from "@/lib/types/database"

export async function getLeads(): Promise<Lead[]> {
  const supabase = createClient()

  const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching leads:", error)
    throw error
  }

  return data || []
}

export async function createLead(lead: Omit<Lead, "id" | "created_at" | "updated_at" | "created_by">): Promise<Lead> {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  const { data, error } = await supabase
    .from("leads")
    .insert({
      ...lead,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating lead:", error)
    throw error
  }

  return data
}

export async function updateLead(
  id: string,
  updates: Partial<Omit<Lead, "id" | "created_at" | "updated_at" | "created_by">>,
): Promise<Lead> {
  const supabase = createClient()

  const { data, error } = await supabase.from("leads").update(updates).eq("id", id).select().single()

  if (error) {
    console.error("Error updating lead:", error)
    throw error
  }

  return data
}

export async function deleteLead(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from("leads").delete().eq("id", id)

  if (error) {
    console.error("Error deleting lead:", error)
    throw error
  }
}
