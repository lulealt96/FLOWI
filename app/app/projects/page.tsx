import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProjectsClient from './ProjectsClient'

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true })

  const { data: tasks } = await supabase
    .from('tasks')
    .select('project_id, status')
    .eq('user_id', user.id)
    .neq('status', 'done')

  const countByProject: Record<string, number> = {}
  for (const t of tasks ?? []) {
    if (t.project_id) countByProject[t.project_id] = (countByProject[t.project_id] ?? 0) + 1
  }

  return <ProjectsClient projects={projects ?? []} countByProject={countByProject} />
}
