'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Flowling from './Flowling'

interface Props {
  topAreaIndexes: number[]
  species?: string
  streak?: number
  onComplete: () => void
}

// ── Egg geometry ────────────────────────────────────────────────────────────
// ViewBox 0 0 120 150
const EGG   = 'M60,16 C93,16 102,52 102,78 C102,116 84,140 60,140 C36,140 18,116 18,78 C18,52 27,16 60,16 Z'
const TOP_H = 'M60,16 C93,16 102,52 102,78 L18,78 C18,52 27,16 60,16 Z'
const BOT_H = 'M18,78 L102,78 C102,116 84,140 60,140 C36,140 18,116 18,78 Z'

const CRACKS = [
  { d: 'M44,46 L50,58 L43,67',         delay: 0    },
  { d: 'M70,42 L65,56 L72,66 L67,74',  delay: 0.28 },
  { d: 'M36,73 L55,79 L82,75',         delay: 0.55 },
  { d: 'M57,86 L51,98',                delay: 0.8  },
]

const SPECKLES = [[38,55],[73,44],[54,102],[82,92],[29,91],[61,126],[48,72],[76,108]]

// ── Confetti ─────────────────────────────────────────────────────────────────
const COLORS = ['#F06B8A','#10B981','#F59E0B','#6B8AF0','#F97316','#EC4899','#06B6D4']
const CONFETTI = Array.from({ length: 20 }, (_, i) => {
  const angle = (i / 20) * Math.PI * 2
  const dist  = 50 + (i % 5) * 14
  return {
    x:     Math.cos(angle) * dist,
    y:     Math.sin(angle) * dist - 20,
    color: COLORS[i % COLORS.length],
    size:  4 + (i % 3) * 2,
    delay: i * 0.025,
  }
})

const SPRING  = { type: 'spring' as const, stiffness: 340, damping: 18 }
const EASE_O: [number,number,number,number] = [0.16, 1, 0.3, 1]

const TITLES = [
  'Tu Flowling está despertando…',
  'Tu Flowling está despertando…',
  '¡Algo se está moviendo!',
  '¡Se está abriendo!',
  '¡Tu Flowling ha nacido! ✨',
  '¡Tu Flowling ha nacido! ✨',
]
const SUBTITLES = [
  '',
  '',
  'Las grietas aparecen…',
  '¡Ya casi!',
  '',
  '',
]

// ── EggSVG ───────────────────────────────────────────────────────────────────

function EggSvg({ phase }: { phase: number }) {
  const wobble =
    phase === 1 ? { rotate: [-5, 5, -4, 4, -3, 3, 0] } :
    phase === 2 ? { rotate: [-8, 8, -7, 7, -8, 8, -6, 6] } :
    {}

  type Ease = [number,number,number,number]
  const EI: Ease = [0.45, 0, 0.55, 1]  // cubic-bezier equivalent of easeInOut
  const wobbleTrans =
    phase === 1
      ? { rotate: { duration: 1.1, repeat: Infinity, repeatType: 'reverse' as const, ease: EI } }
      : phase === 2
      ? { rotate: { duration: 0.55, repeat: Infinity, ease: EI } }
      : {}

  return (
    <motion.div
      animate={phase < 3 ? wobble : {}}
      transition={wobbleTrans}
      style={{ position: 'absolute', top: 0, left: 0 }}
    >
      <svg viewBox="0 0 120 150" width={170} height={212} overflow="visible">
        <defs>
          <radialGradient id="eggG" cx="37%" cy="28%" r="66%">
            <stop offset="0%"   stopColor="#F6FFF9" />
            <stop offset="55%"  stopColor="#E8F8EF" />
            <stop offset="100%" stopColor="#C9E8D8" />
          </radialGradient>
        </defs>
        {/* Shadow */}
        <ellipse cx="60" cy="147" rx="28" ry="5" fill="rgba(0,0,0,0.07)" />
        {/* Egg */}
        <path d={EGG} fill="url(#eggG)" stroke="#B2D8C4" strokeWidth="1" />
        {/* Speckles */}
        {SPECKLES.map(([sx,sy],i) => (
          <circle key={i} cx={sx} cy={sy} r={2.2} fill="#A8CCBA" opacity={0.5} />
        ))}
        {/* Cracks */}
        {phase >= 2 && CRACKS.map((cr, i) => (
          <motion.path key={i}
            d={cr.d}
            fill="none" stroke="#6E9E85" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: cr.delay, duration: 0.4, ease: 'easeOut' }}
          />
        ))}
      </svg>
    </motion.div>
  )
}

