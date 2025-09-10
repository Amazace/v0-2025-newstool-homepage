"use client"

import { useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

interface UseRealtimeOptions {
  table: string
  onInsert?: (payload: any) => void
  onUpdate?: (payload: any) => void
  onDelete?: (payload: any) => void
  enabled?: boolean
}

export function useRealtime({ table, onInsert, onUpdate, onDelete, enabled = true }: UseRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!enabled) return

    const supabase = createClient()

    // 清理舊的連線
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    // 建立新的 Realtime 連線
    const channel = supabase
      .channel(`${table}_changes`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
        },
        (payload) => {
          console.log(`[v0] Realtime update for ${table}:`, payload)

          switch (payload.eventType) {
            case "INSERT":
              onInsert?.(payload)
              break
            case "UPDATE":
              onUpdate?.(payload)
              break
            case "DELETE":
              onDelete?.(payload)
              break
          }
        },
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [table, onInsert, onUpdate, onDelete, enabled])

  return {
    disconnect: () => {
      if (channelRef.current) {
        const supabase = createClient()
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
    },
  }
}
