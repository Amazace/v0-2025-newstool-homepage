"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2 } from "lucide-react"
import type { CalendarEvent } from "@/app/calendar/page"

interface EventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: CalendarEvent | null
  selectedDate: Date | null
  onSave: (event: Omit<CalendarEvent, "id">) => void
  onDelete: (eventId: string) => void
}

const reporters = ["孟祥宇", "江虹", "陳筱雯", "方凱琪", "呂詠倢", "林婷妤", "黃易麒", "林家慶"] as const

export function EventDialog({ open, onOpenChange, event, selectedDate, onSave, onDelete }: EventDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    location: "",
    note: "",
    reporter: "孟祥宇" as const,
  })

  useEffect(() => {
    if (event) {
      // Edit mode
      const startDate = new Date(event.start)
      const endDate = new Date(event.end)

      setFormData({
        title: event.title,
        startDate: startDate.toISOString().split("T")[0],
        startTime: startDate.toTimeString().slice(0, 5),
        endDate: endDate.toISOString().split("T")[0],
        endTime: endDate.toTimeString().slice(0, 5),
        location: event.location || "",
        note: event.note || "",
        reporter: event.reporter,
      })
    } else if (selectedDate) {
      // Add mode with selected date
      const date = selectedDate.toISOString().split("T")[0]
      setFormData({
        title: "",
        startDate: date,
        startTime: "09:00",
        endDate: date,
        endTime: "10:00",
        location: "",
        note: "",
        reporter: "孟祥宇",
      })
    } else {
      // Reset form
      const today = new Date().toISOString().split("T")[0]
      setFormData({
        title: "",
        startDate: today,
        startTime: "09:00",
        endDate: today,
        endTime: "10:00",
        location: "",
        note: "",
        reporter: "孟祥宇",
      })
    }
  }, [event, selectedDate, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`)

    onSave({
      title: formData.title,
      start: startDateTime,
      end: endDateTime,
      location: formData.location,
      note: formData.note,
      reporter: formData.reporter,
    })
  }

  const handleDelete = () => {
    if (event) {
      onDelete(event.id)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{event ? "編輯事件" : "新增事件"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">標題 *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">開始日期 *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="startTime">開始時間 *</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="endDate">結束日期 *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="endTime">結束時間 *</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="reporter">負責記者 *</Label>
            <Select
              value={formData.reporter}
              onValueChange={(value) => setFormData({ ...formData, reporter: value as any })}
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

          <div>
            <Label htmlFor="location">地點</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="note">備註</Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-between pt-4">
            <div>
              {event && (
                <Button type="button" variant="destructive" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  刪除
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button type="submit">{event ? "更新" : "新增"}</Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
