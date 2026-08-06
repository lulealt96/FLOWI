'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle, Circle, X } from 'lucide-react'
import DatePicker from '@/components/DatePicker'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

type Status   = 'todo' | 'in_progress' | 'done'
type Priority = 'low' | 'medium' | 'high'

interface Task {
  id: string
  title: string
  status: Status
  priority: Priority
  due_date: string | null
  notes: string | null
  project_id: string | null
}

interface Project { id: string; name: string; emoji: string; color: string }

const PRIORITY_COLOR: Record<Priority, string> = {
  high: '#F06B8A', medium: '#F0A06B', low: '#6B8AF0',
}
const PRIORITY_LABEL: Record<Priority, string> = {
  high: 'Alta', medium: 'Media', low: 'Baja',
}

const STATUS_TABS: { key: Status | 'all'; label: string }[] = [
  { key: 'all',         label: 'Todas'      },
  { key: 'todo',        label: 'Pendientes' },
  { key: 'in_progress', label: 'En curso'   },
  { key: 'done',        label: 'Hechas'     },
]

function formatDate(iso: string | null) {
  if (!iso) return null
  // Date-only strings (no T) must be parsed as local time, not UTC
  const d = iso.includes('T') ? new Date(iso) : new Date(iso + 'T00:00:00')
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  if (d < today)    return { label: 'Vencida', color: 'var(--status-error)' }
  if (d < tomorrow) return { label: 'Hoy',     color: '#F0A06B' }
  return { label: d.toLocaleDateString('es', { day: 'numeric', month: 'short' }), color: 'var(--text-tertiary)' }
}

