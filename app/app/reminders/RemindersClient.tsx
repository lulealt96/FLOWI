'use client'

import { motion } from 'motion/react'
import { Bell } from 'lucide-react'

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

export default function RemindersClient({ reminders }: { reminders: Reminder[] }) {
  const pending = reminders.filter(r => r.status !== 'sent')
  const sent    = reminders.filter(r => r.status === 'sent')

  return (
    <div style={{ padding: '0 0 2rem' }}>
      <div style={{ padding: '3rem 1.5rem 1.5rem' }}>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontWeight: 500, marginBottom: '2px' }}>No te olvides</p>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
          Recordatorios
        </h1>
      </div>

      {reminders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔔</p>
          <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>Sin recordatorios</p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Escríbele a Flowi por WhatsApp algo como{' '}
            <span style={{ fontStyle: 'italic', color: 'var(--brand-primary)' }}>
              "Recuérdame pagar la renta el viernes a las 9am"
            </span>
          </p>
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
    </div>
  )
}
