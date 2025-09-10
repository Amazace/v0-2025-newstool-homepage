-- Insert user data based on the provided screenshot
-- Note: These users need to be created in Supabase Auth first, then their profiles updated

-- First, we'll create a temporary function to insert users with auth
CREATE OR REPLACE FUNCTION create_user_with_profile(
  user_email text,
  user_password text,
  user_full_name text,
  user_sports_section text,
  user_knowledge_section text,
  user_password_code text,
  user_role text DEFAULT 'Reporter'
)
RETURNS uuid AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- This function should be called from the application layer
  -- as we cannot directly create auth users from SQL
  RAISE NOTICE 'User % should be created via Supabase Auth with password %', user_email, user_password;
  RETURN null;
END;
$$ LANGUAGE plpgsql;

-- Data to be inserted (will be handled by the application)
/*
Users to create in Supabase Auth:

1. 孟祥宇 - mengxiangyu@news.com - Password: HZ
2. 江虹 - jianghong@news.com - Password: B  
3. 陳筱雯 - chenxiaowen@news.com - Password: D丙
4. 方凱琪 - fangkaiqi@news.com - Password: A甲
5. 呂詠倢 - lvyongjie@news.com - Password: G甲
6. 林婷妤 - lintingyu@news.com - Password: EZ
7. 黃易麒 - huangyiqi@news.com - Password: C甲
8. 林家慶 - linjiaqing@news.com - Password: F丙

After creating users in Auth, update their profiles:
*/

-- Update profiles after users are created in Auth
-- This will be executed after the auth users are created
CREATE OR REPLACE FUNCTION update_user_profiles()
RETURNS void AS $$
BEGIN
  -- Update profiles with the correct information
  -- This assumes the users have been created in auth.users first
  
  UPDATE public.profiles SET 
    full_name = '孟祥宇',
    sports_section = 'H',
    knowledge_section = '乙',
    password_code = 'HZ',
    role = 'Editor'
  WHERE email = 'mengxiangyu@news.com';
  
  UPDATE public.profiles SET 
    full_name = '江虹',
    sports_section = 'B',
    knowledge_section = '乙',
    password_code = 'B',
    role = 'Reporter'
  WHERE email = 'jianghong@news.com';
  
  UPDATE public.profiles SET 
    full_name = '陳筱雯',
    sports_section = 'D',
    knowledge_section = '丙',
    password_code = 'D丙',
    role = 'Reporter'
  WHERE email = 'chenxiaowen@news.com';
  
  UPDATE public.profiles SET 
    full_name = '方凱琪',
    sports_section = 'A',
    knowledge_section = '甲',
    password_code = 'A甲',
    role = 'Admin'
  WHERE email = 'fangkaiqi@news.com';
  
  UPDATE public.profiles SET 
    full_name = '呂詠倢',
    sports_section = 'G',
    knowledge_section = '甲',
    password_code = 'G甲',
    role = 'Editor'
  WHERE email = 'lvyongjie@news.com';
  
  UPDATE public.profiles SET 
    full_name = '林婷妤',
    sports_section = 'E',
    knowledge_section = '乙',
    password_code = 'EZ',
    role = 'Reporter'
  WHERE email = 'lintingyu@news.com';
  
  UPDATE public.profiles SET 
    full_name = '黃易麒',
    sports_section = 'C',
    knowledge_section = '甲',
    password_code = 'C甲',
    role = 'Reporter'
  WHERE email = 'huangyiqi@news.com';
  
  UPDATE public.profiles SET 
    full_name = '林家慶',
    sports_section = 'F',
    knowledge_section = '丙',
    password_code = 'F丙',
    role = 'Reporter'
  WHERE email = 'linjiaqing@news.com';
  
END;
$$ LANGUAGE plpgsql;
