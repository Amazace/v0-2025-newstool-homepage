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

-- RLS 政策：所有已認證用戶可以查看所有線索
CREATE POLICY "leads_select_authenticated" ON public.leads
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS 政策：用戶可以新增線索
CREATE POLICY "leads_insert_own" ON public.leads
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- RLS 政策：用戶可以更新自己建立的線索，或者 Admin/Editor 可以更新所有線索
CREATE POLICY "leads_update_own_or_admin" ON public.leads
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'role' IN ('Admin', 'Editor'))
    )
  );

-- RLS 政策：用戶可以刪除自己建立的線索，或者 Admin/Editor 可以刪除所有線索
CREATE POLICY "leads_delete_own_or_admin" ON public.leads
  FOR DELETE USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'role' IN ('Admin', 'Editor'))
    )
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
