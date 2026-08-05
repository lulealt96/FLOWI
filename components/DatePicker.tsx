'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]
const DAYS   = ['D','L','M','M','J','V','S']
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

interface Props {
  date: string        // 'YYYY-MM-DD' or ''
  time: string        // 'HH:MM' or ''
  onChangeDate: (v: string) => void
  onChangeTime: (v: string) => void
  accentColor?: string
}

export default function DatePicker({ date, time, onChangeDate, onChangeTime, accentColor = 'var(--brand-primary)' }: Props) {
  const today  = new Date()
  const init   = date ? new Date(date + 'T12:00:00') : today
  const [cursor, setCursor] = useState({ year: init.getFullYear(), month: init.getMonth() })

  const selected   = date ? new Date(date + 'T12:00:00') : null
  const firstDay   = new Date(cursor.year, cursor.month, 1).getDay()
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const isToday = (d: number) =>
    d === today.getDate() && cursor.month === today.getMonth() && cursor.year === today.getFullYear()

  const isSelected = (d: number) =>
    !!selected && d === selected.getDate() && cursor.month === selected.getMonth() && cursor.year === selected.getFullYear()

  const isPast = (d: number) => {
    const dt = new Date(cursor.year, cursor.month, d)
    const todayStart = new Date(); todayStart.setHours(0,0,0,0)
    return dt < todayStart
  }

  const pick = (d: number) => {
    if (isPast(d)) return
    const mm = String(cursor.month + 1).padStart(2,'0')
    const dd = String(d).padStart(2,'0')
    onChangeDate(`${cursor.year}-${mm}-${dd}`)
  }

  const prevMonth = () => setCursor(c => c.month === 0 ? { year: c.year-1, month: 11 } : { ...c, month: c.month-1 })
  const nextMonth = () => setCursor(c => c.month === 11 ? { year: c.year+1, month: 0 } : { ...c, month: c.month+1 })

  const quickPick = (days: number) => {
    const d = new Date(); d.setDate(d.getDate() + days)
    const val = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    onChangeDate(val)
    setCursor({ year: d.getFullYear(), month: d.getMonth() })
  }

  return (
    <div>
      {/* Atajos rápidos */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '0.75rem' }}>
        {[{label:'Hoy',days:0},{label:'Mañana',days:1},{label:'En 7 días',days:7}].map(({label,days}) => {
          const d = new Date(); d.setDate(d.getDate() + days)
          const val = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
          const active = date === val
          return (
            <button key={label} type="button" onClick={() => quickPick(days)} style={{
              flex: 1, height: '32px',
              borderRadius: 'var(--radius-md)',
              border: `1.5px solid ${active ? accentColor : 'var(--border-default)'}`,
              background: active ? `${accentColor}15` : 'var(--surface-secondary)',
              color: active ? accentColor : 'var(--text-secondary)',
              fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)',
            }}>{label}</button>
          )
        })}
        {date && (
          <button type="button" onClick={() => { onChangeDate(''); onChangeTime('') }} style={{
            height: '32px', padding: '0 10px',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--border-default)',
            background: 'none', color: 'var(--text-tertiary)',
            fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)',
          }}>Quitar</button>
        )}
      </div>

      {/* Cabecera mes */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.625rem' }}>
        <button type="button" onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)', display: 'flex' }}>
          <ChevronLeft size={15} />
        </button>
        <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
          {MONTHS[cursor.month]} {cursor.year}
        </span>
        <button type="button" onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)', display: 'flex' }}>
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Labels días */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '2px' }}>
        {DAYS.map((d,i) => (
          <div key={i} style={{ textAlign:'center', fontSize:'0.6875rem', fontWeight:700, color:'var(--text-tertiary)', padding:'3px 0', letterSpacing:'0.04em' }}>{d}</div>
        ))}
      </div>

      {/* Grid días */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'2px', marginBottom:'0.875rem' }}>
        {cells.map((d, i) => {
          if (!d) return <div key={i} />
          const sel  = isSelected(d)
          const tod  = isToday(d)
          const past = isPast(d)
          return (
            <button
              key={i}
              type="button"
              onClick={() => pick(d)}
              disabled={past}
              style={{
                height:'34px', width:'100%',
                borderRadius:'var(--radius-md)',
                border: tod && !sel ? `1.5px solid ${accentColor}` : '1.5px solid transparent',
                background: sel ? accentColor : 'transparent',
                color: sel ? 'white' : past ? 'var(--border-strong)' : 'var(--text-primary)',
                fontSize:'0.8125rem', fontWeight: sel||tod ? 700 : 400,
                cursor: past ? 'not-allowed' : 'pointer',
                opacity: past ? 0.3 : 1,
                transition:'all 0.1s',
              }}
            >{d}</button>
          )
        })}
      </div>

      {/* Hora — solo si hay fecha */}
      <AnimatePresence>
        {date && (
          <motion.div
            initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} exit={{ opacity:0, height:0 }}
            transition={{ duration:0.2 }}
            style={{ overflow:'hidden' }}
          >
            <div style={{ paddingTop:'0.75rem', borderTop:'1px solid var(--border-default)' }}>
              <p style={{ fontSize:'0.75rem', fontWeight:600, color:'var(--text-tertiary)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.5rem' }}>
                Hora <span style={{ fontWeight:400, textTransform:'none' }}>(opcional — para recordatorio)</span>
              </p>
              <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                <input
                  type="time"
                  value={time}
                  onChange={e => onChangeTime(e.target.value)}
                  style={{
                    flex:1, height:'40px', padding:'0 0.875rem',
                    borderRadius:'var(--radius-md)',
                    border:`1.5px solid ${time ? accentColor : 'var(--border-default)'}`,
                    background:'var(--surface-secondary)',
                    color:'var(--text-primary)',
                    fontSize:'0.9375rem', fontFamily:'var(--font-sans)',
                    outline:'none',
                  }}
                />
                <span style={{ fontSize:'0.8125rem', color:'var(--text-tertiary)', whiteSpace:'nowrap' }}>
                  {time ? '→ te recuerdo a las ' + time : 'sin hora = sin recordatorio'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
