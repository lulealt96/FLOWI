import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProjectDetailClient from './ProjectDetailClient'
import HabitTracker from './HabitTracker'
import FinanceTracker from './FinanceTracker'

function isHabitProject(name: string) {
  return /hábit|habit/i.test(name)
}

function isFinanceProject(name: string) {
  return /finanz|presupuest|gasto|budget|dinero|plata/i.test(name)
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!project) notFound()

  if (isFinanceProject(project.name)) {
    // Fetch transactions for the last 3 months
    const since = new Date()
    since.setMonth(since.getMonth() - 2)
    since.setDate(1)
    const sinceStr = since.toISOString().split('T')[0]

    const { data: transactions } = await supabase
      .from('transactions')
      .select('id, type, amount, category, description, date')
      .eq('project_id', id)
      .eq('user_id', user.id)
      .gte('date', sinceStr)
      .order('date', { ascending: false })

    return (
      <FinanceTracker
        project={project}
        transactions={transactions ?? []}
      />
    )
  }

  if (isHabitProject(project.name)) {
    // Fetch habits + logs (last 14 days)
    const since = new Date()
    since.setDate(since.getDate() - 13)
    const sinceStr = since.toISOString().split('T')[0]

    const [{ data: habits }, { data: logs }] = await Promise.all([
      supabase.from('habits').select('*').eq('project_id', id).eq('user_id', user.id).order('created_at'),
      supabase.from('habit_logs').select('habit_id, date').eq('user_id', user.id).gte('date', sinceStr),
    ])

    return (
      <HabitTracker
        project={project}
        habits={habits ?? []}
        logs={logs ?? []}
      />
    )
  }

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', id)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <ProjectDetailClient project={project} tasks={tasks ?? []} />
}