function EggBreaking() {
  return (
    <>
      {/* Top half flies up + rotates */}
      <motion.div
        initial={{ y: 0, rotate: 0, opacity: 1 }}
        animate={{ y: -90, rotate: -28, opacity: 0 }}
        transition={{ duration: 0.75, ease: EASE_O }}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <svg viewBox="0 0 120 150" width={170} height={212}>
          <path d={TOP_H} fill="#EEF8F3" stroke="#B2D8C4" strokeWidth="1" />
          {CRACKS.map((cr, i) => (
            <path key={i} d={cr.d} fill="none" stroke="#6E9E85" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
          ))}
        </svg>
      </motion.div>
      {/* Bottom half drops + fades */}
      <motion.div
        initial={{ y: 0, opacity: 1 }}
        animate={{ y: 22, opacity: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: EASE_O }}
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <svg viewBox="0 0 120 150" width={170} height={212}>
          <path d={BOT_H} fill="#E8F8EF" stroke="#B2D8C4" strokeWidth="1" />
        </svg>
      </motion.div>
    </>
  )
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function EggHatch({ topAreaIndexes, species = 'bloom', streak = 0, onComplete }: Props) {
  const [phase, setPhase] = useState<0|1|2|3|4|5>(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 500),    // wobble starts
      setTimeout(() => setPhase(2), 1900),   // cracks appear
      setTimeout(() => setPhase(3), 3500),   // egg breaks
      setTimeout(() => setPhase(4), 4500),   // flowling pops
      setTimeout(() => setPhase(5), 5800),   // button appears
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  const title    = TITLES[phase]    ?? TITLES[4]
  const subtitle = SUBTITLES[phase] ?? ''

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem', gap: '0',
    }}>

      {/* Header text */}
      <motion.div
        style={{ textAlign: 'center', marginBottom: '1.75rem' }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_O }}
      >
        <motion.h2
          key={title}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE_O }}
          style={{
            fontSize: '1.375rem', fontWeight: 800,
            color: 'var(--text-primary)', letterSpacing: '-0.025em',
            marginBottom: subtitle ? '6px' : 0,
          }}
        >
          {title}
        </motion.h2>
        {subtitle && (
          <motion.p
            key={subtitle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', fontWeight: 500 }}
          >
            {subtitle}
          </motion.p>
        )}
      </motion.div>

      {/* Stage */}
      <div style={{
        position: 'relative',
        width: '170px', height: '230px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>

        {/* Egg (phases 0-2) */}
        <AnimatePresence>
          {phase <= 2 && (
            <motion.div
              key="egg"
              initial={{ scale: 0.75, opacity: 0, y: 18 }}
              animate={{ scale: 1,    opacity: 1, y: 0  }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.55, ease: EASE_O }}
              style={{ position: 'absolute', inset: 0 }}
            >
              <EggSvg phase={phase} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Egg breaking (phase 3) */}
        <AnimatePresence>
          {phase === 3 && (
            <motion.div key="break" style={{ position: 'absolute', inset: 0 }}>
              <EggBreaking />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Flowling reveal (phase 4+) */}
        <AnimatePresence>
          {phase >= 4 && (
            <motion.div
              key="flowling"
              initial={{ scale: 0, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0,  opacity: 1 }}
              transition={{ ...SPRING, delay: 0.05 }}
              style={{ position: 'absolute' }}
            >
              <Flowling
                totalXp={0}
                species={species}
                topAreaIndexes={topAreaIndexes}
                streak={streak}
                emotion="celebrating"
                size="lg"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confetti burst */}
        <AnimatePresence>
          {phase === 4 && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', pointerEvents: 'none' }}>
              {CONFETTI.map((c, i) => (
                <motion.div key={i}
                  initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                  animate={{ x: c.x, y: c.y, scale: 1, opacity: 0 }}
                  transition={{ delay: c.delay, duration: 0.9, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    width: c.size, height: c.size,
                    borderRadius: i % 3 === 0 ? '2px' : '50%',
                    background: c.color,
                    marginTop: -c.size / 2, marginLeft: -c.size / 2,
                  }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Description + CTA */}
      <AnimatePresence>
        {phase >= 4 && (
          <motion.div
            key="cta"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ delay: 0.2, duration: 0.5, ease: EASE_O }}
            style={{ textAlign: 'center', marginTop: '1rem' }}
          >
            <p style={{
              fontSize: '0.9375rem', color: 'var(--text-secondary)',
              lineHeight: 1.55, marginBottom: '1.5rem', maxWidth: '260px', margin: '0 auto 1.5rem',
            }}>
              Este es tu Flowling. Crece cada vez que<br/>completas tareas y cuidas tus áreas de vida.
            </p>

            {phase >= 5 && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onComplete}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE_O }}
                style={{
                  height: '52px', padding: '0 2.25rem',
                  borderRadius: 'var(--radius-lg)',
                  background: 'var(--brand-primary)',
                  color: 'var(--brand-primary-text)',
                  fontWeight: 700, fontSize: '1rem',
                  fontFamily: 'var(--font-sans)',
                  border: 'none', cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(240,107,138,0.25)',
                }}
              >
                Ir a mi dashboard →
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
