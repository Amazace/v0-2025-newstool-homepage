"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Users, Shield, Edit, UserCheck } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: "admin" | "editor" | "reporter"
  sports_section: string
  knowledge_section: string
  created_at: string
  last_sign_in_at: string
}

export default function UsersManagementPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && (!user || profile?.role !== "admin")) {
      setError("您需要管理員權限才能查看此頁面")
      setLoading(false)
      return
    }

    if (user && profile?.role === "admin") {
      fetchUsers()
    }
  }, [user, profile, authLoading])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()

      if (authError) {
        console.error("[v0] Error fetching auth users:", authError)
        setError("無法獲取使用者資料：" + authError.message)
        return
      }

      const { data: profiles, error: profilesError } = await supabase.from("profiles").select("*")

      if (profilesError && profilesError.code !== "PGRST116") {
        // PGRST116 = table not found
        console.error("[v0] Error fetching profiles:", profilesError)
      }

      const combinedUsers: UserProfile[] = authUsers.users.map((authUser) => {
        const profile = profiles?.find((p) => p.id === authUser.id)
        return {
          id: authUser.id,
          email: authUser.email || "",
          full_name: profile?.full_name || authUser.user_metadata?.full_name || "未設定",
          role: profile?.role || "reporter",
          sports_section: profile?.sports_section || "未設定",
          knowledge_section: profile?.knowledge_section || "未設定",
          created_at: authUser.created_at,
          last_sign_in_at: authUser.last_sign_in_at || "從未登入",
        }
      })

      setUsers(combinedUsers)
    } catch (err) {
      console.error("[v0] Error in fetchUsers:", err)
      setError("獲取使用者資料時發生錯誤")
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800"
      case "editor":
        return "bg-blue-100 text-blue-800"
      case "reporter":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (authLoading || loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600">載入使用者資料中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert className="max-w-2xl mx-auto">
          <Shield className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="h-8 w-8 text-emerald-600" />
            使用者管理
          </h1>
          <p className="text-gray-600 mt-1">管理新聞編採系統的所有使用者</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="搜尋使用者..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full sm:w-80"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm text-gray-600">總使用者</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">管理員</p>
                <p className="text-2xl font-bold">{users.filter((u) => u.role === "admin").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">編輯</p>
                <p className="text-2xl font-bold">{users.filter((u) => u.role === "editor").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">記者</p>
                <p className="text-2xl font-bold">{users.filter((u) => u.role === "reporter").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">{searchTerm ? "找不到符合條件的使用者" : "目前沒有使用者資料"}</p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{user.full_name}</h3>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role === "admin" ? "管理員" : user.role === "editor" ? "編輯" : "記者"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Email:</span> {user.email}
                      </p>
                      <p>
                        <span className="font-medium">體育線區:</span> {user.sports_section}
                      </p>
                      <p>
                        <span className="font-medium">新知線區:</span> {user.knowledge_section}
                      </p>
                      <p>
                        <span className="font-medium">最後登入:</span>{" "}
                        {user.last_sign_in_at === "從未登入"
                          ? user.last_sign_in_at
                          : new Date(user.last_sign_in_at).toLocaleString("zh-TW")}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      編輯
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">如何查看 Supabase 資料</CardTitle>
          <CardDescription>除了此管理頁面，您還可以透過以下方式查看使用者資料：</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">1. Supabase Dashboard</h4>
            <p className="text-sm text-gray-600 mb-2">
              前往{" "}
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 hover:underline"
              >
                Supabase Dashboard
              </a>
            </p>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• 選擇您的專案</li>
              <li>• 進入 "Authentication" → "Users" 查看認證使用者</li>
              <li>• 進入 "Table Editor" → "profiles" 查看使用者資料（需先執行建表腳本）</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">2. SQL Editor</h4>
            <p className="text-sm text-gray-600 mb-2">在 Supabase Dashboard 的 SQL Editor 中執行：</p>
            <code className="block bg-gray-100 p-2 rounded text-sm">
              SELECT * FROM auth.users;
              <br />
              SELECT * FROM profiles;
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
