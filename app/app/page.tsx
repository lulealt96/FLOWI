import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Cargar perfil
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, onboarding_completed')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_completed) redirect('/onboarding')

  // Cargar proyectos activos
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, emoji, color, category')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('sort_order')

  // Tareas de hoy y próximas urgentes
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  const todayStr = today.toISOString()

  const { data: urgentTasks } = await supabase
    .from('tasks')
    .select('id, title, status, priority, due_date, project_id')
    .eq('user_id', user.id)
    .neq('status', 'done')
    .lte('due_date', todayStr)
    .order('priority', { ascending: false })
    .order('due_date')
    .limit(10)

  // Tareas pendientes totales por proyecto
  const { data: taskCounts } = await supabase
    .from('tasks')
    .select('project_id')
    .eq('user_id', user.id)
    .neq('status', 'done')

  const countByProject: Record<string, number> = {}
  taskCounts?.forEach(t => {
    countByProject[t.project_id] = (countByProject[t.project_id] ?? 0) + 1
  })

  return (
    <DashboardClient
      userName={profile?.name ?? ''}
      projects={projects ?? []}
      urgentTasks={urgentTasks ?? []}
      countByProject={countByProject}
    />
  )
}
