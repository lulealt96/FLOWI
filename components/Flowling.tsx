'use client'

import { motion } from 'motion/react'
import { getFlowlingLevel, getFlowlingNextLevel } from '@/lib/areas/defaults'
import { SPECIES, type SpeciesId } from '@/lib/flowlings/species'

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */

export type FlowlingEmotion =
  | 'happy' | 'celebrating' | 'sleeping'
  | 'encouraging' | 'concentrated' | 'tired'

export type FlowlingSize = 'sm' | 'md' | 'lg' | 'xl'

export interface FlowlingProps {
  totalXp:         number
  species?:        string
  topAreaIndexes?: number[]
  streak?:         number
  emotion?:        FlowlingEmotion
  size?:           FlowlingSize
  showInfo?:       boolean
}

/* =============================================================
   GENERIC (non-Bloom) system — viewBox 0 0 120 150
   =========================================================== */

const CX = 60
const CY = 88

interface SS { rx: number; ry: number; eyeOff: number; eyeY: number; eyeR: number; mOff: number }
interface SC { c1: string; c2: string; dark: string }
type S = SS & SC

const STAGE_SIZE: SS[] = [
  { rx:22, ry:26, eyeOff:6.5, eyeY:-8,  eyeR:2.8, mOff:5  },
  { rx:27, ry:32, eyeOff:8,   eyeY:-10, eyeR:3.8, mOff:7  },
  { rx:33, ry:38, eyeOff:10,  eyeY:-12, eyeR:4.8, mOff:9  },
  { rx:39, ry:45, eyeOff:12,  eyeY:-15, eyeR:5.8, mOff:11 },
  { rx:46, ry:53, eyeOff:14,  eyeY:-18, eyeR:7.2, mOff:14 },
]

const SIZE_H: Record<FlowlingSize, number> = { sm: 76, md: 108, lg: 150, xl: 200 }

const BLINK_DELAY: Record<string, number> = {
  bloom: 0, nova: 1.2, kiro: 2.4, momo: 0.6,
  octi: 1.8, ember: 3.0, lumi: 0.3, sage: 2.1,
}

function resolveS(si: number, speciesId: string): S {
  const sp = SPECIES[(speciesId as SpeciesId)] ?? SPECIES.bloom
  const [c1, c2] = sp.stages[si] ?? sp.stages[0]
  return { ...STAGE_SIZE[si], c1, c2, dark: sp.dark }
}

function bodyPath(cx: number, cy: number, rx: number, ry: number): string {
  const k = 0.5523
  return (
    `M ${cx} ${cy - ry} ` +
    `C ${cx+rx*k} ${cy-ry}, ${cx+rx} ${cy-ry*k*0.95}, ${cx+rx} ${cy} ` +
    `C ${cx+rx} ${cy+ry*k*1.08}, ${cx+rx*k*1.04} ${cy+ry*1.02}, ${cx} ${cy+ry} ` +
    `C ${cx-rx*k*1.04} ${cy+ry*1.02}, ${cx-rx} ${cy+ry*k*1.08}, ${cx-rx} ${cy} ` +
    `C ${cx-rx} ${cy-ry*k*0.95}, ${cx-rx*k} ${cy-ry}, ${cx} ${cy-ry} Z`
  )
}

