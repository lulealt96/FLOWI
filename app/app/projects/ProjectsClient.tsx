'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Plus, X } from 'lucide-react'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const COLORS = ['#F06B8A','#6B8AF0','#F0A06B','#6BC96B','#A06BF0','#F0D06B','#6BF0D0','#F06B6B','#8B6F47']
const EMOJIS = ['📌','🏢','💼','🚀','🏠','💚','🐾','💰','⚡','📅','✈️','📚','🎯','🔥','💡','🌱','🎨','🛠️','📝','🏆']

type Category = 'work' | 'personal' | 'life'

interface Project {
  id: string
  name: string
  emoji: string
  color: string
  category: string
  sort_order: number
}

const CAT_LABEL: Record<Category, string> = { work: 'Trabajo', personal: 'Personal', life: 'Vida' }

export default function ProjectsClient({
  projects: initial,
  countByProject,
}: {
  projects: Project[]
  countByProject: Record<string, number>
}) {
  const [projects, setProjects] = useState(initial)
  const [showForm, setShowForm]   = useState(false)
  const [pName, setPName]         = useState('')
  const [pEmoji, setPEmoji]       = useState('📌')
  const [pCategory, setPCategory] = useState<Category>('personal')
  const [colorIdx, setColorIdx]   = useState(0)
  const [saving, setSaving]       = useState(false)
  const router = useRouter()

  const handleCreate = async () => {
    if (!pName.trim() || saving) return
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const color = COLORS[colorIdx % COLORS.length]
    const { data, error } = await supabase.from('projects').insert({
      user_id: user.id,
      name: pName.trim(),
      emoji: pEmoji,
      color,
      category: pCategory,
      sort_order: projects.length,
    }).select().single()

    if (!error && data) {
      setProjects(prev => [...prev, data])
      setPName(''); setPEmoji('📌'); setPCategory('personal')
      setColorIdx(c => c + 1)
      setShowForm(false)
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    await supabase.from('projects').delete().eq('id', id)
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  return (
    <div style={{ padding: '0 0 2rem' }}>
      {/* Header */}
      <div style={{ padding: '3rem 1.5rem 1.5rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontWeight: 500, marginBottom: '2px' }}>Mis espacios</p>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
            Proyectos
          </h1>
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          style={{
            width: '40px', height: '40px',
            borderRadius: '50%',
            background: 'var(--brand-primary)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(240,107,138,0.3)',
          }}
        >
          <Plus size={20} color="white" />
        </motion.button>
      </div>

      {/* Lista */}
      <div style={{ padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        <AnimatePresence initial={false}>
          {projects.map((p, i) => {
            const count = countByProject[p.id] ?? 0
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ delay: i * 0.04, duration: 0.35, ease: EASE }}
              >
                <Link href={`/app/projects/${p.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: 'var(--surface-primary)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '1rem 1rem',
                    border: '1px solid var(--border-default)',
                    borderLeft: `4px solid ${p.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.875rem',
                    boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                  }}>
                    <span style={{ fontSize: '1.5rem', lineHeight: 1, flexShrink: 0 }}>{p.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '2px' }}>
                        {p.name}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                        {CAT_LABEL[p.category as Category] ?? p.category} · {count === 0 ? 'Sin pendientes' : `${count} pendiente${count > 1 ? 's' : ''}`}
                      </p>
                    </div>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: count > 0 ? p.color : 'var(--border-default)', flexShrink: 0 }} />
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {projects.length === 0 && !showForm && (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🌱</p>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>Sin proyectos aún</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Toca + para crear el primero</p>
          </div>
        )}
      </div>

      {/* Modal nuevo proyecto */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowForm(false)}
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
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)' }}>Nuevo proyecto</h2>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Selector emoji */}
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ícono</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1rem' }}>
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => setPEmoji(e)} style={{
                    width: '38px', height: '38px',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${pEmoji === e ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                    background: pEmoji === e ? 'rgba(240,107,138,0.08)' : 'var(--surface-secondary)',
                    fontSize: '1.1rem', cursor: 'pointer',
                  }}>{e}</button>
                ))}
              </div>

              {/* Nombre */}
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nombre</p>
              <input
                autoFocus
                value={pName}
                onChange={e => setPName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="Nombre del proyecto..."
                style={{
                  width: '100%', height: '48px', padding: '0 1rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1.5px solid var(--border-default)',
                  background: 'var(--surface-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9375rem', fontFamily: 'var(--font-sans)',
                  outline: 'none', marginBottom: '1rem',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--brand-primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-default)')}
              />

              {/* Categoría */}
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Categoría</p>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem' }}>
                {(['work','personal','life'] as Category[]).map(cat => (
                  <button key={cat} onClick={() => setPCategory(cat)} style={{
                    flex: 1, height: '38px',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${pCategory === cat ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                    background: pCategory === cat ? 'rgba(240,107,138,0.08)' : 'var(--surface-secondary)',
                    color: pCategory === cat ? 'var(--brand-primary)' : 'var(--text-tertiary)',
                    fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  }}>{CAT_LABEL[cat]}</button>
                ))}
              </div>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleCreate}
                disabled={!pName.trim() || saving}
                style={{
                  width: '100%', height: '52px',
                  borderRadius: 'var(--radius-lg)',
                  background: pName.trim() ? 'var(--brand-primary)' : 'var(--border-default)',
                  color: pName.trim() ? 'var(--brand-primary-text)' : 'var(--text-tertiary)',
                  fontWeight: 600, fontSize: '1rem', fontFamily: 'var(--font-sans)',
                  border: 'none', cursor: pName.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                {saving ? 'Guardando...' : 'Crear proyecto'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
