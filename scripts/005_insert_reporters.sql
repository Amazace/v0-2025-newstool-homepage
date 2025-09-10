-- 插入記者使用者資料到 profiles 資料表
-- 密碼從 0001 開始遞增

INSERT INTO profiles (
  id,
  full_name,
  email,
  password_code,
  role,
  sports_section,
  knowledge_section,
  created_at,
  updated_at
) VALUES
  (gen_random_uuid(), '孟祥宇', 'mengxiangyu@newsroom.com', '0001', 'Reporter', 'H', '乙', now(), now()),
  (gen_random_uuid(), '江虹', 'jianghong@newsroom.com', '0002', 'Reporter', 'B', '乙', now(), now()),
  (gen_random_uuid(), '陳筱雯', 'chenxiaowen@newsroom.com', '0003', 'Reporter', 'D', '丙', now(), now()),
  (gen_random_uuid(), '方凱琪', 'fangkaiqi@newsroom.com', '0004', 'Reporter', 'A', '甲', now(), now()),
  (gen_random_uuid(), '呂詠倢', 'lvyongjie@newsroom.com', '0005', 'Reporter', 'G', '甲', now(), now()),
  (gen_random_uuid(), '林婷妤', 'lintingyu@newsroom.com', '0006', 'Reporter', 'E', '乙', now(), now()),
  (gen_random_uuid(), '黃易麒', 'huangyiqi@newsroom.com', '0007', 'Reporter', 'C', '甲', now(), now()),
  (gen_random_uuid(), '林家慶', 'linjiaqing@newsroom.com', '0008', 'Reporter', 'F', '丙', now(), now())
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  password_code = EXCLUDED.password_code,
  role = EXCLUDED.role,
  sports_section = EXCLUDED.sports_section,
  knowledge_section = EXCLUDED.knowledge_section,
  updated_at = now();
