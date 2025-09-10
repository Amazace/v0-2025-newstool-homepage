"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugPage() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [authUsers, setAuthUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("[v0] Fetching all profiles...")
        const { data: profilesData, error: profilesError } = await supabase.from("profiles").select("*")

        console.log("[v0] Profiles fetch result:", { data: profilesData, error: profilesError })

        if (profilesError) {
          setError(profilesError.message)
        } else {
          setProfiles(profilesData || [])
        }

        console.log("[v0] Fetching auth users...")
        try {
          const {
            data: { users },
            error: usersError,
          } = await supabase.auth.admin.listUsers()
          console.log("[v0] Auth users fetch result:", { users, error: usersError })

          if (usersError) {
            console.log("[v0] Auth users error (expected if not admin):", usersError.message)
          } else {
            setAuthUsers(users || [])
          }
        } catch (authErr) {
          console.log("[v0] Auth users fetch failed (expected if not admin):", authErr)
        }
      } catch (err) {
        console.log("[v0] Data fetch error:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div className="p-8">載入中...</div>

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Debug - 使用者資料檢查</h1>

      {error && (
        <Card className="mb-6 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">錯誤</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Supabase 認證使用者 ({authUsers.length} 筆)</CardTitle>
        </CardHeader>
        <CardContent>
          {authUsers.length === 0 ? (
            <div className="text-gray-500">
              <p>沒有找到認證使用者，或沒有權限查看</p>
              <p className="text-sm mt-2">請到 Supabase Dashboard → Authentication → Users 查看認證使用者</p>
            </div>
          ) : (
            <div className="space-y-4">
              {authUsers.map((user, index) => (
                <div key={user.id || index} className="border p-4 rounded bg-green-50">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <strong>ID:</strong> {user.id}
                    </div>
                    <div>
                      <strong>Email:</strong> {user.email}
                    </div>
                    <div>
                      <strong>建立時間:</strong> {new Date(user.created_at).toLocaleString()}
                    </div>
                    <div>
                      <strong>最後登入:</strong>{" "}
                      {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : "從未登入"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profiles 資料表 ({profiles.length} 筆)</CardTitle>
        </CardHeader>
        <CardContent>
          {profiles.length === 0 ? (
            <p className="text-gray-500">沒有找到任何使用者資料</p>
          ) : (
            <div className="space-y-4">
              {profiles.map((profile, index) => (
                <div key={profile.id || index} className="border p-4 rounded">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <strong>ID:</strong> {profile.id}
                    </div>
                    <div>
                      <strong>姓名:</strong> {profile.full_name}
                    </div>
                    <div>
                      <strong>Email:</strong> {profile.email}
                    </div>
                    <div>
                      <strong>角色:</strong> {profile.role}
                    </div>
                    <div>
                      <strong>密碼代碼:</strong> {profile.password_code}
                    </div>
                    <div>
                      <strong>體育線區:</strong> {profile.sports_section}
                    </div>
                    <div>
                      <strong>新知線區:</strong> {profile.knowledge_section}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>如何查看 Supabase 使用者</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <strong>1. Supabase Dashboard 方式：</strong>
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>
              前往{" "}
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                className="text-blue-600 underline"
                rel="noreferrer"
              >
                Supabase Dashboard
              </a>
            </li>
            <li>選擇您的專案</li>
            <li>進入 Authentication → Users 查看所有認證使用者</li>
            <li>進入 Table Editor → profiles 查看使用者資料</li>
          </ul>
          <p className="mt-4">
            <strong>2. 本頁面方式：</strong>
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>上方顯示 Supabase 認證使用者（需要管理員權限）</li>
            <li>下方顯示 profiles 資料表中的使用者資料</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
