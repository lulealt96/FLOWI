'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Bell, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import DatePicker from '@/components/DatePicker'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

interface Reminder {
  id: string
  title: string
  remind_at: string
  status: string
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  const time = d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })
  if (d < today)    return { date: 'Vencido', time, color: 'var(--status-error)' }
  if (d < tomorrow) return { date: 'Hoy', time, color: '#F0A06B' }
  const date = d.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' })
  return { date, time, color: 'var(--text-tertiary)' }
}

export default function RemindersClient({ reminders: initial, userId }: { reminders: Reminder[]; userId: string }) {
  const [reminders, setReminders] = useState(initial)

  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate]   = useState('')
  const [newTime, setNewTime]   = useState('09:00')
  const [newSaving, setNewSaving] = useState(false)
  const [newError, setNewError]   = useState('')

  const pending = reminders.filter(r => r.status !== 'sent')
  const sent    = reminders.filter(r => r.status === 'sent')

  const openNew = () => {
    setNewTitle(''); setNewDate(''); setNewTime('09:00'); setNewError('')
    setCreating(true)
  }

  const handleCreate = async () => {
    if (!newTitle.trim() || !newDate || newSaving) return
    setNewSaving(true)
    setNewError('')
    const remind_at = newTime
      ? `${newDate}T${newTime}:00`
      : `${newDate}T09:00:00`
    const { data, error } = await createClient().from('reminders').insert({
      title:      newTitle.trim(),
      remind_at,
      user_id:    userId,
      status:     'pending',
    }).select().single()
    if (!error && data) {
      setReminders(prev => [...prev, data as Reminder].sort((a, b) =>
        new Date(a.remind_at).getTime() - new Date(b.remind_at).getTime()
      ))
      setCreating(false)
    } else {
      setNewError('No se pudo crear el recordatorio. Intenta de nuevo.')
    }
    setNewSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este recordatorio?')) return
    await createClient().from('reminders').delete().eq('id', id)
    setReminders(prev => prev.filter(r => r.id !== id))
  }

  return (
    <div style={{ padding: '0 0 2rem' }}>
      {/* Header */}
      <div style={{ padding: '3rem 1.5rem 1.5rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontWeight: 500, marginBottom: '2px' }}>No te olvides</p>
          <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
            Recordatorios
          </h1>
        </div>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={openNew}
          style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: 'var(--brand-primary)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 4px 14px rgba(240,107,138,0.35)',
            color: 'white', fontSize: '1.625rem', lineHeight: 1, fontWeight: 300,
            flexShrink: 0,
          }}
        >+</motion.button>
      </div>

      {reminders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔔</p>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>Sin recordatorios</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
            Crea uno con el botón de arriba o escríbele a Flowi por WhatsApp
          </p>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={openNew}
            style={{
              padding: '0.625rem 1.25rem', borderRadius: 'var(--radius-lg)',
              background: 'var(--brand-primary)', color: 'white',
              fontWeight: 600, fontSize: '0.9375rem', border: 'none',
              cursor: 'pointer', fontFamily: 'var(--font-sans)',
            }}
          >
            + Nuevo recordatorio
          </motion.button>
        </div>
      ) : (
        <div style={{ padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {pending.length > 0 && (
            <>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem' }}>
                Próximos
              </p>
              {pending.map((r, i) => {
                const dt = formatDateTime(r.remind_at)
                return (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.35, ease: EASE }}
                    style={{
                      background: 'var(--surface-primary)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '0.875rem 1rem',
                      border: '1px solid var(--border-default)',
                      display: 'flex', alignItems: 'center', gap: '0.875rem',
                      boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                      background: 'rgba(240,107,138,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Bell size={18} color="var(--brand-primary)" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.title}
                      </p>
                      <p style={{ fontSize: '0.75rem', fontWeight: 500, color: dt.color }}>
                        {dt.date} · {dt.time}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(r.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '4px', flexShrink: 0 }}
                    >
                      <X size={16} />
                    </button>
                  </motion.div>
                )
              })}
            </>
          )}

          {sent.length > 0 && (
            <>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '1rem 0 0.25rem' }}>
                Enviados
              </p>
              {sent.map((r, i) => {
                const dt = formatDateTime(r.remind_at)
                return (
                  <div key={r.id} style={{
                    background: 'var(--surface-secondary)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '0.75rem 1rem',
                    border: '1px solid var(--border-default)',
                    display: 'flex', alignItems: 'center', gap: '0.875rem',
                    opacity: 0.6,
                  }}>
                    <Bell size={16} color="var(--text-tertiary)" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'line-through', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.title}
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{dt.date} · {dt.time}</p>
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}

      {/* Modal nuevo recordatorio */}
      <AnimatePresence>
        {creating && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setCreating(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: EASE }}
              onClick={e => e.stopPropagation()}
              style={{ width: '100%', maxWidth: '400px', background: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)', padding: '1.5rem', boxShadow: '0 24px 60px rgba(0,0,0,0.2)', maxHeight: '88vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h2 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Nuevo recordatorio</h2>
                <button onClick={() => setCreating(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}><X size={20} /></button>
              </div>

              <input
                autoFocus
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="¿Qué debo recordar?"
                style={{ width: '100%', height: '52px', padding: '0 1rem', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--brand-primary)', background: 'var(--surface-secondary)', color: 'var(--text-primary)', fontSize: '1rem', fontFamily: 'var(--font-sans)', outline: 'none', marginBottom: '1rem', boxSizing: 'border-box' }}
              />

              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                Cuándo <span style={{ fontWeight: 500, color: 'var(--status-error)', textTransform: 'none' }}>*</span>
              </p>
              <div style={{ marginBottom: '1.25rem', padding: '0.875rem', background: 'var(--surface-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)' }}>
                <DatePicker date={newDate} time={newTime} onChangeDate={setNewDate} onChangeTime={setNewTime} accentColor="var(--brand-primary)" />
              </div>

              {newError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  style={{ fontSize: '0.875rem', color: 'var(--status-error)', marginBottom: '0.75rem', padding: '0.625rem 0.875rem', background: 'rgba(239,68,68,0.08)', borderRadius: 'var(--radius-md)' }}
                >
                  {newError}
                </motion.p>
              )}

              <motion.button whileTap={{ scale: 0.97 }} onClick={handleCreate}
                disabled={!newTitle.trim() || !newDate || newSaving}
                style={{ width: '100%', height: '52px', borderRadius: 'var(--radius-lg)', background: (newTitle.trim() && newDate) ? 'var(--brand-primary)' : 'var(--border-default)', color: 'white', fontWeight: 600, fontSize: '1rem', fontFamily: 'var(--font-sans)', border: 'none', cursor: (newTitle.trim() && newDate) ? 'pointer' : 'not-allowed' }}>
                {newSaving ? 'Guardando...' : 'Crear recordatorio'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
