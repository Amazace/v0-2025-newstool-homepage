# 新聞編採內部工具系統

專為新聞媒體團隊設計的內部管理平台，提供新聞資料協作編輯和排程管理功能，支援即時多人協作。

## 功能特色

- **新聞資料共編**: 多人協作編輯新聞內容，支援線索管理、狀態追蹤和權限控制
- **共編日曆**: 基於 FullCalendar 的排程管理，支援拖拽調整和事件管理
- **即時同步**: 使用 Supabase Realtime 實現多人即時協作
- **權限管理**: 角色分級權限控制（Admin/Editor/Reporter）
- **響應式設計**: 支援桌面和行動裝置

## 技術架構

- **前端框架**: Next.js 15 (App Router)
- **UI 框架**: React 18 + TypeScript
- **樣式系統**: Tailwind CSS v4 + shadcn/ui
- **資料庫**: Supabase (PostgreSQL + Realtime)
- **日曆組件**: FullCalendar React
- **字體**: Geist Sans + Geist Mono
- **部署平台**: Vercel

## 安裝與開發

### 環境需求

- Node.js 18.17 或更高版本
- npm 或 yarn 或 pnpm
- Supabase 專案（用於資料庫和即時功能）

### 安裝步驟

1. 克隆專案到本地
\`\`\`bash
git clone <your-repo-url>
cd news-editorial-tool
\`\`\`

2. 安裝依賴
\`\`\`bash
npm install
# 或
yarn install
# 或
pnpm install
\`\`\`

3. 設定環境變數（參考下方環境變數章節）

4. 建立 Supabase 資料表（參考下方資料庫設定章節）

5. 啟動開發伺服器
\`\`\`bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
\`\`\`

6. 開啟瀏覽器訪問 [http://localhost:3000](http://localhost:3000)

### 可用指令

\`\`\`bash
npm run dev          # 啟動開發伺服器
npm run build        # 建置生產版本
npm run start        # 啟動生產伺服器
npm run lint         # 執行 ESLint 檢查
\`\`\`

## 環境變數

在專案根目錄建立 `.env.local` 檔案，並設定以下環境變數：

\`\`\`env
# Supabase 配置（必要）
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 開發環境重導向 URL（選用）
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000
\`\`\`

### 取得 Supabase 環境變數

1. 前往 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇或建立專案
3. 在專案設定中找到 API 金鑰：
   - `NEXT_PUBLIC_SUPABASE_URL`: 專案 URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon/public 金鑰
   - `SUPABASE_SERVICE_ROLE_KEY`: service_role 金鑰（保密）

## 資料庫設定

### 自動建立資料表

專案包含 SQL 腳本來建立必要的資料表。在 v0 環境中，這些腳本會自動執行：

1. `scripts/001_create_leads_table.sql` - 建立新聞線索資料表
2. `scripts/002_create_events_table.sql` - 建立事件資料表

### 手動建立資料表

如果需要手動建立，請在 Supabase SQL Editor 中執行以下 SQL：

\`\`\`sql
-- 建立新聞線索資料表
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('not_pre_collected', 'accepted', 'rejected', 'waiting_reply', 'welfare_lead', 'special_situation')),
  reporter TEXT NOT NULL,
  issue_number INTEGER NOT NULL,
  section TEXT NOT NULL CHECK (section IN ('knowledge', 'sports')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  links TEXT[] DEFAULT '{}'
);

-- 啟用 RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 建立 RLS 政策
CREATE POLICY "leads_select_authenticated" ON public.leads FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "leads_insert_own" ON public.leads FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "leads_update_own_or_admin" ON public.leads FOR UPDATE USING (
  auth.uid() = created_by OR 
  EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND (auth.users.raw_user_meta_data->>'role' IN ('Admin', 'Editor')))
);
CREATE POLICY "leads_delete_own_or_admin" ON public.leads FOR DELETE USING (
  auth.uid() = created_by OR 
  EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND (auth.users.raw_user_meta_data->>'role' IN ('Admin', 'Editor')))
);

-- 建立事件資料表
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  start TIMESTAMP WITH TIME ZONE NOT NULL,
  "end" TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reporter TEXT NOT NULL
);

-- 啟用 RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 建立 RLS 政策
CREATE POLICY "events_select_authenticated" ON public.events FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "events_insert_own" ON public.events FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "events_update_own_or_admin" ON public.events FOR UPDATE USING (
  auth.uid() = created_by OR 
  EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND (auth.users.raw_user_meta_data->>'role' IN ('Admin', 'Editor')))
);
CREATE POLICY "events_delete_own_or_admin" ON public.events FOR DELETE USING (
  auth.uid() = created_by OR 
  EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = auth.uid() AND (auth.users.raw_user_meta_data->>'role' IN ('Admin', 'Editor')))
);

-- 建立更新時間觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
\`\`\`

## 部署到 Vercel

### 方法一：透過 v0 介面部署

1. 在 v0 專案頁面點擊右上角的「Publish」按鈕
2. 選擇部署到 Vercel
3. 設定環境變數（Supabase 金鑰）
4. 按照提示完成部署設定

### 方法二：透過 Vercel CLI

1. 安裝 Vercel CLI
\`\`\`bash
npm i -g vercel
\`\`\`

2. 登入 Vercel
\`\`\`bash
vercel login
\`\`\`

3. 部署專案
\`\`\`bash
vercel
\`\`\`

4. 設定環境變數
\`\`\`bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
\`\`\`

### 方法三：透過 GitHub 整合

1. 將程式碼推送到 GitHub（參考下方步驟）
2. 在 Vercel Dashboard 中連接 GitHub 儲存庫
3. 在專案設定中加入環境變數
4. 設定自動部署

## 匯出至 GitHub

### 方法一：透過 v0 介面

1. 在 v0 專案頁面點擊右上角的 GitHub 圖示
2. 選擇「Push to GitHub」
3. 設定儲存庫名稱和可見性
4. 完成推送

### 方法二：手動建立 GitHub 儲存庫

1. 在 GitHub 建立新的儲存庫

2. 下載專案 ZIP 檔案
   - 在 v0 專案頁面點擊右上角三個點
   - 選擇「Download ZIP」

3. 解壓縮並初始化 Git
\`\`\`bash
cd news-editorial-tool
git init
git add .
git commit -m "Initial commit: News editorial tool with Supabase integration"
\`\`\`

4. 連接遠端儲存庫並推送
\`\`\`bash
git remote add origin https://github.com/yourusername/news-editorial-tool.git
git branch -M main
git push -u origin main
\`\`\`

## 專案結構

\`\`\`
news-editorial-tool/
├── app/                          # Next.js App Router 頁面
│   ├── collaborative-editing/    # 新聞資料共編頁面
│   ├── calendar/                 # 共編日曆頁面
│   ├── layout.tsx               # 根 layout
│   ├── page.tsx                 # 首頁
│   └── globals.css              # 全域樣式
├── components/                   # React 組件
│   ├── ui/                      # shadcn/ui 基礎組件
│   ├── navigation.tsx           # 導覽列
│   ├── client-layout.tsx        # 客戶端 layout
│   ├── news-item-list.tsx       # 新聞項目清單
│   ├── news-item-dialog.tsx     # 新聞項目對話框
│   ├── calendar-view.tsx        # 日曆檢視
│   └── event-dialog.tsx         # 事件對話框
├── hooks/                       # 自定義 React Hooks
│   ├── use-auth.tsx            # 認證 Hook
│   └── use-realtime.tsx        # Realtime 連線 Hook
├── lib/                         # 工具函數和 API
│   ├── api/                    # API 層
│   │   ├── leads.ts           # 新聞線索 CRUD
│   │   └── events.ts          # 事件 CRUD
│   ├── supabase/              # Supabase 客戶端
│   │   ├── client.ts          # 瀏覽器端客戶端
│   │   └── server.ts          # 伺服器端客戶端
│   ├── types/                 # TypeScript 型別定義
│   │   └── database.ts        # 資料庫型別
│   └── utils.ts               # 通用工具
├── scripts/                     # 資料庫腳本
│   ├── 001_create_leads_table.sql
│   └── 002_create_events_table.sql
└── package.json                # 專案依賴
\`\`\`

## 開發指南

### 認證系統

目前使用假的認證系統進行開發，未來可整合 Supabase Auth：

- **Admin**: 完整權限，可管理所有資料
- **Editor**: 編輯權限，可管理所有資料  
- **Reporter**: 記者權限，只能管理自己建立的資料

### 資料結構

#### 新聞線索 (Lead)
\`\`\`typescript
interface Lead {
  id: string
  title: string
  status: 'not_pre_collected' | 'accepted' | 'rejected' | 'waiting_reply' | 'welfare_lead' | 'special_situation'
  reporter: string
  issue_number: number
  section: 'knowledge' | 'sports'
  created_at: string
  updated_at: string
  created_by: string
  links: string[]
}
\`\`\`

#### 事件 (Event)
\`\`\`typescript
interface Event {
  id: string
  title: string
  start: string
  end: string
  location?: string
  note?: string
  created_at: string
  updated_at: string
  created_by: string
  reporter: string
}
\`\`\`

### 即時協作功能

系統使用 Supabase Realtime 實現即時協作：

- 新聞線索的新增、編輯、刪除會即時同步到所有使用者
- 日曆事件的變更會即時更新
- 支援多人同時編輯，避免資料衝突

## 安全性

- 使用 Supabase Row Level Security (RLS) 保護資料
- Reporter 只能存取自己建立的資料
- Admin 和 Editor 可以存取所有資料
- 所有 API 呼叫都需要認證

## 疑難排解

### 常見問題

1. **Realtime 連線失敗**
   - 檢查 Supabase 環境變數是否正確設定
   - 確認 Supabase 專案的 Realtime 功能已啟用

2. **權限錯誤**
   - 確認 RLS 政策已正確建立
   - 檢查使用者是否已正確認證

3. **資料表不存在**
   - 執行 SQL 腳本建立資料表
   - 確認資料表名稱和欄位正確

## 後續開發計劃

- [ ] 整合 Supabase Auth 取代假認證系統
- [ ] 加入檔案上傳功能
- [ ] 實作通知系統
- [ ] 加入資料匯出功能
- [ ] 實作搜尋和篩選優化
- [ ] 加入使用者管理介面

## 授權

此專案僅供內部使用。

## 支援

如有問題或建議，請聯繫開發團隊。
