'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Link from 'next/link'
import { MessageCircle, ArrowRight, Flame, CheckCircle, Circle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import Flowling, { type FlowlingEmotion } from '@/components/Flowling'
import { getFlowlingLevel } from '@/lib/areas/defaults'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

interface Area    { id: string; name: string; emoji: string; color: string; order_index: number }
interface Project { id: string; name: string; emoji: string; color: string; area_id: string | null }
interface Task    { id: string; title: string; status: string; priority: string; due_date: string | null; project_id: string }

interface Props {
  userName: string
  areas: Area[]
  latestEvalByArea: Record<string, number>
  xpByArea: Record<string, number>
  streak: { current_streak: number; longest_streak: number }
  urgentTasks: Task[]
  projects: Project[]
  countByProject: Record<string, number>
  waNumber: string
  userAvatar: { total_xp: number; level: number; last_seen_at: string } | null
  species: string
  topAreaIndexes: number[]
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

function formatDate(iso: string | null) {
  if (!iso) return null
  const d = iso.includes('T') ? new Date(iso) : new Date(iso + 'T00:00:00')
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  if (d < today)    return { label: 'Vencida', color: 'var(--status-error)' }
  if (d < tomorrow) return { label: 'Hoy',     color: '#F0A06B' }
  return { label: d.toLocaleDateString('es', { day: 'numeric', month: 'short' }), color: 'var(--text-tertiary)' }
}

const PRIORITY_COLOR: Record<string, string> = {
  high: '#F06B8A', medium: '#F0A06B', low: '#6B8AF0',
}

function computeEmotion(
  lastSeenAt: string | null | undefined,
  streak: number,
): FlowlingEmotion {
  if (!lastSeenAt) return 'encouraging'
  const todayStr    = new Date().toISOString().split('T')[0]
  const lastDateStr = new Date(lastSeenAt).toISOString().split('T')[0]
  const daysSince   = Math.floor((Date.now() - new Date(lastSeenAt).getTime()) / 86_400_000)
  if (daysSince >= 2)        return 'sleeping'
  if (lastDateStr === todayStr && streak >= 3) return 'celebrating'
  if (lastDateStr === todayStr) return 'happy'
  return 'encouraging'
}

function flowlingMessage(emotion: FlowlingEmotion, name: string): string {
  switch (emotion) {
    case 'celebrating':  return `¡${name}, estás en racha! 🔥`
    case 'sleeping':     return `Hace un rato no trabajamos juntos. ¿Volvemos?`
    case 'encouraging':  return `¿Intentamos una tarea pequeñita hoy?`
    default:             return `Tu Flowling está listo para crecer contigo.`
  }
}

export default function DashboardClient({
  userName, areas, latestEvalByArea, xpByArea,
  streak, urgentTasks, projects, countByProject, waNumber,
  userAvatar, species, topAreaIndexes,
}: Props) {
  const firstName    = userName.split(' ')[0]
  const totalPending = Object.values(countByProject).reduce((s, n) => s + n, 0)
  const totalXp      = userAvatar?.total_xp ?? 0
  const flowlingLvl  = getFlowlingLevel(totalXp)
  const emotion      = computeEmotion(userAvatar?.last_seen_at, streak.current_streak)

  const [localUrgent, setLocalUrgent] = useState(urgentTasks)
  const [toggling, setToggling] = useState<string | null>(null)

  const toggleUrgent = async (task: Task) => {
    if (toggling) return
    setToggling(task.id)
    setLocalUrgent(prev => prev.filter(t => t.id !== task.id))
    await createClient().from('tasks').update({ status: 'done' }).eq('id', task.id)
    fetch('/api/xp/award', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: task.id }),
    }).catch(() => {})
    setToggling(null)
  }

  const cometaData = areas.map(a => ({
    area:     a.name.split(' ').slice(0, 2).join(' '),
    score:    latestEvalByArea[a.id] ?? 0,
    fullMark: 100,
  }))

  const avgScore = areas.length > 0
    ? Math.round(cometaData.reduce((s, d) => s + d.score, 0) / areas.length)
    : 0

  return (
    <>
      <style>{`
        .db-wrap   { padding-bottom: 2rem; }
        .db-header { padding: 1.75rem 1.5rem 0.75rem; }
        .db-body   { padding: 0 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
        @media (min-width: 768px) {
          .db-header { padding: 2.25rem 2.5rem 1rem; }
          .db-body   { padding: 0 2.5rem; flex-direction: row; align-items: flex-start; gap: 2rem; }
          .db-left   { flex: 1.1; min-width: 0; display: flex; flex-direction: column; gap: 1.5rem; }
          .db-right  { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1.5rem; }
        }
      `}</style>

      <div className="db-wrap">

        {/* Header */}
        <div className="db-header">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', fontWeight: 500, marginBottom: '2px' }}>
                  {greeting()}
                </p>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                  {firstName} ✦
                </h1>
              </div>
              {streak.current_streak > 0 && (
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 400 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    background: 'linear-gradient(135deg, #F97316, #EF4444)',
                    borderRadius: '24px', padding: '0.5rem 0.875rem',
                    boxShadow: '0 4px 12px rgba(249,115,22,0.3)',
                  }}
                >
                  <Flame size={16} color="white" />
                  <span style={{ color: 'white', fontWeight: 800, fontSize: '1rem' }}>{streak.current_streak}</span>
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', fontWeight: 500 }}>días</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        <div className="db-body">

          {/* ── COLUMNA IZQUIERDA ── */}
          <div className="db-left">

            {/* Flowling hero card */}
            <motion.div
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06, duration: 0.5, ease: EASE }}
              style={{
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-default)',
                padding: '1.25rem',
                display: 'flex', alignItems: 'center', gap: '1.25rem',
                boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* Ambiente background */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/assets/Flowlings/bloom/Ambiente/ambiente_bloom.png"
                alt=""
                draggable={false}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', userSelect: 'none', pointerEvents: 'none' }}
              />
              {/* Overlay para legibilidad del texto */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'linear-gradient(90deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.72) 45%, rgba(255,255,255,0.88) 100%)',
              }} />

              <div style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>
                <Flowling
                  totalXp={totalXp}
                  species={species}
                  topAreaIndexes={topAreaIndexes}
                  streak={streak.current_streak}
                  emotion={emotion}
                  size="md"
                />
              </div>

              <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                    {flowlingLvl.label}
                  </p>
                  <span style={{
                    fontSize: '0.6875rem', fontWeight: 700, padding: '1px 7px',
                    borderRadius: '99px', background: 'var(--surface-secondary)',
                    color: 'var(--text-tertiary)', border: '1px solid var(--border-default)',
                  }}>
                    Nv. {flowlingLvl.level}
                  </span>
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '0.75rem' }}>
                  {flowlingMessage(emotion, firstName)}
                </p>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '4px' }}>
                  {totalXp} XP totales
                </p>
                {/* Mini XP bar */}
                <div style={{ height: '4px', borderRadius: '99px', background: 'var(--surface-secondary)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (totalXp / (totalXp + 50)) * 100)}%` }}
                    transition={{ duration: 1.2, ease: EASE, delay: 0.4 }}
                    style={{ height: '100%', borderRadius: '99px', background: '#1EA86B' }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Cometa chart */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.5, ease: EASE }}
              style={{
                background: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-default)', boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '1.125rem 1.25rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Tu Cometa de Vida
                  </p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-primary)', lineHeight: 1 }}>
                    {avgScore}<span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>/100</span>
                  </p>
                </div>
                <Link href="/app/areas" style={{ fontSize: '0.8125rem', color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}>
                  Ver áreas →
                </Link>
              </div>
              {cometaData.length === 0 ? (
                <div style={{ height: 180, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌟</p>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem', marginBottom: '4px' }}>Tu cometa de vida aparecerá aquí</p>
                  <Link href="/app/areas" style={{ fontSize: '0.875rem', color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}>
                    Evalúa tus áreas →
                  </Link>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={cometaData} margin={{ top: 8, right: 20, bottom: 8, left: 20 }}>
                    <PolarGrid stroke="var(--border-default)" />
                    <PolarAngleAxis
                      dataKey="area"
                      tick={{ fontSize: 10, fill: 'var(--text-tertiary)', fontFamily: 'var(--font-sans)', fontWeight: 600 }}
                    />
                    <Radar name="Score" dataKey="score" stroke="#F06B8A" fill="#F06B8A" fillOpacity={0.15} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            {/* Tareas urgentes */}
            <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.5, ease: EASE }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Para hoy</h2>
                <Link href="/app/tasks" style={{ fontSize: '0.8125rem', color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}>Ver todas</Link>
              </div>
              {localUrgent.length === 0 ? (
                <div style={{ background: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)', padding: '1.25rem', border: '1px solid var(--border-default)', textAlign: 'center' }}>
                  <p style={{ fontSize: '1.5rem', marginBottom: '0.375rem' }}>🎉</p>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>¡Todo al día!</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>No tienes tareas urgentes</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {localUrgent.map((task, i) => {
                    const project = projects.find(p => p.id === task.project_id)
                    const date    = formatDate(task.due_date)
                    return (
                      <motion.div key={task.id}
                        initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 24 }}
                        transition={{ delay: 0.22 + i * 0.05, duration: 0.3, ease: EASE }}
                        style={{
                          background: 'var(--surface-primary)', borderRadius: 'var(--radius-lg)',
                          padding: '0.875rem 1rem', border: '1px solid var(--border-default)',
                          display: 'flex', alignItems: 'center', gap: '0.75rem',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                        }}
                      >
                        <button
                          onClick={() => toggleUrgent(task)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, color: 'var(--border-strong)' }}
                        >
                          <Circle size={22} />
                        </button>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '2px' }}>
                            {task.title}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {project && <span style={{ fontSize: '0.75rem', color: project.color, fontWeight: 600 }}>{project.emoji} {project.name}</span>}
                            {date && <span style={{ fontSize: '0.75rem', color: date.color, fontWeight: 500 }}>· {date.label}</span>}
                          </div>
                        </div>
                        <div style={{ width: '3px', height: '32px', borderRadius: '99px', background: PRIORITY_COLOR[task.priority] ?? 'var(--border-default)', flexShrink: 0 }} />
                      </motion.div>
                    )
                  })}
                </div>
                </AnimatePresence>
              )}
            </motion.section>

            {/* WhatsApp banner */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24, duration: 0.5, ease: EASE }}>
              <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #F06B8A 0%, #c4527a 100%)',
                  borderRadius: 'var(--radius-xl)', padding: '1rem 1.25rem',
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  boxShadow: '0 4px 16px rgba(240,107,138,0.25)',
                }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MessageCircle size={18} color="white" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', marginBottom: '1px' }}>Escríbele a Flowi</p>
                    <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem' }}>Tareas, gastos y hábitos desde WhatsApp</p>
                  </div>
                  <ArrowRight size={16} color="rgba(255,255,255,0.8)" />
                </div>
              </a>
            </motion.div>
          </div>

          {/* ── COLUMNA DERECHA ── */}
          <div className="db-right">

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5, ease: EASE }}
              style={{
                background: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)',
                padding: '1.125rem', border: '1px solid var(--border-default)',
                display: 'flex', gap: '1rem',
              }}
            >
              {[
                { value: totalPending, label: 'Pendientes', color: 'var(--text-primary)' },
                { value: avgScore,     label: 'Promedio',   color: 'var(--brand-primary)' },
                { value: streak.current_streak, label: 'Racha', color: '#F97316' },
              ].map((stat, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                  {i > 0 && (
                    <div style={{ position: 'absolute', left: 0, top: '10%', bottom: '10%', width: '1px', background: 'var(--border-default)' }} />
                  )}
                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + i * 0.08 }}
                    style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color, lineHeight: 1 }}
                  >
                    {stat.value}
                  </motion.p>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 600, marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>

            {/* Áreas */}
            <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.5, ease: EASE }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Mis áreas</h2>
                <Link href="/app/areas" style={{ fontSize: '0.8125rem', color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}>Ver todas</Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {areas.map((area, i) => {
                  const score   = latestEvalByArea[area.id] ?? 0
                  const pending = projects.filter(p => p.area_id === area.id)
                    .reduce((s, p) => s + (countByProject[p.id] ?? 0), 0)
                  const xp      = xpByArea[area.id] ?? 0
                  const isTop   = topAreaIndexes[0] === area.order_index

                  return (
                    <motion.div key={area.id}
                      initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.22 + i * 0.04, duration: 0.3, ease: EASE }}
                    >
                      <Link href={`/app/areas/${area.id}`} style={{ textDecoration: 'none' }}>
                        <div style={{
                          background: 'var(--surface-primary)', borderRadius: 'var(--radius-lg)',
                          padding: '0.75rem 1rem', border: '1px solid var(--border-default)',
                          display: 'flex', alignItems: 'center', gap: '0.75rem',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                          borderLeft: `3px solid ${area.color}`,
                        }}>
                          {/* Emoji badge */}
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                            background: `${area.color}18`, border: `1.5px solid ${area.color}35`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem',
                          }}>
                            {area.emoji}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {area.name}
                              </p>
                              {isTop && (
                                <span style={{ fontSize: '0.5625rem', fontWeight: 700, color: area.color, background: `${area.color}18`, padding: '1px 5px', borderRadius: '4px', flexShrink: 0 }}>
                                  ★ TOP
                                </span>
                              )}
                            </div>
                            <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                              {xp} XP · {pending > 0 ? `${pending} pendiente${pending > 1 ? 's' : ''}` : 'Al día ✓'}
                            </p>
                          </div>

                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <p style={{ fontSize: '1.125rem', fontWeight: 800, color: area.color, lineHeight: 1 }}>{score}</p>
                            <p style={{ fontSize: '0.5625rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>/100</p>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            </motion.section>

          </div>
        </div>
      </div>
    </>
  )
}
