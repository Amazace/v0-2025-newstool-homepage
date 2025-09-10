"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import type { UserProfile } from "@/lib/types/auth"

export type UserRole = "Admin" | "Editor" | "Reporter"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  profile?: UserProfile
}

interface AuthContextType {
  user: User | null
  login: (displayName: string, password: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  isLoggedIn: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchUserProfile = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", supabaseUser.id).single()

      if (error) {
        console.error("Error fetching user profile:", error)
        return null
      }

      return {
        id: supabaseUser.id,
        email: supabaseUser.email || "",
        name: profile.full_name,
        role: profile.role as UserRole,
        profile,
      }
    } catch (error) {
      console.error("Error in fetchUserProfile:", error)
      return null
    }
  }

  const login = async (displayName: string, password: string): Promise<{ error?: string }> => {
    try {
      setIsLoading(true)
      console.log("[v0] Login attempt with displayName:", displayName)

      // 先通過 full_name 查找對應的 email
      console.log("[v0] Searching for user profile with full_name:", displayName)
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("email, full_name, role")
        .eq("full_name", displayName)
        .single()

      console.log("[v0] Profile search result:", { profiles, profileError })

      if (profileError || !profiles) {
        console.log("[v0] Profile not found, error:", profileError)
        return { error: "找不到該使用者名稱" }
      }

      const email = profiles.email
      console.log("[v0] Found email for user:", email)

      console.log("[v0] Attempting Supabase auth with email:", email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("[v0] Supabase auth result:", { data: !!data.user, error })

      if (error) {
        console.log("[v0] Auth error:", error.message)
        return { error: "使用者名稱或密碼錯誤" }
      }

      if (data.user) {
        console.log("[v0] Auth successful, fetching user profile")
        const userProfile = await fetchUserProfile(data.user)
        console.log("[v0] User profile fetched:", userProfile)
        setUser(userProfile)
      }

      return {}
    } catch (error) {
      console.log("[v0] Login catch error:", error)
      return { error: error instanceof Error ? error.message : "登入時發生錯誤" }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true)
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error("Error during logout:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          const userProfile = await fetchUserProfile(session.user)
          setUser(userProfile)
        }
      } catch (error) {
        console.error("Error getting initial session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[v0] Auth state changed:", event)

      if (event === "SIGNED_IN" && session?.user) {
        const userProfile = await fetchUserProfile(session.user)
        setUser(userProfile)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        // Token 自動刷新時更新使用者資料
        const userProfile = await fetchUserProfile(session.user)
        setUser(userProfile)
      }

      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const isLoggedIn = user !== null

  return <AuthContext.Provider value={{ user, login, logout, isLoggedIn, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
