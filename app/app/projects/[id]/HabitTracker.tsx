'use client'

import { useState, useOptimistic } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Plus, Flame, X, Check } from 'lucide-react'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const QUICK_EMOJIS = ['⚡','🏃','💪','📚','💧','🧘','🍎','😴','✍️','🎯','🌱','🔥','🎨','🎵','🧠','💊']
const QUICK_COLORS = ['#F06B8A','#6B8AF0','#F0A06B','#6BC96B','#A06BF0','#F0D06B','#6BF0D0','#F06B6B']

interface Habit {
  id: string
  name: string
  emoji: string
  color: string
}

interface Project {
  id: string
  name: string
  emoji: string
  color: string
}

function getDateKey(d: Date) {
  return d.toISOString().split('T')[0]
}

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d
  })
}

function calcStreak(logs: Set<string>, habitId: string, allLogs: { habit_id: string; date: string }[]) {
  let streak = 0
  const d = new Date()
  while (true) {
    const key = getDateKey(d)
    const done = allLogs.some(l => l.habit_id === habitId && l.date === key)
    if (!done) break
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

export default function HabitTracker({
  project,
  habits: initialHabits,
  logs: initialLogs,
}: {
  project: Project
  habits: Habit[]
  logs: { habit_id: string; date: string }[]
}) {
  const [habits, setHabits]     = useState(initialHabits)
  const [logs, setLogs]         = useState(initialLogs)
  const [showAdd, setShowAdd]   = useState(false)
  const [newName, setNewName]   = useState('')
  const [newEmoji, setNewEmoji] = useState('⚡')
  const [newColor, setNewColor] = useState(project.color)
  const [saving, setSaving]     = useState(false)
  const router = useRouter()

  const today     = getDateKey(new Date())
  const last7     = getLast7Days()
  const logSet    = new Set(logs.map(l => `${l.habit_id}::${l.date}`))

  const isDone = (habitId: string, date: string) => logSet.has(`${habitId}::${date}`)

  const toggleToday = async (habit: Habit) => {
    const supabase = createClient()
    const key = `${habit.id}::${today}`
    if (logSet.has(key)) {
      // quitar
      setLogs(prev => prev.filter(l => !(l.habit_id === habit.id && l.date === today)))
      await supabase.from('habit_logs').delete().eq('habit_id', habit.id).eq('date', today)
    } else {
      // agregar
      setLogs(prev => [...prev, { habit_id: habit.id, date: today }])
      const { data: { user } } = await supabase.auth.getUser()
      if (user) await supabase.from('habit_logs').insert({ habit_id: habit.id, user_id: user.id, date: today })
    }
  }

  const handleAdd = async () => {
    if (!newName.trim() || saving) return
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase.from('habits').insert({
      user_id:    user.id,
      project_id: project.id,
      name:       newName.trim(),
      emoji:      newEmoji,
      color:      newColor,
    }).select().single()

    if (!error && data) {
      setHabits(prev => [...prev, data])
      setNewName(''); setShowAdd(false)
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este hábito y todo su historial? Esta acción no se puede deshacer.')) return
    const supabase = createClient()
    await supabase.from('habits').delete().eq('id', id)
    setHabits(prev => prev.filter(h => h.id !== id))
  }

  const doneToday  = habits.filter(h => isDone(h.id, today)).length
  const totalToday = habits.length
  const pct        = totalToday > 0 ? Math.round((doneToday / totalToday) * 100) : 0

  return (
    <div style={{ padding: '0 0 2rem' }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(160deg, ${project.color}22 0%, transparent 60%)`,
        padding: '3rem 1.5rem 1.5rem',
        borderBottom: `1px solid ${project.color}30`,
      }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-tertiary)', fontSize: '0.875rem', fontWeight: 500, fontFamily: 'var(--font-sans)' }}
        >
          <ArrowLeft size={16} /> Proyectos
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '2.5rem', lineHeight: 1, display: 'block', marginBottom: '0.5rem' }}>{project.emoji}</span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em', marginBottom: '0.25rem' }}>
              {project.name}
            </h1>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
              {doneToday === 0 && totalToday === 0 ? 'Agrega tu primer hábito' :
               doneToday === totalToday ? '¡Todo hecho hoy! 🎉' :
               `${doneToday} de ${totalToday} hoy`}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAdd(true)}
            style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: project.color, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 12px ${project.color}50`, flexShrink: 0,
            }}
          >
            <Plus size={20} color="white" />
          </motion.button>
        </div>

        {/* Progreso del día */}
        {totalToday > 0 && (
          <div style={{ marginTop: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Hoy</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: project.color }}>{pct}%</span>
            </div>
            <div style={{ height: '6px', borderRadius: '99px', background: 'var(--border-default)', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: EASE }}
                style={{ height: '100%', borderRadius: '99px', background: project.color }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Lista de hábitos */}
      <div style={{ padding: '1rem 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {habits.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🌱</p>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>Sin hábitos aún</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Toca + para agregar el primero</p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {habits.map((habit, i) => {
            const done   = isDone(habit.id, today)
            const streak = calcStreak(logSet, habit.id, logs)

            return (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ delay: i * 0.04, duration: 0.3, ease: EASE }}
                style={{
                  background: 'var(--surface-primary)',
                  borderRadius: 'var(--radius-xl)',
                  border: `1px solid ${done ? habit.color + '60' : 'var(--border-default)'}`,
                  padding: '1rem',
                  boxShadow: done ? `0 2px 16px ${habit.color}18` : '0 1px 6px rgba(0,0,0,0.04)',
                  transition: 'all 0.25s',
                }}
              >
                {/* Fila principal */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '0.875rem' }}>
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => toggleToday(habit)}
                    style={{
                      width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                      border: `2px solid ${done ? habit.color : 'var(--border-strong)'}`,
                      background: done ? habit.color : 'transparent',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    {done
                      ? <Check size={20} color="white" strokeWidth={2.5} />
                      : <span style={{ fontSize: '1.25rem' }}>{habit.emoji}</span>
                    }
                  </motion.button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontWeight: 600, fontSize: '0.9375rem',
                      color: done ? 'var(--text-secondary)' : 'var(--text-primary)',
                      textDecoration: done ? 'line-through' : 'none',
                      marginBottom: '2px',
                    }}>{habit.name}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <Flame size={13} color={streak > 0 ? '#F0A06B' : 'var(--text-tertiary)'} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: streak > 0 ? '#F0A06B' : 'var(--text-tertiary)' }}>
                        {streak === 0 ? 'Sin racha' : `${streak} día${streak > 1 ? 's' : ''} seguido${streak > 1 ? 's' : ''}`}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(habit.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '4px', opacity: 0.5 }}
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Grid últimos 7 días */}
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                  {last7.map((d, idx) => {
                    const key  = getDateKey(d)
                    const ok   = isDone(habit.id, key)
                    const isT  = key === today
                    const label = ['D','L','M','M','J','V','S'][d.getDay()]
                    return (
                      <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                        <div style={{
                          width: '100%', aspectRatio: '1',
                          borderRadius: '6px',
                          background: ok ? habit.color : 'var(--surface-secondary)',
                          border: isT ? `2px solid ${habit.color}` : '2px solid transparent',
                          opacity: ok ? 1 : 0.5,
                          transition: 'all 0.2s',
                        }} />
                        <span style={{ fontSize: '0.5625rem', fontWeight: isT ? 700 : 400, color: isT ? habit.color : 'var(--text-tertiary)' }}>
                          {label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Modal nuevo hábito */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowAdd(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 60,
              background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '1.25rem',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: EASE }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: '400px',
                background: 'var(--surface-primary)',
                borderRadius: 'var(--radius-xl)',
                padding: '1.5rem',
                boxShadow: '0 24px 60px rgba(0,0,0,0.2)',
                maxHeight: '88vh', overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1.0625rem', color: 'var(--text-primary)' }}>Nuevo hábito</h2>
                <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Emoji */}
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Ícono</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1rem' }}>
                {QUICK_EMOJIS.map(e => (
                  <button key={e} type="button" onClick={() => setNewEmoji(e)} style={{
                    width: '38px', height: '38px', borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${newEmoji === e ? newColor : 'var(--border-default)'}`,
                    background: newEmoji === e ? `${newColor}15` : 'var(--surface-secondary)',
                    fontSize: '1.1rem', cursor: 'pointer',
                  }}>{e}</button>
                ))}
              </div>

              {/* Nombre */}
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Nombre</p>
              <input
                autoFocus
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                placeholder="Ej: Leer 20 minutos"
                style={{
                  width: '100%', height: '48px', padding: '0 1rem',
                  borderRadius: 'var(--radius-lg)',
                  border: `1.5px solid ${newName ? newColor : 'var(--border-default)'}`,
                  background: 'var(--surface-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9375rem', fontFamily: 'var(--font-sans)',
                  outline: 'none', marginBottom: '1rem', boxSizing: 'border-box',
                }}
              />

              {/* Color */}
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Color</p>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem' }}>
                {QUICK_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => setNewColor(c)} style={{
                    flex: 1, height: '28px', borderRadius: '99px',
                    background: c, border: `3px solid ${newColor === c ? 'var(--text-primary)' : 'transparent'}`,
                    cursor: 'pointer', transition: 'border 0.15s',
                  }} />
                ))}
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleAdd}
                disabled={!newName.trim() || saving}
                style={{
                  width: '100%', height: '52px',
                  borderRadius: 'var(--radius-lg)',
                  background: newName.trim() ? newColor : 'var(--border-default)',
                  color: 'white',
                  fontWeight: 600, fontSize: '1rem', fontFamily: 'var(--font-sans)',
                  border: 'none', cursor: newName.trim() ? 'pointer' : 'not-allowed',
                  boxShadow: newName.trim() ? `0 4px 16px ${newColor}40` : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {saving ? 'Guardando...' : `${newEmoji} Crear hábito`}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
