'use client'

import { motion } from 'motion/react'
import { getFlowlingLevel, getFlowlingNextLevel } from '@/lib/areas/defaults'

/* ── Types ─────────────────────────────────────────────────────────────── */

export type FlowlingEmotion = 'happy' | 'celebrating' | 'sleeping' | 'encouraging'
export type FlowlingSize    = 'sm' | 'md' | 'lg' | 'xl'

export interface FlowlingProps {
  totalXp:         number
  topAreaIndexes?: number[]   // order_indexes of top areas by XP (0=Salud,3=Dinero,4=Trabajo…)
  streak?:         number
  emotion?:        FlowlingEmotion
  size?:           FlowlingSize
  showInfo?:       boolean
}

/* ── Stage configs ─────────────────────────────────────────────────────── */

const CX = 60
const CY = 90

interface S {
  rx: number; ry: number
  c1: string; c2: string
  eyeOff: number; eyeY: number; eyeR: number; mOff: number
}

const STAGE: S[] = [
  { rx:22, ry:27, c1:'#C8EEDF', c2:'#9DDEC6', eyeOff:6.5, eyeY:-8,  eyeR:2.5, mOff:5  },
  { rx:27, ry:33, c1:'#8DD9B3', c2:'#6CC99A', eyeOff:8,   eyeY:-10, eyeR:3.5, mOff:7  },
  { rx:33, ry:39, c1:'#52C48D', c2:'#38B274', eyeOff:10,  eyeY:-12, eyeR:4.5, mOff:9  },
  { rx:39, ry:46, c1:'#30B578', c2:'#1EA365', eyeOff:12,  eyeY:-15, eyeR:5.5, mOff:11 },
  { rx:46, ry:54, c1:'#1EA86B', c2:'#0D9254', eyeOff:14,  eyeY:-18, eyeR:7,   mOff:14 },
]

const SIZE_H: Record<FlowlingSize, number> = { sm: 76, md: 108, lg: 150, xl: 200 }

/* ── Sub-components ─────────────────────────────────────────────────────── */

function Eyes({ s, emotion }: { s: S; emotion: FlowlingEmotion }) {
  const lx = CX - s.eyeOff
  const rx = CX + s.eyeOff
  const ey = CY + s.eyeY
  const r  = s.eyeR

  if (emotion === 'sleeping') {
    const sw = r * 0.55
    return (
      <>
        <path d={`M${lx-r},${ey} Q${lx},${ey+r*0.9} ${lx+r},${ey}`}
          fill="none" stroke="#1C4D38" strokeWidth={sw} strokeLinecap="round" />
        <path d={`M${rx-r},${ey} Q${rx},${ey+r*0.9} ${rx+r},${ey}`}
          fill="none" stroke="#1C4D38" strokeWidth={sw} strokeLinecap="round" />
      </>
    )
  }

  const big = emotion === 'celebrating'
  const er  = big ? r * 1.15 : r

  return (
    <>
      <circle cx={lx} cy={ey} r={er}      fill="#1C4D38" />
      <circle cx={lx + er*0.32} cy={ey - er*0.38} r={er*0.3} fill="white" opacity={0.8} />
      <circle cx={rx} cy={ey} r={er}      fill="#1C4D38" />
      <circle cx={rx + er*0.32} cy={ey - er*0.38} r={er*0.3} fill="white" opacity={0.8} />
    </>
  )
}

function Mouth({ s, emotion }: { s: S; emotion: FlowlingEmotion }) {
  const my = CY + s.mOff
  const mw = s.eyeOff - 1
  const md = s.eyeR * 1.4
  const sw = s.eyeR * 0.55

  if (emotion === 'sleeping') {
    return (
      <ellipse cx={CX} cy={my} rx={s.eyeR * 0.7} ry={s.eyeR * 0.4}
        fill="#1C4D38" opacity={0.25} />
    )
  }
  if (emotion === 'celebrating') {
    return (
      <>
        <path d={`M${CX-mw},${my} Q${CX},${my+md*1.9} ${CX+mw},${my}`}
          fill="none" stroke="#1C4D38" strokeWidth={sw} strokeLinecap="round" />
        <ellipse cx={CX} cy={my + md * 0.85} rx={mw * 0.62} ry={md * 0.52}
          fill="white" opacity={0.5} />
      </>
    )
  }
  return (
    <path d={`M${CX-mw},${my} Q${CX},${my+md} ${CX+mw},${my}`}
      fill="none" stroke="#1C4D38" strokeWidth={sw} strokeLinecap="round" />
  )
}

