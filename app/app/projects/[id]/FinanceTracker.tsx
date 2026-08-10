'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Plus, X, ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Trash2 } from 'lucide-react'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const EXPENSE_CATS = [
  { id:'food',          label:'Comida',        emoji:'🍔', color:'#F06B6B' },
  { id:'transport',     label:'Transporte',    emoji:'🚗', color:'#F0A06B' },
  { id:'home',          label:'Hogar',         emoji:'🏠', color:'#6B8AF0' },
  { id:'health',        label:'Salud',         emoji:'💊', color:'#6BC96B' },
  { id:'entertainment', label:'Entretenim.',   emoji:'🎮', color:'#A06BF0' },
  { id:'shopping',      label:'Compras',       emoji:'🛍️', color:'#F06B8A' },
  { id:'services',      label:'Servicios',     emoji:'💡', color:'#F0D06B' },
  { id:'education',     label:'Educación',     emoji:'📚', color:'#6BF0D0' },
  { id:'travel',        label:'Viajes',        emoji:'✈️', color:'#6BD4F0' },
  { id:'gifts',         label:'Regalos',       emoji:'🎁', color:'#D06BF0' },
  { id:'debt',          label:'Deudas',        emoji:'💳', color:'#F0906B' },
  { id:'other_exp',     label:'Otros',         emoji:'❓', color:'#A0A0A0' },
]
const INCOME_CATS = [
  { id:'salary',        label:'Salario',       emoji:'💼', color:'#22C55E' },
  { id:'freelance',     label:'Freelance',     emoji:'💻', color:'#10B981' },
  { id:'investment',    label:'Inversiones',   emoji:'📈', color:'#059669' },
  { id:'gift',          label:'Regalo',        emoji:'🎁', color:'#34D399' },
  { id:'other_inc',     label:'Otros',         emoji:'💸', color:'#6EE7B7' },
]
const ALL_CATS = [...EXPENSE_CATS, ...INCOME_CATS]
const CAT_MAP = Object.fromEntries(ALL_CATS.map(c => [c.id, c]))

interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: string
}

interface Project { id: string; name: string; emoji: string; color: string }

