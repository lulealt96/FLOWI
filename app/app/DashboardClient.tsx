'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { MessageCircle, ArrowRight, Flame } from 'lucide-react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import AvatarStar from '@/components/AvatarStar'
import { getAvatarLevel } from '@/lib/areas/defaults'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

interface Area { id: string; name: string; emoji: string; color: string; order_index: number }
interface Project { id: string; name: string; emoji: string; color: string; area_id: string | null }
interface Task { id: string; title: string; status: string; priority: string; due_date: string | null; project_id: string }

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

export default function DashboardClient({
  userName, areas, latestEvalByArea, xpByArea,
  streak, urgentTasks, projects, countByProject, waNumber,
}: Props) {
  const firstName = userName.split(' ')[0]
  const totalPending = Object.values(countByProject).reduce((s, n) => s + n, 0)

  // Build cometa data
  const cometaData = areas.map(a => ({
    area: a.name.split(' ').slice(0, 2).join(' '),
    score: latestEvalByArea[a.id] ?? 0,
    fullMark: 100,
    color: a.color,
  }))

  const avgScore = areas.length > 0
    ? Math.round(cometaData.reduce((s, d) => s + d.score, 0) / areas.length)
    : 0

  return (
    <>
      <style>{`
        .db-wrap   { padding-bottom: 2rem; }
        .db-header { padding: 2rem 1.5rem 1rem; }
        .db-body   { padding: 0 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }
        @media (min-width: 768px) {
          .db-header { padding: 2.5rem 2.5rem 1.25rem; }
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

              {/* Streak badge */}
              {streak.current_streak > 0 && (
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 400 }}
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

            {/* Cometa chart */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.5, ease: EASE }}
              style={{
                background: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-default)',
                boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
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
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={cometaData} margin={{ top: 8, right: 20, bottom: 8, left: 20 }}>
                  <PolarGrid stroke="var(--border-default)" />
                  <PolarAngleAxis
                    dataKey="area"
                    tick={{ fontSize: 10, fill: 'var(--text-tertiary)', fontFamily: 'var(--font-sans)', fontWeight: 600 }}
                  />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#F06B8A"
                    fill="#F06B8A"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Tareas urgentes */}
            <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16, duration: 0.5, ease: EASE }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Para hoy</h2>
                <Link href="/app/tasks" style={{ fontSize: '0.8125rem', color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}>
                  Ver todas
                </Link>
              </div>

              {urgentTasks.length === 0 ? (
                <div style={{
                  background: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)',
                  padding: '1.25rem', border: '1px solid var(--border-default)', textAlign: 'center',
                }}>
                  <p style={{ fontSize: '1.5rem', marginBottom: '0.375rem' }}>🎉</p>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>¡Todo al día!</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>No tienes tareas urgentes</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {urgentTasks.map((task, i) => {
                    const project = projects.find(p => p.id === task.project_id)
                    const date = formatDate(task.due_date)
                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.05, duration: 0.3, ease: EASE }}
                        style={{
                          background: 'var(--surface-primary)', borderRadius: 'var(--radius-lg)',
                          padding: '0.875rem 1rem', border: '1px solid var(--border-default)',
                          display: 'flex', alignItems: 'center', gap: '0.75rem',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                        }}
                      >
                        <div style={{ width: '3px', height: '32px', borderRadius: '99px', background: PRIORITY_COLOR[task.priority] ?? 'var(--border-default)', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '2px' }}>
                            {task.title}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {project && <span style={{ fontSize: '0.75rem', color: project.color, fontWeight: 600 }}>{project.emoji} {project.name}</span>}
                            {date && <span style={{ fontSize: '0.75rem', color: date.color, fontWeight: 500 }}>· {date.label}</span>}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </motion.section>

            {/* WhatsApp banner */}
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.5, ease: EASE }}>
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

            {/* Stat resumen */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5, ease: EASE }}
              style={{
                background: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)',
                padding: '1.125rem', border: '1px solid var(--border-default)',
                display: 'flex', gap: '1rem',
              }}
            >
              <div style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{totalPending}</p>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 600, marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pendientes</p>
              </div>
              <div style={{ width: '1px', background: 'var(--border-default)' }} />
              <div style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-primary)', lineHeight: 1 }}>{avgScore}</p>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 600, marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Promedio</p>
              </div>
              <div style={{ width: '1px', background: 'var(--border-default)' }} />
              <div style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#F97316', lineHeight: 1 }}>{streak.current_streak}</p>
                <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 600, marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Racha</p>
              </div>
            </motion.div>

            {/* Áreas — avatares */}
            <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.5, ease: EASE }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Mis áreas</h2>
                <Link href="/app/areas" style={{ fontSize: '0.8125rem', color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}>
                  Ver todas
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {areas.map((area, i) => {
                  const xp = xpByArea[area.id] ?? 0
                  const avatarLevel = getAvatarLevel(xp)
                  const score = latestEvalByArea[area.id] ?? 0
                  const areaProjects = projects.filter(p => p.area_id === area.id)
                  const pending = areaProjects.reduce((s, p) => s + (countByProject[p.id] ?? 0), 0)

                  return (
                    <motion.div
                      key={area.id}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.22 + i * 0.04, duration: 0.3, ease: EASE }}
                    >
                      <Link href={`/app/areas/${area.id}`} style={{ textDecoration: 'none' }}>
                        <div style={{
                          background: 'var(--surface-primary)', borderRadius: 'var(--radius-lg)',
                          padding: '0.875rem 1rem', border: '1px solid var(--border-default)',
                          display: 'flex', alignItems: 'center', gap: '0.875rem',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                          borderLeft: `3px solid ${area.color}`,
                          transition: 'box-shadow 0.2s',
                        }}>
                          <AvatarStar xp={xp} color={area.color} emoji={area.emoji} size="sm" />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {area.name}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontSize: '0.6875rem', color: area.color, fontWeight: 700 }}>
                                Nv.{avatarLevel.level} · {avatarLevel.label}
                              </span>
                              {pending > 0 && (
                                <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                                  · {pending} pendiente{pending > 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <p style={{ fontSize: '1.125rem', fontWeight: 800, color: area.color, lineHeight: 1 }}>{score}</p>
                            <p style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>/ 100</p>
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