function Blush({ s }: { s: S }) {
  const bx = s.eyeOff * 1.5
  const by = s.eyeY + s.eyeR * 1.2
  return (
    <>
      <ellipse cx={CX - bx} cy={CY + by} rx={s.eyeR * 1.4} ry={s.eyeR * 0.7}
        fill="#FFB5C5" opacity={0.38} />
      <ellipse cx={CX + bx} cy={CY + by} rx={s.eyeR * 1.4} ry={s.eyeR * 0.7}
        fill="#FFB5C5" opacity={0.38} />
    </>
  )
}

function LeafSprouts({ s, si, enhanced }: { s: S; si: number; enhanced: boolean }) {
  const count  = Math.min(si + 2, 5)                   // 2..5 leaves
  const topY   = CY - s.ry + 2
  const spread = 24 + si * 4
  const lc     = enhanced ? '#3EAF4D' : '#5DC974'
  const ld     = enhanced ? '#2D8A3B' : '#44B059'

  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const frac = count === 1 ? 0 : (i / (count - 1)) - 0.5
        const x    = CX + frac * spread
        const stemH = 7 + si * 1.5
        const lrx   = 3.5 + si * 0.6
        const lry   = 2   + si * 0.3
        return (
          <g key={i}>
            <line x1={x} y1={topY} x2={x + frac * 3} y2={topY - stemH}
              stroke={ld} strokeWidth={1.2} strokeLinecap="round" />
            <ellipse cx={x + frac * 3} cy={topY - stemH - lry * 0.5}
              rx={lrx} ry={lry} fill={lc} opacity={0.9}
              transform={`rotate(${frac * 30}, ${x + frac * 3}, ${topY - stemH - lry * 0.5})`} />
          </g>
        )
      })}
    </>
  )
}

function Arms({ s, emotion }: { s: S; emotion: FlowlingEmotion }) {
  const ay   = CY - s.ry * 0.05
  const aw   = s.rx * 0.3
  const ah   = s.rx * 0.18
  const lift = emotion === 'celebrating' ? -s.ry * 0.45 : 0
  const rot  = emotion === 'celebrating' ? 40 : 15

  return (
    <>
      <ellipse cx={CX - s.rx - 2} cy={ay + lift} rx={aw} ry={ah} fill={s.c2}
        transform={`rotate(${-rot}, ${CX - s.rx - 2}, ${ay + lift})`} />
      <ellipse cx={CX + s.rx + 2} cy={ay + lift} rx={aw} ry={ah} fill={s.c2}
        transform={`rotate(${rot}, ${CX + s.rx + 2}, ${ay + lift})`} />
    </>
  )
}

function Glasses({ s }: { s: S }) {
  const ey = CY + s.eyeY
  const r  = s.eyeR * 1.55 + 0.8
  const lx = CX - s.eyeOff
  const rx = CX + s.eyeOff
  return (
    <g opacity={0.82}>
      <circle cx={lx} cy={ey} r={r} fill="none" stroke="#4E2E0A" strokeWidth={0.9} />
      <circle cx={rx} cy={ey} r={r} fill="none" stroke="#4E2E0A" strokeWidth={0.9} />
      <line x1={lx + r} y1={ey} x2={rx - r} y2={ey} stroke="#4E2E0A" strokeWidth={0.8} />
      <line x1={lx - r} y1={ey} x2={lx - r - 5} y2={ey - 2}
        stroke="#4E2E0A" strokeWidth={0.8} strokeLinecap="round" />
      <line x1={rx + r} y1={ey} x2={rx + r + 5} y2={ey - 2}
        stroke="#4E2E0A" strokeWidth={0.8} strokeLinecap="round" />
    </g>
  )
}

function Backpack({ s }: { s: S }) {
  const bx  = CX - s.rx - 1
  const by  = CY - s.ry * 0.28
  const bw  = s.rx * 0.52
  const bh  = s.ry * 0.62
  const bx0 = bx - bw
  return (
    <g>
      <rect x={bx0} y={by} width={bw} height={bh} rx={3} fill="#8B6534" opacity={0.88} />
      <rect x={bx0 + 2} y={by + 3} width={bw - 4} height={bh * 0.32}
        rx={1.5} fill="#A07840" opacity={0.7} />
      <line x1={bx0 + bw * 0.35} y1={by}
            x2={bx + 0.5}         y2={CY - s.ry * 0.08}
        stroke="#6B4E27" strokeWidth={1.4} opacity={0.65} />
      <line x1={bx0 + bw * 0.65} y1={by}
            x2={bx + 0.5}         y2={CY + s.ry * 0.22}
        stroke="#6B4E27" strokeWidth={1.4} opacity={0.65} />
    </g>
  )
}

