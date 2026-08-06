import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, onboarding_completed')
    .eq('id', user.id)
    .single()

  if (!profile?.onboarding_completed) redirect('/onboarding')

  // Verificar si el usuario ya tiene áreas configuradas
  const { data: areas } = await supabase
    .from('areas')
    .select('id, name, emoji, color, order_index')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('order_index')

  // Si no tiene áreas, redirigir al setup
  if (!areas || areas.length === 0) redirect('/app/setup-areas')

  // Avatar global del usuario (Flowling)
  const { data: userAvatar } = await supabase
    .from('user_avatars')
    .select('total_xp, level, last_seen_at')
    .eq('user_id', user.id)
    .single()

  // Última evaluación por área
  const { data: evalRows } = await supabase
    .from('area_evaluations')
    .select('area_id, score, evaluated_at')
    .eq('user_id', user.id)
    .order('evaluated_at', { ascending: false })
    .order('created_at', { ascending: false })

  // Tomar solo la más reciente por área
  const latestEvalByArea: Record<string, number> = {}
  evalRows?.forEach(e => {
    if (!(e.area_id in latestEvalByArea)) latestEvalByArea[e.area_id] = e.score
  })

  // Avatares XP
  const { data: avatars } = await supabase
    .from('area_avatars')
    .select('area_id, xp, level')
    .eq('user_id', user.id)

  const xpByArea: Record<string, number> = {}
  avatars?.forEach(a => { xpByArea[a.area_id] = a.xp })

  // Top area indexes (por order_index) ordenados por XP descendente
  const topAreaIndexes = (areas ?? [])
    .map(a => ({ orderIndex: a.order_index, xp: xpByArea[a.id] ?? 0 }))
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 3)
    .map(a => a.orderIndex)

  // Racha
  const { data: streak } = await supabase
    .from('streaks')
    .select('current_streak, longest_streak')
    .eq('user_id', user.id)
    .single()

  // Tareas urgentes (hoy o vencidas)
  const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999)
  const { data: urgentTasks } = await supabase
    .from('tasks')
    .select('id, title, status, priority, due_date, project_id')
    .eq('user_id', user.id)
    .neq('status', 'done')
    .lte('due_date', todayEnd.toISOString())
    .order('priority', { ascending: false })
    .order('due_date')
    .limit(6)

  // Proyectos
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, emoji, color, area_id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('sort_order')

  // Conteo pendientes por proyecto
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
      areas={areas ?? []}
      latestEvalByArea={latestEvalByArea}
      xpByArea={xpByArea}
      streak={streak ?? { current_streak: 0, longest_streak: 0 }}
      urgentTasks={urgentTasks ?? []}
      projects={projects ?? []}
      countByProject={countByProject}
      waNumber={process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY_NUMBER ?? '15556660581'}
      userAvatar={userAvatar ?? null}
      topAreaIndexes={topAreaIndexes}
    />
  )
}
