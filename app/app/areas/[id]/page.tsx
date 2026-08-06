import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import AreaDetailClient from './AreaDetailClient'

export default async function AreaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: area } = await supabase
    .from('areas')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!area) notFound()

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, emoji, color, sort_order')
    .eq('user_id', user.id)
    .eq('area_id', id)
    .eq('is_active', true)
    .order('sort_order')

  const { data: avatar } = await supabase
    .from('area_avatars')
    .select('xp, level')
    .eq('user_id', user.id)
    .eq('area_id', id)
    .single()

  const { data: evaluations } = await supabase
    .from('area_evaluations')
    .select('score, evaluated_at, notes')
    .eq('user_id', user.id)
    .eq('area_id', id)
    .order('evaluated_at', { ascending: false })
    .limit(6)

  // Conteo pendientes por proyecto
  const projectIds = (projects ?? []).map(p => p.id)
  let countByProject: Record<string, number> = {}
  if (projectIds.length > 0) {
    const { data: taskCounts } = await supabase
      .from('tasks')
      .select('project_id')
      .in('project_id', projectIds)
      .neq('status', 'done')
    taskCounts?.forEach(t => {
      countByProject[t.project_id] = (countByProject[t.project_id] ?? 0) + 1
    })
  }

  return (
    <AreaDetailClient
      area={area}
      projects={projects ?? []}
      avatar={avatar ?? { xp: 0, level: 1 }}
      evaluations={evaluations ?? []}
      countByProject={countByProject}
      userId={user.id}
    />
  )
}
