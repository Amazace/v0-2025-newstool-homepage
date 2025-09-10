# 使用者資料匯入指南

## 執行步驟

### 1. 確保環境變數已設定
確認以下環境變數在您的 Vercel 專案中已正確設定：
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### 2. 執行資料庫腳本
首先執行 SQL 腳本建立 profiles 資料表：
\`\`\`bash
# 在 v0 中執行這些 SQL 腳本
scripts/003_create_profiles_table.sql
\`\`\`

### 3. 執行使用者匯入腳本
\`\`\`bash
node scripts/import-users.js
\`\`\`

## 匯入的使用者資料

根據提供的截圖，將匯入以下使用者：

| 姓名 | Email | 密碼 | 角色 | 體育線區 | 新知線區 |
|------|-------|------|------|----------|----------|
| 孟祥宇 | mengxiangyu@news.com | HZ123456 | Editor | H | 乙 |
| 江虹 | jianghong@news.com | B123456 | Reporter | B | 乙 |
| 陳筱雯 | chenxiaowen@news.com | D丙123456 | Reporter | D | 丙 |
| 方凱琪 | fangkaiqi@news.com | A甲123456 | Admin | A | 甲 |
| 呂詠倢 | lvyongjie@news.com | G甲123456 | Editor | G | 甲 |
| 林婷妤 | lintingyu@news.com | EZ123456 | Reporter | E | 乙 |
| 黃易麒 | huangyiqi@news.com | C甲123456 | Reporter | C | 甲 |
| 林家慶 | linjiaqing@news.com | F丙123456 | Reporter | F | 丙 |

## 注意事項

1. **密碼格式**：原始密碼代碼後面加上 "123456" 以符合 Supabase 密碼長度要求
2. **角色分配**：
   - 方凱琪設為 Admin（可管理所有資料）
   - 孟祥宇、呂詠倢設為 Editor（可編輯大部分資料）
   - 其他人設為 Reporter（只能編輯自己的資料）
3. **Email 格式**：使用拼音 + @news.com 的格式

## 測試登入

匯入完成後，您可以使用任何一組 email/password 組合來測試登入功能。
