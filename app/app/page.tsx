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

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, emoji, color, category')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('sort_order')

  const allProjects = projects ?? []

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
    .limit(8)

  // Conteo de pendientes por proyecto
  const { data: taskCounts } = await supabase
    .from('tasks')
    .select('project_id')
    .eq('user_id', user.id)
    .neq('status', 'done')

  const countByProject: Record<string, number> = {}
  taskCounts?.forEach(t => {
    countByProject[t.project_id] = (countByProject[t.project_id] ?? 0) + 1
  })

  // Balance financiero del mes
  const financeProject = allProjects.find(p => /finanz|presupuest|gasto|budget|dinero|plata/i.test(p.name))
  let financeData: { income: number; expense: number } | null = null
  if (financeProject) {
    const now = new Date()
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    const { data: txs } = await supabase
      .from('transactions')
      .select('type, amount')
      .eq('project_id', financeProject.id)
      .gte('date', monthStart)
    if (txs) {
      financeData = {
        income:  txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      }
    }
  }

  // Progreso de hábitos de hoy
  const habitProject = allProjects.find(p => /hábit|habit/i.test(p.name))
  let habitData: { total: number; done: number } | null = null
  if (habitProject) {
    const todayDate = new Date().toISOString().split('T')[0]
    const [{ data: habits }, { data: logs }] = await Promise.all([
      supabase.from('habits').select('id').eq('project_id', habitProject.id).eq('user_id', user.id),
      supabase.from('habit_logs').select('id').eq('user_id', user.id).eq('date', todayDate),
    ])
    if (habits) habitData = { total: habits.length, done: logs?.length ?? 0 }
  }

  return (
    <DashboardClient
      userName={profile?.name ?? ''}
      projects={allProjects}
      urgentTasks={urgentTasks ?? []}
      countByProject={countByProject}
      financeData={financeData}
      habitData={habitData}
      waNumber={process.env.NEXT_PUBLIC_WHATSAPP_DISPLAY_NUMBER ?? '15556660581'}
    />
  )
}
