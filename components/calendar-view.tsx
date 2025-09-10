"use client"

import { useEffect, useRef } from "react"
import { Calendar } from "@fullcalendar/core"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import zhTwLocale from "@fullcalendar/core/locales/zh-tw"
import type { CalendarEvent } from "@/app/calendar/page"

interface CalendarViewProps {
  events: CalendarEvent[]
  onDateSelect: (selectInfo: any) => void
  onEventClick: (clickInfo: any) => void
  onEventDrop: (dropInfo: any) => void
}

export function CalendarView({ events, onDateSelect, onEventClick, onEventDrop }: CalendarViewProps) {
  const calendarRef = useRef<HTMLDivElement>(null)
  const calendarInstance = useRef<Calendar | null>(null)

  useEffect(() => {
    if (!calendarRef.current) return

    // Initialize calendar
    const calendar = new Calendar(calendarRef.current, {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      locale: zhTwLocale,
      initialView: "dayGridMonth",
      headerToolbar: {
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      },
      height: "auto",
      selectable: true,
      selectMirror: true,
      editable: true,
      dayMaxEvents: true,
      weekends: true,
      select: onDateSelect,
      eventClick: onEventClick,
      eventDrop: onEventDrop,
      eventResize: onEventDrop,
      events: events.map((event) => ({
        id: event.id,
        title: event.title,
        start: event.start,
        end: event.end,
        backgroundColor: getEventColor(event.reporter),
        borderColor: getEventColor(event.reporter),
        textColor: "#ffffff",
      })),
    })

    calendar.render()
    calendarInstance.current = calendar

    return () => {
      calendar.destroy()
    }
  }, [])

  // Update events when props change
  useEffect(() => {
    if (calendarInstance.current) {
      calendarInstance.current.removeAllEvents()
      calendarInstance.current.addEventSource(
        events.map((event) => ({
          id: event.id,
          title: event.title,
          start: event.start,
          end: event.end,
          backgroundColor: getEventColor(event.reporter),
          borderColor: getEventColor(event.reporter),
          textColor: "#ffffff",
        })),
      )
    }
  }, [events])

  return (
    <div className="bg-card rounded-lg border p-6">
      <div ref={calendarRef} className="calendar-container" />
      <style jsx global>{`
        .fc-theme-standard .fc-scrollgrid {
          border: 1px solid hsl(var(--border));
        }
        .fc-theme-standard td, .fc-theme-standard th {
          border: 1px solid hsl(var(--border));
        }
        .fc-col-header-cell {
          background-color: hsl(var(--muted));
        }
        .fc-daygrid-day-number {
          color: hsl(var(--foreground));
        }
        .fc-button-primary {
          background-color: hsl(var(--primary));
          border-color: hsl(var(--primary));
        }
        .fc-button-primary:hover {
          background-color: hsl(var(--primary) / 0.9);
          border-color: hsl(var(--primary) / 0.9);
        }
        .fc-today-button {
          background-color: hsl(var(--secondary));
          border-color: hsl(var(--secondary));
          color: hsl(var(--secondary-foreground));
        }
      `}</style>
    </div>
  )
}

function getEventColor(reporter: string): string {
  const colors: Record<string, string> = {
    孟祥宇: "#3b82f6", // blue
    江虹: "#ef4444", // red
    陳筱雯: "#10b981", // emerald
    方凱琪: "#f59e0b", // amber
    呂詠倢: "#8b5cf6", // violet
    林婷妤: "#ec4899", // pink
    黃易麒: "#06b6d4", // cyan
    林家慶: "#84cc16", // lime
  }
  return colors[reporter] || "#6b7280" // gray as fallback
}
