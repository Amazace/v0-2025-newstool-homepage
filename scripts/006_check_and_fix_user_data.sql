-- 檢查廖奇典的使用者資料
SELECT * FROM profiles WHERE full_name = '廖奇典';

-- 如果不存在，則插入廖奇典的資料
INSERT INTO profiles (full_name, email, password_code, role)
VALUES ('廖奇典', 'liaochidian@news.com', 'fu62u031425120', 'Editor')
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  password_code = EXCLUDED.password_code,
  role = EXCLUDED.role;

-- 檢查所有使用者資料
SELECT full_name, email, role, created_at FROM profiles ORDER BY created_at;
