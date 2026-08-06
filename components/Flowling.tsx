'use client'

import { motion } from 'motion/react'
import { getFlowlingLevel, getFlowlingNextLevel } from '@/lib/areas/defaults'
import { SPECIES, type SpeciesId } from '@/lib/flowlings/species'

/* ── Types ─────────────────────────────────────────────────────────────── */

export type FlowlingEmotion = 'happy' | 'celebrating' | 'sleeping' | 'encouraging' | 'concentrated' | 'tired'
export type FlowlingSize    = 'sm' | 'md' | 'lg' | 'xl'

export interface FlowlingProps {
  totalXp:         number
  species?:        string
  topAreaIndexes?: number[]
  streak?:         number
  emotion?:        FlowlingEmotion
  size?:           FlowlingSize
  showInfo?:       boolean
}

/* ── Stage / size ───────────────────────────────────────────────────────── */

const CX = 60
const CY = 90

interface SS { rx: number; ry: number; eyeOff: number; eyeY: number; eyeR: number; mOff: number }
interface SC { c1: string; c2: string; dark: string }
type S = SS & SC

const STAGE_SIZE: SS[] = [
  { rx:22, ry:27, eyeOff:6.5, eyeY:-8,  eyeR:2.5, mOff:5  },
  { rx:27, ry:33, eyeOff:8,   eyeY:-10, eyeR:3.5, mOff:7  },
  { rx:33, ry:39, eyeOff:10,  eyeY:-12, eyeR:4.5, mOff:9  },
  { rx:39, ry:46, eyeOff:12,  eyeY:-15, eyeR:5.5, mOff:11 },
  { rx:46, ry:54, eyeOff:14,  eyeY:-18, eyeR:7,   mOff:14 },
]

const SIZE_H: Record<FlowlingSize, number> = { sm: 76, md: 108, lg: 150, xl: 200 }

const BLINK_DELAY: Record<string, number> = {
  bloom: 0, nova: 1.2, kiro: 2.4, momo: 0.6,
  octi: 1.8, ember: 3.0, lumi: 0.3, sage: 2.1,
}

function resolveS(si: number, speciesId: string): S {
  const sp  = SPECIES[(speciesId as SpeciesId)] ?? SPECIES.bloom
  const [c1, c2] = sp.stages[si] ?? sp.stages[0]
  return { ...STAGE_SIZE[si], c1, c2, dark: sp.dark }
}

/* ── Eyes ───────────────────────────────────────────────────────────────── */

function Eyes({ s, emotion, speciesId }: { s: S; emotion: FlowlingEmotion; speciesId: string }) {
  const lx = CX - s.eyeOff
  const rx = CX + s.eyeOff
  const ey = CY + s.eyeY
  const r  = s.eyeR
  const bd = BLINK_DELAY[speciesId] ?? 0

  if (emotion === 'sleeping') {
    const sw = r * 0.55
    return (
      <>
        <path d={`M${lx-r},${ey} Q${lx},${ey+r*0.9} ${lx+r},${ey}`}
          fill="none" stroke={s.dark} strokeWidth={sw} strokeLinecap="round" />
        <path d={`M${rx-r},${ey} Q${rx},${ey+r*0.9} ${rx+r},${ey}`}
          fill="none" stroke={s.dark} strokeWidth={sw} strokeLinecap="round" />
      </>
    )
  }

  if (emotion === 'concentrated') {
    // Upper semicircle = squinting
    return (
      <>
        <path d={`M${lx-r},${ey} A${r},${r} 0 0,0 ${lx+r},${ey} Z`} fill={s.dark} />
        <circle cx={lx + r*0.28} cy={ey - r*0.2} r={r*0.25} fill="white" opacity={0.75} />
        <path d={`M${rx-r},${ey} A${r},${r} 0 0,0 ${rx+r},${ey} Z`} fill={s.dark} />
        <circle cx={rx + r*0.28} cy={ey - r*0.2} r={r*0.25} fill="white" opacity={0.75} />
      </>
    )
  }

  if (emotion === 'tired') {
    // Lower semicircle = droopy
    return (
      <>
        <path d={`M${lx-r},${ey} A${r},${r} 0 0,1 ${lx+r},${ey} Z`} fill={s.dark} />
        <circle cx={lx + r*0.25} cy={ey + r*0.18} r={r*0.22} fill="white" opacity={0.65} />
        <path d={`M${rx-r},${ey} A${r},${r} 0 0,1 ${rx+r},${ey} Z`} fill={s.dark} />
        <circle cx={rx + r*0.25} cy={ey + r*0.18} r={r*0.22} fill="white" opacity={0.65} />
      </>
    )
  }

  const big = emotion === 'celebrating'
  const er  = big ? r * 1.15 : r

  return (
    <motion.g
      animate={{ scaleY: [1, 1, 1, 0.06, 1, 1, 1, 1, 1, 1] }}
      transition={{
        duration: 6,
        repeat: Infinity,
        delay: bd,
        times: [0, 0.33, 0.40, 0.42, 0.45, 0.52, 0.65, 0.78, 0.9, 1],
        ease: 'easeInOut',
      }}
      style={{ transformOrigin: `${CX}px ${ey}px` }}
    >
      <circle cx={lx} cy={ey} r={er} fill={s.dark} />
      <circle cx={lx + er*0.32} cy={ey - er*0.38} r={er*0.3} fill="white" opacity={0.8} />
      <circle cx={rx} cy={ey} r={er} fill={s.dark} />
      <circle cx={rx + er*0.32} cy={ey - er*0.38} r={er*0.3} fill="white" opacity={0.8} />
    </motion.g>
  )
}

