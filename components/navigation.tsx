"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { User, Loader2, Settings } from "lucide-react"
import { LoginDialog } from "./login-dialog"

export function Navigation() {
  const { user, profile, logout, isLoggedIn, isLoading } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-primary">
              新聞編採系統
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/collaborative-editing"
                className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                新聞資料共編
              </Link>
              <Link
                href="/calendar"
                className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                共編日曆
              </Link>
              {isLoggedIn && profile?.role === "admin" && (
                <Link
                  href="/admin/users"
                  className="text-muted-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1"
                >
                  <Settings className="h-4 w-4" />
                  使用者管理
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">載入中...</span>
              </div>
            ) : isLoggedIn && user ? (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{profile?.full_name || user.email}</span>
                  <span className="text-muted-foreground">
                    ({profile?.role === "admin" ? "管理員" : profile?.role === "editor" ? "編輯" : "記者"})
                  </span>
                </div>
                <Button onClick={handleLogout} variant="outline" size="sm">
                  登出
                </Button>
              </>
            ) : (
              <LoginDialog />
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
