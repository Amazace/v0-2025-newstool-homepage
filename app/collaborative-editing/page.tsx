"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Navigation } from "@/components/navigation"
import { NewsItemList } from "@/components/news-item-list"
import { NewsItemDialog } from "@/components/news-item-dialog"
import { useAuth } from "@/hooks/use-auth"
import { Search, Plus } from "lucide-react"
import { getLeads, createLead, updateLead, deleteLead } from "@/lib/api/leads"
import type { Lead } from "@/lib/types/database"
import { createClient } from "@/lib/supabase/client"

export interface NewsItem {
  id: string
  title: string
  status: "not_pre_collected" | "accepted" | "rejected" | "waiting_reply" | "welfare_lead" | "special_situation"
  reporter: "孟祥宇" | "江虹" | "陳筱雯" | "方凱琪" | "呂詠倢" | "林婷妤" | "黃易麒" | "林家慶"
  issue_number: number
  section: "knowledge" | "sports"
  created_at: string
  updated_at: string
  links: string[]
  created_by: string
}

const mapLeadToNewsItem = (lead: Lead): NewsItem => ({
  id: lead.id,
  title: lead.title,
  status: lead.status,
  reporter: lead.reporter as NewsItem["reporter"],
  issue_number: lead.issue_number,
  section: lead.section,
  created_at: lead.created_at,
  updated_at: lead.updated_at,
  links: lead.links,
  created_by: lead.created_by,
})

const mapNewsItemToLead = (
  item: Omit<NewsItem, "id" | "created_at" | "updated_at" | "created_by">,
): Omit<Lead, "id" | "created_at" | "updated_at" | "created_by"> => ({
  title: item.title,
  status: item.status,
  reporter: item.reporter,
  issue_number: item.issue_number,
  section: item.section,
  links: item.links,
})

export default function CollaborativeEditingPage() {
  const { user } = useAuth()
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null)

  const getStatusDisplayName = (status: NewsItem["status"]): string => {
    const statusMap = {
      not_pre_collected: "未預採",
      accepted: "接受",
      rejected: "拒訪",
      waiting_reply: "等待回覆",
      welfare_lead: "福利線",
      special_situation: "特殊狀況",
    }
    return statusMap[status] || status
  }

  useEffect(() => {
    if (user) {
      loadLeads()
    }
  }, [user])

  const loadLeads = async () => {
    try {
      setLoading(true)
      setError(null)
      const leads = await getLeads()
      setNewsItems(leads.map(mapLeadToNewsItem))
    } catch (err) {
      console.error("Error loading leads:", err)
      setError("載入資料時發生錯誤")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return

    const supabase = createClient()

    const channel = supabase
      .channel("leads_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "leads",
        },
        (payload) => {
          console.log("[v0] Realtime update received:", payload)

          if (payload.eventType === "INSERT") {
            const newLead = payload.new as Lead
            setNewsItems((prev) => [mapLeadToNewsItem(newLead), ...prev])
          } else if (payload.eventType === "UPDATE") {
            const updatedLead = payload.new as Lead
            setNewsItems((prev) =>
              prev.map((item) => (item.id === updatedLead.id ? mapLeadToNewsItem(updatedLead) : item)),
            )
          } else if (payload.eventType === "DELETE") {
            const deletedLead = payload.old as Lead
            setNewsItems((prev) => prev.filter((item) => item.id !== deletedLead.id))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const filteredItems = newsItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reporter.includes(searchTerm) ||
      getStatusDisplayName(item.status).includes(searchTerm),
  )

  const canEditOrDelete = (item: NewsItem): boolean => {
    if (!user) return false
    if (user.role === "Admin" || user.role === "Editor") return true
    if (user.role === "Reporter") return item.created_by === user.id
    return false
  }

  const handleAddItem = () => {
    setEditingItem(null)
    setIsDialogOpen(true)
  }

  const handleEditItem = (item: NewsItem) => {
    if (!canEditOrDelete(item)) return
    setEditingItem(item)
    setIsDialogOpen(true)
  }

  const handleDeleteItem = async (id: string) => {
    const item = newsItems.find((item) => item.id === id)
    if (!item || !canEditOrDelete(item)) return

    try {
      await deleteLead(id)
      // Realtime 會自動更新 UI，但為了即時反饋也手動更新
      setNewsItems((prev) => prev.filter((item) => item.id !== id))
    } catch (err) {
      console.error("Error deleting lead:", err)
      setError("刪除時發生錯誤")
    }
  }

  const handleSaveItem = async (item: Omit<NewsItem, "id" | "created_at" | "updated_at" | "created_by">) => {
    try {
      setError(null)

      if (editingItem) {
        if (!canEditOrDelete(editingItem)) return
        const updatedLead = await updateLead(editingItem.id, mapNewsItemToLead(item))
        // Realtime 會自動更新 UI，但為了即時反饋也手動更新
        setNewsItems((prev) =>
          prev.map((existing) => (existing.id === editingItem.id ? mapLeadToNewsItem(updatedLead) : existing)),
        )
      } else {
        const newLead = await createLead(mapNewsItemToLead(item))
        // Realtime 會自動更新 UI，但為了即時反饋也手動更新
        setNewsItems((prev) => [mapLeadToNewsItem(newLead), ...prev])
      }

      setIsDialogOpen(false)
    } catch (err) {
      console.error("Error saving lead:", err)
      setError("儲存時發生錯誤")
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-foreground mb-4">請先登入</h1>
              <p className="text-muted-foreground">您需要登入才能使用新聞資料共編功能</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">新聞資料共編</h1>
            <p className="text-muted-foreground">管理新聞線索與編輯進度</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
              <Button variant="outline" size="sm" onClick={loadLeads} className="mt-2 bg-transparent">
                重新載入
              </Button>
            </div>
          )}

          {/* Search and Add Section */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="搜尋線索名稱、記者或狀態..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleAddItem} className="sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              新增
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">載入中...</p>
            </div>
          ) : (
            /* News Items List */
            <NewsItemList
              items={filteredItems}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
              canEditOrDelete={canEditOrDelete}
              getStatusDisplayName={getStatusDisplayName}
            />
          )}

          {/* Add/Edit Dialog */}
          <NewsItemDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            item={editingItem}
            onSave={handleSaveItem}
            getStatusDisplayName={getStatusDisplayName}
          />
        </div>
      </main>
    </div>
  )
}
