'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { QUIZ, SPECIES_LIST, computeQuizResult, type SpeciesId } from '@/lib/flowlings/species'
import Flowling from '@/components/Flowling'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]
const TOTAL_STEPS = 4

const SUGGESTED_PROJECTS = [
  { name: 'Mi negocio',          emoji: '🏢', color: '#F06B8A', category: 'work'     as const },
  { name: 'Trabajo / Empleo',    emoji: '💼', color: '#6B8AF0', category: 'work'     as const },
  { name: 'Freelance',           emoji: '🚀', color: '#F0A06B', category: 'work'     as const },
  { name: 'Hogar y familia',     emoji: '🏠', color: '#6BC96B', category: 'life'     as const },
  { name: 'Salud y bienestar',   emoji: '💚', color: '#6BF0D0', category: 'life'     as const },
  { name: 'Mascotas',            emoji: '🐾', color: '#A06BF0', category: 'life'     as const },
  { name: 'Finanzas personales', emoji: '💰', color: '#F0D06B', category: 'personal' as const },
  { name: 'Hábitos y rutinas',   emoji: '⚡', color: '#F06B6B', category: 'personal' as const },
  { name: 'Fechas importantes',  emoji: '📅', color: '#8B6F47', category: 'personal' as const },
  { name: 'Viajes y planes',     emoji: '✈️', color: '#6B8AF0', category: 'personal' as const },
  { name: 'Estudios',            emoji: '📚', color: '#F06B8A', category: 'personal' as const },
]

type Category = 'work' | 'personal' | 'life'

interface Project { name: string; emoji: string; color: string; category: Category }

const CUSTOM_COLORS = ['#F06B8A','#6B8AF0','#F0A06B','#6BC96B','#A06BF0','#F0D06B','#6BF0D0','#F06B6B']
const QUICK_EMOJIS  = ['📌','⭐','🎯','🔥','💡','🌱','🎨','🛠️','📝','🏆','💎','🌍']

