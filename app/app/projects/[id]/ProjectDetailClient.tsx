'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Plus, CheckCircle, Circle, X, Settings } from 'lucide-react'
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
  section: string | null
}

interface Project {
  id: string
  name: string
  emoji: string
  color: string
  category: string
}

const PRIORITY_COLOR: Record<Priority, string> = {
  high: '#F06B8A', medium: '#F0A06B', low: '#6B8AF0',
}
const PRIORITY_LABEL: Record<Priority, string> = {
  high: 'Alta', medium: 'Media', low: 'Baja',
}

const PROJECT_COLORS = [
  '#F06B8A','#F0A06B','#6B8AF0','#22C55E','#A06BF0',
  '#F0D06B','#6BD4F0','#F06B6B','#10B981','#8B5CF6',
]

function formatDate(iso: string | null) {
  if (!iso) return null
  const d = iso.includes('T') ? new Date(iso) : new Date(iso + 'T00:00:00')
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  if (d < today)    return { label: 'Vencida', color: 'var(--status-error)' }
  if (d < tomorrow) return { label: 'Hoy',     color: '#F0A06B' }
  return { label: d.toLocaleDateString('es', { day: 'numeric', month: 'short' }), color: 'var(--text-tertiary)' }
}

function groupBySection(tasks: Task[]): Array<{ section: string | null; tasks: Task[] }> {
  const map = new Map<string, Task[]>()
  const NO_SECTION = '__none__'
  for (const t of tasks) {
    const key = t.section?.trim() || NO_SECTION
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(t)
  }
  const result: Array<{ section: string | null; tasks: Task[] }> = []
  map.forEach((tasks, key) => {
    result.push({ section: key === NO_SECTION ? null : key, tasks })
  })
  // sections with name first, then no-section
  return result.sort((a, b) => {
    if (a.section === null) return 1
    if (b.section === null) return -1
    return a.section.localeCompare(b.section)
  })
}

