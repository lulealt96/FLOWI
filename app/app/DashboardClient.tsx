'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { MessageCircle, Plus, ArrowRight } from 'lucide-react'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

interface Project {
  id: string
  name: string
  emoji: string
  color: string
  category: string
}

interface Task {
  id: string
  title: string
  status: string
  priority: string
  due_date: string | null
  project_id: string
}

interface Props {
  userName: string
  projects: Project[]
  urgentTasks: Task[]
  countByProject: Record<string, number>
}

const PRIORITY_COLOR: Record<string, string> = {
  high:   '#F06B8A',
  medium: '#F0A06B',
  low:    '#6B8AF0',
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Buenos días'
  if (h < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

function formatDate(iso: string | null) {
  if (!iso) return null
  const d = new Date(iso)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  if (d < today) return { label: 'Vencida', color: 'var(--status-error)' }
  if (d < tomorrow) return { label: 'Hoy', color: '#F0A06B' }
  return { label: d.toLocaleDateString('es', { day: 'numeric', month: 'short' }), color: 'var(--text-tertiary)' }
}

export default function DashboardClient({ userName, projects, urgentTasks, countByProject }: Props) {
  const firstName = userName.split(' ')[0]

  return (
    <div style={{ padding: '0 0 1rem' }}>

      {/* Header */}
      <div style={{ padding: '3rem 1.5rem 1.5rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', fontWeight: 500, marginBottom: '2px' }}>
            {greeting()}
          </p>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.025em',
            lineHeight: 1.2,
          }}>
            {firstName} ✦
          </h1>
        </motion.div>
      </div>

      {/* Banner WhatsApp */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: EASE }}
        style={{ margin: '0 1.5rem 1.5rem' }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #F06B8A 0%, #c4527a 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.25rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 4px 20px rgba(240,107,138,0.25)',
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <MessageCircle size={22} color="white" />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: 'white', fontWeight: 600, fontSize: '0.9375rem', marginBottom: '2px' }}>
              Escríbele a Flowi por WhatsApp
            </p>
            <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.8125rem' }}>
              Manda tus tareas y las clasifica sola
            </p>
          </div>
          <ArrowRight size={18} color="rgba(255,255,255,0.8)" />
        </div>
      </motion.div>

      {/* Tareas urgentes */}
      {urgentTasks.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.5, ease: EASE }}
          style={{ marginBottom: '1.75rem' }}
        >
          <div style={{ padding: '0 1.5rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Para hoy
            </h2>
            <Link href="/app/tasks" style={{ fontSize: '0.8125rem', color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}>
              Ver todas
            </Link>
          </div>

          <div style={{ padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {urgentTasks.map((task, i) => {
              const project = projects.find(p => p.id === task.project_id)
              const date = formatDate(task.due_date)
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.22 + i * 0.06, duration: 0.35, ease: EASE }}
                  style={{
                    background: 'var(--surface-primary)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '0.875rem 1rem',
                    border: '1px solid var(--border-default)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                  }}
                >
                  {/* Indicador de prioridad */}
                  <div style={{
                    width: '3px',
                    height: '32px',
                    borderRadius: '99px',
                    background: PRIORITY_COLOR[task.priority] ?? 'var(--border-default)',
                    flexShrink: 0,
                  }} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: '0.9375rem',
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      marginBottom: '2px',
                    }}>
                      {task.title}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {project && (
                        <span style={{
                          fontSize: '0.75rem',
                          color: project.color,
                          fontWeight: 600,
                        }}>
                          {project.emoji} {project.name}
                        </span>
                      )}
                      {date && (
                        <span style={{ fontSize: '0.75rem', color: date.color, fontWeight: 500 }}>
                          · {date.label}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.section>
      )}

      {/* Proyectos */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26, duration: 0.5, ease: EASE }}
      >
        <div style={{ padding: '0 1.5rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Mis proyectos
          </h2>
          <Link href="/app/projects" style={{ fontSize: '0.8125rem', color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Ver todos
          </Link>
        </div>

        {/* Grid de proyectos */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem',
          padding: '0 1.5rem',
        }}>
          {projects.map((p, i) => {
            const count = countByProject[p.id] ?? 0
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.04, duration: 0.35, ease: EASE }}
              >
                <Link href={`/app/projects/${p.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: 'var(--surface-primary)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '1.125rem 1rem',
                    border: '1px solid var(--border-default)',
                    boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                    borderTop: `3px solid ${p.color}`,
                    minHeight: '90px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}>
                    <span style={{ fontSize: '1.5rem', lineHeight: 1, display: 'block', marginBottom: '0.5rem' }}>{p.emoji}</span>
                    <div>
                      <p style={{
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        marginBottom: '2px',
                        lineHeight: 1.3,
                      }}>
                        {p.name}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                        {count === 0 ? 'Sin pendientes' : `${count} pendiente${count > 1 ? 's' : ''}`}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}

          {/* Card nueva proyecto */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + projects.length * 0.04, duration: 0.35, ease: EASE }}
          >
            <Link href="/app/projects/new" style={{ textDecoration: 'none' }}>
              <div style={{
                borderRadius: 'var(--radius-xl)',
                padding: '1.125rem 1rem',
                border: '1.5px dashed var(--border-default)',
                minHeight: '90px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
              }}>
                <Plus size={20} color="var(--text-tertiary)" />
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                  Nuevo proyecto
                </p>
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Empty state si no hay proyectos */}
        {projects.length === 0 && (
          <div style={{ padding: '2rem 1.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🌱</p>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
              Aún no tienes proyectos
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Crea tu primer proyecto o escríbele a Flowi por WhatsApp
            </p>
          </div>
        )}
      </motion.section>

    </div>
  )
}
