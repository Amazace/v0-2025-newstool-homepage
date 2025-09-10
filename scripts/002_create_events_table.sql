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

-- RLS 政策：所有已認證用戶可以查看所有事件
CREATE POLICY "events_select_authenticated" ON public.events
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS 政策：用戶可以新增事件
CREATE POLICY "events_insert_own" ON public.events
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- RLS 政策：用戶可以更新自己建立的事件，或者 Admin/Editor 可以更新所有事件
CREATE POLICY "events_update_own_or_admin" ON public.events
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'role' IN ('Admin', 'Editor'))
    )
  );

-- RLS 政策：用戶可以刪除自己建立的事件，或者 Admin/Editor 可以刪除所有事件
CREATE POLICY "events_delete_own_or_admin" ON public.events
  FOR DELETE USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'role' IN ('Admin', 'Editor'))
    )
  );

-- 建立更新時間觸發器
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
