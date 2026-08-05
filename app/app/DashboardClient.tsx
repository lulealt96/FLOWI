'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { MessageCircle, Plus, ArrowRight, TrendingDown, TrendingUp, Zap } from 'lucide-react'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

interface Project { id: string; name: string; emoji: string; color: string; category: string }
interface Task    { id: string; title: string; status: string; priority: string; due_date: string | null; project_id: string }

interface Props {
  userName: string
  projects: Project[]
  urgentTasks: Task[]
  countByProject: Record<string, number>
  financeData: { income: number; expense: number } | null
  habitData: { total: number; done: number } | null
  waNumber: string
}

const PRIORITY_COLOR: Record<string, string> = {
  high: '#F06B8A', medium: '#F0A06B', low: '#6B8AF0',
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

function fmt(n: number) {
  return new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)
}

export default function DashboardClient({ userName, projects, urgentTasks, countByProject, financeData, habitData, waNumber }: Props) {
  const firstName = userName.split(' ')[0]
  const totalPending = Object.values(countByProject).reduce((s, n) => s + n, 0)
  const balance = financeData ? financeData.income - financeData.expense : null

  return (
    <>
      {/* ── CSS para breakpoints ── */}
      <style>{`
        .dashboard-wrapper { padding: 0 0 1rem; }
        .dashboard-header  { padding: 2.5rem 1.5rem 1.25rem; }
        .stat-row          { display: flex; flex-direction: column; gap: 0.75rem; padding: 0 1.5rem; margin-bottom: 1.5rem; }
        .main-grid         { display: flex; flex-direction: column; gap: 1.5rem; padding: 0 1.5rem; }
        .wa-banner         { margin: 0 1.5rem 1.5rem; }
        .wa-banner-desktop { display: none; }
        @media (min-width: 768px) {
          .dashboard-header  { padding: 2.5rem 2.5rem 1.5rem; }
          .stat-row          { flex-direction: row; padding: 0 2.5rem; }
          .stat-row > *      { flex: 1; }
          .main-grid         { flex-direction: row; padding: 0 2.5rem; align-items: flex-start; }
          .main-grid-left    { flex: 1.2; min-width: 0; }
          .main-grid-right   { flex: 1; min-width: 0; }
          .wa-banner         { display: none; }
          .wa-banner-desktop { display: block; margin: 0 2.5rem 1.5rem; }
        }
      `}</style>

      <div className="dashboard-wrapper">

        {/* Header */}
        <div className="dashboard-header">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', fontWeight: 500, marginBottom: '2px' }}>
              {greeting()}
            </p>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
              {firstName} ✦
            </h1>
          </motion.div>
        </div>

        {/* WhatsApp banner — mobile */}
        <motion.div className="wa-banner" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.5, ease: EASE }}>
          <WaBanner waNumber={waNumber} />
        </motion.div>

        {/* Stat cards */}
        {(financeData || habitData || totalPending > 0) && (
          <motion.div className="stat-row" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.5, ease: EASE }}>
            {financeData && (
              <div style={{
                background: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)',
                padding: '1.125rem', border: '1px solid var(--border-default)',
                boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.625rem' }}>
                  {balance !== null && balance >= 0
                    ? <TrendingUp size={14} color="#22C55E" />
                    : <TrendingDown size={14} color="#F06B6B" />
                  }
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Balance del mes
                  </span>
                </div>
                <p style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.03em', color: balance !== null && balance >= 0 ? '#22C55E' : '#F06B6B', lineHeight: 1 }}>
                  {balance !== null && balance < 0 ? '−' : ''} ${fmt(Math.abs(balance ?? 0))}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                  Ing. ${fmt(financeData.income)} · Gas. ${fmt(financeData.expense)}
                </p>
              </div>
            )}

            {habitData && habitData.total > 0 && (
              <div style={{
                background: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)',
                padding: '1.125rem', border: '1px solid var(--border-default)',
                boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.625rem' }}>
                  <Zap size={14} color="#F0A06B" />
                  <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Hábitos hoy
                  </span>
                </div>
                <p style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)', lineHeight: 1 }}>
                  {habitData.done}<span style={{ fontSize: '1rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>/{habitData.total}</span>
                </p>
                <div style={{ marginTop: '8px', height: '4px', borderRadius: '99px', background: 'var(--surface-secondary)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(habitData.done / habitData.total) * 100}%` }}
                    transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
                    style={{ height: '100%', borderRadius: '99px', background: '#F0A06B' }}
                  />
                </div>
              </div>
            )}

            <div style={{
              background: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)',
              padding: '1.125rem', border: '1px solid var(--border-default)',
              boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '0.625rem' }}>
                <span style={{ fontSize: '0.875rem' }}>✓</span>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Pendientes
                </span>
              </div>
              <p style={{ fontSize: '1.375rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)', lineHeight: 1 }}>
                {totalPending}
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontWeight: 500, marginLeft: '4px' }}>tareas</span>
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                {urgentTasks.length > 0 ? `${urgentTasks.length} para hoy` : 'Al día 🎉'}
              </p>
            </div>
          </motion.div>
        )}

        {/* WhatsApp banner — desktop (encima del grid) */}
        <motion.div className="wa-banner-desktop" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16, duration: 0.5, ease: EASE }}>
          <WaBanner waNumber={waNumber} />
        </motion.div>

        {/* Grid principal */}
        <div className="main-grid">

          {/* Columna izquierda — tareas urgentes */}
          <div className="main-grid-left">
            {urgentTasks.length > 0 && (
              <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5, ease: EASE }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Para hoy</h2>
                  <Link href="/app/tasks" style={{ fontSize: '0.8125rem', color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}>
                    Ver todas
                  </Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {urgentTasks.map((task, i) => {
                    const project = projects.find(p => p.id === task.project_id)
                    const date = formatDate(task.due_date)
                    return (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.24 + i * 0.05, duration: 0.3, ease: EASE }}
                        style={{
                          background: 'var(--surface-primary)', borderRadius: 'var(--radius-lg)',
                          padding: '0.875rem 1rem', border: '1px solid var(--border-default)',
                          display: 'flex', alignItems: 'center', gap: '0.75rem',
                          boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
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
              </motion.section>
            )}

            {urgentTasks.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                style={{ background: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', border: '1px solid var(--border-default)', textAlign: 'center' }}>
                <p style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>🎉</p>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>¡Todo al día!</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>No tienes tareas urgentes para hoy</p>
              </motion.div>
            )}
          </div>

          {/* Columna derecha — proyectos */}
          <div className="main-grid-right">
            <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26, duration: 0.5, ease: EASE }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Mis proyectos</h2>
                <Link href="/app/projects" style={{ fontSize: '0.8125rem', color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}>
                  Ver todos
                </Link>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                {projects.map((p, i) => {
                  const count = countByProject[p.id] ?? 0
                  return (
                    <motion.div key={p.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.04, duration: 0.3, ease: EASE }}>
                      <Link href={`/app/projects/${p.id}`} style={{ textDecoration: 'none' }}>
                        <div style={{
                          background: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)',
                          padding: '1rem', border: '1px solid var(--border-default)',
                          boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                          borderTop: `3px solid ${p.color}`,
                          minHeight: '84px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                        }}>
                          <span style={{ fontSize: '1.375rem', lineHeight: 1, display: 'block', marginBottom: '0.5rem' }}>{p.emoji}</span>
                          <div>
                            <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px', lineHeight: 1.3 }}>{p.name}</p>
                            <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                              {count === 0 ? 'Al día ✓' : `${count} pendiente${count > 1 ? 's' : ''}`}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}

                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + projects.length * 0.04, duration: 0.3, ease: EASE }}>
                  <Link href="/app/projects/new" style={{ textDecoration: 'none' }}>
                    <div style={{
                      borderRadius: 'var(--radius-xl)', padding: '1rem',
                      border: '1.5px dashed var(--border-default)',
                      minHeight: '84px', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                    }}>
                      <Plus size={18} color="var(--text-tertiary)" />
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Nuevo proyecto</p>
                    </div>
                  </Link>
                </motion.div>
              </div>
            </motion.section>
          </div>

        </div>
      </div>
    </>
  )
}

function WaBanner({ waNumber }: { waNumber: string }) {
  return (
    <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
      <div style={{
        background: 'linear-gradient(135deg, #F06B8A 0%, #c4527a 100%)',
        borderRadius: 'var(--radius-xl)', padding: '1.125rem 1.25rem',
        display: 'flex', alignItems: 'center', gap: '1rem',
        boxShadow: '0 4px 20px rgba(240,107,138,0.25)', cursor: 'pointer',
      }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <MessageCircle size={20} color="white" />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ color: 'white', fontWeight: 600, fontSize: '0.9375rem', marginBottom: '2px' }}>Escríbele a Flowi por WhatsApp</p>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8125rem' }}>Tareas, gastos y hábitos desde el chat</p>
        </div>
        <ArrowRight size={16} color="rgba(255,255,255,0.8)" />
      </div>
    </a>
  )
}
