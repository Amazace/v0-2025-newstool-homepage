// User data import script for Supabase Auth
// Run with: node scripts/import-users.js

import { createClient } from "@supabase/supabase-js"

// Initialize Supabase with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing required environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// User data from the screenshot
const userData = [
  {
    full_name: "孟祥宇",
    email: "mengxiangyu@news.com",
    password: "HZ123456", // Adding numbers to meet password requirements
    sports_section: "H",
    knowledge_section: "乙",
    password_code: "HZ",
    role: "Editor",
  },
  {
    full_name: "江虹",
    email: "jianghong@news.com",
    password: "B123456",
    sports_section: "B",
    knowledge_section: "乙",
    password_code: "B",
    role: "Reporter",
  },
  {
    full_name: "陳筱雯",
    email: "chenxiaowen@news.com",
    password: "D丙123456",
    sports_section: "D",
    knowledge_section: "丙",
    password_code: "D丙",
    role: "Reporter",
  },
  {
    full_name: "方凱琪",
    email: "fangkaiqi@news.com",
    password: "A甲123456",
    sports_section: "A",
    knowledge_section: "甲",
    password_code: "A甲",
    role: "Admin",
  },
  {
    full_name: "呂詠倢",
    email: "lvyongjie@news.com",
    password: "G甲123456",
    sports_section: "G",
    knowledge_section: "甲",
    password_code: "G甲",
    role: "Editor",
  },
  {
    full_name: "林婷妤",
    email: "lintingyu@news.com",
    password: "EZ123456",
    sports_section: "E",
    knowledge_section: "乙",
    password_code: "EZ",
    role: "Reporter",
  },
  {
    full_name: "黃易麒",
    email: "huangyiqi@news.com",
    password: "C甲123456",
    sports_section: "C",
    knowledge_section: "甲",
    password_code: "C甲",
    role: "Reporter",
  },
  {
    full_name: "林家慶",
    email: "linjiaqing@news.com",
    password: "F丙123456",
    sports_section: "F",
    knowledge_section: "丙",
    password_code: "F丙",
    role: "Reporter",
  },
]

async function createUser(user) {
  try {
    console.log(`Creating user: ${user.full_name} (${user.email})`)

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: user.full_name,
      },
    })

    if (authError) {
      console.error(`Error creating auth user for ${user.email}:`, authError.message)
      return false
    }

    console.log(`✓ Auth user created for ${user.email}`)

    // Update profile with additional information
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: user.full_name,
        sports_section: user.sports_section,
        knowledge_section: user.knowledge_section,
        password_code: user.password_code,
        role: user.role,
      })
      .eq("id", authData.user.id)

    if (profileError) {
      console.error(`Error updating profile for ${user.email}:`, profileError.message)
      return false
    }

    console.log(`✓ Profile updated for ${user.email}`)
    return true
  } catch (error) {
    console.error(`Unexpected error for ${user.email}:`, error.message)
    return false
  }
}

async function importAllUsers() {
  console.log("Starting user import process...")
  console.log(`Total users to import: ${userData.length}`)

  let successCount = 0
  let failCount = 0

  for (const user of userData) {
    const success = await createUser(user)
    if (success) {
      successCount++
    } else {
      failCount++
    }

    // Add small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  console.log("\n=== Import Summary ===")
  console.log(`✓ Successfully imported: ${successCount} users`)
  console.log(`✗ Failed to import: ${failCount} users`)
  console.log("======================")

  if (failCount === 0) {
    console.log("\n🎉 All users imported successfully!")
    console.log("\nYou can now use the following credentials to test login:")
    userData.forEach((user) => {
      console.log(`${user.full_name}: ${user.email} / ${user.password}`)
    })
  }
}

// Run the import
importAllUsers().catch(console.error)