const categoryLabel: Record<Category, string> = { work: 'Trabajo', personal: 'Personal', life: 'Vida' }

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')

  // Quiz state (step 2)
  const [quizAnswers, setQuizAnswers]   = useState<number[]>([-1, -1, -1, -1])
  const [quizQ, setQuizQ]               = useState(0)   // 0-3 = preguntas, 4 = resultados
  const [selectedSpecies, setSelected]  = useState<SpeciesId | ''>('')

  // Projects state (step 3)
  const [selected, setSelectedProj]    = useState<Set<number>>(new Set())
  const [customProjects, setCustomProjects] = useState<Project[]>([])
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customName, setCustomName]     = useState('')
  const [customEmoji, setCustomEmoji]   = useState('📌')
  const [customCategory, setCustomCategory] = useState<Category>('personal')

  // WhatsApp (step 4)
  const [waPhone, setWaPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // ── Quiz helpers ────────────────────────────────────────────────────────
  const quizResults = quizAnswers.every(a => a >= 0) ? computeQuizResult(quizAnswers) : []

  function answerQuiz(qIdx: number, optIdx: number) {
    const next = [...quizAnswers]
    next[qIdx] = optIdx
    setQuizAnswers(next)
    if (qIdx < 3) {
      setTimeout(() => setQuizQ(qIdx + 1), 340)
    } else {
      setTimeout(() => setQuizQ(4), 340)
    }
  }

  // ── Project helpers ─────────────────────────────────────────────────────
  function addCustomProject() {
    if (!customName.trim()) return
    const color = CUSTOM_COLORS[customProjects.length % CUSTOM_COLORS.length]
    setCustomProjects(prev => [...prev, { name: customName.trim(), emoji: customEmoji, color, category: customCategory }])
    setCustomName(''); setCustomEmoji('📌'); setCustomCategory('personal'); setShowCustomForm(false)
  }

  function toggleProject(i: number) {
    setSelectedProj(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n })
  }

  // ── Finish ──────────────────────────────────────────────────────────────
  async function handleFinish() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const species = selectedSpecies || quizResults[0] || 'bloom'

    await supabase.from('profiles').update({
      name: name.trim() || user.user_metadata?.full_name || '',
      whatsapp_phone: waPhone.trim() || null,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id)

    // Crear avatar global con la especie elegida
    await supabase.from('user_avatars').upsert({
      user_id:  user.id,
      species,
      total_xp: 0,
      level:    1,
    }, { onConflict: 'user_id' })

    const suggested: Project[] = Array.from(selected).map(i => SUGGESTED_PROJECTS[i])
    const allProjects = [...suggested, ...customProjects]
    if (allProjects.length > 0) {
      await supabase.from('projects').insert(
        allProjects.map((p, idx) => ({
          user_id: user.id, name: p.name, emoji: p.emoji,
          color: p.color, category: p.category, sort_order: idx,
        }))
      )
    }

    if (waPhone.trim()) {
      fetch('/api/whatsapp/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: waPhone.trim(), name: name.trim() || 'amiga' }),
      }).catch(() => {})
    }

    router.push('/app')
    router.refresh()
  }

  return (
    <div className="flowi-bg min-h-dvh flex flex-col items-center">
      <div className="w-full flex flex-col flex-1" style={{ maxWidth: '480px' }}>

        {/* Progress bar */}
        <div style={{ padding: '1.5rem 1.5rem 0' }}>
          <div className="flex items-center gap-2 mb-1">
            {Array.from({ length: TOTAL_STEPS }).map((_, s) => (
              <div key={s} style={{
                flex: 1, height: '3px', borderRadius: '99px',
                background: s + 1 <= step ? 'var(--brand-primary)' : 'var(--border-default)',
                transition: 'background 0.4s ease',
              }} />
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
            Paso {step} de {TOTAL_STEPS}
          </p>
        </div>

        <div className="flex-1 flex flex-col" style={{ padding: '0 1.5rem 2rem' }}>
          <AnimatePresence mode="wait">

            {/* ── PASO 1: Nombre ── */}
            {step === 1 && (
              <motion.div key="s1"
                initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } }}
                exit={{ opacity: 0, x: -24, transition: { duration: 0.25 } }}
                className="flex-1 flex flex-col"
              >
                <div style={{ marginBottom: '2rem', paddingTop: '1rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem', lineHeight: 1 }}>👋</div>
                  <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '0.5rem' }}>
                    Hola, bienvenida a Flowi
                  </h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.5 }}>
                    En 2 minutos tendrás todo listo. Primero, ¿cómo te llamas?
                  </p>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                    Tu nombre
                  </label>
                  <input
                    type="text" autoFocus value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Luisa"
                    onKeyDown={e => e.key === 'Enter' && name.trim() && setStep(2)}
                    style={{
                      width: '100%', height: '52px', padding: '0 1rem',
                      borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--border-default)',
                      background: 'var(--surface-primary)', color: 'var(--text-primary)',
                      fontSize: '1rem', fontFamily: 'var(--font-sans)', outline: 'none',
                    }}
                    onFocus={e => (e.target.style.borderColor = 'var(--brand-primary)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border-default)')}
                  />
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(2)} disabled={!name.trim()}
                    style={{
                      width: '100%', height: '52px', borderRadius: 'var(--radius-lg)',
                      background: name.trim() ? 'var(--brand-primary)' : 'var(--border-default)',
                      color: name.trim() ? 'var(--brand-primary-text)' : 'var(--text-tertiary)',
                      fontWeight: 600, fontSize: '1rem', fontFamily: 'var(--font-sans)',
                      border: 'none', cursor: name.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s ease',
                    }}
                  >Continuar →</motion.button>
                </div>
              </motion.div>
            )}

            {/* ── PASO 2: Quiz de especie ── */}
            {step === 2 && (
              <motion.div key="s2"
                initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } }}
                exit={{ opacity: 0, x: -24, transition: { duration: 0.25 } }}
                className="flex-1 flex flex-col"
              >
                <AnimatePresence mode="wait">

                  {/* Preguntas 0-3 */}
                  {quizQ < 4 && (
                    <motion.div key={`q${quizQ}`}
                      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } }}
                      exit={{ opacity: 0, y: -18, transition: { duration: 0.22 } }}
                      className="flex-1 flex flex-col"
                    >
                      <div style={{ marginBottom: '1.5rem', paddingTop: '1rem' }}>
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '1rem' }}>
                          {QUIZ.map((_, i) => (
                            <div key={i} style={{
                              flex: 1, height: '3px', borderRadius: '99px',
                              background: i <= quizQ ? 'var(--brand-primary)' : 'var(--border-default)',
                              transition: 'background 0.3s ease',
                            }} />
                          ))}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500, marginBottom: '0.75rem' }}>
                          Pregunta {quizQ + 1} de {QUIZ.length}
                        </p>
                        <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.25 }}>
                          {QUIZ[quizQ].question}
                        </h2>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                        {QUIZ[quizQ].options.map((opt, oi) => {
                          const chosen = quizAnswers[quizQ] === oi
                          return (
                            <motion.button key={oi} whileTap={{ scale: 0.98 }}
                              onClick={() => answerQuiz(quizQ, oi)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '0.875rem',
                                padding: '1rem 1.125rem',
                                borderRadius: 'var(--radius-lg)',
                                border: `1.5px solid ${chosen ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                                background: chosen ? 'rgba(240,107,138,0.08)' : 'var(--surface-primary)',
                                cursor: 'pointer', textAlign: 'left', width: '100%',
                                transition: 'all 0.18s ease',
                              }}
                            >
                              <span style={{ fontSize: '1.5rem', lineHeight: 1, flexShrink: 0 }}>{opt.emoji}</span>
                              <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.35 }}>
                                {opt.label}
                              </span>
                              {chosen && (
                                <div style={{ marginLeft: 'auto', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                                    <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </div>
                              )}
                            </motion.button>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* Resultados: elegir especie */}
                  {quizQ === 4 && (
                    <motion.div key="results"
                      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } }}
                      className="flex-1 flex flex-col"
                    >
                      <div style={{ marginBottom: '1.25rem', paddingTop: '1rem' }}>
                        <h2 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em', lineHeight: 1.25, marginBottom: '0.5rem' }}>
                          Tu compañero ideal es...
                        </h2>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          Basado en tus respuestas, estos son los más afines a ti. Elige el que más te llame.
                        </p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                        {quizResults.map((spId, ri) => {
                          const sp = SPECIES_LIST.find(s => s.id === spId)
                          if (!sp) return null
                          const isChosen = selectedSpecies === spId
                          return (
                            <motion.button key={spId} whileTap={{ scale: 0.98 }}
                              onClick={() => setSelected(spId)}
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0, transition: { delay: ri * 0.1, duration: 0.35, ease: EASE } }}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '1rem',
                                padding: '0.875rem 1rem',
                                borderRadius: 'var(--radius-lg)',
                                border: `2px solid ${isChosen ? sp.stages[2][1] : 'var(--border-default)'}`,
                                background: isChosen ? `${sp.stages[0][0]}` : 'var(--surface-primary)',
                                cursor: 'pointer', textAlign: 'left', width: '100%',
                                transition: 'all 0.2s ease',
                                position: 'relative',
                              }}
                            >
                              {ri === 0 && (
                                <div style={{ position: 'absolute', top: '-8px', left: '12px', background: 'var(--brand-primary)', color: 'var(--brand-primary-text)', fontSize: '0.625rem', fontWeight: 700, padding: '2px 8px', borderRadius: '99px' }}>
                                  RECOMENDADO
                                </div>
                              )}
                              <Flowling totalXp={0} species={spId} emotion="happy" size="sm" />
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                                  <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{sp.name}</span>
                                  <span style={{ fontSize: '1rem' }}>{sp.emoji}</span>
                                </div>
                                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '6px', lineHeight: 1.3 }}>
                                  {sp.tagline}
                                </p>
                                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                  {sp.traits.map(t => (
                                    <span key={t} style={{
                                      fontSize: '0.6875rem', fontWeight: 600,
                                      padding: '2px 8px', borderRadius: '99px',
                                      background: `${sp.stages[0][0]}`, color: sp.dark,
                                    }}>{t}</span>
                                  ))}
                                </div>
                              </div>
                              {isChosen && (
                                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: sp.stages[2][1], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  <svg width="12" height="9" viewBox="0 0 11 8" fill="none">
                                    <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </div>
                              )}
                            </motion.button>
                          )
                        })}
                      </div>

                      <div style={{ paddingTop: '1rem' }}>
                        <motion.button whileTap={{ scale: 0.97 }}
                          onClick={() => setStep(3)}
                          disabled={!selectedSpecies}
                          style={{
                            width: '100%', height: '52px', borderRadius: 'var(--radius-lg)',
                            background: selectedSpecies ? 'var(--brand-primary)' : 'var(--border-default)',
                            color: selectedSpecies ? 'var(--brand-primary-text)' : 'var(--text-tertiary)',
                            fontWeight: 600, fontSize: '1rem', fontFamily: 'var(--font-sans)',
                            border: 'none', cursor: selectedSpecies ? 'pointer' : 'not-allowed', transition: 'all 0.2s ease',
                          }}
                        >
                          {selectedSpecies
                            ? `Continuar con ${SPECIES_LIST.find(s => s.id === selectedSpecies)?.name} →`
                            : 'Elige tu compañero'}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </motion.div>
            )}

            {/* ── PASO 3: Proyectos ── */}
            {step === 3 && (
              <motion.div key="s3"
                initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } }}
                exit={{ opacity: 0, x: -24, transition: { duration: 0.25 } }}
                className="flex-1 flex flex-col"
              >
                <div style={{ marginBottom: '1.5rem', paddingTop: '1rem' }}>
                  <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '0.5rem' }}>
                    ¿Cuáles son tus proyectos, {name}?
                  </h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                    Selecciona los que manejas ahora. Puedes agregar más después.
                  </p>
                </div>

                <div className="flex flex-col gap-2" style={{ flex: 1, overflowY: 'auto', paddingBottom: '1rem' }}>
                  {SUGGESTED_PROJECTS.map((p, i) => {
                    const isSelected = selected.has(i)
                    return (
                      <motion.button key={i} whileTap={{ scale: 0.98 }} onClick={() => toggleProject(i)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '0.75rem',
                          padding: '0.875rem 1rem', borderRadius: 'var(--radius-lg)',
                          border: `1.5px solid ${isSelected ? p.color : 'var(--border-default)'}`,
                          background: isSelected ? `${p.color}12` : 'var(--surface-primary)',
                          cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.18s ease',
                        }}
                      >
                        <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{p.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '1px' }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>{categoryLabel[p.category]}</div>
                        </div>
                        {isSelected && (
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                              <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        )}
                      </motion.button>
                    )
                  })}

                  {customProjects.map((p, i) => (
                    <motion.div key={`c${i}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem', borderRadius: 'var(--radius-lg)', border: `1.5px solid ${p.color}`, background: `${p.color}12` }}
                    >
                      <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{p.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '1px' }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>{categoryLabel[p.category]}</div>
                      </div>
                      <button onClick={() => setCustomProjects(prev => prev.filter((_, idx) => idx !== i))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '4px', fontSize: '1rem', lineHeight: 1 }}>✕</button>
                    </motion.div>
                  ))}

                  <AnimatePresence>
                    {showCustomForm ? (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1.5px dashed var(--brand-primary)', background: 'rgba(240,107,138,0.04)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                      >
                        <div>
                          <p style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>Elige un ícono</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {QUICK_EMOJIS.map(e => (
                              <button key={e} type="button" onClick={() => setCustomEmoji(e)}
                                style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', border: `1.5px solid ${customEmoji === e ? 'var(--brand-primary)' : 'var(--border-default)'}`, background: customEmoji === e ? 'rgba(240,107,138,0.1)' : 'var(--surface-primary)', fontSize: '1.1rem', cursor: 'pointer' }}
                              >{e}</button>
                            ))}
                          </div>
                        </div>
                        <input type="text" autoFocus value={customName} onChange={e => setCustomName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCustomProject()} placeholder="Nombre del proyecto..."
                          style={{ height: '44px', padding: '0 0.875rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-default)', background: 'var(--surface-primary)', color: 'var(--text-primary)', fontSize: '0.9375rem', fontFamily: 'var(--font-sans)', outline: 'none' }}
                          onFocus={e => (e.target.style.borderColor = 'var(--brand-primary)')}
                          onBlur={e => (e.target.style.borderColor = 'var(--border-default)')}
                        />
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {(['work','personal','life'] as Category[]).map(cat => (
                            <button key={cat} type="button" onClick={() => setCustomCategory(cat)}
                              style={{ flex: 1, height: '34px', borderRadius: 'var(--radius-md)', border: `1.5px solid ${customCategory === cat ? 'var(--brand-primary)' : 'var(--border-default)'}`, background: customCategory === cat ? 'rgba(240,107,138,0.1)' : 'var(--surface-primary)', color: customCategory === cat ? 'var(--brand-primary)' : 'var(--text-tertiary)', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
                            >{categoryLabel[cat]}</button>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button type="button" onClick={() => setShowCustomForm(false)}
                            style={{ flex: 1, height: '40px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-default)', background: 'none', color: 'var(--text-tertiary)', fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>Cancelar</button>
                          <button type="button" onClick={addCustomProject} disabled={!customName.trim()}
                            style={{ flex: 2, height: '40px', borderRadius: 'var(--radius-md)', border: 'none', background: customName.trim() ? 'var(--brand-primary)' : 'var(--border-default)', color: customName.trim() ? 'var(--brand-primary-text)' : 'var(--text-tertiary)', fontSize: '0.875rem', fontWeight: 600, cursor: customName.trim() ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-sans)' }}>Agregar proyecto</button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setShowCustomForm(true)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.875rem 1rem', borderRadius: 'var(--radius-lg)', border: '1.5px dashed var(--border-strong)', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.9375rem', fontWeight: 500, fontFamily: 'var(--font-sans)', width: '100%' }}
                      ><span style={{ fontSize: '1.1rem' }}>＋</span> Agregar proyecto propio</motion.button>
                    )}
                  </AnimatePresence>
                </div>

                <div style={{ paddingTop: '1rem' }}>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(4)}
                    style={{ width: '100%', height: '52px', borderRadius: 'var(--radius-lg)', background: 'var(--brand-primary)', color: 'var(--brand-primary-text)', fontWeight: 600, fontSize: '1rem', fontFamily: 'var(--font-sans)', border: 'none', cursor: 'pointer' }}
                  >
                    {(selected.size + customProjects.length) === 0
                      ? 'Continuar sin proyectos'
                      : `Continuar con ${selected.size + customProjects.length} proyecto${(selected.size + customProjects.length) > 1 ? 's' : ''} →`}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ── PASO 4: WhatsApp ── */}
            {step === 4 && (
              <motion.div key="s4"
                initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } }}
                exit={{ opacity: 0, x: -24, transition: { duration: 0.25 } }}
                className="flex-1 flex flex-col"
              >
                <div style={{ marginBottom: '2rem', paddingTop: '1rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem', lineHeight: 1 }}>💬</div>
                  <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '0.5rem' }}>
                    Tu número de WhatsApp
                  </h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.5 }}>
                    Flowi te enviará recordatorios y motivación. Puedes agregarlo más adelante desde Ajustes.
                  </p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                    Número de WhatsApp
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.9375rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>+</span>
                    <input type="tel" value={waPhone}
                      onChange={e => setWaPhone(e.target.value.replace(/[^\d+\s-]/g, ''))}
                      placeholder="57 300 000 0000"
                      style={{ width: '100%', height: '52px', padding: '0 1rem 0 1.75rem', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--border-default)', background: 'var(--surface-primary)', color: 'var(--text-primary)', fontSize: '1rem', fontFamily: 'var(--font-sans)', outline: 'none' }}
                      onFocus={e => (e.target.style.borderColor = 'var(--brand-primary)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--border-default)')}
                    />
                  </div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                    Incluye el código de país. Ej: +57 para Colombia.
                  </p>
                </div>

                <div style={{ padding: '1rem', borderRadius: 'var(--radius-lg)', background: 'rgba(240,107,138,0.07)', border: '1px solid rgba(240,107,138,0.2)', marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    🔗 El número de WhatsApp de Flowi lo configuramos juntas en la siguiente sesión.
                    Por ahora guarda el tuyo para que quede listo.
                  </p>
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={handleFinish} disabled={loading}
                    style={{ width: '100%', height: '52px', borderRadius: 'var(--radius-lg)', background: loading ? 'var(--border-default)' : 'var(--brand-primary)', color: loading ? 'var(--text-tertiary)' : 'var(--brand-primary-text)', fontWeight: 600, fontSize: '1rem', fontFamily: 'var(--font-sans)', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: '0.75rem' }}
                  >{loading ? 'Guardando...' : '¡Empezar a usar Flowi! 🎉'}</motion.button>
                  <button onClick={handleFinish} disabled={loading}
                    style={{ width: '100%', height: '44px', background: 'none', border: 'none', color: 'var(--text-tertiary)', fontSize: '0.875rem', cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
                  >Omitir por ahora</button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
