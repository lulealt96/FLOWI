import { createClient } from '@supabase/supabase-js'

// Solo usar en server-side: webhooks, cron jobs, funciones de admin
// NUNCA exponer al cliente
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
