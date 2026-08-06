'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { QUIZ, SPECIES_LIST, computeQuizResult, type SpeciesId } from '@/lib/flowlings/species'
import { DEFAULT_AREAS } from '@/lib/areas/defaults'
import EggHatch from '@/components/EggHatch'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]
const TOTAL_STEPS = 4  // nombre, quiz, áreas, whatsapp (huevo no cuenta en barra)

interface AreaSetup {
  name: string; emoji: string; color: string; description: string
  order_index: number; questions: string[]; answers: number[]
}

function scoreLabel(v: number) {
  if (v < 40) return 'Por mejorar'
  if (v < 60) return 'Regular'
  if (v < 75) return 'Bien'
  if (v < 90) return 'Muy bien'
  return 'Excelente'
}

function QuestionSlider({ question, value, color, onChange }: {
  question: string; value: number; color: string; onChange: (v: number) => void
}) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <p style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '0.625rem', lineHeight: 1.4 }}>
        {question}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <input type="range" min={0} max={100} step={5} value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{
            flex: 1, height: '6px', appearance: 'none', borderRadius: '99px',
            background: `linear-gradient(to right, ${color} 0%, ${color} ${value}%, var(--surface-secondary) ${value}%, var(--surface-secondary) 100%)`,
            outline: 'none', cursor: 'pointer',
          }}
        />
        <span style={{ fontSize: '1rem', fontWeight: 800, color, minWidth: '40px', textAlign: 'right' }}>
          {value}
        </span>
      </div>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500, marginTop: '2px' }}>
        {scoreLabel(value)}
      </p>
    </div>
  )
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')

  // Quiz (step 2)
  const [quizAnswers, setQuizAnswers] = useState<number[]>([-1, -1, -1, -1])
  const [quizQ, setQuizQ]             = useState(0)
  const [selectedSpecies, setSelected] = useState<SpeciesId | ''>('')

  // Diagnóstico de áreas (step 3)
  const [areas]        = useState<AreaSetup[]>(DEFAULT_AREAS.map(a => ({ ...a, answers: a.questions.map(() => 70) })))
  const [areaAnswers, setAreaAnswers] = useState<number[][]>(DEFAULT_AREAS.map(a => a.questions.map(() => 70)))
  const [diagIndex, setDiagIndex]     = useState(0)

  // WhatsApp (step 4)
  const [waPhone, setWaPhone] = useState('')
  const [loading, setLoading] = useState(false)

  // Egg hatch (step 5 — virtual, sin barra)
  const [topAreaIndexes, setTopAreaIndexes] = useState<number[]>([])

  const router = useRouter()

  // ── Quiz helpers ─────────────────────────────────────────────────────────
  const quizResults = quizAnswers.every(a => a >= 0) ? computeQuizResult(quizAnswers) : []

  function answerQuiz(qIdx: number, optIdx: number) {
    const next = [...quizAnswers]; next[qIdx] = optIdx; setQuizAnswers(next)
    if (qIdx < 3) { setTimeout(() => setQuizQ(qIdx + 1), 340) }
    else          { setTimeout(() => setQuizQ(4), 340) }
  }

  // ── Area helpers ──────────────────────────────────────────────────────────
  function updateAnswer(areaIdx: number, qIdx: number, value: number) {
    setAreaAnswers(prev => {
      const next = prev.map(row => [...row])
      next[areaIdx][qIdx] = value
      return next
    })
  }

  function getAreaScore(areaIdx: number) {
    const ans = areaAnswers[areaIdx]
    return Math.round(ans.reduce((s, v) => s + v, 0) / ans.length)
  }

  // ── Finish ────────────────────────────────────────────────────────────────
  async function handleFinish() {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const species = selectedSpecies || quizResults[0] || 'bloom'

    // Top area indexes por score (para el Flowling en el huevo)
    const top = areas
      .map((_, i) => ({ i, score: getAreaScore(i) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3).map(a => a.i)
    setTopAreaIndexes(top)

    // Actualizar perfil
    await supabase.from('profiles').update({
      name: name.trim() || user.user_metadata?.full_name || '',
      whatsapp_phone: waPhone.trim() || null,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id)

    // Avatar global con especie
    await supabase.from('user_avatars').upsert(
      { user_id: user.id, species, total_xp: 0, level: 1 },
      { onConflict: 'user_id' }
    )

    // Crear áreas
    const { data: createdAreas } = await supabase.from('areas').insert(
      areas.map((a, idx) => ({
        user_id: user.id, name: a.name, emoji: a.emoji, color: a.color,
        description: a.description, order_index: idx, is_default: true,
      }))
    ).select('id, order_index')

    if (createdAreas) {
      await supabase.from('area_evaluations').insert(
        createdAreas.map(ca => ({
          user_id: user.id, area_id: ca.id,
          score: getAreaScore(ca.order_index), notes: 'Diagnóstico inicial',
        }))
      )
      await supabase.from('area_avatars').insert(
        createdAreas.map(ca => ({ user_id: user.id, area_id: ca.id, xp: 0, level: 1 }))
      )
    }

    await supabase.from('streaks').upsert(
      { user_id: user.id, current_streak: 0, longest_streak: 0 },
      { onConflict: 'user_id' }
    )

    if (waPhone.trim()) {
      fetch('/api/whatsapp/welcome', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: waPhone.trim(), name: name.trim() || 'amiga' }),
      }).catch(() => {})
    }

    setLoading(false)
    setStep(5)
  }

  const currentArea  = areas[diagIndex]
  const currentScore = getAreaScore(diagIndex)
  const species      = selectedSpecies || quizResults[0] || 'bloom'

  return (
    <div className="flowi-bg min-h-dvh flex flex-col items-center">
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          appearance: none; width: 22px; height: 22px; border-radius: 50%;
          background: var(--thumb-color, #10B981); border: 2px solid white;
          box-shadow: 0 1px 6px rgba(0,0,0,0.2); cursor: pointer;
        }
      `}</style>

      {/* ── PASO 5: Huevo (sin barra de progreso) ── */}
      {step === 5 && (
        <div style={{ width: '100%', maxWidth: '520px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <EggHatch
            topAreaIndexes={topAreaIndexes}
            species={species}
            onComplete={() => { router.push('/app'); router.refresh() }}
          />
        </div>
      )}

      {/* ── PASOS 1-4 ── */}
      {step < 5 && (
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
                    <input type="text" autoFocus value={name}
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
                                  padding: '1rem 1.125rem', borderRadius: 'var(--radius-lg)',
                                  border: `1.5px solid ${chosen ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                                  background: chosen ? 'rgba(240,107,138,0.08)' : 'var(--surface-primary)',
                                  cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.18s ease',
                                }}
                              >
                                <span style={{ fontSize: '1.5rem', lineHeight: 1, flexShrink: 0 }}>{opt.emoji}</span>
                                <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.35 }}>
                                  {opt.label}
                                </span>
                                {chosen && (
                                  <div style={{ marginLeft: 'auto', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <svg width="11" height="8" viewBox="0 0 11 8" fill="none"><path d="M1 4L4 7L10 1" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                  </div>
                                )}
                              </motion.button>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}

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
                            Elige el que más te llame.
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
                                  padding: '0.875rem 1rem', borderRadius: 'var(--radius-lg)',
                                  border: `2px solid ${isChosen ? sp.stages[2][1] : 'var(--border-default)'}`,
                                  background: isChosen ? sp.stages[0][0] : 'var(--surface-primary)',
                                  cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.2s ease',
                                  position: 'relative',
                                }}
                              >
                                {ri === 0 && (
                                  <div style={{ position: 'absolute', top: '-8px', left: '12px', background: 'var(--brand-primary)', color: 'var(--brand-primary-text)', fontSize: '0.625rem', fontWeight: 700, padding: '2px 8px', borderRadius: '99px' }}>
                                    RECOMENDADO
                                  </div>
                                )}
                                <span style={{ fontSize: '2rem', flexShrink: 0 }}>{sp.emoji}</span>
                                <div style={{ flex: 1 }}>
                                  <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px' }}>{sp.name}</p>
                                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '6px', lineHeight: 1.3 }}>{sp.tagline}</p>
                                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                    {sp.traits.map(t => (
                                      <span key={t} style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '2px 8px', borderRadius: '99px', background: sp.stages[0][0], color: sp.dark }}>{t}</span>
                                    ))}
                                  </div>
                                </div>
                                {isChosen && (
                                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: sp.stages[2][1], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <svg width="12" height="9" viewBox="0 0 11 8" fill="none"><path d="M1 4L4 7L10 1" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                  </div>
                                )}
                              </motion.button>
                            )
                          })}
                        </div>

                        <div style={{ paddingTop: '1rem' }}>
                          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(3)} disabled={!selectedSpecies}
                            style={{
                              width: '100%', height: '52px', borderRadius: 'var(--radius-lg)',
                              background: selectedSpecies ? 'var(--brand-primary)' : 'var(--border-default)',
                              color: selectedSpecies ? 'var(--brand-primary-text)' : 'var(--text-tertiary)',
                              fontWeight: 600, fontSize: '1rem', fontFamily: 'var(--font-sans)',
                              border: 'none', cursor: selectedSpecies ? 'pointer' : 'not-allowed', transition: 'all 0.2s ease',
                            }}
                          >
                            {selectedSpecies ? `Continuar con ${SPECIES_LIST.find(s => s.id === selectedSpecies)?.name} →` : 'Elige tu compañero'}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* ── PASO 3: Diagnóstico de áreas ── */}
              {step === 3 && (
                <motion.div key="s3"
                  initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } }}
                  exit={{ opacity: 0, x: -24, transition: { duration: 0.25 } }}
                  className="flex-1 flex flex-col"
                >
                  <div style={{ marginBottom: '1rem', paddingTop: '1rem' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
                      Tu diagnóstico inicial
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                      Responde con honestidad — nadie más lo verá.
                    </p>
                  </div>

                  {/* Mini barra de progreso entre áreas */}
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '1.25rem' }}>
                    {areas.map((a, i) => (
                      <div key={i} onClick={() => i < diagIndex && setDiagIndex(i)} style={{
                        flex: 1, height: '4px', borderRadius: '99px',
                        cursor: i < diagIndex ? 'pointer' : 'default',
                        background: i <= diagIndex ? a.color : 'var(--border-default)',
                        opacity: i < diagIndex ? 0.7 : i === diagIndex ? 1 : 0.35,
                        transition: 'all 0.3s',
                      }} />
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div key={diagIndex}
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } }}
                      exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
                      className="flex-1 flex flex-col"
                    >
                      <div style={{
                        background: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)',
                        padding: '1.25rem', border: '1px solid var(--border-default)',
                        borderTop: `4px solid ${currentArea.color}`, marginBottom: '1rem',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${currentArea.color}20`, border: `1.5px solid ${currentArea.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
                            {currentArea.emoji}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1px' }}>{currentArea.name}</p>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{currentArea.description}</p>
                          </div>
                          <div style={{ textAlign: 'center', flexShrink: 0 }}>
                            <p style={{ fontSize: '1.5rem', fontWeight: 900, color: currentArea.color, lineHeight: 1 }}>{currentScore}</p>
                            <p style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>promedio</p>
                          </div>
                        </div>
                        <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '1rem' }}>
                          {currentArea.questions.map((q, qi) => (
                            <QuestionSlider key={qi} question={q}
                              value={areaAnswers[diagIndex][qi]}
                              color={currentArea.color}
                              onChange={v => updateAnswer(diagIndex, qi, v)}
                            />
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                        {diagIndex > 0 && (
                          <button onClick={() => setDiagIndex(i => i - 1)} style={{
                            flex: 1, height: '48px', borderRadius: 'var(--radius-lg)',
                            border: '1.5px solid var(--border-default)', background: 'none',
                            color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer',
                            fontFamily: 'var(--font-sans)', fontSize: '0.9375rem',
                          }}>← Anterior</button>
                        )}
                        {diagIndex < areas.length - 1 ? (
                          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setDiagIndex(i => i + 1)}
                            style={{
                              flex: 2, height: '48px', borderRadius: 'var(--radius-lg)',
                              background: currentArea.color, color: 'white',
                              fontWeight: 700, fontSize: '0.9375rem', border: 'none',
                              cursor: 'pointer', fontFamily: 'var(--font-sans)',
                            }}
                          >
                            Siguiente ({diagIndex + 2}/{areas.length}) →
                          </motion.button>
                        ) : (
                          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(4)}
                            style={{
                              flex: 2, height: '48px', borderRadius: 'var(--radius-lg)',
                              background: 'var(--brand-primary)', color: 'var(--brand-primary-text)',
                              fontWeight: 700, fontSize: '0.9375rem', border: 'none',
                              cursor: 'pointer', fontFamily: 'var(--font-sans)',
                            }}
                          >Continuar →</motion.button>
                        )}
                      </div>
                    </motion.div>
                  </AnimatePresence>
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
      )}
    </div>
  )
}
