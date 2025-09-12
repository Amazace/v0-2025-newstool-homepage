"use client"

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react"
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

  const fetchingProfile = useRef(false)
  const currentUserId = useRef<string | null>(null)

  const fetchUserProfile = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    if (fetchingProfile.current && currentUserId.current === supabaseUser.id) {
      return null
    }

    try {
      fetchingProfile.current = true
      currentUserId.current = supabaseUser.id

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
    } finally {
      fetchingProfile.current = false
    }
  }

  const login = async (displayName: string, password: string): Promise<{ error?: string }> => {
    try {
      setIsLoading(true)

      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("email")
        .eq("full_name", displayName)
        .single()

      if (profileError || !profiles) {
        return { error: "找不到該使用者名稱" }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: profiles.email,
        password,
      })

      if (error) {
        return { error: "使用者名稱或密碼錯誤" }
      }

      return {}
    } catch (error) {
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
      currentUserId.current = null
    } catch (error) {
      console.error("Error during logout:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user && mounted) {
          const userProfile = await fetchUserProfile(session.user)
          if (userProfile && mounted) {
            setUser(userProfile)
          }
        }
      } catch (error) {
        console.error("Error getting initial session:", error)
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    getInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      if (event === "SIGNED_IN" && session?.user) {
        const userProfile = await fetchUserProfile(session.user)
        if (userProfile && mounted) {
          setUser(userProfile)
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        currentUserId.current = null
      }

      if (mounted) {
        setIsLoading(false)
      }
    })

    return () => {
      mounted = false
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
