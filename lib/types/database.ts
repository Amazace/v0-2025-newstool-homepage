export interface Lead {
  id: string
  title: string
  status: "not_pre_collected" | "accepted" | "rejected" | "waiting_reply" | "welfare_lead" | "special_situation"
  reporter: string
  issue_number: number
  section: "knowledge" | "sports"
  created_at: string
  updated_at: string
  created_by: string
  links: string[]
}

export interface Event {
  id: string
  title: string
  start: string
  end: string
  location?: string
  note?: string
  created_at: string
  updated_at: string
  created_by: string
  reporter: string
}

export type LeadStatus = Lead["status"]
export type Section = Lead["section"]
export type Reporter = "孟祥宇" | "江虹" | "陳筱雯" | "方凱琪" | "呂詠倢" | "林婷妤" | "黃易麒" | "林家慶"
