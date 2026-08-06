import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAvatarLevel } from '@/lib/areas/defaults'

const XP_PER_TASK = 5

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { taskId } = await req.json()
  if (!taskId) return NextResponse.json({ error: 'Missing taskId' }, { status: 400 })

  // Get task → project → area
  const { data: task } = await supabase
    .from('tasks')
    .select('project_id')
    .eq('id', taskId)
    .eq('user_id', user.id)
    .single()

  if (!task?.project_id) return NextResponse.json({ ok: true, xp: 0 })

  const { data: project } = await supabase
    .from('projects')
    .select('area_id')
    .eq('id', task.project_id)
    .single()

  if (!project?.area_id) return NextResponse.json({ ok: true, xp: 0 })

  // Award XP to area avatar
  const { data: avatar } = await supabase
    .from('area_avatars')
    .select('xp, level')
    .eq('user_id', user.id)
    .eq('area_id', project.area_id)
    .single()

  const currentXp = avatar?.xp ?? 0
  const newXp = currentXp + XP_PER_TASK
  const newLevel = getAvatarLevel(newXp).level
  const leveledUp = newLevel > (avatar?.level ?? 1)

  await supabase
    .from('area_avatars')
    .upsert({
      user_id: user.id,
      area_id: project.area_id,
      xp: newXp,
      level: newLevel,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,area_id' })

  // Update streak
  const todayStr = new Date().toISOString().split('T')[0]
  const { data: streak } = await supabase
    .from('streaks')
    .select('current_streak, longest_streak, last_activity_date')
    .eq('user_id', user.id)
    .single()

  if (streak) {
    const lastDate = streak.last_activity_date
    let newStreak = streak.current_streak

    if (lastDate === todayStr) {
      // Already counted today — no change
    } else {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      if (lastDate === yesterdayStr) {
        newStreak = streak.current_streak + 1
      } else {
        newStreak = 1
      }
    }

    const newLongest = Math.max(newStreak, streak.longest_streak)
    await supabase.from('streaks').update({
      current_streak: newStreak,
      longest_streak: newLongest,
      last_activity_date: todayStr,
      updated_at: new Date().toISOString(),
    }).eq('user_id', user.id)
  } else {
    await supabase.from('streaks').insert({
      user_id: user.id,
      current_streak: 1,
      longest_streak: 1,
      last_activity_date: todayStr,
    })
  }

  return NextResponse.json({ ok: true, xp: XP_PER_TASK, newXp, newLevel, leveledUp })
}