export default function TasksClient({ tasks: initial, projects }: { tasks: Task[]; projects: Project[] }) {
  const [tasks, setTasks]       = useState(initial)
  const [tab, setTab]           = useState<Status | 'all'>('all')
  const [toggling, setToggling] = useState<string | null>(null)

  const [editTask, setEditTask]         = useState<Task | null>(null)
  const [editTitle, setEditTitle]       = useState('')
  const [editPriority, setEditPriority] = useState<Priority>('medium')
  const [editDate, setEditDate]         = useState('')
  const [editTime, setEditTime]         = useState('')
  const [editNotes, setEditNotes]       = useState('')
  const [editSaving, setEditSaving]     = useState(false)

  const projectMap = Object.fromEntries(projects.map(p => [p.id, p]))

  const filtered = tab === 'all' ? tasks : tasks.filter(t => t.status === tab)

  const toggleDone = async (task: Task) => {
    if (toggling) return
    setToggling(task.id)
    const next: Status = task.status === 'done' ? 'todo' : 'done'
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: next } : t))
    await createClient().from('tasks').update({ status: next }).eq('id', task.id)
    if (next === 'done') {
      fetch('/api/xp/award', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id }),
      }).catch(() => {})
    }
    setToggling(null)
  }

  const openEdit = (task: Task) => {
    setEditTask(task)
    setEditTitle(task.title)
    setEditPriority(task.priority)
    if (task.due_date) {
      const d = task.due_date.includes('T') ? new Date(task.due_date) : new Date(task.due_date + 'T00:00:00')
      setEditDate(d.toISOString().split('T')[0])
      setEditTime(task.due_date.includes('T') ? task.due_date.split('T')[1].slice(0, 5) : '')
    } else {
      setEditDate(''); setEditTime('')
    }
    setEditNotes(task.notes ?? '')
  }

  const handleEditSave = async () => {
    if (!editTask || !editTitle.trim() || editSaving) return
    setEditSaving(true)
    const supabase = createClient()
    const dueDate = editDate
      ? (editTime ? `${editDate}T${editTime}:00` : `${editDate}T00:00:00`)
      : null
    const { error } = await supabase.from('tasks').update({
      title:    editTitle.trim(),
      priority: editPriority,
      due_date: dueDate,
      notes:    editNotes.trim() || null,
    }).eq('id', editTask.id)
    if (!error) {
      setTasks(prev => prev.map(t => t.id === editTask.id
        ? { ...t, title: editTitle.trim(), priority: editPriority, due_date: dueDate, notes: editNotes.trim() || null }
        : t
      ))
      setEditTask(null)
    }
    setEditSaving(false)
  }

  const handleEditDelete = async () => {
    if (!editTask) return
    const supabase = createClient()
    await supabase.from('tasks').delete().eq('id', editTask.id)
    setTasks(prev => prev.filter(t => t.id !== editTask.id))
    setEditTask(null)
  }

  const accentColor = editTask?.project_id ? (projectMap[editTask.project_id]?.color ?? 'var(--brand-primary)') : 'var(--brand-primary)'

  return (
    <div style={{ padding: '0 0 2rem' }}>
      {/* Header */}
      <div style={{ padding: '3rem 1.5rem 1rem' }}>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontWeight: 500, marginBottom: '2px' }}>Tu lista</p>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
          Tareas
        </h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', padding: '0 1.5rem', marginBottom: '1.25rem', overflowX: 'auto' }}>
        {STATUS_TABS.map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '6px 14px', borderRadius: '99px',
            border: `1.5px solid ${tab === key ? 'var(--brand-primary)' : 'var(--border-default)'}`,
            background: tab === key ? 'rgba(240,107,138,0.08)' : 'var(--surface-primary)',
            color: tab === key ? 'var(--brand-primary)' : 'var(--text-tertiary)',
            fontSize: '0.8125rem', fontWeight: 600,
            cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'var(--font-sans)',
          }}>{label}</button>
        ))}
      </div>

      {/* Lista */}
      <div style={{ padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <AnimatePresence initial={false}>
          {filtered.map((task, i) => {
            const project = task.project_id ? projectMap[task.project_id] : null
            const date = formatDate(task.due_date)
            const done = task.status === 'done'
            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 24 }}
                transition={{ delay: i * 0.03, duration: 0.3, ease: EASE }}
                onClick={() => openEdit(task)}
                style={{
                  background: 'var(--surface-primary)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '0.875rem 1rem',
                  border: '1px solid var(--border-default)',
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                  opacity: done ? 0.55 : 1,
                  transition: 'opacity 0.2s',
                  cursor: 'pointer',
                }}
              >
                <button
                  onClick={e => { e.stopPropagation(); toggleDone(task) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, color: done ? 'var(--brand-primary)' : 'var(--border-strong)' }}
                >
                  {done ? <CheckCircle size={22} /> : <Circle size={22} />}
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: '0.9375rem', fontWeight: 500,
                    color: 'var(--text-primary)',
                    textDecoration: done ? 'line-through' : 'none',
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    marginBottom: '2px',
                  }}>{task.title}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {project && <span style={{ fontSize: '0.75rem', color: project.color, fontWeight: 600 }}>{project.emoji} {project.name}</span>}
                    {date && <span style={{ fontSize: '0.75rem', color: date.color, fontWeight: 500 }}>{project ? '· ' : ''}{date.label}</span>}
                  </div>
                </div>
                {!done && task.priority && (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: PRIORITY_COLOR[task.priority] ?? 'var(--border-default)', flexShrink: 0 }} />
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✅</p>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
              {tab === 'done' ? 'Aún no has completado tareas' : 'Sin tareas aquí'}
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Escríbele a Flowi por WhatsApp para agregar tareas
            </p>
          </div>
        )}
      </div>

      {/* Modal editar tarea */}
      <AnimatePresence>
        {editTask && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setEditTask(null)}
            style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: EASE }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: '400px', background: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', boxShadow: '0 24px 60px rgba(0,0,0,0.2)', maxHeight: '88vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Editar tarea</h2>
                <button onClick={() => setEditTask(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}><X size={20} /></button>
              </div>

              <input
                autoFocus
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                placeholder="¿Qué hay que hacer?"
                style={{ width: '100%', height: '52px', padding: '0 1rem', borderRadius: 'var(--radius-lg)', border: `1.5px solid ${accentColor}`, background: 'var(--surface-secondary)', color: 'var(--text-primary)', fontSize: '1rem', fontFamily: 'var(--font-sans)', outline: 'none', marginBottom: '1rem', boxSizing: 'border-box' }}
              />

              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Prioridad</p>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                {(['high', 'medium', 'low'] as Priority[]).map(p => (
                  <button key={p} onClick={() => setEditPriority(p)} style={{ flex: 1, height: '40px', borderRadius: 'var(--radius-md)', border: `1.5px solid ${editPriority === p ? PRIORITY_COLOR[p] : 'var(--border-default)'}`, background: editPriority === p ? `${PRIORITY_COLOR[p]}15` : 'var(--surface-secondary)', color: editPriority === p ? PRIORITY_COLOR[p] : 'var(--text-tertiary)', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>{PRIORITY_LABEL[p]}</button>
                ))}
              </div>

              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Fecha y hora <span style={{ fontWeight: 400, textTransform: 'none' }}>(opcional)</span></p>
              <div style={{ marginBottom: '1rem', padding: '0.875rem', background: 'var(--surface-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)' }}>
                <DatePicker date={editDate} time={editTime} onChangeDate={setEditDate} onChangeTime={setEditTime} accentColor={accentColor} />
              </div>

              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Notas <span style={{ fontWeight: 400, textTransform: 'none' }}>(opcional)</span></p>
              <textarea
                value={editNotes}
                onChange={e => setEditNotes(e.target.value)}
                placeholder="Ideas, contexto, detalles..."
                rows={2}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-default)', background: 'var(--surface-secondary)', color: 'var(--text-primary)', fontSize: '0.9375rem', fontFamily: 'var(--font-sans)', outline: 'none', resize: 'none', marginBottom: '1.25rem', boxSizing: 'border-box', lineHeight: 1.5 }}
                onFocus={e => (e.target.style.borderColor = accentColor)}
                onBlur={e => (e.target.style.borderColor = 'var(--border-default)')}
              />

              <motion.button whileTap={{ scale: 0.97 }} onClick={handleEditSave} disabled={!editTitle.trim() || editSaving}
                style={{ width: '100%', height: '52px', borderRadius: 'var(--radius-lg)', background: editTitle.trim() ? accentColor : 'var(--border-default)', color: 'white', fontWeight: 600, fontSize: '1rem', fontFamily: 'var(--font-sans)', border: 'none', cursor: editTitle.trim() ? 'pointer' : 'not-allowed', marginBottom: '0.75rem' }}>
                {editSaving ? 'Guardando...' : 'Guardar cambios'}
              </motion.button>

              <button onClick={handleEditDelete}
                style={{ width: '100%', height: '44px', borderRadius: 'var(--radius-lg)', background: 'none', color: 'var(--status-error)', fontWeight: 600, fontSize: '0.9375rem', fontFamily: 'var(--font-sans)', border: '1.5px solid var(--status-error)', cursor: 'pointer' }}>
                Eliminar tarea
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
