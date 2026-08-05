'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

// Plantillas genéricas para cualquier usuario
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

interface Project {
  name: string
  emoji: string
  color: string
  category: Category
}

const CUSTOM_COLORS = ['#F06B8A','#6B8AF0','#F0A06B','#6BC96B','#A06BF0','#F0D06B','#6BF0D0','#F06B6B']
const QUICK_EMOJIS = ['📌','⭐','🎯','🔥','💡','🌱','🎨','🛠️','📝','🏆','💎','🌍']

const categoryLabel: Record<Category, string> = {
  work:     'Trabajo',
  personal: 'Personal',
  life:     'Vida',
}

export default function OnboardingPage() {
  const [step, setStep]             = useState(1)
  const [name, setName]             = useState('')
  const [selected, setSelected]     = useState<Set<number>>(new Set())
  const [customProjects, setCustomProjects] = useState<Project[]>([])
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customName, setCustomName]   = useState('')
  const [customEmoji, setCustomEmoji] = useState('📌')
  const [customCategory, setCustomCategory] = useState<Category>('personal')
  const [waPhone, setWaPhone]       = useState('')
  const [loading, setLoading]       = useState(false)
  const router = useRouter()

  const addCustomProject = () => {
    if (!customName.trim()) return
    const color = CUSTOM_COLORS[customProjects.length % CUSTOM_COLORS.length]
    setCustomProjects(prev => [...prev, {
      name: customName.trim(),
      emoji: customEmoji,
      color,
      category: customCategory,
    }])
    setCustomName('')
    setCustomEmoji('📌')
    setCustomCategory('personal')
    setShowCustomForm(false)
  }

  const removeCustomProject = (i: number) => {
    setCustomProjects(prev => prev.filter((_, idx) => idx !== i))
  }

  const toggleProject = (i: number) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  const handleFinish = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    await supabase.from('profiles').update({
      name: name.trim() || user.user_metadata?.full_name || '',
      whatsapp_phone: waPhone.trim() || null,
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id)

    const suggested: Project[] = Array.from(selected).map(i => SUGGESTED_PROJECTS[i])
    const allProjects = [...suggested, ...customProjects]
    if (allProjects.length > 0) {
      await supabase.from('projects').insert(
        allProjects.map((p, idx) => ({
          user_id:    user.id,
          name:       p.name,
          emoji:      p.emoji,
          color:      p.color,
          category:   p.category,
          sort_order: idx,
        }))
      )
    }

    // Mensaje de bienvenida por WhatsApp
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

      {/* Header con progreso */}
      <div style={{ padding: '1.5rem 1.5rem 0' }}>
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              flex: 1,
              height: '3px',
              borderRadius: '99px',
              background: s <= step ? 'var(--brand-primary)' : 'var(--border-default)',
              transition: 'background 0.4s ease',
            }} />
          ))}
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 flex flex-col" style={{ padding: '0 1.5rem 2rem' }}>
        <AnimatePresence mode="wait">

          {/* PASO 1 — Bienvenida */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } }}
              exit={{ opacity: 0, x: -24, transition: { duration: 0.25 } }}
              className="flex-1 flex flex-col"
            >
              <div style={{ marginBottom: '2rem' }}>
                <div style={{
                  fontSize: '2.5rem',
                  marginBottom: '1rem',
                  lineHeight: 1,
                }}>👋</div>
                <h1 style={{
                  fontSize: '1.625rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                  marginBottom: '0.5rem',
                }}>
                  Hola, bienvenida a flowi
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
                  type="text"
                  autoFocus
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Luisa"
                  onKeyDown={e => e.key === 'Enter' && name.trim() && setStep(2)}
                  style={{
                    width: '100%',
                    height: '52px',
                    padding: '0 1rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '1.5px solid var(--border-default)',
                    background: 'var(--surface-primary)',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    fontFamily: 'var(--font-sans)',
                    outline: 'none',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--brand-primary)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border-default)')}
                />
              </div>

              <div style={{ marginTop: 'auto' }}>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setStep(2)}
                  disabled={!name.trim()}
                  style={{
                    width: '100%',
                    height: '52px',
                    borderRadius: 'var(--radius-lg)',
                    background: name.trim() ? 'var(--brand-primary)' : 'var(--border-default)',
                    color: name.trim() ? 'var(--brand-primary-text)' : 'var(--text-tertiary)',
                    fontWeight: 600,
                    fontSize: '1rem',
                    fontFamily: 'var(--font-sans)',
                    border: 'none',
                    cursor: name.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Continuar →
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* PASO 2 — Proyectos */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } }}
              exit={{ opacity: 0, x: -24, transition: { duration: 0.25 } }}
              className="flex-1 flex flex-col"
            >
              <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{
                  fontSize: '1.625rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                  marginBottom: '0.5rem',
                }}>
                  ¿Cuáles son tus proyectos, {name}?
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                  Selecciona los que manejas ahora. Puedes agregar más después.
                </p>
              </div>

              <div className="flex flex-col gap-2" style={{ flex: 1, overflowY: 'auto', paddingBottom: '1rem' }}>
                {/* Sugerencias */}
                {SUGGESTED_PROJECTS.map((p, i) => {
                  const isSelected = selected.has(i)
                  return (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleProject(i)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.875rem 1rem',
                        borderRadius: 'var(--radius-lg)',
                        border: `1.5px solid ${isSelected ? p.color : 'var(--border-default)'}`,
                        background: isSelected ? `${p.color}12` : 'var(--surface-primary)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        width: '100%',
                        transition: 'all 0.18s ease',
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

                {/* Proyectos custom ya agregados */}
                {customProjects.map((p, i) => (
                  <motion.div
                    key={`custom-${i}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.875rem 1rem',
                      borderRadius: 'var(--radius-lg)',
                      border: `1.5px solid ${p.color}`,
                      background: `${p.color}12`,
                    }}
                  >
                    <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{p.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '1px' }}>{p.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>{categoryLabel[p.category]}</div>
                    </div>
                    <button
                      onClick={() => removeCustomProject(i)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '4px', fontSize: '1rem', lineHeight: 1 }}
                    >✕</button>
                  </motion.div>
                ))}

                {/* Formulario para agregar proyecto propio */}
                <AnimatePresence>
                  {showCustomForm ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-lg)',
                        border: '1.5px dashed var(--brand-primary)',
                        background: 'rgba(240,107,138,0.04)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                      }}
                    >
                      {/* Selector de emoji */}
                      <div>
                        <p style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>Elige un ícono</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {QUICK_EMOJIS.map(e => (
                            <button
                              key={e}
                              type="button"
                              onClick={() => setCustomEmoji(e)}
                              style={{
                                width: '36px', height: '36px',
                                borderRadius: 'var(--radius-md)',
                                border: `1.5px solid ${customEmoji === e ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                                background: customEmoji === e ? 'rgba(240,107,138,0.1)' : 'var(--surface-primary)',
                                fontSize: '1.1rem', cursor: 'pointer',
                              }}
                            >{e}</button>
                          ))}
                        </div>
                      </div>

                      {/* Nombre */}
                      <input
                        type="text"
                        autoFocus
                        value={customName}
                        onChange={e => setCustomName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addCustomProject()}
                        placeholder="Nombre del proyecto..."
                        style={{
                          height: '44px', padding: '0 0.875rem',
                          borderRadius: 'var(--radius-md)',
                          border: '1.5px solid var(--border-default)',
                          background: 'var(--surface-primary)',
                          color: 'var(--text-primary)',
                          fontSize: '0.9375rem',
                          fontFamily: 'var(--font-sans)',
                          outline: 'none',
                        }}
                        onFocus={e => (e.target.style.borderColor = 'var(--brand-primary)')}
                        onBlur={e => (e.target.style.borderColor = 'var(--border-default)')}
                      />

                      {/* Categoría */}
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {(['work','personal','life'] as Category[]).map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setCustomCategory(cat)}
                            style={{
                              flex: 1, height: '34px',
                              borderRadius: 'var(--radius-md)',
                              border: `1.5px solid ${customCategory === cat ? 'var(--brand-primary)' : 'var(--border-default)'}`,
                              background: customCategory === cat ? 'rgba(240,107,138,0.1)' : 'var(--surface-primary)',
                              color: customCategory === cat ? 'var(--brand-primary)' : 'var(--text-tertiary)',
                              fontSize: '0.8125rem', fontWeight: 600,
                              cursor: 'pointer', fontFamily: 'var(--font-sans)',
                            }}
                          >{categoryLabel[cat]}</button>
                        ))}
                      </div>

                      {/* Acciones */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => setShowCustomForm(false)}
                          style={{
                            flex: 1, height: '40px',
                            borderRadius: 'var(--radius-md)',
                            border: '1.5px solid var(--border-default)',
                            background: 'none',
                            color: 'var(--text-tertiary)',
                            fontSize: '0.875rem', fontWeight: 500,
                            cursor: 'pointer', fontFamily: 'var(--font-sans)',
                          }}
                        >Cancelar</button>
                        <button
                          type="button"
                          onClick={addCustomProject}
                          disabled={!customName.trim()}
                          style={{
                            flex: 2, height: '40px',
                            borderRadius: 'var(--radius-md)',
                            border: 'none',
                            background: customName.trim() ? 'var(--brand-primary)' : 'var(--border-default)',
                            color: customName.trim() ? 'var(--brand-primary-text)' : 'var(--text-tertiary)',
                            fontSize: '0.875rem', fontWeight: 600,
                            cursor: customName.trim() ? 'pointer' : 'not-allowed',
                            fontFamily: 'var(--font-sans)',
                          }}
                        >Agregar proyecto</button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowCustomForm(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.875rem 1rem',
                        borderRadius: 'var(--radius-lg)',
                        border: '1.5px dashed var(--border-strong)',
                        background: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                        fontSize: '0.9375rem',
                        fontWeight: 500,
                        fontFamily: 'var(--font-sans)',
                        width: '100%',
                      }}
                    >
                      <span style={{ fontSize: '1.1rem' }}>＋</span> Agregar proyecto propio
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              <div style={{ paddingTop: '1rem' }}>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setStep(3)}
                  style={{
                    width: '100%',
                    height: '52px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--brand-primary)',
                    color: 'var(--brand-primary-text)',
                    fontWeight: 600,
                    fontSize: '1rem',
                    fontFamily: 'var(--font-sans)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {(selected.size + customProjects.length) === 0
                    ? 'Continuar sin proyectos'
                    : `Continuar con ${selected.size + customProjects.length} proyecto${(selected.size + customProjects.length) > 1 ? 's' : ''} →`}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* PASO 3 — WhatsApp */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } }}
              exit={{ opacity: 0, x: -24, transition: { duration: 0.25 } }}
              className="flex-1 flex flex-col"
            >
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem', lineHeight: 1 }}>💬</div>
                <h1 style={{
                  fontSize: '1.625rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                  marginBottom: '0.5rem',
                }}>
                  Tu número de WhatsApp
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.5 }}>
                  Con este número Flowi te identificará cuando le escribas. Puedes agregarlo más adelante desde Ajustes.
                </p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  display: 'block',
                  marginBottom: '0.5rem',
                }}>
                  Número de WhatsApp
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '0.9375rem',
                    color: 'var(--text-tertiary)',
                    fontWeight: 500,
                  }}>+</span>
                  <input
                    type="tel"
                    value={waPhone}
                    onChange={e => setWaPhone(e.target.value.replace(/[^\d+\s-]/g, ''))}
                    placeholder="57 300 000 0000"
                    style={{
                      width: '100%',
                      height: '52px',
                      padding: '0 1rem 0 1.75rem',
                      borderRadius: 'var(--radius-lg)',
                      border: '1.5px solid var(--border-default)',
                      background: 'var(--surface-primary)',
                      color: 'var(--text-primary)',
                      fontSize: '1rem',
                      fontFamily: 'var(--font-sans)',
                      outline: 'none',
                    }}
                    onFocus={e => (e.target.style.borderColor = 'var(--brand-primary)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border-default)')}
                  />
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: '0.5rem' }}>
                  Incluye el código de país. Ej: +57 para Colombia.
                </p>
              </div>

              {/* Info card */}
              <div style={{
                padding: '1rem',
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(240,107,138,0.07)',
                border: '1px solid rgba(240,107,138,0.2)',
                marginBottom: '1.5rem',
              }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  🔗 El número de WhatsApp de Flowi lo configuramos juntas en la siguiente sesión.
                  Por ahora guarda el tuyo para que quede listo.
                </p>
              </div>

              <div style={{ marginTop: 'auto' }}>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleFinish}
                  disabled={loading}
                  style={{
                    width: '100%',
                    height: '52px',
                    borderRadius: 'var(--radius-lg)',
                    background: loading ? 'var(--border-default)' : 'var(--brand-primary)',
                    color: loading ? 'var(--text-tertiary)' : 'var(--brand-primary-text)',
                    fontWeight: 600,
                    fontSize: '1rem',
                    fontFamily: 'var(--font-sans)',
                    border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginBottom: '0.75rem',
                  }}
                >
                  {loading ? 'Guardando...' : '¡Empezar a usar Flowi! 🎉'}
                </motion.button>

                <button
                  onClick={handleFinish}
                  disabled={loading}
                  style={{
                    width: '100%',
                    height: '44px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-tertiary)',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  Omitir por ahora
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
      </div>
    </div>
  )
}
