// 建立記者認證帳號的腳本
// 使用 Supabase Admin API 建立使用者並設定密碼

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

const reporters = [
  { name: "孟祥宇", email: "mengxiangyu@news.com", password: "0001" },
  { name: "江虹", email: "jianghong@news.com", password: "0002" },
  { name: "陳筱雯", email: "chenxiaowen@news.com", password: "0003" },
  { name: "方凱琪", email: "fangkaiqi@news.com", password: "0004" },
  { name: "呂詠倢", email: "lvyongjie@news.com", password: "0005" },
  { name: "林婷妤", email: "lintingyu@news.com", password: "0006" },
  { name: "黃易麒", email: "huangyiqi@news.com", password: "0007" },
  { name: "林家慶", email: "linjiaqing@news.com", password: "0008" },
]

async function createReporterAccounts() {
  console.log("開始建立記者帳號...")
  console.log("測試 Supabase 連線...")

  try {
    const { data: testData, error: testError } = await supabase.auth.admin.listUsers()
    if (testError) {
      console.error("Supabase 連線測試失敗:", testError.message)
      return
    }
    console.log(`✅ Supabase 連線成功，目前有 ${testData.users.length} 個使用者`)
  } catch (error) {
    console.error("連線測試錯誤:", error.message)
    return
  }

  for (const reporter of reporters) {
    try {
      console.log(`建立帳號: ${reporter.name} (${reporter.email})`)

      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const existingUser = existingUsers.users.find((user) => user.email === reporter.email)

      if (existingUser) {
        console.log(`⚠️  ${reporter.name} 帳號已存在，跳過建立`)
        continue
      }

      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: reporter.email,
        password: reporter.password,
        email_confirm: true,
        user_metadata: {
          full_name: reporter.name,
        },
      })

      if (authError) {
        console.error(`❌ 建立 ${reporter.name} 認證帳號失敗:`, authError.message)
        continue
      }

      console.log(`✅ ${reporter.name} 帳號建立成功 (ID: ${authData.user.id})`)

      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (error) {
      console.error(`❌ 建立 ${reporter.name} 帳號時發生錯誤:`, error.message)
    }
  }

  try {
    const { data: finalUsers } = await supabase.auth.admin.listUsers()
    console.log(`\n✅ 記者帳號建立完成！總共有 ${finalUsers.users.length} 個使用者`)
  } catch (error) {
    console.log("\n記者帳號建立完成！")
  }

  console.log("\n測試帳號資訊:")
  reporters.forEach((reporter) => {
    console.log(`${reporter.name}: 使用者名稱=${reporter.name}, 密碼=${reporter.password}`)
  })
}

createReporterAccounts().catch(console.error)