/* ── Mouth ──────────────────────────────────────────────────────────────── */

function Mouth({ s, emotion }: { s: S; emotion: FlowlingEmotion }) {
  const my = CY + s.mOff
  const mw = s.eyeOff - 1
  const md = s.eyeR * 1.4
  const sw = s.eyeR * 0.55

  if (emotion === 'sleeping') {
    return <ellipse cx={CX} cy={my} rx={s.eyeR * 0.7} ry={s.eyeR * 0.4} fill={s.dark} opacity={0.25} />
  }
  if (emotion === 'celebrating') {
    return (
      <>
        <path d={`M${CX-mw},${my} Q${CX},${my+md*1.9} ${CX+mw},${my}`}
          fill="none" stroke={s.dark} strokeWidth={sw} strokeLinecap="round" />
        <ellipse cx={CX} cy={my + md * 0.85} rx={mw * 0.62} ry={md * 0.52}
          fill="white" opacity={0.5} />
      </>
    )
  }
  if (emotion === 'concentrated') {
    // Small determined line — slight downward curve at ends
    return (
      <path d={`M${CX-mw*0.55},${my} Q${CX},${my+md*0.25} ${CX+mw*0.55},${my}`}
        fill="none" stroke={s.dark} strokeWidth={sw} strokeLinecap="round" />
    )
  }
  if (emotion === 'tired') {
    // Small open yawn mouth
    return (
      <ellipse cx={CX} cy={my + md*0.2} rx={mw * 0.45} ry={md * 0.38}
        fill={s.dark} opacity={0.28} />
    )
  }
  return (
    <path d={`M${CX-mw},${my} Q${CX},${my+md} ${CX+mw},${my}`}
      fill="none" stroke={s.dark} strokeWidth={sw} strokeLinecap="round" />
  )
}

/* ── Blush ──────────────────────────────────────────────────────────────── */

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

/* ── BLOOM-specific components ──────────────────────────────────────────── */