export default function ProjectDetailClient({ project: initialProject, tasks: initial }: { project: Project; tasks: Task[] }) {
  const [project, setProject]   = useState(initialProject)
  const [tasks, setTasks]       = useState(initial)
  const [showAdd, setShowAdd]   = useState(false)
  const [filter, setFilter]     = useState<Status | 'all'>('all')
  const [toggling, setToggling] = useState<string | null>(null)
  const router = useRouter()

  // ── Add task state ──────────────────────────────────────────────
  const [newTitle, setNewTitle]       = useState('')
  const [newPriority, setNewPriority] = useState<Priority>('medium')
  const [newDate, setNewDate]         = useState('')
  const [newTime, setNewTime]         = useState('')
  const [newNotes, setNewNotes]       = useState('')
  const [newSection, setNewSection]   = useState('')
  const [saving, setSaving]           = useState(false)

  // ── Edit task state ─────────────────────────────────────────────
  const [editTask, setEditTask]         = useState<Task | null>(null)
  const [editTitle, setEditTitle]       = useState('')
  const [editPriority, setEditPriority] = useState<Priority>('medium')
  const [editDate, setEditDate]         = useState('')
  const [editTime, setEditTime]         = useState('')
  const [editNotes, setEditNotes]       = useState('')
  const [editSection, setEditSection]   = useState('')
  const [editSaving, setEditSaving]     = useState(false)

  // ── Edit project state ──────────────────────────────────────────
  const [showEditProject, setShowEditProject]   = useState(false)
  const [editProjName, setEditProjName]         = useState('')
  const [editProjEmoji, setEditProjEmoji]       = useState('')
  const [editProjColor, setEditProjColor]       = useState('')
  const [editProjSaving, setEditProjSaving]     = useState(false)

  const pending = tasks.filter(t => t.status !== 'done').length
  const done    = tasks.filter(t => t.status === 'done').length
  const pct     = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)
  const grouped  = groupBySection(filtered)
  const hasSections = filtered.some(t => t.section?.trim())

  // Unique sections for autocomplete
  const allSections = [...new Set(tasks.map(t => t.section?.trim()).filter(Boolean))] as string[]

  // ── Handlers ────────────────────────────────────────────────────
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

  const handleAdd = async () => {
    if (!newTitle.trim() || saving) return
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const dueDate = newDate ? (newTime ? `${newDate}T${newTime}:00` : `${newDate}T23:59:00`) : null
    const { data, error } = await supabase.from('tasks').insert({
      user_id:    user.id,
      project_id: project.id,
      title:      newTitle.trim(),
      priority:   newPriority,
      status:     'todo',
      due_date:   dueDate,
      notes:      newNotes.trim() || null,
      section:    newSection.trim() || null,
    }).select().single()

    if (!error && data) {
      if (dueDate && newTime) {
        await supabase.from('reminders').insert({
          user_id: user.id, task_id: data.id,
          title: newTitle.trim(), remind_at: dueDate, status: 'pending',
        })
      }
      setTasks(prev => [data, ...prev])
      setNewTitle(''); setNewPriority('medium')
      setNewDate(''); setNewTime(''); setNewNotes(''); setNewSection('')
      setShowAdd(false)
    }
    setSaving(false)
  }

  const openEdit = (task: Task) => {
    setEditTask(task)
    setEditTitle(task.title)
    setEditPriority(task.priority)
    setEditSection(task.section ?? '')
    setEditNotes(task.notes ?? '')
    if (task.due_date) {
      const d = task.due_date.includes('T') ? new Date(task.due_date) : new Date(task.due_date + 'T00:00:00')
      setEditDate(d.toISOString().split('T')[0])
      setEditTime(task.due_date.includes('T') ? task.due_date.split('T')[1].slice(0, 5) : '')
    } else { setEditDate(''); setEditTime('') }
  }

  const handleEditSave = async () => {
    if (!editTask || !editTitle.trim() || editSaving) return
    setEditSaving(true)
    const dueDate = editDate ? (editTime ? `${editDate}T${editTime}:00` : `${editDate}T00:00:00`) : null
    const { error } = await createClient().from('tasks').update({
      title: editTitle.trim(), priority: editPriority,
      due_date: dueDate, notes: editNotes.trim() || null,
      section: editSection.trim() || null,
    }).eq('id', editTask.id)
    if (!error) {
      setTasks(prev => prev.map(t => t.id === editTask.id
        ? { ...t, title: editTitle.trim(), priority: editPriority, due_date: dueDate, notes: editNotes.trim() || null, section: editSection.trim() || null }
        : t
      ))
      setEditTask(null)
    }
    setEditSaving(false)
  }

  const handleEditDelete = async () => {
    if (!editTask) return
    if (!confirm('¿Eliminar esta tarea? Esta acción no se puede deshacer.')) return
    await createClient().from('tasks').delete().eq('id', editTask.id)
    setTasks(prev => prev.filter(t => t.id !== editTask.id))
    setEditTask(null)
  }

  const openEditProject = () => {
    setEditProjName(project.name)
    setEditProjEmoji(project.emoji)
    setEditProjColor(project.color)
    setShowEditProject(true)
  }

  const handleProjectSave = async () => {
    if (!editProjName.trim() || editProjSaving) return
    setEditProjSaving(true)
    const { error } = await createClient().from('projects').update({
      name: editProjName.trim(),
      emoji: editProjEmoji.trim() || project.emoji,
      color: editProjColor,
    }).eq('id', project.id)
    if (!error) {
      setProject(p => ({ ...p, name: editProjName.trim(), emoji: editProjEmoji.trim() || p.emoji, color: editProjColor }))
      setShowEditProject(false)
    }
    setEditProjSaving(false)
  }

  const handleProjectDelete = async () => {
    if (!confirm('¿Eliminar este proyecto y todas sus tareas? Esta acción no se puede deshacer.')) return
    await createClient().from('projects').update({ is_active: false }).eq('id', project.id)
    router.push('/app/projects')
  }

  return (
    <div style={{ padding: '0 0 2rem' }}>

      {/* Header */}
      <div style={{
        background: `linear-gradient(160deg, ${project.color}22 0%, transparent 60%)`,
        padding: '3rem 1.5rem 1.5rem',
        borderBottom: `1px solid ${project.color}30`,
      }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-tertiary)', fontSize: '0.875rem', fontWeight: 500, fontFamily: 'var(--font-sans)' }}>
          <ArrowLeft size={16} /> Proyectos
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '2.5rem', lineHeight: 1, display: 'block', marginBottom: '0.5rem' }}>{project.emoji}</span>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em', marginBottom: '0.25rem' }}>{project.name}</h1>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
              {pending === 0 ? 'Todo al día ✓' : `${pending} pendiente${pending > 1 ? 's' : ''}`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
            {/* Editar proyecto */}
            <motion.button whileTap={{ scale: 0.95 }} onClick={openEditProject} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface-secondary)', border: '1px solid var(--border-default)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Settings size={17} color="var(--text-tertiary)" />
            </motion.button>
            {/* Nueva tarea */}
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowAdd(true)} style={{ width: '44px', height: '44px', borderRadius: '50%', background: project.color, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${project.color}50` }}>
              <Plus size={20} color="white" />
            </motion.button>
          </div>
        </div>

        {tasks.length > 0 && (
          <div style={{ marginTop: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Progreso</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: project.color }}>{pct}%</span>
            </div>
            <div style={{ height: '6px', borderRadius: '99px', background: 'var(--border-default)', overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: EASE }} style={{ height: '100%', borderRadius: '99px', background: project.color }} />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.375rem' }}>{done} de {tasks.length} completadas</p>
          </div>
        )}
      </div>

      {/* Filtros */}
      {tasks.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', padding: '1rem 1.5rem 0', overflowX: 'auto' }}>
          {([['all','Todas'],['todo','Pendientes'],['in_progress','En curso'],['done','Hechas']] as [Status|'all', string][]).map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)} style={{ padding: '6px 14px', borderRadius: '99px', whiteSpace: 'nowrap', border: `1.5px solid ${filter === key ? project.color : 'var(--border-default)'}`, background: filter === key ? `${project.color}15` : 'var(--surface-primary)', color: filter === key ? project.color : 'var(--text-tertiary)', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
              {label}
            </button>
          ))}
          {/* Filtros por sección */}
          {allSections.map(sec => (
            <button key={sec} onClick={() => setFilter('all')} style={{ padding: '6px 14px', borderRadius: '99px', whiteSpace: 'nowrap', border: '1.5px solid var(--border-default)', background: 'var(--surface-primary)', color: 'var(--text-tertiary)', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
              {sec}
            </button>
          ))}
        </div>
      )}

      {/* Lista de tareas agrupadas por sección */}
      <div style={{ padding: '0.875rem 1.5rem 0', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <AnimatePresence initial={false}>
          {grouped.map(({ section, tasks: sectionTasks }) => (
            <div key={section ?? '__none__'}>
              {/* Header de sección */}
              {hasSections && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: section ? project.color : 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {section ?? 'Sin sección'}
                  </span>
                  <div style={{ flex: 1, height: '1px', background: section ? `${project.color}30` : 'var(--border-default)' }} />
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>{sectionTasks.length}</span>
                </div>
              )}

              {/* Tareas de la sección */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {sectionTasks.map((task, i) => {
                  const date = formatDate(task.due_date)
                  const isDone = task.status === 'done'
                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 24 }}
                      transition={{ delay: i * 0.03, duration: 0.3, ease: EASE }}
                      onClick={() => openEdit(task)}
                      style={{ background: 'var(--surface-primary)', borderRadius: 'var(--radius-lg)', padding: '0.875rem 1rem', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 1px 6px rgba(0,0,0,0.04)', opacity: isDone ? 0.55 : 1, cursor: 'pointer' }}
                    >
                      <button onClick={e => { e.stopPropagation(); toggleDone(task) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, color: isDone ? project.color : 'var(--border-strong)' }}>
                        {isDone ? <CheckCircle size={22} /> : <Circle size={22} />}
                      </button>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-primary)', textDecoration: isDone ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: date ? '2px' : 0 }}>
                          {task.title}
                        </p>
                        {date && <span style={{ fontSize: '0.75rem', color: date.color, fontWeight: 500 }}>{date.label}</span>}
                      </div>
                      {!isDone && (
                        <div style={{ padding: '2px 8px', borderRadius: '99px', background: `${PRIORITY_COLOR[task.priority]}18`, color: PRIORITY_COLOR[task.priority], fontSize: '0.6875rem', fontWeight: 700, flexShrink: 0 }}>
                          {PRIORITY_LABEL[task.priority]}
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{filter === 'done' ? '🏆' : '📋'}</p>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>{filter === 'done' ? 'Aún no has completado tareas' : 'Sin tareas aquí'}</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Toca + para agregar la primera</p>
          </div>
        )}
      </div>

      {/* ── Modal editar proyecto ── */}
      <AnimatePresence>
        {showEditProject && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEditProject(false)} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2, ease: EASE }} onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '400px', background: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', boxShadow: '0 24px 60px rgba(0,0,0,0.2)', maxHeight: '88vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Editar proyecto</h2>
                <button onClick={() => setShowEditProject(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}><X size={20} /></button>
              </div>

              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Nombre</p>
              <input autoFocus value={editProjName} onChange={e => setEditProjName(e.target.value)} placeholder="Nombre del proyecto" style={{ width: '100%', height: '48px', padding: '0 1rem', borderRadius: 'var(--radius-lg)', border: `1.5px solid ${project.color}`, background: 'var(--surface-secondary)', color: 'var(--text-primary)', fontSize: '1rem', fontFamily: 'var(--font-sans)', outline: 'none', marginBottom: '1rem', boxSizing: 'border-box' }} />

              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Emoji</p>
              <input value={editProjEmoji} onChange={e => setEditProjEmoji(e.target.value)} placeholder="Ej: 💼 🚀 🎯" style={{ width: '100%', height: '48px', padding: '0 1rem', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--border-default)', background: 'var(--surface-secondary)', color: 'var(--text-primary)', fontSize: '1.5rem', fontFamily: 'var(--font-sans)', outline: 'none', marginBottom: '1rem', boxSizing: 'border-box' }} />

              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Color</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                {PROJECT_COLORS.map(c => (
                  <button key={c} onClick={() => setEditProjColor(c)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: c, border: editProjColor === c ? `3px solid var(--text-primary)` : '3px solid transparent', cursor: 'pointer', boxShadow: editProjColor === c ? `0 0 0 2px var(--surface-primary), 0 0 0 4px ${c}` : 'none', transition: 'all 0.15s' }} />
                ))}
              </div>

              <motion.button whileTap={{ scale: 0.97 }} onClick={handleProjectSave} disabled={!editProjName.trim() || editProjSaving} style={{ width: '100%', height: '52px', borderRadius: 'var(--radius-lg)', background: editProjName.trim() ? editProjColor : 'var(--border-default)', color: 'white', fontWeight: 600, fontSize: '1rem', fontFamily: 'var(--font-sans)', border: 'none', cursor: editProjName.trim() ? 'pointer' : 'not-allowed', marginBottom: '0.75rem' }}>
                {editProjSaving ? 'Guardando...' : 'Guardar cambios'}
              </motion.button>
              <button onClick={handleProjectDelete} style={{ width: '100%', height: '44px', borderRadius: 'var(--radius-lg)', background: 'none', color: 'var(--status-error)', fontWeight: 600, fontSize: '0.9375rem', fontFamily: 'var(--font-sans)', border: '1.5px solid var(--status-error)', cursor: 'pointer' }}>
                Archivar proyecto
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal editar tarea ── */}
      <AnimatePresence>
        {editTask && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditTask(null)} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2, ease: EASE }} onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '400px', background: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', boxShadow: '0 24px 60px rgba(0,0,0,0.2)', maxHeight: '88vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Editar tarea</h2>
                <button onClick={() => setEditTask(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}><X size={20} /></button>
              </div>

              <input autoFocus value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="¿Qué hay que hacer?" style={{ width: '100%', height: '52px', padding: '0 1rem', borderRadius: 'var(--radius-lg)', border: `1.5px solid ${project.color}`, background: 'var(--surface-secondary)', color: 'var(--text-primary)', fontSize: '1rem', fontFamily: 'var(--font-sans)', outline: 'none', marginBottom: '1rem', boxSizing: 'border-box' }} />

              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Sección / Evento <span style={{ fontWeight: 400, textTransform: 'none' }}>(opcional)</span></p>
              <input value={editSection} onChange={e => setEditSection(e.target.value)} placeholder={allSections.length ? `Ej: ${allSections[0]}` : 'Ej: Festival Rock, Evento corporativo...'} list="sections-edit" style={{ width: '100%', height: '44px', padding: '0 1rem', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--border-default)', background: 'var(--surface-secondary)', color: 'var(--text-primary)', fontSize: '0.9375rem', fontFamily: 'var(--font-sans)', outline: 'none', marginBottom: '1rem', boxSizing: 'border-box' }} onFocus={e => (e.target.style.borderColor = project.color)} onBlur={e => (e.target.style.borderColor = 'var(--border-default)')} />
              <datalist id="sections-edit">{allSections.map(s => <option key={s} value={s} />)}</datalist>

              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Prioridad</p>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                {(['high','medium','low'] as Priority[]).map(p => (
                  <button key={p} onClick={() => setEditPriority(p)} style={{ flex: 1, height: '40px', borderRadius: 'var(--radius-md)', border: `1.5px solid ${editPriority === p ? PRIORITY_COLOR[p] : 'var(--border-default)'}`, background: editPriority === p ? `${PRIORITY_COLOR[p]}15` : 'var(--surface-secondary)', color: editPriority === p ? PRIORITY_COLOR[p] : 'var(--text-tertiary)', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>{PRIORITY_LABEL[p]}</button>
                ))}
              </div>

              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Fecha y hora <span style={{ fontWeight: 400, textTransform: 'none' }}>(opcional)</span></p>
              <div style={{ marginBottom: '1rem', padding: '0.875rem', background: 'var(--surface-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)' }}>
                <DatePicker date={editDate} time={editTime} onChangeDate={setEditDate} onChangeTime={setEditTime} accentColor={project.color} />
              </div>

              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Notas <span style={{ fontWeight: 400, textTransform: 'none' }}>(opcional)</span></p>
              <textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} placeholder="Ideas, contexto, detalles..." rows={2} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-default)', background: 'var(--surface-secondary)', color: 'var(--text-primary)', fontSize: '0.9375rem', fontFamily: 'var(--font-sans)', outline: 'none', resize: 'none', marginBottom: '1.25rem', boxSizing: 'border-box', lineHeight: 1.5 }} onFocus={e => (e.target.style.borderColor = project.color)} onBlur={e => (e.target.style.borderColor = 'var(--border-default)')} />

              <motion.button whileTap={{ scale: 0.97 }} onClick={handleEditSave} disabled={!editTitle.trim() || editSaving} style={{ width: '100%', height: '52px', borderRadius: 'var(--radius-lg)', background: editTitle.trim() ? project.color : 'var(--border-default)', color: 'white', fontWeight: 600, fontSize: '1rem', fontFamily: 'var(--font-sans)', border: 'none', cursor: editTitle.trim() ? 'pointer' : 'not-allowed', marginBottom: '0.75rem' }}>
                {editSaving ? 'Guardando...' : 'Guardar cambios'}
              </motion.button>
              <button onClick={handleEditDelete} style={{ width: '100%', height: '44px', borderRadius: 'var(--radius-lg)', background: 'none', color: 'var(--status-error)', fontWeight: 600, fontSize: '0.9375rem', fontFamily: 'var(--font-sans)', border: '1.5px solid var(--status-error)', cursor: 'pointer' }}>
                Eliminar tarea
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal agregar tarea ── */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAdd(false)} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2, ease: EASE }} onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '400px', background: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', boxShadow: '0 24px 60px rgba(0,0,0,0.2)', maxHeight: '88vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>Nueva tarea en {project.emoji} {project.name}</h2>
                <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', flexShrink: 0, marginLeft: '0.5rem' }}><X size={20} /></button>
              </div>

              <input autoFocus value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdd()} placeholder="¿Qué hay que hacer?" style={{ width: '100%', height: '52px', padding: '0 1rem', borderRadius: 'var(--radius-lg)', border: `1.5px solid ${project.color}`, background: 'var(--surface-secondary)', color: 'var(--text-primary)', fontSize: '1rem', fontFamily: 'var(--font-sans)', outline: 'none', marginBottom: '1rem', boxSizing: 'border-box' }} />

              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Sección / Evento <span style={{ fontWeight: 400, textTransform: 'none' }}>(opcional)</span></p>
              <input value={newSection} onChange={e => setNewSection(e.target.value)} placeholder={allSections.length ? `Ej: ${allSections[0]}` : 'Ej: Festival Rock, Evento corporativo...'} list="sections-add" style={{ width: '100%', height: '44px', padding: '0 1rem', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--border-default)', background: 'var(--surface-secondary)', color: 'var(--text-primary)', fontSize: '0.9375rem', fontFamily: 'var(--font-sans)', outline: 'none', marginBottom: '1rem', boxSizing: 'border-box' }} onFocus={e => (e.target.style.borderColor = project.color)} onBlur={e => (e.target.style.borderColor = 'var(--border-default)')} />
              <datalist id="sections-add">{allSections.map(s => <option key={s} value={s} />)}</datalist>

              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Prioridad</p>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
                {(['high','medium','low'] as Priority[]).map(p => (
                  <button key={p} onClick={() => setNewPriority(p)} style={{ flex: 1, height: '40px', borderRadius: 'var(--radius-md)', border: `1.5px solid ${newPriority === p ? PRIORITY_COLOR[p] : 'var(--border-default)'}`, background: newPriority === p ? `${PRIORITY_COLOR[p]}15` : 'var(--surface-secondary)', color: newPriority === p ? PRIORITY_COLOR[p] : 'var(--text-tertiary)', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>{PRIORITY_LABEL[p]}</button>
                ))}
              </div>

              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Fecha y hora <span style={{ fontWeight: 400, textTransform: 'none' }}>(opcional)</span></p>
              <div style={{ marginBottom: '1rem', padding: '0.875rem', background: 'var(--surface-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)' }}>
                <DatePicker date={newDate} time={newTime} onChangeDate={setNewDate} onChangeTime={setNewTime} accentColor={project.color} />
              </div>

              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Notas <span style={{ fontWeight: 400, textTransform: 'none' }}>(opcional)</span></p>
              <textarea value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="Ideas, contexto, detalles..." rows={2} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-default)', background: 'var(--surface-secondary)', color: 'var(--text-primary)', fontSize: '0.9375rem', fontFamily: 'var(--font-sans)', outline: 'none', resize: 'none', marginBottom: '1.25rem', boxSizing: 'border-box', lineHeight: 1.5 }} onFocus={e => (e.target.style.borderColor = project.color)} onBlur={e => (e.target.style.borderColor = 'var(--border-default)')} />

              <motion.button whileTap={{ scale: 0.97 }} onClick={handleAdd} disabled={!newTitle.trim() || saving} style={{ width: '100%', height: '52px', borderRadius: 'var(--radius-lg)', background: newTitle.trim() ? project.color : 'var(--border-default)', color: 'white', fontWeight: 600, fontSize: '1rem', fontFamily: 'var(--font-sans)', border: 'none', cursor: newTitle.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s' }}>
                {saving ? 'Guardando...' : 'Agregar tarea'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
