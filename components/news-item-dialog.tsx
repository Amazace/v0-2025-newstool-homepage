"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, X } from "lucide-react"
import type { NewsItem } from "@/app/collaborative-editing/page"

interface NewsItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: NewsItem | null
  onSave: (item: Omit<NewsItem, "id" | "created_at" | "updated_at" | "created_by">) => void
  getStatusDisplayName: (status: NewsItem["status"]) => string
}

const reporters = ["孟祥宇", "江虹", "陳筱雯", "方凱琪", "呂詠倢", "林婷妤", "黃易麒", "林家慶"] as const
const statuses: { value: NewsItem["status"]; label: string }[] = [
  { value: "not_pre_collected", label: "未預採" },
  { value: "accepted", label: "接受" },
  { value: "rejected", label: "拒訪" },
  { value: "waiting_reply", label: "等待回覆" },
  { value: "welfare_lead", label: "福利線" },
  { value: "special_situation", label: "特殊狀況" },
]
const sections: { value: NewsItem["section"]; label: string }[] = [
  { value: "knowledge", label: "新知" },
  { value: "sports", label: "體育" },
]
const issues = Array.from({ length: 10 }, (_, i) => 1813 + i)

export function NewsItemDialog({ open, onOpenChange, item, onSave, getStatusDisplayName }: NewsItemDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    status: "not_pre_collected" as NewsItem["status"],
    reporter: "孟祥宇" as NewsItem["reporter"],
    issue_number: 1820,
    section: "knowledge" as NewsItem["section"],
    links: [""],
  })

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        status: item.status,
        reporter: item.reporter,
        issue_number: item.issue_number,
        section: item.section,
        links: item.links.length > 0 ? item.links : [""],
      })
    } else {
      setFormData({
        title: "",
        status: "not_pre_collected",
        reporter: "孟祥宇",
        issue_number: 1820,
        section: "knowledge",
        links: [""],
      })
    }
  }, [item, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    onSave({
      title: formData.title.trim(),
      status: formData.status,
      reporter: formData.reporter,
      issue_number: formData.issue_number,
      section: formData.section,
      links: formData.links.filter((link) => link.trim() !== ""),
    })
  }

  const addLink = () => {
    setFormData((prev) => ({
      ...prev,
      links: [...prev.links, ""],
    }))
  }

  const removeLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }))
  }

  const updateLink = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      links: prev.links.map((link, i) => (i === index ? value : link)),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "編輯新聞線索" : "新增新聞線索"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">線索名稱 *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="請輸入線索名稱"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">狀態</Label>
              <Select
                value={formData.status}
                onValueChange={(value: NewsItem["status"]) => setFormData((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reporter">記者</Label>
              <Select
                value={formData.reporter}
                onValueChange={(value: NewsItem["reporter"]) => setFormData((prev) => ({ ...prev, reporter: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reporters.map((reporter) => (
                    <SelectItem key={reporter} value={reporter}>
                      {reporter}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issue">期數</Label>
              <Select
                value={formData.issue_number.toString()}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, issue_number: Number.parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {issues.map((issue) => (
                    <SelectItem key={issue} value={issue.toString()}>
                      {issue}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="section">版別</Label>
              <Select
                value={formData.section}
                onValueChange={(value: NewsItem["section"]) => setFormData((prev) => ({ ...prev, section: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem key={section.value} value={section.value}>
                      {section.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>相關連結</Label>
              <Button type="button" variant="outline" size="sm" onClick={addLink}>
                <Plus className="h-4 w-4 mr-1" />
                新增連結
              </Button>
            </div>
            <div className="space-y-2">
              {formData.links.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={link}
                    onChange={(e) => updateLink(index, e.target.value)}
                    placeholder="https://example.com"
                  />
                  {formData.links.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeLink(index)}
                      className="px-3"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">{item ? "更新" : "新增"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
