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

  // Global Flowling avatar
  const { data: userAvatar } = await supabase
    .from('user_avatars')
    .select('total_xp, level, last_seen_at, species')
    .eq('user_id', user.id)
    .single()

  // Top area indexes for accessories
  const { data: allAvatars } = await supabase
    .from('area_avatars')
    .select('area_id, xp')
    .eq('user_id', user.id)

  const { data: allAreas } = await supabase
    .from('areas')
    .select('id, order_index')
    .eq('user_id', user.id)

  const orderByAreaId: Record<string, number> = {}
  allAreas?.forEach(a => { orderByAreaId[a.id] = a.order_index })

  const topAreaIndexes = (allAvatars ?? [])
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 3)
    .map(a => orderByAreaId[a.area_id])
    .filter(v => v !== undefined)

  // Streak
  const { data: streak } = await supabase
    .from('streaks')
    .select('current_streak')
    .eq('user_id', user.id)
    .single()

  const { data: evaluations } = await supabase
    .from('area_evaluations')
    .select('score, evaluated_at, notes')
    .eq('user_id', user.id)
    .eq('area_id', id)
    .order('evaluated_at', { ascending: false })
    .order('created_at', { ascending: false })
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
      userAvatar={userAvatar ?? null}
      species={userAvatar?.species ?? 'bloom'}
      topAreaIndexes={topAreaIndexes}
      streak={streak?.current_streak ?? 0}
    />
  )
}