function GoldCoins({ s }: { s: S }) {
  const coins = [
    { dx: s.rx + 9,  dy: -s.ry * 0.38, r: 4.5, delay: 0   },
    { dx: s.rx + 14, dy:  s.ry * 0.08, r: 3.5, delay: 0.35 },
    { dx: s.rx + 8,  dy:  s.ry * 0.5,  r: 4,   delay: 0.7  },
  ]
  return (
    <>
      {coins.map((c, i) => (
        <motion.g key={i}
          animate={{ y: [0, -4, 0] }}
          transition={{ delay: c.delay, duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <circle cx={CX + c.dx} cy={CY + c.dy} r={c.r} fill="#FBBF24" />
          <circle cx={CX + c.dx} cy={CY + c.dy} r={c.r * 0.55}
            fill="none" stroke="#F59E0B" strokeWidth={0.7} opacity={0.6} />
          <text x={CX + c.dx} y={CY + c.dy + c.r * 0.4}
            textAnchor="middle" fontSize={c.r * 0.9} fill="#92400E" fontWeight="bold" opacity={0.7}>$</text>
        </motion.g>
      ))}
    </>
  )
}

function FireAura({ s }: { s: S }) {
  const baseY = CY + s.ry - 1
  const flames = [-11, 0, 11]
  return (
    <>
      {flames.map((xOff, i) => (
        <motion.path key={i}
          d={`M${CX+xOff-4},${baseY+6} C${CX+xOff-3},${baseY-4} ${CX+xOff+3},${baseY-4} ${CX+xOff+4},${baseY+6}`}
          fill={i === 1 ? '#F97316' : '#FB923C'}
          opacity={0.85}
          animate={{ scaleY: [1, 1.35, 0.85, 1.2, 1], opacity: [0.85, 1, 0.7, 0.95, 0.85] }}
          transition={{ delay: i * 0.18, duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: `${CX + xOff}px ${baseY + 6}px` }}
        />
      ))}
    </>
  )
}

function SleepZzz({ s }: { s: S }) {
  const zs = [
    { x: CX + s.rx + 2,  y: CY - s.ry * 0.55, sz: 7,  delay: 0   },
    { x: CX + s.rx + 8,  y: CY - s.ry * 0.85, sz: 9,  delay: 0.5 },
    { x: CX + s.rx + 15, y: CY - s.ry * 1.1,  sz: 11, delay: 1   },
  ]
  return (
    <>
      {zs.map((z, i) => (
        <motion.text key={i}
          x={z.x} y={z.y} fontSize={z.sz}
          fill="#7BAECE" fontWeight="800" textAnchor="middle"
          animate={{ opacity: [0, 0.9, 0], y: [z.y, z.y - 14, z.y - 28] }}
          transition={{ delay: z.delay, duration: 2.8, repeat: Infinity, ease: 'easeOut' }}
        >
          z
        </motion.text>
      ))}
    </>
  )
}

function CelebrationStars({ s }: { s: S }) {
  const stars = [
    { x: CX - s.rx - 5, y: CY - s.ry * 0.75 },
    { x: CX + s.rx + 8, y: CY - s.ry * 0.95 },
    { x: CX,             y: CY - s.ry - 12   },
  ]
  return (
    <>
      {stars.map((st, i) => (
        <motion.text key={i}
          x={st.x} y={st.y} fontSize={11} textAnchor="middle"
          animate={{ scale: [0, 1.3, 1, 0], rotate: [0, 15, -10, 0] }}
          transition={{ delay: i * 0.18, duration: 1.6, repeat: Infinity, ease: 'backOut' }}
          style={{ transformOrigin: `${st.x}px ${st.y}px` }}
        >
          ✨
        </motion.text>
      ))}
    </>
  )
}

function GlowFilter({ id }: { id: string }) {
  return (
    <filter id={id} x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  )
}

/* ── Main component ─────────────────────────────────────────────────────── */

export default function Flowling({
  totalXp,
  topAreaIndexes = [],
  streak         = 0,
  emotion        = 'happy',
  size           = 'md',
  showInfo       = false,
}: FlowlingProps) {
  const lvl     = getFlowlingLevel(totalXp)
  const nextLvl = getFlowlingNextLevel(totalXp)
  const si      = lvl.stageIdx          // 0..4
  const s       = STAGE[si]

  // Accessories
  const hasLeaves   = topAreaIndexes.includes(0)  // Salud
  const hasGold     = topAreaIndexes.includes(3)  // Dinero
  const hasBackpack = topAreaIndexes.includes(4)  // Trabajo
  const hasFire     = streak >= 7
  const isGuardian  = si === 4

  // Animation
  const bodyAnim =
    emotion === 'sleeping'     ? { y: [0, 3, 0], scale: [1, 1.025, 1] } :
    emotion === 'celebrating'  ? { y: [0, -11, 0, -6, 0] }              :
    emotion === 'encouraging'  ? { rotate: [-2, 2, -2] }                :
                                 { y: [0, -5, 0] }

  const bodyDur =
    emotion === 'sleeping'    ? 4   :
    emotion === 'celebrating' ? 0.9 :
    emotion === 'encouraging' ? 2   : 3.2

  const h   = SIZE_H[size]
  const w   = Math.round(h * (120 / 150))
  const gid = `bg${si}`

  // XP progress
  const xpInLevel  = totalXp - lvl.minXp
  const xpNeeded   = nextLvl ? nextLvl.minXp - lvl.minXp : 1
  const progressPct = nextLvl ? Math.min(100, (xpInLevel / xpNeeded) * 100) : 100

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <motion.div
        animate={bodyAnim}
        transition={{ repeat: Infinity, duration: bodyDur, ease: 'easeInOut', repeatType: 'reverse' }}
      >
        <svg viewBox="0 0 120 150" width={w} height={h} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id={gid} cx="38%" cy="32%" r="62%">
              <stop offset="0%" stopColor={s.c1} />
              <stop offset="100%" stopColor={s.c2} />
            </radialGradient>
            {isGuardian && <GlowFilter id="glow" />}
          </defs>

          {/* Fire aura — behind body */}
          {hasFire && <FireAura s={s} />}

          {/* Backpack — behind body */}
          {hasBackpack && si >= 2 && <Backpack s={s} />}

          {/* Body */}
          <motion.ellipse
            cx={CX} cy={CY} rx={s.rx} ry={s.ry}
            fill={`url(#${gid})`}
            filter={isGuardian ? 'url(#glow)' : undefined}
          />

          {/* Shine highlight */}
          <ellipse
            cx={CX - s.rx * 0.2} cy={CY - s.ry * 0.3}
            rx={s.rx * 0.32} ry={s.ry * 0.2}
            fill="white" opacity={0.22}
          />

          {/* Leaf sprouts — stage 2+ */}
          {si >= 1 && <LeafSprouts s={s} si={si} enhanced={hasLeaves} />}

          {/* Arms — stage 3+ */}
          {si >= 2 && <Arms s={s} emotion={emotion} />}

          {/* Blush */}
          <Blush s={s} />

          {/* Eyes */}
          <Eyes s={s} emotion={emotion} />

          {/* Mouth */}
          <Mouth s={s} emotion={emotion} />

          {/* Glasses — Trabajo + stage 3+ */}
          {hasBackpack && si >= 2 && <Glasses s={s} />}

          {/* Gold coins — Dinero + stage 2+ */}
          {hasGold && si >= 1 && <GoldCoins s={s} />}

          {/* ZZZ particles */}
          {emotion === 'sleeping' && <SleepZzz s={s} />}

          {/* Celebration stars */}
          {emotion === 'celebrating' && <CelebrationStars s={s} />}
        </svg>
      </motion.div>

      {showInfo && (
        <div style={{ textAlign: 'center', width: '100%', maxWidth: `${w}px` }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1px', letterSpacing: '-0.01em' }}>
            {lvl.label}
          </p>
          <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 500, marginBottom: '6px' }}>
            {totalXp} XP{nextLvl ? ` · ${nextLvl.minXp - totalXp} para ${nextLvl.label}` : ' · Nivel máximo ✨'}
          </p>
          {nextLvl && (
            <div style={{ height: '4px', borderRadius: '99px', background: 'var(--surface-secondary)', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                style={{ height: '100%', borderRadius: '99px', background: s.c2 }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
