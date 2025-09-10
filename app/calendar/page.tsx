"use client"

import { useState, useCallback, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { CalendarView } from "@/components/calendar-view"
import { EventDialog } from "@/components/event-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { getEvents, createEvent, updateEvent, deleteEvent } from "@/lib/api/events"
import type { Event } from "@/lib/types/database"
import { createClient } from "@/lib/supabase/client"

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  location?: string
  note?: string
  reporter: "孟祥宇" | "江虹" | "陳筱雯" | "方凱琪" | "呂詠倢" | "林婷妤" | "黃易麒" | "林家慶" | "全部"
  created_by: string
}

const mapEventToCalendarEvent = (event: Event): CalendarEvent => ({
  id: event.id,
  title: event.title,
  start: new Date(event.start),
  end: new Date(event.end),
  location: event.location || undefined,
  note: event.note || undefined,
  reporter: event.reporter as CalendarEvent["reporter"],
  created_by: event.created_by,
})

const mapCalendarEventToEvent = (
  event: Omit<CalendarEvent, "id" | "created_by">,
): Omit<Event, "id" | "created_at" | "updated_at" | "created_by"> => ({
  title: event.title,
  start: event.start.toISOString(),
  end: event.end.toISOString(),
  location: event.location || null,
  note: event.note || null,
  reporter: event.reporter === "全部" ? "孟祥宇" : event.reporter, // 預設值處理
})

const reporters = ["全部", "孟祥宇", "江虹", "陳筱雯", "方凱琪", "呂詠倢", "林婷妤", "黃易麒", "林家慶"] as const

export default function CalendarPage() {
  const { user } = useAuth()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedReporter, setSelectedReporter] = useState<string>("全部")
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    if (user) {
      loadEvents()
    }
  }, [user])

  const loadEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      const eventsData = await getEvents()
      setEvents(eventsData.map(mapEventToCalendarEvent))
    } catch (err) {
      console.error("Error loading events:", err)
      setError("載入事件時發生錯誤")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return

    const supabase = createClient()

    const channel = supabase
      .channel("events_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "events",
        },
        (payload) => {
          console.log("[v0] Calendar realtime update received:", payload)

          if (payload.eventType === "INSERT") {
            const newEvent = payload.new as Event
            setEvents((prev) => [...prev, mapEventToCalendarEvent(newEvent)])
          } else if (payload.eventType === "UPDATE") {
            const updatedEvent = payload.new as Event
            setEvents((prev) =>
              prev.map((event) => (event.id === updatedEvent.id ? mapEventToCalendarEvent(updatedEvent) : event)),
            )
          } else if (payload.eventType === "DELETE") {
            const deletedEvent = payload.old as Event
            setEvents((prev) => prev.filter((event) => event.id !== deletedEvent.id))
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const filteredEvents = events.filter((event) => selectedReporter === "全部" || event.reporter === selectedReporter)

  const handleDateSelect = useCallback((selectInfo: any) => {
    setEditingEvent(null)
    setSelectedDate(selectInfo.start)
    setIsEventDialogOpen(true)
  }, [])

  const handleEventClick = useCallback(
    (clickInfo: any) => {
      const event = events.find((e) => e.id === clickInfo.event.id)
      if (event) {
        setEditingEvent(event)
        setSelectedDate(null)
        setIsEventDialogOpen(true)
      }
    },
    [events],
  )

  const handleEventDrop = useCallback(async (dropInfo: any) => {
    const eventId = dropInfo.event.id
    const newStart = dropInfo.event.start
    const newEnd = dropInfo.event.end

    try {
      await updateEvent(eventId, {
        start: newStart.toISOString(),
        end: newEnd.toISOString(),
      })
      // Realtime 會自動更新 UI，但為了即時反饋也手動更新
      setEvents((prevEvents) =>
        prevEvents.map((event) => (event.id === eventId ? { ...event, start: newStart, end: newEnd } : event)),
      )
    } catch (err) {
      console.error("Error updating event:", err)
      setError("更新事件時發生錯誤")
      // 恢復原始位置
      dropInfo.revert()
    }
  }, [])

  const handleSaveEvent = async (eventData: Omit<CalendarEvent, "id" | "created_by">) => {
    try {
      setError(null)

      if (editingEvent) {
        const updatedEvent = await updateEvent(editingEvent.id, mapCalendarEventToEvent(eventData))
        // Realtime 會自動更新 UI，但為了即時反饋也手動更新
        setEvents((prevEvents) =>
          prevEvents.map((event) => (event.id === editingEvent.id ? mapEventToCalendarEvent(updatedEvent) : event)),
        )
      } else {
        const newEvent = await createEvent(mapCalendarEventToEvent(eventData))
        // Realtime 會自動更新 UI，但為了即時反饋也手動更新
        setEvents((prevEvents) => [...prevEvents, mapEventToCalendarEvent(newEvent)])
      }

      setIsEventDialogOpen(false)
    } catch (err) {
      console.error("Error saving event:", err)
      setError("儲存事件時發生錯誤")
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      setError(null)
      await deleteEvent(eventId)
      // Realtime 會自動更新 UI，但為了即時反饋也手動更新
      setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId))
      setIsEventDialogOpen(false)
    } catch (err) {
      console.error("Error deleting event:", err)
      setError("刪除事件時發生錯誤")
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
              <p className="text-muted-foreground">您需要登入才能使用共編日曆功能</p>
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
            <h1 className="text-3xl font-bold text-foreground mb-2">共編日曆</h1>
            <p className="text-muted-foreground">管理採訪行程與編輯會議</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
              <Button variant="outline" size="sm" onClick={loadEvents} className="mt-2 bg-transparent">
                重新載入
              </Button>
            </div>
          )}

          {/* Filters */}
          <div className="mb-6">
            <div className="flex items-center gap-4">
              <Label htmlFor="reporter-filter" className="text-sm font-medium">
                成員篩選：
              </Label>
              <Select value={selectedReporter} onValueChange={setSelectedReporter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="選擇記者" />
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

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">載入中...</p>
            </div>
          ) : (
            /* Calendar */
            <CalendarView
              events={filteredEvents}
              onDateSelect={handleDateSelect}
              onEventClick={handleEventClick}
              onEventDrop={handleEventDrop}
            />
          )}

          {/* Event Dialog */}
          <EventDialog
            open={isEventDialogOpen}
            onOpenChange={setIsEventDialogOpen}
            event={editingEvent}
            selectedDate={selectedDate}
            onSave={handleSaveEvent}
            onDelete={handleDeleteEvent}
          />
        </div>
      </main>
    </div>
  )
}
