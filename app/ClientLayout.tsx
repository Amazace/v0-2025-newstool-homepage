"use client"

import type React from "react"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { AuthProvider } from "@/hooks/use-auth" // <CHANGE> 匯入 AuthProvider
import { Suspense } from "react" // <CHANGE> 匯入 Suspense
import "./globals.css"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-TW">
      {" "}
      {/* <CHANGE> 更改語言為繁體中文 */}
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {/* <CHANGE> 用 AuthProvider 包裹 children 提供認證狀態 */}
        {/* <CHANGE> 用 Suspense 包裹 AuthProvider 以解決 useSearchParams() 的錯誤 */}
        <Suspense fallback={<div>Loading...</div>}>
          <AuthProvider>{children}</AuthProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
