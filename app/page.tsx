"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navigation } from "@/components/navigation"
import { FileText, Calendar, Users, BarChart3, Info } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function HomePage() {
  const searchParams = useSearchParams()
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const messageParam = searchParams.get("message")
    if (messageParam) {
      setMessage(messageParam)
      // Clear message after 5 seconds
      const timer = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Main Content */}
      <main className="pt-16">
        {message && (
          <div className="px-4 sm:px-6 lg:px-8 pt-4">
            <div className="max-w-4xl mx-auto">
              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            </div>
          </div>
        )}

        {/* Hero Section */}
        <section className="bg-gradient-to-b from-muted/50 to-background py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">新聞編採內部工具</h1>
            <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
              提升編輯效率，優化協作流程。專為新聞媒體團隊設計的內部管理平台。
            </p>

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/collaborative-editing">
                  <FileText className="mr-2 h-5 w-5" />
                  前往新聞資料共編
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                <Link href="/calendar">
                  <Calendar className="mr-2 h-5 w-5" />
                  前往共編日曆
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-balance">核心功能</h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>新聞資料共編</CardTitle>
                  <CardDescription>多人協作編輯新聞內容，即時同步更新，提升團隊協作效率</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>共編日曆</CardTitle>
                  <CardDescription>統一管理編輯排程，追蹤截稿時間，確保新聞發布流程順暢</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>團隊協作</CardTitle>
                  <CardDescription>分配編輯任務，追蹤進度狀態，促進編輯部門內部溝通</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>數據分析</CardTitle>
                  <CardDescription>追蹤編輯效率指標，分析內容表現，優化編輯流程</CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
                <CardHeader>
                  <CardTitle>快速開始</CardTitle>
                  <CardDescription>選擇您需要的功能模組，立即開始使用編採工具</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/collaborative-editing">
                        <FileText className="mr-2 h-4 w-4" />
                        新聞資料共編
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full justify-start">
                      <Link href="/calendar">
                        <Calendar className="mr-2 h-4 w-4" />
                        共編日曆
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 py-8 px-4 sm:px-6 lg:px-8 mt-16">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-muted-foreground">© 2024 新聞編採系統. 專為提升編輯效率而設計.</p>
        </div>
      </footer>
    </div>
  )
}
