import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RemindersClient from './RemindersClient'

export default async function RemindersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: reminders } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', user.id)
    .order('remind_at', { ascending: true })

  return <RemindersClient reminders={reminders ?? []} userId={user.id} />
}