/* ── Generic: Defs ──────────────────────────────────────────── */
function GenDefs({ s, si, species, isGuardian }: { s: S; si: number; species: string; isGuardian: boolean }) {
  const gid  = `bg${si}${species}`
  const shid = `bsh${si}${species}`
  const fid  = `fshadow${si}${species}`
  const blid = `fblush${si}${species}`
  const glid = `fglow${si}${species}`
  return (
    <defs>
      <radialGradient id={gid} cx="30%" cy="25%" r="72%">
        <stop offset="0%"   stopColor="white"  stopOpacity={0.45} />
        <stop offset="30%"  stopColor={s.c1} />
        <stop offset="100%" stopColor={s.c2} />
      </radialGradient>
      <radialGradient id={shid} cx="50%" cy="88%" r="58%">
        <stop offset="0%"   stopColor="#000" stopOpacity={0.18} />
        <stop offset="100%" stopColor="#000" stopOpacity={0}    />
      </radialGradient>
      <filter id={fid} x="-30%" y="-20%" width="160%" height="160%">
        <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#2D1020" floodOpacity="0.22" />
      </filter>
      <filter id={blid} x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="2.6" />
      </filter>
      {isGuardian && (
        <filter id={glid} x="-35%" y="-35%" width="170%" height="170%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      )}
    </defs>
  )
}

/* ── Generic: Body ──────────────────────────────────────────── */
function GenBody({ s, si, species, isGuardian }: { s: S; si: number; species: string; isGuardian: boolean }) {
  const gid  = `bg${si}${species}`
  const shid = `bsh${si}${species}`
  const fid  = `fshadow${si}${species}`
  const glid = `fglow${si}${species}`
  const bp   = bodyPath(CX, CY, s.rx, s.ry)
  return (
    <g filter={`url(#${fid})`}>
      <path d={bp} fill={`url(#${gid})`} filter={isGuardian ? `url(#${glid})` : undefined} />
      <path d={bp} fill={`url(#${shid})`} />
      <path d={bp} fill="none" stroke={s.dark} strokeWidth={1.4} strokeOpacity={0.2} />
      <ellipse cx={CX - s.rx*0.2} cy={CY - s.ry*0.32} rx={s.rx*0.42} ry={s.ry*0.24} fill="white" opacity={0.38} />
      <ellipse cx={CX - s.rx*0.36} cy={CY - s.ry*0.46} rx={s.rx*0.14} ry={s.ry*0.09} fill="white" opacity={0.62} />
    </g>
  )
}

/* ── Generic: Eyes ──────────────────────────────────────────── */
function GenEyes({ s, emotion, speciesId }: { s: S; emotion: FlowlingEmotion; speciesId: string }) {
  const lx = CX - s.eyeOff
  const rx = CX + s.eyeOff
  const ey = CY + s.eyeY
  const r  = s.eyeR
  const bd = BLINK_DELAY[speciesId] ?? 0

  const eyeShadow = (
    <>
      <ellipse cx={lx} cy={ey+r*0.95} rx={r*1.15} ry={r*0.38} fill={s.dark} opacity={0.09} />
      <ellipse cx={rx} cy={ey+r*0.95} rx={r*1.15} ry={r*0.38} fill={s.dark} opacity={0.09} />
    </>
  )

  if (emotion === 'sleeping') {
    const sw = r*0.58
    return (
      <>
        {eyeShadow}
        <path d={`M${lx-r},${ey} Q${lx},${ey+r*0.95} ${lx+r},${ey}`} fill="none" stroke={s.dark} strokeWidth={sw} strokeLinecap="round" />
        <path d={`M${rx-r},${ey} Q${rx},${ey+r*0.95} ${rx+r},${ey}`} fill="none" stroke={s.dark} strokeWidth={sw} strokeLinecap="round" />
      </>
    )
  }
  if (emotion === 'concentrated') {
    return (
      <>
        {eyeShadow}
        <path d={`M${lx-r},${ey} A${r},${r} 0 0,0 ${lx+r},${ey} Z`} fill={s.dark} />
        <circle cx={lx+r*0.28} cy={ey-r*0.22} r={r*0.26} fill="white" opacity={0.82} />
        <path d={`M${rx-r},${ey} A${r},${r} 0 0,0 ${rx+r},${ey} Z`} fill={s.dark} />
        <circle cx={rx+r*0.28} cy={ey-r*0.22} r={r*0.26} fill="white" opacity={0.82} />
      </>
    )
  }
  if (emotion === 'tired') {
    return (
      <>
        {eyeShadow}
        <path d={`M${lx-r},${ey} A${r},${r} 0 0,1 ${lx+r},${ey} Z`} fill={s.dark} />
        <circle cx={lx+r*0.24} cy={ey+r*0.2} r={r*0.24} fill="white" opacity={0.68} />
        <path d={`M${rx-r},${ey} A${r},${r} 0 0,1 ${rx+r},${ey} Z`} fill={s.dark} />
        <circle cx={rx+r*0.24} cy={ey+r*0.2} r={r*0.24} fill="white" opacity={0.68} />
      </>
    )
  }
  const big = emotion === 'celebrating'
  const er  = big ? r*1.18 : r
  return (
    <>
      {eyeShadow}
      <motion.g
        animate={{ scaleY:[1,1,1,0.06,1,1,1,1,1,1] }}
        transition={{ duration:6, repeat:Infinity, delay:bd, times:[0,0.33,0.40,0.42,0.45,0.52,0.65,0.78,0.9,1], ease:'easeInOut' }}
        style={{ transformOrigin:`${CX}px ${ey}px` }}
      >
        <circle cx={lx} cy={ey} r={er} fill={s.dark} />
        <circle cx={lx+er*0.3}  cy={ey-er*0.36} r={er*0.32} fill="white" opacity={0.92} />
        <circle cx={lx-er*0.12} cy={ey-er*0.55} r={er*0.12} fill="white" opacity={0.7}  />
        <circle cx={rx} cy={ey} r={er} fill={s.dark} />
        <circle cx={rx+er*0.3}  cy={ey-er*0.36} r={er*0.32} fill="white" opacity={0.92} />
        <circle cx={rx-er*0.12} cy={ey-er*0.55} r={er*0.12} fill="white" opacity={0.7}  />
      </motion.g>
    </>
  )
}

/* ── Generic: Mouth ─────────────────────────────────────────── */
function GenMouth({ s, emotion }: { s: S; emotion: FlowlingEmotion }) {
  const my = CY + s.mOff
  const mw = s.eyeOff - 1
  const md = s.eyeR * 1.4
  const sw = s.eyeR * 0.58
  if (emotion === 'sleeping')    return <ellipse cx={CX} cy={my} rx={s.eyeR*0.7} ry={s.eyeR*0.4} fill={s.dark} opacity={0.25} />
  if (emotion === 'celebrating') return (
    <>
      <path d={`M${CX-mw},${my} Q${CX},${my+md*1.9} ${CX+mw},${my}`} fill="none" stroke={s.dark} strokeWidth={sw} strokeLinecap="round" />
      <ellipse cx={CX} cy={my+md*0.85} rx={mw*0.62} ry={md*0.52} fill="white" opacity={0.5} />
    </>
  )
  if (emotion === 'concentrated') return <path d={`M${CX-mw*0.55},${my} Q${CX},${my+md*0.25} ${CX+mw*0.55},${my}`} fill="none" stroke={s.dark} strokeWidth={sw} strokeLinecap="round" />
  if (emotion === 'tired')        return <ellipse cx={CX} cy={my+md*0.2} rx={mw*0.45} ry={md*0.38} fill={s.dark} opacity={0.28} />
  return <path d={`M${CX-mw},${my} Q${CX},${my+md} ${CX+mw},${my}`} fill="none" stroke={s.dark} strokeWidth={sw} strokeLinecap="round" />
}

/* ── Generic: Blush ─────────────────────────────────────────── */
function GenBlush({ s, si, species }: { s: S; si: number; species: string }) {
  const blid = `fblush${si}${species}`
  const bx   = s.eyeOff * 1.6
  const by   = s.eyeY + s.eyeR * 1.5
  return (
    <g filter={`url(#${blid})`}>
      <ellipse cx={CX-bx} cy={CY+by} rx={s.eyeR*2.0} ry={s.eyeR*1.0} fill="#FFB5C5" opacity={0.62} />
      <ellipse cx={CX+bx} cy={CY+by} rx={s.eyeR*2.0} ry={s.eyeR*1.0} fill="#FFB5C5" opacity={0.62} />
    </g>
  )
}

/* ── Generic: SpeciesFeature ────────────────────────────────── */
function SpeciesFeature({ feature, s }: { feature: string; s: S }) {
  const topY = CY - s.ry
  switch (feature) {
    case 'antenna': {
      const sh = s.ry*0.32
      return (
        <g>
          <line x1={CX} y1={topY+2} x2={CX} y2={topY-sh} stroke={s.dark} strokeWidth={1.4} strokeLinecap="round" />
          <circle cx={CX} cy={topY-sh-2.5} r={3.2} fill={s.c2} stroke={s.dark} strokeWidth={0.7} />
          <circle cx={CX} cy={topY-sh-2.5} r={1.3} fill="white" opacity={0.85} />
        </g>
      )
    }
    case 'fox-ears': {
      const eh = s.ry*0.42; const ew = s.rx*0.2
      const lbx = CX-s.rx*0.48; const rbx = CX+s.rx*0.48
      return (
        <g>
          <path d={`M${lbx-ew},${topY+5} L${lbx},${topY-eh} L${lbx+ew},${topY+5} Z`} fill={s.c2} stroke={s.dark} strokeWidth={0.8} strokeLinejoin="round" />
          <path d={`M${rbx-ew},${topY+5} L${rbx},${topY-eh} L${rbx+ew},${topY+5} Z`} fill={s.c2} stroke={s.dark} strokeWidth={0.8} strokeLinejoin="round" />
          <path d={`M${lbx-ew*0.5},${topY+5} L${lbx},${topY-eh*0.55} L${lbx+ew*0.5},${topY+5} Z`} fill="#FED7AA" opacity={0.8} />
          <path d={`M${rbx-ew*0.5},${topY+5} L${rbx},${topY-eh*0.55} L${rbx+ew*0.5},${topY+5} Z`} fill="#FED7AA" opacity={0.8} />
        </g>
      )
    }
    case 'panda-ears': {
      const er = s.rx*0.26
      const lEx = CX-s.rx*0.54; const rEx = CX+s.rx*0.54; const earY = topY+er*0.25
      return (
        <g>
          <circle cx={lEx} cy={earY} r={er} fill={s.dark} opacity={0.8} />
          <circle cx={rEx} cy={earY} r={er} fill={s.dark} opacity={0.8} />
          <circle cx={lEx} cy={earY} r={er*0.52} fill="#E5E7EB" opacity={0.55} />
          <circle cx={rEx} cy={earY} r={er*0.52} fill="#E5E7EB" opacity={0.55} />
        </g>
      )
    }
    case 'tentacles': {
      const bY = CY+s.ry; const tips = [-s.rx*0.55,-s.rx*0.2,s.rx*0.2,s.rx*0.55]
      return (
        <g>
          {tips.map((dx,i)=>(
            <path key={i} d={`M${CX+dx},${bY} Q${CX+dx+(i%2===0?-3.5:3.5)},${bY+7} ${CX+dx},${bY+13}`}
              fill="none" stroke={s.c2} strokeWidth={3.8} strokeLinecap="round" />
          ))}
        </g>
      )
    }
    case 'horns': {
      const hh = s.ry*0.38; const lhx = CX-s.rx*0.3; const rhx = CX+s.rx*0.3
      return (
        <g>
          <path d={`M${lhx},${topY+4} Q${lhx-hh*0.55},${topY-hh*0.35} ${lhx-hh*0.28},${topY-hh}`} fill="none" stroke={s.dark} strokeWidth={2.4} strokeLinecap="round" />
          <path d={`M${rhx},${topY+4} Q${rhx+hh*0.55},${topY-hh*0.35} ${rhx+hh*0.28},${topY-hh}`} fill="none" stroke={s.dark} strokeWidth={2.4} strokeLinecap="round" />
          <circle cx={lhx-hh*0.28} cy={topY-hh} r={2} fill={s.dark} />
          <circle cx={rhx+hh*0.28} cy={topY-hh} r={2} fill={s.dark} />
        </g>
      )
    }
    case 'sparkles': {
      const pts = [{dx:-s.rx*0.75,dy:-s.ry*0.55,d:0},{dx:s.rx*0.8,dy:-s.ry*0.45,d:0.5},{dx:-s.rx*0.38,dy:-s.ry*1.1,d:0.9},{dx:s.rx*0.42,dy:-s.ry*1.05,d:1.4}]
      return (
        <g>
          {pts.map((p,i)=>(
            <motion.text key={i} x={CX+p.dx} y={CY+p.dy+4} textAnchor="middle" fontSize={8} fill={s.c2}
              animate={{opacity:[0.3,1,0.3],scale:[0.8,1.3,0.8]}}
              transition={{delay:p.d,duration:2.2,repeat:Infinity,ease:'easeInOut'}}
              style={{transformOrigin:`${CX+p.dx}px ${CY+p.dy}px`}}>✦</motion.text>
          ))}
        </g>
      )
    }
    case 'owl-feathers': {
      const fh = s.ry*0.28; const pts = [-s.rx*0.24,0,s.rx*0.24]
      return (
        <g>
          {pts.map((dx,i)=>(
            <ellipse key={i} cx={CX+dx} cy={topY-fh*0.35} rx={s.rx*0.1} ry={fh*0.52}
              fill={s.dark} opacity={0.65} transform={`rotate(${dx>0?12:dx<0?-12:0},${CX+dx},${topY})`} />
          ))}
        </g>
      )
    }
    default: return null
  }
}

/* ── Generic accessories ────────────────────────────────────── */
function GenLeafSprouts({ s, si }: { s: S; si: number }) {
  const count = Math.min(si+2, 5); const topY = CY-s.ry; const spread = 24+si*4
  return (
    <>
      {Array.from({length:count}).map((_,i) => {
        const frac = count===1?0:(i/(count-1))-0.5
        const x = CX+frac*spread; const sh = 7+si*1.5; const lrx = 3.5+si*0.6; const lry = 2+si*0.3
        return (
          <g key={i}>
            <line x1={x} y1={topY} x2={x+frac*3} y2={topY-sh} stroke="#3EAF4D" strokeWidth={1.2} strokeLinecap="round" />
            <ellipse cx={x+frac*3} cy={topY-sh-lry*0.5} rx={lrx} ry={lry} fill="#5DC974" stroke="#3EAF4D" strokeWidth={0.4} opacity={0.9}
              transform={`rotate(${frac*30},${x+frac*3},${topY-sh-lry*0.5})`} />
          </g>
        )
      })}
    </>
  )
}

function GenArms({ s, emotion }: { s: S; emotion: FlowlingEmotion }) {
  const ay = CY-s.ry*0.05; const aw = s.rx*0.3; const ah = s.rx*0.18
  const lift = emotion==='celebrating' ? -s.ry*0.45 : 0; const rot = emotion==='celebrating' ? 40 : 15
  return (
    <>
      <ellipse cx={CX-s.rx-2} cy={ay+lift} rx={aw} ry={ah} fill={s.c2} stroke={s.dark} strokeWidth={0.8} strokeOpacity={0.2} transform={`rotate(${-rot},${CX-s.rx-2},${ay+lift})`} />
      <ellipse cx={CX+s.rx+2} cy={ay+lift} rx={aw} ry={ah} fill={s.c2} stroke={s.dark} strokeWidth={0.8} strokeOpacity={0.2} transform={`rotate(${rot},${CX+s.rx+2},${ay+lift})`} />
    </>
  )
}

function GenGlasses({ s }: { s: S }) {
  const ey = CY+s.eyeY; const r = s.eyeR*1.55+0.8; const lx = CX-s.eyeOff; const rx = CX+s.eyeOff
  return (
    <g opacity={0.82}>
      <circle cx={lx} cy={ey} r={r} fill="none" stroke="#4E2E0A" strokeWidth={0.9} />
      <circle cx={rx} cy={ey} r={r} fill="none" stroke="#4E2E0A" strokeWidth={0.9} />
      <line x1={lx+r} y1={ey} x2={rx-r} y2={ey} stroke="#4E2E0A" strokeWidth={0.8} />
      <line x1={lx-r} y1={ey} x2={lx-r-5} y2={ey-2} stroke="#4E2E0A" strokeWidth={0.8} strokeLinecap="round" />
      <line x1={rx+r} y1={ey} x2={rx+r+5} y2={ey-2} stroke="#4E2E0A" strokeWidth={0.8} strokeLinecap="round" />
    </g>
  )
}

function GenBackpack({ s }: { s: S }) {
  const bx = CX-s.rx-1; const by = CY-s.ry*0.28; const bw = s.rx*0.52; const bh = s.ry*0.62; const bx0 = bx-bw
  return (
    <g>
      <rect x={bx0} y={by} width={bw} height={bh} rx={3} fill="#8B6534" stroke="#5A3A1A" strokeWidth={0.6} opacity={0.9} />
      <rect x={bx0+2} y={by+3} width={bw-4} height={bh*0.32} rx={1.5} fill="#A07840" opacity={0.7} />
      <line x1={bx0+bw*0.35} y1={by} x2={bx+0.5} y2={CY-s.ry*0.08} stroke="#6B4E27" strokeWidth={1.4} opacity={0.65} />
      <line x1={bx0+bw*0.65} y1={by} x2={bx+0.5} y2={CY+s.ry*0.22} stroke="#6B4E27" strokeWidth={1.4} opacity={0.65} />
    </g>
  )
}

function GenGoldCoins({ s }: { s: S }) {
  const coins = [{dx:s.rx+9,dy:-s.ry*0.38,r:4.5,d:0},{dx:s.rx+14,dy:s.ry*0.08,r:3.5,d:0.35},{dx:s.rx+8,dy:s.ry*0.5,r:4,d:0.7}]
  return (
    <>
      {coins.map((c,i)=>(
        <motion.g key={i} animate={{y:[0,-4,0]}} transition={{delay:c.d,duration:2.2,repeat:Infinity,ease:'easeInOut'}}>
          <circle cx={CX+c.dx} cy={CY+c.dy} r={c.r} fill="#FBBF24" stroke="#D97706" strokeWidth={0.5} />
          <text x={CX+c.dx} y={CY+c.dy+c.r*0.4} textAnchor="middle" fontSize={c.r*0.9} fill="#92400E" fontWeight="bold" opacity={0.7}>$</text>
        </motion.g>
      ))}
    </>
  )
}

function GenFireAura({ s }: { s: S }) {
  const bY = CY+s.ry-1
  return (
    <>
      {[-11,0,11].map((xOff,i)=>(
        <motion.path key={i}
          d={`M${CX+xOff-4},${bY+6} C${CX+xOff-3},${bY-4} ${CX+xOff+3},${bY-4} ${CX+xOff+4},${bY+6}`}
          fill={i===1?'#F97316':'#FB923C'} opacity={0.85}
          animate={{scaleY:[1,1.35,0.85,1.2,1],opacity:[0.85,1,0.7,0.95,0.85]}}
          transition={{delay:i*0.18,duration:0.9,repeat:Infinity,ease:'easeInOut'}}
          style={{transformOrigin:`${CX+xOff}px ${bY+6}px`}} />
      ))}
    </>
  )
}

function GenSleepZzz({ s }: { s: S }) {
  const zs = [{x:CX+s.rx+2,y:CY-s.ry*0.55,sz:7,d:0},{x:CX+s.rx+8,y:CY-s.ry*0.85,sz:9,d:0.5},{x:CX+s.rx+15,y:CY-s.ry*1.1,sz:11,d:1}]
  return (
    <>
      {zs.map((z,i)=>(
        <motion.text key={i} x={z.x} y={z.y} fontSize={z.sz} fill="#7BAECE" fontWeight="800" textAnchor="middle"
          animate={{opacity:[0,0.9,0],y:[z.y,z.y-14,z.y-28]}}
          transition={{delay:z.d,duration:2.8,repeat:Infinity,ease:'easeOut'}}>z</motion.text>
      ))}
    </>
  )
}

function GenCelebStars({ s }: { s: S }) {
  const stars = [{x:CX-s.rx-5,y:CY-s.ry*0.75},{x:CX+s.rx+8,y:CY-s.ry*0.95},{x:CX,y:CY-s.ry-12}]
  return (
    <>
      {stars.map((st,i)=>(
        <motion.text key={i} x={st.x} y={st.y} fontSize={11} textAnchor="middle"
          animate={{scale:[0,1.3,1,0],rotate:[0,15,-10,0]}}
          transition={{delay:i*0.18,duration:1.6,repeat:Infinity,ease:'backOut'}}
          style={{transformOrigin:`${st.x}px ${st.y}px`}}>✨</motion.text>
      ))}
    </>
  )
}

/* =============================================================
   BLOOM — PNG asset system
   Base (por etapa) + Expresión (overlay) + Poses especiales
   =========================================================== */

const bloomBase      = (si: number) => `/assets/Flowlings/bloom/Base/Etapa_${si + 1}.png`
const bloomPoseCeleb = (si: number) => `/assets/Flowlings/bloom/Poses/Celebrando/Etapa_${si + 1}.png`
const bloomPoseSleep = (si: number) => `/assets/Flowlings/bloom/Poses/Durmiendo/Etapa_${si + 1}.png`

const BLOOM_FACE: Record<string, string> = {
  happy:        '/assets/Flowlings/bloom/Expresiones/Feliz.png',
  encouraging:  '/assets/Flowlings/bloom/Expresiones/Alentador.png',
  tired:        '/assets/Flowlings/bloom/Expresiones/Cansado.png',
  concentrated: '/assets/Flowlings/bloom/Expresiones/Sorprendido.png',
}
const BLOOM_FACE_DEFAULT = '/assets/Flowlings/bloom/Expresiones/Feliz.png'

// Ajuste fino del overlay de expresión por etapa (si=0…4)
// translateY(+%) = bajar  |  translateY(-%) = subir  |  scale(X) = agrandar  |  translateX(-%) = izquierda
const BLOOM_FACE_ADJUST: string[] = [
  'translateY(15%)',                      // E1 Semilla: bajar + centrar
  'translateY(8%)',                       // E2 Brote: subir un poco
  'translateX(-2%) translateY(-5%)',     // E3 Explorador: subir un poco
  'translateY(-3%)',                     // E4 Maestro: subir un poco
  'scale(0.85) translateX(-8%) translateY(-7%)', // E5 Guardián: subir y derecha
]

// Ajuste específico para Cansado (tired)
const BLOOM_CANSADO_ADJUST: string[] = [
  'translateY(10%)',                              // E1: subir un poco
  'translateY(4%)',                               // E2: subir un poquito
  'translateX(-5%) translateY(-5%)',              // E3: izquierda un poquito
  'translateY(-7%)',                              // E4: subir un poquito
  'scale(0.85) translateX(-8%) translateY(-7%)', // E5: igual que Feliz
]

// Ajuste específico para Alentador (encouraging) — escalar un poco más grande
const BLOOM_ALENTADOR_ADJUST: string[] = [
  'scale(1.12) translateY(10%)',                 // E1: subir un poco
  'scale(1.12) translateY(4%)',                  // E2: subir un poco
  'scale(1.12) translateX(-5%) translateY(-5%)', // E3: izquierda un poco
  'scale(1.12) translateY(-7%)',                 // E4: subir un poco
  'scale(0.95) translateX(-8%) translateY(-7%)', // E5: sin cambio
]

// Ajuste específico para Sorprendido (concentrated) — hereda los anteriores salvo E3/E4/E5
const BLOOM_SORPRENDIDO_ADJUST: string[] = [
  'translateY(15%)',                              // E1: igual
  'translateY(8%)',                               // E2: igual
  'translateX(-5%) translateY(-2%)',              // E3: subir un poquito
  'translateY(-2%)',                              // E4: bajar un poquito
  'scale(0.85) translateX(-9%) translateY(0%)',  // E5: izquierda suave
]

// Ajuste del cuerpo base por etapa (scale para cuando el personaje queda pequeño en el canvas)
const BLOOM_BASE_ADJUST: string[] = [
  'none',        // E1
  'none',        // E2
  'none',        // E3
  'none',        // E4
  'scale(1.22)', // E5 Guardián: base más pequeña en canvas → agrandar
]

/* =============================================================
   KIRO — PNG asset system
   =========================================================== */

const kiroBase      = (si: number) => `/assets/Flowlings/kiro/Base/Etapa_${si + 1}.png`
const kiroPoseCeleb = (si: number) => `/assets/Flowlings/kiro/Poses/Celebrando/Etapa_${si + 1}.png`
const kiroPoseSleep = (si: number) => `/assets/Flowlings/kiro/Poses/Durmiendo/Etapa_${si + 1}.png`

const KIRO_FACE: Record<string, string> = {
  happy:        '/assets/Flowlings/kiro/Expresiones/Feliz.png',
  encouraging:  '/assets/Flowlings/kiro/Expresiones/Alentador.png',
  tired:        '/assets/Flowlings/kiro/Expresiones/Cansado.png',
  concentrated: '/assets/Flowlings/kiro/Expresiones/Sorprendido.png',
}
const KIRO_FACE_DEFAULT = '/assets/Flowlings/kiro/Expresiones/Feliz.png'

const KIRO_FACE_ADJUST: string[] = [
  'scale(0.54) translateY(-10%)',                   // E1
  'scale(0.55) translateY(-14%)',                   // E2: subir más
  'scale(0.52) translateY(-16%) translateX(3%)',    // E3: leve izquierda
  'scale(0.48) translateY(-20%) translateX(8%)',    // E4: subir
  'scale(0.50) translateY(-25%) translateX(3%)',    // E5: subir + leve derecha
]

const KIRO_CANSADO_ADJUST: string[]   = [
  'scale(0.60) translateY(-10%) translateX(2%)',   // E1: tris derecha
  'scale(0.63) translateY(-18%) translateX(4%)',   // E2: derecha
  'scale(0.63) translateY(-17%) translateX(5%)',   // E3: derecha
  'scale(0.62) translateY(-21%) translateX(5%)',   // E4: subir
  'scale(0.66) translateY(-23%) translateX(2%)',   // E5: izquierda
]
const KIRO_ALENTADOR_ADJUST: string[] = [
  'scale(0.62) translateY(-10%) translateX(4%)',  // E1: derecha
  'scale(0.60) translateY(-19%) translateX(4%)',  // E2: subir más
  'scale(0.72) translateY(-11%) translateX(7%)',  // E3: bajar + derecha
  'scale(0.72) translateY(-17%) translateX(7%)',  // E4: subir tris + derecha
  'scale(0.70) translateY(-23%) translateX(4%)',  // E5: subir más
]
const KIRO_SORPRENDIDO_ADJUST: string[] = [
  'scale(0.54) translateY(-12%)',  // E1: reducir
  'scale(0.57) translateY(-16%)',  // E2: reducir
  'scale(0.57) translateY(-14%) translateX(3%)',   // E3: derecha
  'scale(0.56) translateY(-21%)',                  // E4: subir más
  'scale(0.52) translateY(-24%)',                  // E5: subir más
]

const KIRO_BASE_ADJUST: string[] = [
  'scale(0.72)', // E1: más pequeña para dar sensación de progresión
  'scale(0.82)', // E2: un poco más grande que E1
  'scale(0.90)', // E3: más grande
  'scale(0.96)', // E4: casi tamaño natural
  'none',        // E5: tamaño natural del canvas
]

/* =============================================================
   MOMO — PNG asset system
   =========================================================== */

const momoBase      = (si: number) => `/assets/Flowlings/Momo/Base/Etapa_${si + 1}.png`
const momoPoseCeleb = (si: number) => `/assets/Flowlings/Momo/Poses/Celebrando/Etapa_${si + 1}.png`
const momoPoseSleep = (si: number) => `/assets/Flowlings/Momo/Poses/Durmiendo/Etapa_${si + 1}.png`

const MOMO_FACE: Record<string, string> = {
  happy:        '/assets/Flowlings/Momo/Expresiones/Feliz.png',
  encouraging:  '/assets/Flowlings/Momo/Expresiones/Alentador.png',
  tired:        '/assets/Flowlings/Momo/Expresiones/Cansado.png',
  concentrated: '/assets/Flowlings/Momo/Expresiones/Sorprendido.png',
}
const MOMO_FACE_DEFAULT = '/assets/Flowlings/Momo/Expresiones/Feliz.png'

const MOMO_FACE_ADJUST: string[] = [
  'scale(0.60) translateY(-27%)',                                        // E1: recto
  'scale(0.70) translateY(-29%) translateX(2%) rotate(6deg)',            // E2: derecha
  'scale(0.65) translateY(-37%) translateX(2%)',                         // E3
  'scale(0.63) translateY(-34%) translateX(-2%)',                        // E4
  'scale(0.63) translateY(-25%) translateX(-4%)',                        // E5
]

const MOMO_CANSADO_ADJUST: string[] = [
  'scale(0.60) translateY(-30%) translateX(3%)',   // E1: derecha
  'scale(0.65) translateY(-34%)',                  // E2: bajar
  'scale(0.63) translateY(-36%)',                  // E3
  'scale(0.61) translateY(-37%)',                  // E4: bajar
  'scale(0.61) translateY(-29%)',                  // E5: bajar
]

const MOMO_ALENTADOR_ADJUST: string[] = [
  'scale(0.55) translateY(-30%)',                       // E1: reducir
  'scale(0.60) translateY(-34%) rotate(6deg)',          // E2: inclinar derecha
  'scale(0.63) translateY(-39%) translateX(-3%) rotate(4deg)', // E3: izquierda
  'scale(0.61) translateY(-37%) translateX(-3%) rotate(4deg)', // E4: bajar + inclinar
  'scale(0.56) translateY(-26%) translateX(-7%) rotate(4deg)', // E5: izquierda + inclinar derecha
]

const MOMO_SORPRENDIDO_ADJUST: string[] = [
  'scale(0.50) translateY(-30%)',  // E1: reducir
  'scale(0.50) translateY(-46%)',  // E2: subir
  'scale(0.52) translateY(-42%)',  // E3
  'scale(0.50) translateY(-43%)',  // E4
  'scale(0.50) translateY(-32%) translateX(-3%) rotate(4deg)',  // E5: inclinar derecha
]

const MOMO_BASE_ADJUST: string[] = [
  'scale(0.65)', // E1
  'scale(0.70)', // E2
  'scale(0.72)', // E3
  'scale(0.95)', // E4
  'scale(0.85)', // E5
]

/* =============================================================
   LUMI — PNG asset system
   =========================================================== */

const lumiBase      = (si: number) => `/assets/Flowlings/Lumi/Base/Etapa_${si + 1}.png`
const lumiPoseCeleb = (si: number) => `/assets/Flowlings/Lumi/Poses/Celebrando/Etapa_${si + 1}.png`
const lumiPoseSleep = (si: number) => `/assets/Flowlings/Lumi/Poses/Durmiendo/Etapa_${si + 1}.png`

const LUMI_FACE: Record<string, string> = {
  happy:        '/assets/Flowlings/Lumi/Expresiones/Feliz.png',
  encouraging:  '/assets/Flowlings/Lumi/Expresiones/Alentador.png',
  tired:        '/assets/Flowlings/Lumi/Expresiones/Cansado.png',
  concentrated: '/assets/Flowlings/Lumi/Expresiones/Sorprendido.png',
}
const LUMI_FACE_DEFAULT = '/assets/Flowlings/Lumi/Expresiones/Feliz.png'

const LUMI_FACE_ADJUST: string[] = [
  'scale(0.60) translateY(-18%)',                      // E1
  'scale(0.60) translateY(-22%)',                      // E2
  'scale(0.57) translateY(-11%) rotate(-6deg)',        // E3: bajar 2 puntos
  'scale(0.65) translateY(-18%) translateX(-5%) rotate(-6deg)',  // E4: izquierda 1 punto
  'scale(0.65) translateY(-17%) translateX(-5%) rotate(-6deg)', // E5: bajar 1 punto
]

const LUMI_CANSADO_ADJUST: string[] = [
  'scale(0.60) translateY(-17%)',  // E1: +1 tamaño, bajar 2.5
  'scale(0.60) translateY(-21%)',  // E2: +1 tamaño, bajar 2.5
  'scale(0.57) translateY(-12%) rotate(-6deg)',                   // E3: inclinar izquierda
  'scale(0.60) translateY(-17%) translateX(-3%) rotate(-6deg)',   // E4: +1 tamaño, subir medio, izq medio
  'scale(0.55) translateY(-14%) translateX(-5%) rotate(-6deg)',   // E5: inclinar + subir + izquierda
]

const LUMI_ALENTADOR_ADJUST: string[] = [
  'scale(0.60) translateY(-17%)',             // E1: bajar medio punto
  'scale(0.60) translateY(-21%)',             // E2: bajar medio punto
  'scale(0.62) translateY(-12%) rotate(-6deg)',          // E3: +1 tamaño
  'scale(0.65) translateY(-20%) translateX(-3%) rotate(-3deg)', // E4: medio punto izquierda
  'scale(0.60) translateY(-19%) translateX(-7%)',        // E5: derecha medio punto más
]

const LUMI_SORPRENDIDO_ADJUST: string[] = [
  'scale(0.60) translateY(-17%)',                        // E1: +1 tamaño, bajar 2.5
  'scale(0.60) translateY(-21%)',                        // E2: +1 tamaño, bajar 2.5
  'scale(0.57) translateY(-12%) rotate(-6deg)',          // E3: +1 tamaño, bajar 5, izq
  'scale(0.60) translateY(-17%) translateX(-3%) rotate(-6deg)', // E4: +1 tamaño, subir medio, izq medio
  'scale(0.55) translateY(-14%) translateX(-5%) rotate(-6deg)', // E5: +1 tamaño, bajar 6, izq, izq
]

const LUMI_BASE_ADJUST: string[] = [
  'scale(0.65)', // E1
  'scale(0.72)', // E2
  'scale(0.80)', // E3
  'scale(0.90)', // E4
  'scale(0.95)', // E5
]

/* =============================================================
   OCTI — PNG asset system
   =========================================================== */

const octiBase      = (si: number) => `/assets/Flowlings/Octi/Base/Etapa_${si + 1}.png`
const octiPoseCeleb = (si: number) => `/assets/Flowlings/Octi/Poses/Celebrando/Etapa_${si + 1}.png`
const octiPoseSleep = (si: number) => `/assets/Flowlings/Octi/Poses/Durmiendo/Etapa_${si + 1}.png`

const OCTI_FACE: Record<string, string> = {
  happy:        '/assets/Flowlings/Octi/Expresiones/Feliz.png',
  encouraging:  '/assets/Flowlings/Octi/Expresiones/Alentador.png',
  tired:        '/assets/Flowlings/Octi/Expresiones/Cansado.png',
  concentrated: '/assets/Flowlings/Octi/Expresiones/Sorprendido.png',
}
const OCTI_FACE_DEFAULT = '/assets/Flowlings/Octi/Expresiones/Feliz.png'

const OCTI_FACE_ADJUST: string[] = [
  'scale(0.525) translateY(-18%)',
  'scale(0.55) translateY(-17%)',
  'scale(0.60) translateY(-14%)',
  'scale(0.65) translateY(-11%) translateX(3%)',
  'scale(0.65) translateY(-10%) translateX(-3%)',
]

const OCTI_CANSADO_ADJUST: string[] = [
  'scale(0.525) translateY(-17%)',
  'scale(0.55) translateY(-16%)',
  'scale(0.60) translateY(-13%)',
  'scale(0.65) translateY(-10%) translateX(3%)',
  'scale(0.65) translateY(-9%) translateX(-3%)',
]

const OCTI_ALENTADOR_ADJUST: string[] = [
  'scale(0.525) translateY(-17%)',
  'scale(0.55) translateY(-16%)',
  'scale(0.60) translateY(-13%)',
  'scale(0.65) translateY(-10%) translateX(3%)',
  'scale(0.65) translateY(-9%) translateX(-3%)',
]

const OCTI_SORPRENDIDO_ADJUST: string[] = [
  'scale(0.525) translateY(-17%)',
  'scale(0.55) translateY(-16%)',
  'scale(0.60) translateY(-13%)',
  'scale(0.65) translateY(-10%) translateX(3%)',
  'scale(0.65) translateY(-9%) translateX(-3%)',
]

const OCTI_BASE_ADJUST: string[] = [
  'scale(0.65)', // E1
  'scale(0.72)', // E2
  'scale(0.80)', // E3
  'scale(0.90)', // E4
  'scale(0.95)', // E5
]

/* =============================================================
   MAIN Flowling COMPONENT
   =========================================================== */

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
  const sp      = SPECIES[(species as SpeciesId)] ?? SPECIES.bloom
  const isBloom = species === 'bloom'
  const isKiro  = species === 'kiro'
  const isMomo  = species === 'momo'
  const isLumi  = species === 'lumi'
  const isOcti  = species === 'octi'
  const isPngSpecies = isBloom || isKiro || isMomo || isLumi || isOcti

  /* Generic species state (only used when !isPngSpecies) */
  const s = isPngSpecies ? resolveS(si, 'nova') : resolveS(si, species)  // fallback never shown

  const hasLeaves   = topAreaIndexes.includes(0)
  const hasGold     = topAreaIndexes.includes(3)
  const hasBackpack = topAreaIndexes.includes(4)
  const hasFire     = streak >= 7
  const isGuardian  = si === 4

  const bodyAnim =
    emotion === 'sleeping'     ? { y:[0,3,0], scale:[1,1.025,1] } :
    emotion === 'celebrating'  ? { y:[0,-11,0,-6,0]              } :
    emotion === 'encouraging'  ? { rotate:[-2,2,-2]               } :
    emotion === 'concentrated' ? { y:[0,-1.5,0]                   } :
    emotion === 'tired'        ? { y:[0,2,0]                      } :
                                 { y:[0,-5,0]                     }

  const bodyDur =
    emotion === 'sleeping'     ? 4   :
    emotion === 'celebrating'  ? 0.9 :
    emotion === 'encouraging'  ? 2   :
    emotion === 'concentrated' ? 4.5 :
    emotion === 'tired'        ? 5.5 : 3.2

  const h = SIZE_H[size]
  const w = isPngSpecies
    ? h
    : Math.round(h * (120/150))

  const xpInLevel   = totalXp - lvl.minXp
  const xpNeeded    = nextLvl ? nextLvl.minXp - lvl.minXp : 1
  const progressPct = nextLvl ? Math.min(100, (xpInLevel / xpNeeded) * 100) : 100

  return (
    <div style={{ display:'inline-flex', flexDirection:'column', alignItems:'center', gap:'0.5rem' }}>
      <motion.div
        animate={bodyAnim}
        transition={{ repeat:Infinity, duration:bodyDur, ease:'easeInOut', repeatType:'reverse' }}
      >
        {isBloom ? (
          /* ══ BLOOM: PNG por etapa + expresión overlay ══ */
          <div style={{ position: 'relative', width: w, height: h, overflow: 'hidden' }}>

            {emotion === 'celebrating' ? (
              /* Pose celebración — imagen completa por etapa */
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={bloomPoseCeleb(si)}
                alt="Bloom celebrando"
                draggable={false}
                style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom', display: 'block', userSelect: 'none', transform: BLOOM_BASE_ADJUST[si] ?? 'none', transformOrigin: 'center 30%' }}
              />
            ) : emotion === 'sleeping' ? (
              /* Pose durmiendo — imagen completa por etapa */
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={bloomPoseSleep(si)}
                alt="Bloom durmiendo"
                draggable={false}
                style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom', display: 'block', userSelect: 'none', transform: BLOOM_BASE_ADJUST[si] ?? 'none', transformOrigin: 'center 30%' }}
              />
            ) : (
              /* Emociones estándar: cuerpo base + expresión overlay */
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={bloomBase(si)}
                  alt="Bloom"
                  draggable={false}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom', display: 'block', userSelect: 'none', transform: BLOOM_BASE_ADJUST[si] ?? 'none', transformOrigin: 'center 30%' }}
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={BLOOM_FACE[emotion] ?? BLOOM_FACE_DEFAULT}
                  alt=""
                  draggable={false}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom', pointerEvents: 'none', userSelect: 'none', transform: (
  emotion === 'concentrated' ? BLOOM_SORPRENDIDO_ADJUST[si] :
  emotion === 'tired'        ? BLOOM_CANSADO_ADJUST[si] :
  emotion === 'encouraging'  ? BLOOM_ALENTADOR_ADJUST[si] :
  BLOOM_FACE_ADJUST[si]
) ?? 'none', transformOrigin: 'center center' }}
                />
              </>
            )}

            {/* Glow sutil en etapas avanzadas */}
            {si >= 2 && (
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: `radial-gradient(ellipse 60% 50% at 50% 60%, ${
                  si === 2 ? 'rgba(74,222,128,0.12)' :
                  si === 3 ? 'rgba(74,222,128,0.20)' :
                             'rgba(134,239,172,0.28)'
                } 0%, transparent 70%)`,
              }} />
            )}
          </div>

        ) : isKiro ? (
          /* ══ KIRO: PNG por etapa + expresión overlay ══ */
          <div style={{ position: 'relative', width: w, height: h, overflow: 'hidden' }}>

            {emotion === 'celebrating' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={kiroPoseCeleb(si)} alt="Kiro celebrando" draggable={false}
                style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom', display: 'block', userSelect: 'none', transform: KIRO_BASE_ADJUST[si] ?? 'none', transformOrigin: 'center 30%' }} />
            ) : emotion === 'sleeping' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={kiroPoseSleep(si)} alt="Kiro durmiendo" draggable={false}
                style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom', display: 'block', userSelect: 'none', transform: KIRO_BASE_ADJUST[si] ?? 'none', transformOrigin: 'center 30%' }} />
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={kiroBase(si)} alt="Kiro" draggable={false}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom', display: 'block', userSelect: 'none', transform: KIRO_BASE_ADJUST[si] ?? 'none', transformOrigin: 'center 30%' }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={KIRO_FACE[emotion] ?? KIRO_FACE_DEFAULT} alt="" draggable={false}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom', pointerEvents: 'none', userSelect: 'none', transform: (
                    emotion === 'concentrated' ? KIRO_SORPRENDIDO_ADJUST[si] :
                    emotion === 'tired'        ? KIRO_CANSADO_ADJUST[si] :
                    emotion === 'encouraging'  ? KIRO_ALENTADOR_ADJUST[si] :
                    KIRO_FACE_ADJUST[si]
                  ) ?? 'none', transformOrigin: 'center center' }} />
              </>
            )}

            {si >= 2 && (
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: `radial-gradient(ellipse 60% 50% at 50% 60%, ${
                  si === 2 ? 'rgba(99,179,237,0.12)' :
                  si === 3 ? 'rgba(99,179,237,0.20)' :
                             'rgba(147,210,255,0.28)'
                } 0%, transparent 70%)`,
              }} />
            )}
          </div>

        ) : isMomo ? (
          /* ══ MOMO: PNG por etapa + expresión overlay ══ */
          <div style={{ position: 'relative', width: w, height: h, overflow: 'hidden' }}>

            {emotion === 'celebrating' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={momoPoseCeleb(si)} alt="Momo celebrando" draggable={false}
                style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom', display: 'block', userSelect: 'none', transform: MOMO_BASE_ADJUST[si] ?? 'none', transformOrigin: 'center 30%' }} />
            ) : emotion === 'sleeping' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={momoPoseSleep(si)} alt="Momo durmiendo" draggable={false}
                style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom', display: 'block', userSelect: 'none', transform: MOMO_BASE_ADJUST[si] ?? 'none', transformOrigin: 'center 30%' }} />
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={momoBase(si)} alt="Momo" draggable={false}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom', display: 'block', userSelect: 'none', transform: MOMO_BASE_ADJUST[si] ?? 'none', transformOrigin: 'center 30%' }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={MOMO_FACE[emotion] ?? MOMO_FACE_DEFAULT} alt="" draggable={false}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom', pointerEvents: 'none', userSelect: 'none', transform: (
                    emotion === 'concentrated' ? MOMO_SORPRENDIDO_ADJUST[si] :
                    emotion === 'tired'        ? MOMO_CANSADO_ADJUST[si] :
                    emotion === 'encouraging'  ? MOMO_ALENTADOR_ADJUST[si] :
                    MOMO_FACE_ADJUST[si]
                  ) ?? 'none', transformOrigin: 'center center' }} />
              </>
            )}

            {si >= 2 && (
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: `radial-gradient(ellipse 60% 50% at 50% 60%, ${
                  si === 2 ? 'rgba(251,191,36,0.12)' :
                  si === 3 ? 'rgba(251,191,36,0.20)' :
                             'rgba(252,211,77,0.28)'
                } 0%, transparent 70%)`,
              }} />
            )}
          </div>

        ) : isLumi ? (
          /* ══ LUMI: PNG por etapa + expresión overlay ══ */
          <div style={{ position: 'relative', width: w, height: h, overflow: 'hidden' }}>

            {emotion === 'celebrating' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={lumiPoseCeleb(si)} alt="Lumi celebrando" draggable={false}
                style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom', display: 'block', userSelect: 'none', transform: LUMI_BASE_ADJUST[si] ?? 'none', transformOrigin: 'center 30%' }} />
            ) : emotion === 'sleeping' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={lumiPoseSleep(si)} alt="Lumi durmiendo" draggable={false}
                style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom', display: 'block', userSelect: 'none', transform: LUMI_BASE_ADJUST[si] ?? 'none', transformOrigin: 'center 30%' }} />
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={lumiBase(si)} alt="Lumi" draggable={false}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom', display: 'block', userSelect: 'none', transform: LUMI_BASE_ADJUST[si] ?? 'none', transformOrigin: 'center 30%' }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={LUMI_FACE[emotion] ?? LUMI_FACE_DEFAULT} alt="" draggable={false}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom', pointerEvents: 'none', userSelect: 'none', transform: (
                    emotion === 'concentrated' ? LUMI_SORPRENDIDO_ADJUST[si] :
                    emotion === 'tired'        ? LUMI_CANSADO_ADJUST[si] :
                    emotion === 'encouraging'  ? LUMI_ALENTADOR_ADJUST[si] :
                    LUMI_FACE_ADJUST[si]
                  ) ?? 'none', transformOrigin: 'center center' }} />
              </>
            )}

            {si >= 2 && (
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: `radial-gradient(ellipse 60% 50% at 50% 60%, ${
                  si === 2 ? 'rgba(167,139,250,0.12)' :
                  si === 3 ? 'rgba(167,139,250,0.20)' :
                             'rgba(196,181,253,0.28)'
                } 0%, transparent 70%)`,
              }} />
            )}
          </div>

        ) : isOcti ? (
          /* ══ OCTI: PNG por etapa + expresión overlay ══ */
          <div style={{ position: 'relative', width: w, height: h, overflow: 'hidden' }}>

            {emotion === 'celebrating' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={octiPoseCeleb(si)} alt="Octi celebrando" draggable={false}
                style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom', display: 'block', userSelect: 'none', transform: OCTI_BASE_ADJUST[si] ?? 'none', transformOrigin: 'center 30%' }} />
            ) : emotion === 'sleeping' ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={octiPoseSleep(si)} alt="Octi durmiendo" draggable={false}
                style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom', display: 'block', userSelect: 'none', transform: OCTI_BASE_ADJUST[si] ?? 'none', transformOrigin: 'center 30%' }} />
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={octiBase(si)} alt="Octi" draggable={false}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom', display: 'block', userSelect: 'none', transform: OCTI_BASE_ADJUST[si] ?? 'none', transformOrigin: 'center 30%' }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={OCTI_FACE[emotion] ?? OCTI_FACE_DEFAULT} alt="" draggable={false}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom', pointerEvents: 'none', userSelect: 'none', transform: (
                    emotion === 'concentrated' ? OCTI_SORPRENDIDO_ADJUST[si] :
                    emotion === 'tired'        ? OCTI_CANSADO_ADJUST[si] :
                    emotion === 'encouraging'  ? OCTI_ALENTADOR_ADJUST[si] :
                    OCTI_FACE_ADJUST[si]
                  ) ?? 'none', transformOrigin: 'center center' }} />
              </>
            )}

            {si >= 2 && (
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: `radial-gradient(ellipse 60% 50% at 50% 60%, ${
                  si === 2 ? 'rgba(139,92,246,0.12)' :
                  si === 3 ? 'rgba(124,58,237,0.20)' :
                             'rgba(109,40,217,0.28)'
                } 0%, transparent 70%)`,
              }} />
            )}
          </div>

        ) : (
          /* ══ GENERIC SPECIES: 120×150 SVG ══ */
          <svg viewBox="0 0 120 150" width={w} height={h} xmlns="http://www.w3.org/2000/svg">
            <GenDefs s={s} si={si} species={species} isGuardian={isGuardian} />
            {hasFire && <GenFireAura s={s} />}
            {hasBackpack && si >= 2 && <GenBackpack s={s} />}
            <GenBody s={s} si={si} species={species} isGuardian={isGuardian} />
            <SpeciesFeature feature={sp.feature} s={s} />
            {hasLeaves && si >= 1 && <GenLeafSprouts s={s} si={si} />}
            {si >= 2 && <GenArms s={s} emotion={emotion} />}
            <GenBlush s={s} si={si} species={species} />
            <GenEyes  s={s} emotion={emotion} speciesId={species} />
            <GenMouth s={s} emotion={emotion} />
            {hasBackpack && si >= 2 && <GenGlasses s={s} />}
            {hasGold && si >= 1 && <GenGoldCoins s={s} />}
            {emotion === 'sleeping'    && <GenSleepZzz s={s} />}
            {emotion === 'celebrating' && <GenCelebStars s={s} />}
          </svg>
        )}
      </motion.div>

      {showInfo && (
        <div style={{ textAlign:'center', width:'100%', maxWidth:`${w}px` }}>
          <p style={{ fontSize:'0.875rem', fontWeight:800, color:'var(--text-primary)', marginBottom:'1px', letterSpacing:'-0.01em' }}>
            {sp.name} · {lvl.label}
          </p>
          <p style={{ fontSize:'0.6875rem', color:'var(--text-tertiary)', fontWeight:500, marginBottom:'6px' }}>
            {totalXp} XP{nextLvl ? ` · ${nextLvl.minXp - totalXp} para ${nextLvl.label}` : ' · Nivel máximo ✨'}
          </p>
          {nextLvl && (
            <div style={{ height:'4px', borderRadius:'99px', background:'var(--surface-secondary)', overflow:'hidden' }}>
              <motion.div
                initial={{ width:0 }}
                animate={{ width:`${progressPct}%` }}
                transition={{ duration:1.2, ease:[0.16,1,0.3,1] }}
                style={{ height:'100%', borderRadius:'99px', background: isBloom ? '#4ADE80' : s.c2 }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