function BloomCrown({ s, si }: { s: S; si: number }) {
  const topY = CY - s.ry

  // Stage 0 — single seedling sprout
  if (si === 0) {
    return (
      <g>
        <line x1={CX} y1={topY + 2} x2={CX} y2={topY - 11}
          stroke="#44B059" strokeWidth={1.5} strokeLinecap="round" />
        <ellipse cx={CX - 3} cy={topY - 10}
          rx={5.5} ry={2.8} fill="#5DC974"
          transform={`rotate(-30,${CX - 3},${topY - 10})`} />
        <ellipse cx={CX + 3.5} cy={topY - 7}
          rx={4.5} ry={2.2} fill="#4AB864"
          transform={`rotate(22,${CX + 3.5},${topY - 7})`} />
      </g>
    )
  }

  // Stage 1 — 3-leaf small crown
  if (si === 1) {
    const leaves = [
      { dx: -10, sh: 13, tilt: -38, lrx: 5.5, lry: 2.8, c: '#4AB864' },
      { dx:   0, sh: 16, tilt:   0, lrx: 6.2, lry: 3.2, c: '#5DC974' },
      { dx:  10, sh: 13, tilt:  38, lrx: 5.5, lry: 2.8, c: '#4AB864' },
    ]
    return (
      <g>
        {leaves.map((l, i) => (
          <g key={i}>
            <line x1={CX + l.dx * 0.28} y1={topY + 2}
              x2={CX + l.dx} y2={topY - l.sh}
              stroke="#3EAF4D" strokeWidth={1.2} strokeLinecap="round" />
            <ellipse cx={CX + l.dx} cy={topY - l.sh - l.lry * 0.6}
              rx={l.lrx} ry={l.lry} fill={l.c}
              transform={`rotate(${l.tilt},${CX + l.dx},${topY - l.sh - l.lry * 0.6})`} />
          </g>
        ))}
      </g>
    )
  }

  // Stage 2 — 5-leaf crown + small flower bud
  if (si === 2) {
    const leaves = [
      { dx: -16, sh: 14, tilt: -48, lrx: 6,   lry: 3.2, c: '#3EAF4D' },
      { dx:  -8, sh: 19, tilt: -22, lrx: 7,   lry: 3.8, c: '#4AB864' },
      { dx:   0, sh: 22, tilt:   0, lrx: 7.8, lry: 4.2, c: '#5DC974' },
      { dx:   8, sh: 19, tilt:  22, lrx: 7,   lry: 3.8, c: '#4AB864' },
      { dx:  16, sh: 14, tilt:  48, lrx: 6,   lry: 3.2, c: '#3EAF4D' },
    ]
    return (
      <g>
        {leaves.map((l, i) => (
          <g key={i}>
            <line x1={CX + l.dx * 0.18} y1={topY + 2}
              x2={CX + l.dx} y2={topY - l.sh}
              stroke="#3EAF4D" strokeWidth={1.3} strokeLinecap="round" />
            <ellipse cx={CX + l.dx} cy={topY - l.sh - l.lry * 0.55}
              rx={l.lrx} ry={l.lry} fill={l.c}
              transform={`rotate(${l.tilt},${CX + l.dx},${topY - l.sh - l.lry * 0.55})`} />
          </g>
        ))}
        <circle cx={CX} cy={topY - 24} r={3.8} fill="#FBBF24" opacity={0.92} />
        <circle cx={CX} cy={topY - 24} r={2}   fill="#F59E0B" opacity={0.9}  />
      </g>
    )
  }

  // Stage 3 — flower headpiece
  if (si === 3) {
    const leaves = [
      { dx: -22, sh: 16, tilt: -58, lrx: 7,   lry: 4   },
      { dx: -11, sh: 23, tilt: -26, lrx: 8.5, lry: 4.8 },
      { dx:   0, sh: 27, tilt:   0, lrx: 9.5, lry: 5.2 },
      { dx:  11, sh: 23, tilt:  26, lrx: 8.5, lry: 4.8 },
      { dx:  22, sh: 16, tilt:  58, lrx: 7,   lry: 4   },
    ]
    const fy = topY - 30
    const petals = [0, 60, 120, 180, 240, 300]
    return (
      <g>
        {leaves.map((l, i) => (
          <g key={i}>
            <line x1={CX + l.dx * 0.18} y1={topY + 2}
              x2={CX + l.dx} y2={topY - l.sh}
              stroke="#3EAF4D" strokeWidth={1.5} strokeLinecap="round" />
            <ellipse cx={CX + l.dx} cy={topY - l.sh - l.lry * 0.55}
              rx={l.lrx} ry={l.lry} fill="#5DC974"
              transform={`rotate(${l.tilt},${CX + l.dx},${topY - l.sh - l.lry * 0.55})`} />
          </g>
        ))}
        {petals.map((deg, i) => {
          const rad = deg * Math.PI / 180
          const px  = CX + Math.cos(rad) * 8.5
          const py  = fy + Math.sin(rad) * 8.5
          return (
            <ellipse key={i} cx={px} cy={py} rx={4.8} ry={3}
              fill={i % 2 === 0 ? '#FFC0CB' : '#FFD1DC'}
              transform={`rotate(${deg},${px},${py})`} />
          )
        })}
        <circle cx={CX} cy={fy} r={5.5} fill="#FBBF24" />
        <circle cx={CX} cy={fy} r={2.8} fill="#F59E0B" />
      </g>
    )
  }

  // Stage 4 — ancient tree / legendary form
  const bY = topY - 16
  const branches: [number, number, number, number, number][] = [
    [-26, -24, -62, 8,  5],
    [-13, -32, -28, 9,  5.5],
    [  0, -36,   0, 11, 7],
    [ 13, -32,  28, 9,  5.5],
    [ 26, -24,  62, 8,  5],
  ]
  return (
    <g>
      <path d={`M${CX-2},${topY} C${CX-2},${bY-4} ${CX+1},${bY-10} ${CX},${bY-16}`}
        fill="none" stroke="#7B5230" strokeWidth={3.5} strokeLinecap="round" />
      {branches.map(([dx, dy, angle, lrx, lry], i) => (
        <g key={i}>
          <line x1={CX} y1={bY - 10} x2={CX + dx} y2={topY + dy}
            stroke="#7B5230" strokeWidth={i === 2 ? 2.6 : 1.9} strokeLinecap="round" />
          <ellipse cx={CX + dx} cy={topY + dy - 6}
            rx={lrx} ry={lry} fill={i === 2 ? '#3EAF4D' : '#4AB864'} opacity={0.92}
            transform={`rotate(${angle},${CX + dx},${topY + dy - 6})`} />
        </g>
      ))}
      <motion.circle cx={CX} cy={topY - 44} r={6} fill="#6BDE82"
        animate={{ r: [5.5, 7.5, 5.5], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.circle cx={CX} cy={topY - 44} r={11} fill="#6BDE82" opacity={0.18}
        animate={{ r: [10, 14, 10], opacity: [0.12, 0.28, 0.12] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }} />
    </g>
  )
}

function BloomFeet({ s, si }: { s: S; si: number }) {
  if (si < 1) return null
  const fy  = CY + s.ry - 1
  const fw  = s.rx * 0.25
  const fh  = s.ry * 0.14
  const lx  = CX - s.rx * 0.36
  const rx  = CX + s.rx * 0.36
  const col = si >= 3 ? '#3EAF4D' : s.c2
  return (
    <g>
      <ellipse cx={lx} cy={fy} rx={fw} ry={fh + 1} fill={col} />
      <ellipse cx={rx} cy={fy} rx={fw} ry={fh + 1} fill={col} />
    </g>
  )
}

function BloomBelt({ s, si }: { s: S; si: number }) {
  if (si < 2) return null
  const by = CY + s.ry * 0.28
  return (
    <g opacity={0.78}>
      <path d={`M${CX - s.rx + 2},${by} A${s.rx - 2},${s.ry * 0.3} 0 0,0 ${CX + s.rx - 2},${by}`}
        fill="none" stroke="#6B4226" strokeWidth={2.4} />
      <rect x={CX - s.rx * 0.82} y={by - 2}
        width={s.rx * 0.3} height={s.rx * 0.28} rx={2} fill="#8B6534" />
      <rect x={CX + s.rx * 0.5}  y={by - 2}
        width={s.rx * 0.26} height={s.rx * 0.24} rx={2} fill="#7B5A2E" />
    </g>
  )
}

function BloomStaff({ s, si }: { s: S; si: number }) {
  if (si < 3) return null
  const bx  = CX + s.rx + 3
  const bot = CY + s.ry - 4
  const top = CY - s.ry * 1.5
  return (
    <g opacity={0.88}>
      <line x1={bx} y1={bot} x2={bx} y2={top}
        stroke="#6B4226" strokeWidth={2.2} strokeLinecap="round" />
      {/* Flower at tip */}
      {[0, 72, 144, 216, 288].map((deg, i) => {
        const rad = deg * Math.PI / 180
        const px  = bx + Math.cos(rad) * 5.5
        const py  = top + Math.sin(rad) * 5.5
        return (
          <ellipse key={i} cx={px} cy={py} rx={3.2} ry={2}
            fill={i % 2 === 0 ? '#FFC0CB' : '#FFD1DC'}
            transform={`rotate(${deg},${px},${py})`} />
        )
      })}
      <circle cx={bx} cy={top} r={3.5} fill="#FBBF24" />
      <circle cx={bx} cy={top} r={1.8} fill="#F59E0B" />
    </g>
  )
}

/* ── Generic accessories ────────────────────────────────────────────────── */

function LeafSprouts({ s, si, enhanced }: { s: S; si: number; enhanced: boolean }) {
  const count  = Math.min(si + 2, 5)
  const topY   = CY - s.ry + 2
  const spread = 24 + si * 4
  const lc     = enhanced ? '#3EAF4D' : '#5DC974'
  const ld     = enhanced ? '#2D8A3B' : '#44B059'
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const frac  = count === 1 ? 0 : (i / (count - 1)) - 0.5
        const x     = CX + frac * spread
        const stemH = 7 + si * 1.5
        const lrx   = 3.5 + si * 0.6
        const lry   = 2   + si * 0.3
        return (
          <g key={i}>
            <line x1={x} y1={topY} x2={x + frac * 3} y2={topY - stemH}
              stroke={ld} strokeWidth={1.2} strokeLinecap="round" />
            <ellipse cx={x + frac * 3} cy={topY - stemH - lry * 0.5}
              rx={lrx} ry={lry} fill={lc} opacity={0.9}
              transform={`rotate(${frac * 30},${x + frac * 3},${topY - stemH - lry * 0.5})`} />
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
        transform={`rotate(${-rot},${CX - s.rx - 2},${ay + lift})`} />
      <ellipse cx={CX + s.rx + 2} cy={ay + lift} rx={aw} ry={ah} fill={s.c2}
        transform={`rotate(${rot},${CX + s.rx + 2},${ay + lift})`} />
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
      <line x1={lx - r} y1={ey} x2={lx - r - 5} y2={ey - 2} stroke="#4E2E0A" strokeWidth={0.8} strokeLinecap="round" />
      <line x1={rx + r} y1={ey} x2={rx + r + 5} y2={ey - 2} stroke="#4E2E0A" strokeWidth={0.8} strokeLinecap="round" />
    </g>
  )
}

function Backpack({ s }: { s: S }) {
  const bx = CX - s.rx - 1; const by = CY - s.ry * 0.28
  const bw = s.rx * 0.52;   const bh = s.ry * 0.62
  const bx0 = bx - bw
  return (
    <g>
      <rect x={bx0} y={by} width={bw} height={bh} rx={3} fill="#8B6534" opacity={0.88} />
      <rect x={bx0 + 2} y={by + 3} width={bw - 4} height={bh * 0.32} rx={1.5} fill="#A07840" opacity={0.7} />
      <line x1={bx0 + bw * 0.35} y1={by} x2={bx + 0.5} y2={CY - s.ry * 0.08} stroke="#6B4E27" strokeWidth={1.4} opacity={0.65} />
      <line x1={bx0 + bw * 0.65} y1={by} x2={bx + 0.5} y2={CY + s.ry * 0.22} stroke="#6B4E27" strokeWidth={1.4} opacity={0.65} />
    </g>
  )
}

function GoldCoins({ s }: { s: S }) {
  const coins = [
    { dx: s.rx + 9,  dy: -s.ry * 0.38, r: 4.5, delay: 0    },
    { dx: s.rx + 14, dy:  s.ry * 0.08,  r: 3.5, delay: 0.35 },
    { dx: s.rx + 8,  dy:  s.ry * 0.5,   r: 4,   delay: 0.7  },
  ]
  return (
    <>
      {coins.map((c, i) => (
        <motion.g key={i}
          animate={{ y: [0, -4, 0] }}
          transition={{ delay: c.delay, duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <circle cx={CX + c.dx} cy={CY + c.dy} r={c.r} fill="#FBBF24" />
          <circle cx={CX + c.dx} cy={CY + c.dy} r={c.r * 0.55} fill="none" stroke="#F59E0B" strokeWidth={0.7} opacity={0.6} />
          <text x={CX + c.dx} y={CY + c.dy + c.r * 0.4} textAnchor="middle" fontSize={c.r * 0.9} fill="#92400E" fontWeight="bold" opacity={0.7}>$</text>
        </motion.g>
      ))}
    </>
  )
}

function FireAura({ s }: { s: S }) {
  const baseY = CY + s.ry - 1
  return (
    <>
      {[-11, 0, 11].map((xOff, i) => (
        <motion.path key={i}
          d={`M${CX+xOff-4},${baseY+6} C${CX+xOff-3},${baseY-4} ${CX+xOff+3},${baseY-4} ${CX+xOff+4},${baseY+6}`}
          fill={i === 1 ? '#F97316' : '#FB923C'} opacity={0.85}
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
        <motion.text key={i} x={z.x} y={z.y} fontSize={z.sz}
          fill="#7BAECE" fontWeight="800" textAnchor="middle"
          animate={{ opacity: [0, 0.9, 0], y: [z.y, z.y - 14, z.y - 28] }}
          transition={{ delay: z.delay, duration: 2.8, repeat: Infinity, ease: 'easeOut' }}
        >z</motion.text>
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
        <motion.text key={i} x={st.x} y={st.y} fontSize={11} textAnchor="middle"
          animate={{ scale: [0, 1.3, 1, 0], rotate: [0, 15, -10, 0] }}
          transition={{ delay: i * 0.18, duration: 1.6, repeat: Infinity, ease: 'backOut' }}
          style={{ transformOrigin: `${st.x}px ${st.y}px` }}
        >✨</motion.text>
      ))}
    </>
  )
}

function GlowFilter({ id }: { id: string }) {
  return (
    <filter id={id} x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
      <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
  )
}

/* ── Species features ───────────────────────────────────────────────────── */

function SpeciesFeature({ feature, s }: { feature: string; s: S }) {
  const topY = CY - s.ry

  switch (feature) {
    case 'antenna': {
      const stemH = s.ry * 0.32
      return (
        <g>
          <line x1={CX} y1={topY + 2} x2={CX} y2={topY - stemH}
            stroke={s.dark} strokeWidth={1.4} strokeLinecap="round" />
          <circle cx={CX} cy={topY - stemH - 2.5} r={3} fill={s.c2} stroke={s.dark} strokeWidth={0.8} />
          <circle cx={CX} cy={topY - stemH - 2.5} r={1.2} fill="white" opacity={0.85} />
        </g>
      )
    }
    case 'fox-ears': {
      const earH = s.ry * 0.42
      const earW = s.rx * 0.2
      const lbx  = CX - s.rx * 0.48
      const rbx  = CX + s.rx * 0.48
      return (
        <g>
          <path d={`M${lbx-earW},${topY+5} L${lbx},${topY-earH} L${lbx+earW},${topY+5} Z`}
            fill={s.c2} stroke={s.dark} strokeWidth={0.7} strokeLinejoin="round" />
          <path d={`M${rbx-earW},${topY+5} L${rbx},${topY-earH} L${rbx+earW},${topY+5} Z`}
            fill={s.c2} stroke={s.dark} strokeWidth={0.7} strokeLinejoin="round" />
          <path d={`M${lbx-earW*0.5},${topY+5} L${lbx},${topY-earH*0.55} L${lbx+earW*0.5},${topY+5} Z`}
            fill="#FED7AA" opacity={0.75} />
          <path d={`M${rbx-earW*0.5},${topY+5} L${rbx},${topY-earH*0.55} L${rbx+earW*0.5},${topY+5} Z`}
            fill="#FED7AA" opacity={0.75} />
        </g>
      )
    }
    case 'panda-ears': {
      const earR = s.rx * 0.26
      const lEx  = CX - s.rx * 0.54
      const rEx  = CX + s.rx * 0.54
      const earY = topY + earR * 0.25
      return (
        <g>
          <circle cx={lEx} cy={earY} r={earR} fill={s.dark} opacity={0.75} />
          <circle cx={rEx} cy={earY} r={earR} fill={s.dark} opacity={0.75} />
          <circle cx={lEx} cy={earY} r={earR * 0.52} fill="#E5E7EB" opacity={0.55} />
          <circle cx={rEx} cy={earY} r={earR * 0.52} fill="#E5E7EB" opacity={0.55} />
        </g>
      )
    }
    case 'tentacles': {
      const baseY = CY + s.ry
      const tips  = [-s.rx * 0.55, -s.rx * 0.2, s.rx * 0.2, s.rx * 0.55]
      return (
        <g>
          {tips.map((dx, i) => (
            <path key={i}
              d={`M${CX+dx},${baseY} Q${CX+dx+(i%2===0?-3.5:3.5)},${baseY+7} ${CX+dx},${baseY+13}`}
              fill="none" stroke={s.c2} strokeWidth={3.5} strokeLinecap="round" />
          ))}
        </g>
      )
    }
    case 'horns': {
      const hornH = s.ry * 0.38
      const lhx   = CX - s.rx * 0.3
      const rhx   = CX + s.rx * 0.3
      return (
        <g>
          <path d={`M${lhx},${topY+4} Q${lhx - hornH*0.55},${topY - hornH*0.35} ${lhx - hornH*0.28},${topY - hornH}`}
            fill="none" stroke={s.dark} strokeWidth={2.2} strokeLinecap="round" />
          <path d={`M${rhx},${topY+4} Q${rhx + hornH*0.55},${topY - hornH*0.35} ${rhx + hornH*0.28},${topY - hornH}`}
            fill="none" stroke={s.dark} strokeWidth={2.2} strokeLinecap="round" />
          <circle cx={lhx - hornH*0.28} cy={topY - hornH} r={1.6} fill={s.dark} />
          <circle cx={rhx + hornH*0.28} cy={topY - hornH} r={1.6} fill={s.dark} />
        </g>
      )
    }
    case 'sparkles': {
      const pts = [
        { dx: -s.rx * 0.75, dy: -s.ry * 0.55, delay: 0    },
        { dx:  s.rx * 0.8,  dy: -s.ry * 0.45, delay: 0.5  },
        { dx: -s.rx * 0.38, dy: -s.ry * 1.1,  delay: 0.9  },
        { dx:  s.rx * 0.42, dy: -s.ry * 1.05, delay: 1.4  },
      ]
      return (
        <g>
          {pts.map((p, i) => (
            <motion.text key={i}
              x={CX + p.dx} y={CY + p.dy + 4}
              textAnchor="middle" fontSize={8} fill={s.c2}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.3, 0.8] }}
              transition={{ delay: p.delay, duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: `${CX + p.dx}px ${CY + p.dy}px` }}
            >✦</motion.text>
          ))}
        </g>
      )
    }
    case 'owl-feathers': {
      const fH  = s.ry * 0.28
      const pts = [-s.rx * 0.24, 0, s.rx * 0.24]
      return (
        <g>
          {pts.map((dx, i) => (
            <ellipse key={i}
              cx={CX + dx} cy={topY - fH * 0.35}
              rx={s.rx * 0.1} ry={fH * 0.52}
              fill={s.dark} opacity={0.65}
              transform={`rotate(${dx > 0 ? 12 : dx < 0 ? -12 : 0},${CX + dx},${topY})`}
            />
          ))}
        </g>
      )
    }
    default:
      return null
  }
}

/* ── Main component ─────────────────────────────────────────────────────── */

export default function Flowling({
  totalXp,
  species        = 'bloom',
  topAreaIndexes = [],
  streak         = 0,
  emotion        = 'happy',
  size           = 'md',
  showInfo       = false,
}: FlowlingProps) {
  const lvl     = getFlowlingLevel(totalXp)
  const nextLvl = getFlowlingNextLevel(totalXp)
  const si      = lvl.stageIdx
  const s       = resolveS(si, species)
  const sp      = SPECIES[(species as SpeciesId)] ?? SPECIES.bloom
  const isBloom = species === 'bloom'

  const hasLeaves   = topAreaIndexes.includes(0)
  const hasGold     = topAreaIndexes.includes(3)
  const hasBackpack = topAreaIndexes.includes(4)
  const hasFire     = streak >= 7
  const isGuardian  = si === 4

  const bodyAnim =
    emotion === 'sleeping'     ? { y: [0, 3, 0], scale: [1, 1.025, 1] } :
    emotion === 'celebrating'  ? { y: [0, -11, 0, -6, 0] }              :
    emotion === 'encouraging'  ? { rotate: [-2, 2, -2] }                :
    emotion === 'concentrated' ? { y: [0, -1.5, 0] }                    :
    emotion === 'tired'        ? { y: [0, 2, 0] }                       :
                                 { y: [0, -5, 0] }

  const bodyDur =
    emotion === 'sleeping'     ? 4   :
    emotion === 'celebrating'  ? 0.9 :
    emotion === 'encouraging'  ? 2   :
    emotion === 'concentrated' ? 4.5 :
    emotion === 'tired'        ? 5.5 :
    3.2

  const h   = SIZE_H[size]
  const w   = Math.round(h * (120 / 150))
  const gid = `bg${si}${species}`

  const xpInLevel   = totalXp - lvl.minXp
  const xpNeeded    = nextLvl ? nextLvl.minXp - lvl.minXp : 1
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

          {hasFire && <FireAura s={s} />}

          {/* Bloom staff goes behind body */}
          {isBloom && <BloomStaff s={s} si={si} />}

          {/* Generic backpack for non-bloom species */}
          {!isBloom && hasBackpack && si >= 2 && <Backpack s={s} />}

          {/* Body */}
          <motion.ellipse cx={CX} cy={CY} rx={s.rx} ry={s.ry}
            fill={`url(#${gid})`}
            filter={isGuardian ? 'url(#glow)' : undefined}
          />
          <ellipse cx={CX - s.rx * 0.2} cy={CY - s.ry * 0.3}
            rx={s.rx * 0.32} ry={s.ry * 0.2} fill="white" opacity={0.22} />

          {/* Bloom feet (behind the body bottom edge) */}
          {isBloom && <BloomFeet s={s} si={si} />}

          {/* Bloom belt / seed pouch */}
          {isBloom && <BloomBelt s={s} si={si} />}

          {/* Species feature or Bloom crown */}
          {isBloom
            ? <BloomCrown s={s} si={si} />
            : <SpeciesFeature feature={sp.feature} s={s} />
          }

          {/* Leaf sprouts for non-bloom species with leaf area unlocked */}
          {!isBloom && hasLeaves && si >= 1 && <LeafSprouts s={s} si={si} enhanced={true} />}

          {si >= 2 && <Arms s={s} emotion={emotion} />}
          <Blush s={s} />
          <Eyes s={s} emotion={emotion} speciesId={species} />
          <Mouth s={s} emotion={emotion} />

          {!isBloom && hasBackpack && si >= 2 && <Glasses s={s} />}
          {hasGold && si >= 1 && <GoldCoins s={s} />}
          {emotion === 'sleeping'    && <SleepZzz s={s} />}
          {emotion === 'celebrating' && <CelebrationStars s={s} />}
        </svg>
      </motion.div>

      {showInfo && (
        <div style={{ textAlign: 'center', width: '100%', maxWidth: `${w}px` }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1px', letterSpacing: '-0.01em' }}>
            {sp.name} · {lvl.label}
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
