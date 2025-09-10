"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, ExternalLink } from "lucide-react"
import type { NewsItem } from "@/app/collaborative-editing/page"

interface NewsItemListProps {
  items: NewsItem[]
  onEdit: (item: NewsItem) => void
  onDelete: (id: string) => void
  canEditOrDelete: (item: NewsItem) => boolean
  getStatusDisplayName: (status: NewsItem["status"]) => string
}

const statusColors = {
  未預採: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  接受: "bg-green-100 text-green-800 hover:bg-green-200",
  拒訪: "bg-red-100 text-red-800 hover:bg-red-200",
  等待回覆: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  福利線: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  特殊狀況: "bg-purple-100 text-purple-800 hover:bg-purple-200",
}

const sectionColors = {
  新知: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
  體育: "bg-orange-100 text-orange-800 hover:bg-orange-200",
}

export function NewsItemList({ items, onEdit, onDelete, canEditOrDelete, getStatusDisplayName }: NewsItemListProps) {
  const getSectionDisplayName = (section: NewsItem["section"]): string => {
    const sectionMap = {
      knowledge: "新知",
      sports: "體育",
    }
    return sectionMap[section] || section
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">目前沒有新聞資料</p>
        <p className="text-muted-foreground text-sm mt-2">點擊「新增」按鈕開始建立新聞線索</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const statusDisplayName = getStatusDisplayName(item.status)
        const sectionDisplayName = getSectionDisplayName(item.section)

        return (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary" className={statusColors[statusDisplayName as keyof typeof statusColors]}>
                      {statusDisplayName}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={sectionColors[sectionDisplayName as keyof typeof sectionColors]}
                    >
                      {sectionDisplayName}
                    </Badge>
                  </div>
                </div>
                {canEditOrDelete(item) && (
                  <div className="flex gap-2 ml-4">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(item)} className="h-8 w-8 p-0">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(item.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">記者：</span>
                  <span className="font-medium">{item.reporter}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">期數：</span>
                  <span className="font-medium">{item.issue_number}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">卡線時間：</span>
                  <span className="font-medium">
                    {new Date(item.created_at).toLocaleString("zh-TW", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              {item.links.length > 0 && (
                <div className="mt-4">
                  <span className="text-muted-foreground text-sm">相關連結：</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.links.map((link, index) => (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        連結 {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
