'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { DEFAULT_AREAS } from '@/lib/areas/defaults'
import AvatarStar from '@/components/AvatarStar'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]
const TOTAL_STEPS = 3

interface AreaSetup {
  name: string
  emoji: string
  color: string
  description: string
  order_index: number
  score: number
}

function ScoreSlider({ value, color, onChange }: { value: number; color: string; onChange: (v: number) => void }) {
  const label = value < 40 ? 'Por mejorar' : value < 60 ? 'Regular' : value < 80 ? 'Bien' : value < 90 ? 'Muy bien' : 'Excelente'
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: '1rem', fontWeight: 800, color }}>{value}%</span>
      </div>
      <input
        type="range"
        min={0} max={100} step={5}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          width: '100%',
          height: '6px',
          appearance: 'none',
          borderRadius: '99px',
          background: `linear-gradient(to right, ${color} 0%, ${color} ${value}%, var(--surface-secondary) ${value}%, var(--surface-secondary) 100%)`,
          outline: 'none',
          cursor: 'pointer',
        }}
      />
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          appearance: none;
          width: 20px; height: 20px;
          border-radius: 50%;
          background: ${color};
          border: 2px solid white;
          box-shadow: 0 1px 6px rgba(0,0,0,0.2);
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}

export default function SetupAreasPage() {
  const [step, setStep] = useState(1)
  const [areas, setAreas] = useState<AreaSetup[]>(
    DEFAULT_AREAS.map(a => ({ ...a, score: 70 }))
  )
  const [diagIndex, setDiagIndex] = useState(0)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const updateAreaName = (i: number, name: string) => {
    setAreas(prev => prev.map((a, idx) => idx === i ? { ...a, name } : a))
  }

  const updateScore = (i: number, score: number) => {
    setAreas(prev => prev.map((a, idx) => idx === i ? { ...a, score } : a))
  }

  const handleFinish = async () => {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // Create areas
    const { data: createdAreas } = await supabase.from('areas').insert(
      areas.map((a, idx) => ({
        user_id: user.id,
        name: a.name,
        emoji: a.emoji,
        color: a.color,
        description: a.description,
        order_index: idx,
        is_default: true,
      }))
    ).select('id, order_index')

    if (createdAreas) {
      // Create evaluations (initial diagnostic)
      await supabase.from('area_evaluations').insert(
        createdAreas.map(ca => ({
          user_id: user.id,
          area_id: ca.id,
          score: areas[ca.order_index]?.score ?? 70,
          notes: 'Diagnóstico inicial',
        }))
      )

      // Create avatar records (XP=0)
      await supabase.from('area_avatars').insert(
        createdAreas.map(ca => ({
          user_id: user.id,
          area_id: ca.id,
          xp: 0,
          level: 1,
        }))
      )
    }

    // Create streak record
    await supabase.from('streaks').upsert({
      user_id: user.id,
      current_streak: 0,
      longest_streak: 0,
    }, { onConflict: 'user_id' })

    router.push('/app')
    router.refresh()
  }

  const currentArea = areas[diagIndex]

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg-base)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: '520px', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Progress bar */}
        <div style={{ padding: '1.5rem 1.5rem 0' }}>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '0.5rem' }}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div key={i} style={{
                flex: 1, height: '3px', borderRadius: '99px',
                background: i < step ? 'var(--brand-primary)' : 'var(--border-default)',
                transition: 'background 0.4s ease',
              }} />
            ))}
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
            Paso {step} de {TOTAL_STEPS}
          </p>
        </div>

        <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <AnimatePresence mode="wait">

            {/* PASO 1 — Bienvenida al nuevo Flowi */}
            {step === 1 && (
              <motion.div key="s1"
                initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } }}
                exit={{ opacity: 0, x: -24, transition: { duration: 0.25 } }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: 1 }}>✦</div>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: '0.75rem' }}>
                    Flowi se renovó
                  </h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
                    Ahora eres el centro. Flowi organiza tu vida en <strong>8 áreas</strong> que juntas forman quién eres — y cada una tiene su propio avatar que crece contigo.
                  </p>
                </div>

                {/* Area previews */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '2rem' }}>
                  {DEFAULT_AREAS.map((a, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1, transition: { delay: 0.1 + i * 0.06, duration: 0.4, ease: EASE } }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
                    >
                      <div style={{
                        width: '52px', height: '52px', borderRadius: '16px',
                        background: `${a.color}18`,
                        border: `1.5px solid ${a.color}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem',
                      }}>
                        {a.emoji}
                      </div>
                      <p style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>
                        {a.name.split(' ').slice(0, 2).join(' ')}
                      </p>
                    </motion.div>
                  ))}
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setStep(2)}
                    style={{
                      width: '100%', height: '52px', borderRadius: 'var(--radius-lg)',
                      background: 'var(--brand-primary)', color: 'var(--brand-primary-text)',
                      fontWeight: 700, fontSize: '1rem', fontFamily: 'var(--font-sans)',
                      border: 'none', cursor: 'pointer',
                    }}
                  >
                    Configurar mis áreas →
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* PASO 2 — Nombres de áreas */}
            {step === 2 && (
              <motion.div key="s2"
                initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } }}
                exit={{ opacity: 0, x: -24, transition: { duration: 0.25 } }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ marginBottom: '1.5rem' }}>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '0.5rem' }}>
                    Tus 8 áreas de vida
                  </h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                    Los nombres son sugeridos. Personalízalos como quieras.
                  </p>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.625rem', paddingBottom: '1rem' }}>
                  {areas.map((area, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      background: 'var(--surface-primary)', borderRadius: 'var(--radius-lg)',
                      padding: '0.75rem 1rem', border: '1px solid var(--border-default)',
                    }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '12px',
                        background: `${area.color}18`, border: `1.5px solid ${area.color}40`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.25rem', flexShrink: 0,
                      }}>
                        {area.emoji}
                      </div>
                      <input
                        type="text"
                        value={area.name}
                        onChange={e => updateAreaName(i, e.target.value)}
                        style={{
                          flex: 1, background: 'none', border: 'none', outline: 'none',
                          fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)',
                          fontFamily: 'var(--font-sans)',
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div style={{ paddingTop: '1rem' }}>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setStep(3)}
                    style={{
                      width: '100%', height: '52px', borderRadius: 'var(--radius-lg)',
                      background: 'var(--brand-primary)', color: 'var(--brand-primary-text)',
                      fontWeight: 700, fontSize: '1rem', fontFamily: 'var(--font-sans)',
                      border: 'none', cursor: 'pointer',
                    }}
                  >
                    Continuar al diagnóstico →
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* PASO 3 — Diagnóstico */}
            {step === 3 && (
              <motion.div key="s3"
                initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } }}
                exit={{ opacity: 0, x: -24, transition: { duration: 0.25 } }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ marginBottom: '1.25rem' }}>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: '0.375rem' }}>
                    Tu diagnóstico inicial
                  </h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                    ¿Cómo está cada área hoy? Sé honesta — nadie más lo verá.
                  </p>
                </div>

                {/* Progress through areas */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '1.25rem' }}>
                  {areas.map((_, i) => (
                    <div
                      key={i}
                      onClick={() => setDiagIndex(i)}
                      style={{
                        flex: 1, height: '4px', borderRadius: '99px', cursor: 'pointer',
                        background: i <= diagIndex ? areas[i].color : 'var(--border-default)',
                        transition: 'background 0.3s ease',
                      }}
                    />
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div key={diagIndex}
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } }}
                    exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
                  >
                    {/* Area card */}
                    <div style={{
                      background: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)',
                      padding: '1.5rem', border: '1px solid var(--border-default)',
                      borderTop: `4px solid ${currentArea.color}`,
                      marginBottom: '1.5rem', flex: 1,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                        <AvatarStar xp={0} color={currentArea.color} emoji={currentArea.emoji} size="md" />
                        <div>
                          <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                            {currentArea.name}
                          </p>
                          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                            {currentArea.description}
                          </p>
                        </div>
                      </div>

                      <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                        ¿Cómo está esta área en tu vida hoy?
                      </p>

                      <ScoreSlider
                        value={currentArea.score}
                        color={currentArea.color}
                        onChange={v => updateScore(diagIndex, v)}
                      />

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>0 — Muy mal</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>100 — Excelente</span>
                      </div>
                    </div>

                    {/* Navigation */}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      {diagIndex > 0 && (
                        <button
                          onClick={() => setDiagIndex(i => i - 1)}
                          style={{
                            flex: 1, height: '48px', borderRadius: 'var(--radius-lg)',
                            border: '1.5px solid var(--border-default)', background: 'none',
                            color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer',
                            fontFamily: 'var(--font-sans)', fontSize: '0.9375rem',
                          }}
                        >
                          ← Anterior
                        </button>
                      )}

                      {diagIndex < areas.length - 1 ? (
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setDiagIndex(i => i + 1)}
                          style={{
                            flex: 2, height: '48px', borderRadius: 'var(--radius-lg)',
                            background: currentArea.color, color: 'white',
                            fontWeight: 700, fontSize: '0.9375rem', border: 'none',
                            cursor: 'pointer', fontFamily: 'var(--font-sans)',
                          }}
                        >
                          Siguiente área ({diagIndex + 2}/{areas.length}) →
                        </motion.button>
                      ) : (
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={handleFinish}
                          disabled={saving}
                          style={{
                            flex: 2, height: '48px', borderRadius: 'var(--radius-lg)',
                            background: saving ? 'var(--border-default)' : 'var(--brand-primary)',
                            color: saving ? 'var(--text-tertiary)' : 'var(--brand-primary-text)',
                            fontWeight: 700, fontSize: '0.9375rem', border: 'none',
                            cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-sans)',
                          }}
                        >
                          {saving ? 'Guardando...' : '¡Comenzar mi viaje! 🚀'}
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>

              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