function fmt(n: number) {
  return new Intl.NumberFormat('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)
}

function parseAmount(raw: string): number {
  return parseFloat(raw.replace(/[^0-9.]/g, '')) || 0
}

export default function FinanceTracker({
  project,
  transactions: initial,
}: {
  project: Project
  transactions: Transaction[]
}) {
  const today = new Date()
  const [txs, setTxs]               = useState(initial)
  const [month, setMonth]           = useState(today.getMonth())
  const [year, setYear]             = useState(today.getFullYear())
  const [showModal, setShowModal]   = useState(false)
  const [txType, setTxType]         = useState<'expense'|'income'>('expense')
  const [rawAmount, setRawAmount]   = useState('')
  const [selCat, setSelCat]         = useState('food')
  const [desc, setDesc]             = useState('')
  const [txDate, setTxDate]         = useState(today.toISOString().split('T')[0])
  const [saving, setSaving]         = useState(false)
  const router = useRouter()

  // Filter by selected month
  const monthStr = `${year}-${String(month+1).padStart(2,'0')}`
  const filtered = useMemo(() => txs.filter(t => t.date.startsWith(monthStr)), [txs, monthStr])

  const totalIncome  = filtered.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0)
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0)
  const balance      = totalIncome - totalExpense

  // Category breakdown (expenses only)
  const byCat = useMemo(() => {
    const map: Record<string, number> = {}
    filtered.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] ?? 0) + t.amount
    })
    return Object.entries(map)
      .sort((a,b) => b[1] - a[1])
      .map(([cat, amt]) => ({ cat, amt, pct: totalExpense > 0 ? (amt/totalExpense)*100 : 0 }))
  }, [filtered, totalExpense])

  // Group by date
  const byDate = useMemo(() => {
    const map: Record<string, Transaction[]> = {}
    ;[...filtered].sort((a,b) => b.date.localeCompare(a.date)).forEach(t => {
      ;(map[t.date] ??= []).push(t)
    })
    return Object.entries(map)
  }, [filtered])

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y-1) }
    else setMonth(m => m-1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y+1) }
    else setMonth(m => m+1)
  }
  const isCurrentMonth = month === today.getMonth() && year === today.getFullYear()

  const openModal = () => {
    setTxType('expense'); setRawAmount(''); setSelCat('food')
    setDesc(''); setTxDate(today.toISOString().split('T')[0])
    setShowModal(true)
  }

  const handleSave = async () => {
    const amount = parseAmount(rawAmount)
    if (!amount || saving) return
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase.from('transactions').insert({
      user_id: user.id, project_id: project.id,
      type: txType, amount, category: selCat,
      description: desc.trim(), date: txDate,
    }).select().single()

    if (!error && data) {
      setTxs(prev => [data, ...prev])
      setShowModal(false)
    }
    setSaving(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este movimiento? Esta acción no se puede deshacer.')) return
    const supabase = createClient()
    await supabase.from('transactions').delete().eq('id', id)
    setTxs(prev => prev.filter(t => t.id !== id))
  }

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00')
    const todayD = new Date(); todayD.setHours(0,0,0,0)
    const diff = Math.round((todayD.getTime() - d.getTime()) / 86400000)
    if (diff === 0) return 'Hoy'
    if (diff === 1) return 'Ayer'
    return d.toLocaleDateString('es-CO', { weekday:'short', day:'numeric', month:'short' })
  }

  const cats = txType === 'expense' ? EXPENSE_CATS : INCOME_CATS

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--surface-secondary)' }}>
      {/* Hero card */}
      <div style={{
        background: `linear-gradient(145deg, ${project.color} 0%, ${project.color}cc 100%)`,
        padding: '3rem 1.5rem 2rem',
        color: 'white',
        position: 'relative',
      }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', padding: '6px 12px 6px 8px', display: 'flex', alignItems: 'center', gap: '4px', color: 'white', fontSize: '0.8125rem', fontWeight: 600, fontFamily: 'var(--font-sans)', borderRadius: '99px', marginBottom: '1.5rem' }}
        >
          <ArrowLeft size={14} /> Proyectos
        </button>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
          <p style={{ fontSize: '0.8125rem', fontWeight: 500, opacity: 0.8 }}>
            {project.emoji} {project.name}
          </p>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={openModal}
            style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.25)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(4px)', flexShrink: 0,
            }}
          >
            <Plus size={20} color="white" />
          </motion.button>
        </div>
        <p style={{ fontSize: '0.8125rem', opacity: 0.7, marginBottom: '0.5rem', fontWeight: 400 }}>
          Balance {MONTHS[month]} {year}
        </p>
        <motion.p
          key={`${monthStr}-bal`}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: '2.75rem', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: '1.5rem', lineHeight: 1 }}
        >
          {balance < 0 ? '−' : ''} $ {fmt(Math.abs(balance))}
        </motion.p>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '0.875rem', backdropFilter: 'blur(4px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <TrendingUp size={14} opacity={0.8} />
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Ingresos</span>
            </div>
            <p style={{ fontSize: '1.125rem', fontWeight: 700 }}>$ {fmt(totalIncome)}</p>
          </div>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.15)', borderRadius: '12px', padding: '0.875rem', backdropFilter: 'blur(4px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <TrendingDown size={14} opacity={0.8} />
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Gastos</span>
            </div>
            <p style={{ fontSize: '1.125rem', fontWeight: 700 }}>$ {fmt(totalExpense)}</p>
          </div>
        </div>
      </div>

      {/* Month nav */}
      <div style={{ background: 'var(--surface-primary)', borderBottom: '1px solid var(--border-default)', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '4px', display: 'flex' }}>
          <ChevronLeft size={20} />
        </button>
        <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
          {MONTHS[month]} {year} {isCurrentMonth ? '· hoy' : ''}
        </span>
        <button onClick={nextMonth} disabled={isCurrentMonth} style={{ background: 'none', border: 'none', cursor: isCurrentMonth ? 'not-allowed' : 'pointer', color: isCurrentMonth ? 'var(--border-strong)' : 'var(--text-secondary)', padding: '4px', display: 'flex' }}>
          <ChevronRight size={20} />
        </button>
      </div>

      <div style={{ flex: 1, padding: '1rem 1.25rem 6rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

        {/* Sin movimientos */}
        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '3rem 0' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>💰</p>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Sin movimientos</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Toca + para registrar un gasto o ingreso</p>
          </motion.div>
        )}

        {/* Categorías */}
        {byCat.length > 0 && (
          <div style={{ background: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)', padding: '1.125rem', border: '1px solid var(--border-default)' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.875rem' }}>
              Gastos por categoría
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {byCat.map(({ cat, amt, pct }) => {
                const info = CAT_MAP[cat] ?? { emoji:'❓', label: cat, color:'#A0A0A0' }
                return (
                  <div key={cat}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '1rem' }}>{info.emoji}</span>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{info.label}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>$ {fmt(amt)}</span>
                        <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginLeft: '4px' }}>{Math.round(pct)}%</span>
                      </div>
                    </div>
                    <div style={{ height: '5px', borderRadius: '99px', background: 'var(--surface-secondary)', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.7, ease: EASE, delay: 0.05 }}
                        style={{ height: '100%', borderRadius: '99px', background: info.color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Lista de movimientos */}
        {byDate.map(([date, items]) => (
          <div key={date}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem', paddingLeft: '4px' }}>
              {formatDateLabel(date)}
            </p>
            <div style={{ background: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-default)', overflow: 'hidden' }}>
              {items.map((t, i) => {
                const info = CAT_MAP[t.category] ?? { emoji:'❓', label: t.category, color:'#A0A0A0' }
                const isInc = t.type === 'income'
                return (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.25, ease: EASE }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.875rem',
                      padding: '0.875rem 1rem',
                      borderBottom: i < items.length-1 ? '1px solid var(--border-default)' : 'none',
                    }}
                  >
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '10px',
                      background: `${info.color}20`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.125rem', flexShrink: 0,
                    }}>
                      {info.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '1px' }}>
                        {t.description || info.label}
                      </p>
                      {t.description && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{info.label}</p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: isInc ? '#22C55E' : '#F06B6B' }}>
                        {isInc ? '+' : '−'} $ {fmt(t.amount)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(t.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '4px', opacity: 0.4, flexShrink: 0 }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={openModal}
        style={{
          position: 'fixed', bottom: '80px', right: '20px', zIndex: 55,
          width: '56px', height: '56px', borderRadius: '50%',
          background: project.color,
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 6px 20px ${project.color}60`,
        }}
      >
        <Plus size={24} color="white" />
      </motion.button>

      {/* Modal nueva transacción */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 60,
              background: 'rgba(0,0,0,0.55)',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ duration: 0.35, ease: EASE }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: '480px',
                background: 'var(--surface-primary)',
                borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
                padding: '1.25rem 1.5rem 2.5rem',
                maxHeight: '92dvh', overflowY: 'auto',
              }}
            >
              {/* Handle */}
              <div style={{ width: '40px', height: '4px', borderRadius: '99px', background: 'var(--border-strong)', margin: '0 auto 1.25rem', opacity: 0.4 }} />

              {/* Toggle gasto/ingreso */}
              <div style={{ display: 'flex', background: 'var(--surface-secondary)', borderRadius: 'var(--radius-lg)', padding: '3px', marginBottom: '1.5rem' }}>
                {(['expense','income'] as const).map(t => (
                  <button key={t} type="button" onClick={() => { setTxType(t); setSelCat(t === 'expense' ? 'food' : 'salary') }} style={{
                    flex: 1, height: '40px', borderRadius: 'var(--radius-md)',
                    background: txType === t ? (t === 'expense' ? '#F06B6B' : '#22C55E') : 'transparent',
                    color: txType === t ? 'white' : 'var(--text-tertiary)',
                    fontWeight: 700, fontSize: '0.875rem', fontFamily: 'var(--font-sans)',
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                    {t === 'expense' ? '↓ Gasto' : '↑ Ingreso'}
                  </button>
                ))}
              </div>

              {/* Monto */}
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Monto</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>$</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={rawAmount}
                    onChange={e => setRawAmount(e.target.value)}
                    placeholder="0"
                    autoFocus
                    style={{
                      fontSize: '3rem', fontWeight: 800, fontFamily: 'var(--font-sans)',
                      color: txType === 'expense' ? '#F06B6B' : '#22C55E',
                      background: 'none', border: 'none', outline: 'none',
                      width: '200px', textAlign: 'center', letterSpacing: '-0.04em',
                    }}
                  />
                </div>
              </div>

              {/* Categorías */}
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.625rem' }}>Categoría</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '1.25rem' }}>
                {cats.map(c => (
                  <button key={c.id} type="button" onClick={() => setSelCat(c.id)} style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '6px 10px', borderRadius: '99px',
                    border: `1.5px solid ${selCat === c.id ? c.color : 'var(--border-default)'}`,
                    background: selCat === c.id ? `${c.color}18` : 'var(--surface-secondary)',
                    color: selCat === c.id ? c.color : 'var(--text-secondary)',
                    fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  }}>
                    <span>{c.emoji}</span> {c.label}
                  </button>
                ))}
              </div>

              {/* Descripción */}
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Descripción <span style={{ fontWeight: 400, textTransform: 'none' }}>(opcional)</span></p>
              <input
                type="text"
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="Ej: Almuerzo con cliente"
                style={{
                  width: '100%', height: '44px', padding: '0 1rem', boxSizing: 'border-box',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-default)',
                  background: 'var(--surface-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9375rem', fontFamily: 'var(--font-sans)',
                  outline: 'none', marginBottom: '1rem',
                }}
                onFocus={e => (e.target.style.borderColor = project.color)}
                onBlur={e => (e.target.style.borderColor = 'var(--border-default)')}
              />

              {/* Fecha */}
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Fecha</p>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '1.25rem' }}>
                {[
                  { label: 'Hoy',  days: 0 },
                  { label: 'Ayer', days: 1 },
                ].map(({ label, days }) => {
                  const d = new Date(); d.setDate(d.getDate() - days)
                  const val = d.toISOString().split('T')[0]
                  return (
                    <button key={label} type="button" onClick={() => setTxDate(val)} style={{
                      padding: '7px 14px', borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${txDate === val ? project.color : 'var(--border-default)'}`,
                      background: txDate === val ? `${project.color}15` : 'var(--surface-secondary)',
                      color: txDate === val ? project.color : 'var(--text-secondary)',
                      fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)',
                    }}>{label}</button>
                  )
                })}
                <input
                  type="date"
                  value={txDate}
                  onChange={e => setTxDate(e.target.value)}
                  style={{
                    flex: 1, height: '38px', padding: '0 8px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--border-default)',
                    background: 'var(--surface-secondary)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.8125rem', fontFamily: 'var(--font-sans)',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Botón guardar */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                disabled={!rawAmount || parseAmount(rawAmount) === 0 || saving}
                style={{
                  width: '100%', height: '54px', borderRadius: 'var(--radius-lg)',
                  background: parseAmount(rawAmount) > 0
                    ? (txType === 'expense' ? '#F06B6B' : '#22C55E')
                    : 'var(--border-default)',
                  color: 'white',
                  fontWeight: 700, fontSize: '1rem', fontFamily: 'var(--font-sans)',
                  border: 'none', cursor: parseAmount(rawAmount) > 0 ? 'pointer' : 'not-allowed',
                  boxShadow: parseAmount(rawAmount) > 0
                    ? `0 4px 16px ${txType === 'expense' ? '#F06B6B40' : '#22C55E40'}`
                    : 'none',
                  transition: 'all 0.2s',
                }}
              >
                {saving ? 'Guardando...' : txType === 'expense' ? '↓ Registrar gasto' : '↑ Registrar ingreso'}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
