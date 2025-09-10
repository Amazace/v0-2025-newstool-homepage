"use client"

import type React from "react"

import { AuthProvider } from "@/hooks/use-auth"
import { Suspense } from "react"

export function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthProvider>{children}</AuthProvider>
    </Suspense>
  )
}
