import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TasksClient from './TasksClient'

export default async function TasksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: tasks }, { data: projects }] = await Promise.all([
    supabase.from('tasks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('projects').select('id, name, emoji, color').eq('user_id', user.id),
  ])

  return <TasksClient tasks={tasks ?? []} projects={projects ?? []} userId={user.id} />
}
