'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, Plus, FolderOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Flowling, { type FlowlingEmotion } from '@/components/Flowling'
import { getAvatarLevel, getNextLevel, AVATAR_LEVELS, DEFAULT_AREAS } from '@/lib/areas/defaults'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

function scoreLabel(v: number) {
  if (v < 40) return 'Por mejorar'
  if (v < 60) return 'Regular'
  if (v < 75) return 'Bien'
  if (v < 90) return 'Muy bien'
  return 'Excelente'
}

interface Area { id: string; name: string; emoji: string; color: string; description: string; order_index: number }
interface Project { id: string; name: string; emoji: string; color: string }
interface Evaluation { score: number; evaluated_at: string; notes: string | null }
interface Avatar { xp: number; level: number }

interface Props {
  area: Area
  projects: Project[]
  avatar: Avatar
  evaluations: Evaluation[]
  countByProject: Record<string, number>
  userId: string
  userAvatar: { total_xp: number; level: number; last_seen_at: string } | null
  species: string
  topAreaIndexes: number[]
  streak: number
}

export default function AreaDetailClient({ area, projects, avatar, evaluations, countByProject, userId, userAvatar, species, topAreaIndexes, streak }: Props) {
  const totalXp = userAvatar?.total_xp ?? 0

  const emotion: FlowlingEmotion = (() => {
    if (!userAvatar?.last_seen_at) return 'encouraging'
    const days = Math.floor((Date.now() - new Date(userAvatar.last_seen_at).getTime()) / 86_400_000)
    if (days >= 2) return 'sleeping'
    const today = new Date().toISOString().split('T')[0]
    const last  = new Date(userAvatar.last_seen_at).toISOString().split('T')[0]
    if (last === today && streak >= 3) return 'celebrating'
    return 'happy'
  })()
  const questions = DEFAULT_AREAS[area.order_index]?.questions ?? []
  const [showEvalModal, setShowEvalModal] = useState(false)
  const [answers, setAnswers] = useState<number[]>(() => questions.map(() => evaluations[0]?.score ?? 70))
  const [evalNotes, setEvalNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedToast, setSavedToast] = useState(false)
  const router = useRouter()

  const computedScore = answers.length > 0
    ? Math.round(answers.reduce((s, v) => s + v, 0) / answers.length)
    : evaluations[0]?.score ?? 70

  const updateAnswer = (qi: number, value: number) => {
    setAnswers(prev => prev.map((v, i) => i === qi ? value : v))
  }

  const avatarLevel = getAvatarLevel(avatar.xp)
  const nextLevel = getNextLevel(avatar.xp)
  const xpForNext = nextLevel ? nextLevel.minXp - avatarLevel.minXp : 0
  const xpProgress = nextLevel ? avatar.xp - avatarLevel.minXp : avatarLevel.minXp
  const progressPct = nextLevel ? Math.min(100, (xpProgress / xpForNext) * 100) : 100

  const latestScore = evaluations[0]?.score ?? 0
  const prevScore = evaluations[1]?.score ?? null

  const handleSaveEval = async () => {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('area_evaluations').insert({
      user_id: userId,
      area_id: area.id,
      score: computedScore,
      notes: evalNotes.trim() || null,
    })
    setSaving(false)
    setShowEvalModal(false)
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 2500)
    router.refresh()
  }

  return (
    <div style={{ minHeight: '100dvh', paddingBottom: '5rem' }}>

      {/* Header */}
      <div style={{
        background: 'var(--surface-primary)',
        borderBottom: '1px solid var(--border-default)',
        padding: '1rem 1.5rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        position: 'sticky', top: 0, zIndex: 20,
      }}>
        <Link href="/app/areas" style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)', textDecoration: 'none' }}>
          <ChevronLeft size={20} />
        </Link>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>Área de vida</p>
          <h1 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {area.emoji} {area.name}
          </h1>
        </div>
        <button
          onClick={() => setShowEvalModal(true)}
          style={{
            height: '36px', padding: '0 1rem', borderRadius: '99px',
            background: `${area.color}18`, border: `1.5px solid ${area.color}40`,
            color: area.color, fontWeight: 700, fontSize: '0.8125rem',
            cursor: 'pointer', fontFamily: 'var(--font-sans)', whiteSpace: 'nowrap',
          }}
        >
          Evaluar
        </button>
      </div>

      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '680px', margin: '0 auto' }}>

        {/* Avatar hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}
          style={{
            background: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)',
            padding: '1.75rem', border: '1px solid var(--border-default)',
            borderTop: `4px solid ${area.color}`,
            display: 'flex', alignItems: 'center', gap: '1.5rem',
            boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <Flowling
              totalXp={totalXp}
              species={species}
              topAreaIndexes={topAreaIndexes}
              streak={streak}
              emotion={emotion}
              size="md"
            />
            {/* Área badge */}
            <div style={{
              fontSize: '0.6875rem', fontWeight: 700, padding: '2px 8px',
              borderRadius: '99px', background: `${area.color}20`,
              color: area.color, border: `1px solid ${area.color}40`,
            }}>
              {area.emoji} {area.name.split(' ')[0]}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '0.375rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 900, color: area.color, lineHeight: 1, letterSpacing: '-0.04em' }}>
                {latestScore}
              </span>
              <span style={{ fontSize: '1rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>/100</span>
              {prevScore !== null && (
                <span style={{ fontSize: '0.8125rem', color: latestScore >= prevScore ? '#10B981' : '#F06B6B', fontWeight: 700 }}>
                  {latestScore >= prevScore ? `+${latestScore - prevScore}` : latestScore - prevScore}
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              {avatarLevel.label}
            </p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              {area.description}
            </p>

            {/* XP progress */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                  {avatar.xp} XP
                </span>
                {nextLevel && (
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                    Nv.{nextLevel.level} a {nextLevel.minXp} XP
                  </span>
                )}
              </div>
              <div style={{ height: '6px', borderRadius: '99px', background: 'var(--surface-secondary)', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 1, ease: EASE, delay: 0.3 }}
                  style={{ height: '100%', borderRadius: '99px', background: area.color }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Nivel progress steps */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4, ease: EASE }}
          style={{
            background: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)',
            padding: '1.25rem', border: '1px solid var(--border-default)',
          }}
        >
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
            Camino de crecimiento
          </p>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {AVATAR_LEVELS.map((lvl, i) => {
              const reached = avatar.xp >= lvl.minXp
              const isCurrent = avatarLevel.level === lvl.level
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: reached ? area.color : 'var(--surface-secondary)',
                    border: `2px solid ${reached ? area.color : 'var(--border-default)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: isCurrent ? '1rem' : '0.75rem',
                    boxShadow: isCurrent ? `0 0 0 3px ${area.color}30` : 'none',
                    transition: 'all 0.3s',
                  }}>
                    {reached ? '⭐' : <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>{lvl.level}</span>}
                  </div>
                  <p style={{ fontSize: '0.5625rem', fontWeight: 600, color: reached ? area.color : 'var(--text-tertiary)', textAlign: 'center' }}>
                    {lvl.label}
                  </p>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Proyectos */}
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14, duration: 0.4, ease: EASE }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Proyectos <span style={{ color: 'var(--text-tertiary)', fontWeight: 500 }}>({projects.length})</span>
            </h2>
            <Link href={`/app/projects/new?area=${area.id}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8125rem', color: area.color, fontWeight: 600, textDecoration: 'none' }}>
              <Plus size={14} /> Nuevo
            </Link>
          </div>

          {projects.length === 0 ? (
            <div style={{
              background: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)',
              padding: '2rem', border: '1.5px dashed var(--border-default)',
              textAlign: 'center',
            }}>
              <FolderOpen size={32} color="var(--text-tertiary)" style={{ marginBottom: '0.75rem' }} />
              <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Sin proyectos aún</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Agrega el primer proyecto de esta área
              </p>
              <Link href={`/app/projects/new?area=${area.id}`} style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '0.625rem 1.25rem', borderRadius: '99px',
                background: area.color, color: 'white',
                fontWeight: 700, fontSize: '0.875rem', textDecoration: 'none',
              }}>
                <Plus size={14} /> Crear proyecto
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {projects.map((p, i) => {
                const pending = countByProject[p.id] ?? 0
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.18 + i * 0.05, duration: 0.3, ease: EASE }}
                  >
                    <Link href={`/app/projects/${p.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        background: 'var(--surface-primary)', borderRadius: 'var(--radius-lg)',
                        padding: '0.875rem 1rem', border: '1px solid var(--border-default)',
                        display: 'flex', alignItems: 'center', gap: '0.875rem',
                        borderLeft: `3px solid ${p.color}`,
                        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                      }}>
                        <span style={{ fontSize: '1.375rem', lineHeight: 1, flexShrink: 0 }}>{p.emoji}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1px' }}>{p.name}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                            {pending === 0 ? 'Al día ✓' : `${pending} pendiente${pending > 1 ? 's' : ''}`}
                          </p>
                        </div>
                        <ChevronLeft size={16} color="var(--text-tertiary)" style={{ transform: 'rotate(180deg)', flexShrink: 0 }} />
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.section>

        {/* Historial evaluaciones */}
        {evaluations.length > 1 && (
          <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4, ease: EASE }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Historial</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {evaluations.slice(0, 5).map((ev, i) => (
                <div key={i} style={{
                  background: 'var(--surface-primary)', borderRadius: 'var(--radius-lg)',
                  padding: '0.875rem 1rem', border: '1px solid var(--border-default)',
                  display: 'flex', alignItems: 'center', gap: '1rem',
                }}>
                  <div style={{ width: '48px', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.25rem', fontWeight: 800, color: area.color, lineHeight: 1 }}>{ev.score}</p>
                    <p style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>/100</p>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1px' }}>
                      {new Date(ev.evaluated_at + 'T00:00:00').toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    {ev.notes && <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{ev.notes}</p>}
                  </div>
                  <div style={{ height: '40px', width: '4px', borderRadius: '99px', background: area.color, opacity: 0.3 + (ev.score / 100) * 0.7, flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </motion.section>
        )}

      </div>

      {/* Toast de éxito al guardar evaluación */}
      {savedToast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
          style={{
            position: 'fixed', bottom: '6rem', left: '50%', transform: 'translateX(-50%)',
            background: '#10B981', color: 'white', padding: '0.75rem 1.25rem',
            borderRadius: '99px', fontWeight: 700, fontSize: '0.9375rem',
            boxShadow: '0 4px 16px rgba(16,185,129,0.35)', zIndex: 200, whiteSpace: 'nowrap',
          }}
        >
          ✓ Evaluación guardada
        </motion.div>
      )}

      {/* Modal evaluación mensual */}
      {showEvalModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end',
        }} onClick={() => setShowEvalModal(false)}>
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} transition={{ duration: 0.35, ease: EASE }}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: '520px', margin: '0 auto',
              background: 'var(--surface-primary)', borderRadius: '24px 24px 0 0',
              padding: '1.5rem', paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
            }}
          >
            <div style={{ width: '40px', height: '4px', borderRadius: '99px', background: 'var(--border-default)', margin: '0 auto 1.25rem' }} />

            {/* Header fijo */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {area.emoji} {area.name}
              </h3>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '1.5rem', fontWeight: 900, color: area.color, lineHeight: 1 }}>{computedScore}</p>
                <p style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>promedio</p>
              </div>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Responde con honestidad — el promedio de tus respuestas será el puntaje.
            </p>

            {/* Preguntas scrollables */}
            <div style={{ maxHeight: '50vh', overflowY: 'auto', marginBottom: '1rem', paddingRight: '4px' }}>
              <style>{`
                input[type=range]::-webkit-slider-thumb {
                  appearance: none; width: 22px; height: 22px; border-radius: 50%;
                  background: ${area.color}; border: 2px solid white;
                  box-shadow: 0 1px 6px rgba(0,0,0,0.2); cursor: pointer;
                }
              `}</style>
              {questions.map((q, qi) => (
                <div key={qi} style={{ marginBottom: '1.25rem' }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '0.5rem', lineHeight: 1.4 }}>
                    {q}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input
                      type="range" min={0} max={100} step={5}
                      value={answers[qi] ?? 70}
                      onChange={e => updateAnswer(qi, Number(e.target.value))}
                      style={{
                        flex: 1, height: '6px', appearance: 'none', borderRadius: '99px',
                        background: `linear-gradient(to right, ${area.color} 0%, ${area.color} ${answers[qi] ?? 70}%, var(--surface-secondary) ${answers[qi] ?? 70}%, var(--surface-secondary) 100%)`,
                        outline: 'none', cursor: 'pointer',
                      }}
                    />
                    <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: area.color, minWidth: '36px', textAlign: 'right' }}>
                      {answers[qi] ?? 70}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 500, marginTop: '2px' }}>
                    {scoreLabel(answers[qi] ?? 70)}
                  </p>
                </div>
              ))}
            </div>

            <textarea
              value={evalNotes}
              onChange={e => setEvalNotes(e.target.value)}
              placeholder="Nota opcional (qué mejoró, qué falta...)"
              rows={2}
              style={{
                width: '100%', padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--border-default)',
                background: 'var(--surface-primary)', color: 'var(--text-primary)',
                fontSize: '0.9375rem', fontFamily: 'var(--font-sans)', resize: 'none', outline: 'none',
                marginBottom: '1.25rem',
              }}
              onFocus={e => (e.target.style.borderColor = area.color)}
              onBlur={e => (e.target.style.borderColor = 'var(--border-default)')}
            />

            <button
              onClick={handleSaveEval}
              disabled={saving}
              style={{
                width: '100%', height: '52px', borderRadius: 'var(--radius-lg)',
                background: saving ? 'var(--border-default)' : area.color,
                color: 'white', fontWeight: 700, fontSize: '1rem',
                border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {saving ? 'Guardando...' : 'Guardar evaluación'}
            </button>
          </motion.div>
        </div>
      )}

    </div>
  )
}
