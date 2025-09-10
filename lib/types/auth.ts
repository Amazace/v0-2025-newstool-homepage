export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: "Admin" | "Editor" | "Reporter"
  sports_section?: string
  knowledge_section?: string
  password_code: string
  created_at: string
  updated_at: string
}

export interface AuthUser {
  id: string
  email: string
  profile?: UserProfile
}
