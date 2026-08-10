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
   BLOOM — 400×450 viewBox
   Coordenadas derivadas del SVG estructurado provisto.
   =========================================================== */

const BCX = 250   // center x in Bloom's 500×500 space
const BCY = 320   // center y in Bloom's 500×500 space

// Body sizes per stage (rx, ry) in 500×500 units — used for face overlay coords
const BLOOM_BODY_SIZES = [
  { rx:144, ry:144 },  // stage 0
  { rx:160, ry:160 },  // stage 1
  { rx:179, ry:178 },  // stage 2
  { rx:200, ry:200 },  // stage 3
  { rx:225, ry:227 },  // stage 4
]

// CSS scale applied to PNG per stage (derived from rx ratio vs stage 0)
const BLOOM_PNG_SCALE = [1, 1.11, 1.24, 1.39, 1.57]

// Parameterized face values derived from stage 0 proportions
function bloomFace(si: number) {
  const { rx, ry } = BLOOM_BODY_SIZES[si]
  return {
    eyeOff: rx  * 0.348,    // stage0: 50
    eyeY:  -ry  * 0.192,    // stage0: -28 → cy=250
    eyeRx:  rx  * 0.104,    // stage0: 15
    eyeRy:  ry  * 0.123,    // stage0: 18
    mHW:    rx  * 0.104,    // mouth half-width, stage0: 15
    mY:    -ry  * 0.062,    // mouth y offset from BCY, stage0: -9
    mDip:   ry  * 0.093,    // smile dip depth, stage0: 13
    bOff:   rx  * 0.478,    // blush x offset, stage0: 69
    bY:    -ry  * 0.038,    // blush y offset, stage0: -5
    bRx:    14  * rx/144,   // blush rx
    bRy:    8   * ry/144,   // blush ry
  }
}

// Organic body path using exact bezier ratios from the provided SVG
function bloomBodyPath(rx: number, ry: number): string {
  const cx = BCX; const cy = BCY
  const p  = (dx: number, dy: number) => `${Math.round(cx+dx)} ${Math.round(cy+dy)}`
  return [
    `M ${p(0, -ry)}`,
    `C ${p(rx*0.739,-ry)}, ${p(rx,-ry*0.462)}, ${p(rx*0.957,ry*0.154)}`,
    `C ${p(rx*0.913,ry*0.692)}, ${p(rx*0.522,ry)}, ${p(0,ry)}`,
    `C ${p(-rx*0.522,ry)}, ${p(-rx*0.913,ry*0.692)}, ${p(-rx*0.957,ry*0.154)}`,
    `C ${p(-rx,-ry*0.462)}, ${p(-rx*0.739,-ry)}, ${p(0,-ry)} Z`,
  ].join(' ')
}

/* ── Bloom: Defs (400×450) ────────────────────────────────── */
function BloomDefs400({ si }: { si: number }) {
  return (
    <defs>
      {/* Body gradient (matches user's design) */}
      <radialGradient id="bloomBodyGrad" cx="35%" cy="30%" r="70%">
        <stop offset="0%"   stopColor="#86EFAC" />
        <stop offset="55%"  stopColor="#4ADE80" />
        <stop offset="100%" stopColor="#16A34A" />
      </radialGradient>

      {/* Leaf / crown gradient */}
      <linearGradient id="bloomLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stopColor="#BBF7D0" />
        <stop offset="100%" stopColor="#22C55E" />
      </linearGradient>

      {/* Ground shadow */}
      <radialGradient id="bloomDropShadow" cx="50%" cy="50%" r="50%">
        <stop offset="0%"   stopColor="#166534" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#166534" stopOpacity="0"    />
      </radialGradient>

      {/* Bottom-volume shadow overlay */}
      <radialGradient id="bloomBodyShadow" cx="50%" cy="90%" r="55%">
        <stop offset="0%"   stopColor="#14532D" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#14532D" stopOpacity="0"   />
      </radialGradient>

      {/* Soft drop shadow for whole character */}
      <filter id="bloomSoftShadow" x="-15%" y="-10%" width="130%" height="130%">
        <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#14532D" floodOpacity="0.18" />
      </filter>

      {/* Blush blur */}
      <filter id="bloomBlushBlur" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="5" />
      </filter>

      {/* Ancient tree glow (stage 4) */}
      <filter id="bloomGlow" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
  )
}

/* ── Bloom: Ground shadow ─────────────────────────────────── */
function BloomGroundShadow({ si }: { si: number }) {
  const { rx } = BLOOM_BODY_SIZES[si]
  return <ellipse cx={BCX} cy={461} rx={rx*0.65} ry={14} fill="url(#bloomDropShadow)" />
}

/* ── Bloom: Feet ──────────────────────────────────────────── */
function BloomFeet400({ si }: { si: number }) {
  const { rx, ry } = BLOOM_BODY_SIZES[si]
  if (si === 4) return null  // ancient tree: no visible feet
  const sc     = rx / 115   // scale from stage-0 reference
  const bottom = BCY + ry
  const startY = bottom - 10*sc
  const endY   = bottom + 18*sc
  const lx     = BCX - 40*sc
  const rx2    = BCX + 40*sc
  const fw     = 20*sc

  return (
    <g id="body-legs" stroke="#15803D" strokeWidth={3*sc} strokeLinecap="round" strokeLinejoin="round">
      {/* Left foot */}
      <path d={`M ${lx} ${startY} C ${lx-10*sc} ${startY+5*sc}, ${lx-15*sc} ${endY-3*sc}, ${lx+5*sc} ${endY} C ${lx+fw} ${endY+2*sc}, ${lx+fw} ${startY+10*sc}, ${lx+15*sc} ${startY} Z`}
        fill="#22C55E" />
      {/* Right foot */}
      <path d={`M ${rx2} ${startY} C ${rx2+10*sc} ${startY+5*sc}, ${rx2+15*sc} ${endY-3*sc}, ${rx2-5*sc} ${endY} C ${rx2-fw} ${endY+2*sc}, ${rx2-fw} ${startY+10*sc}, ${rx2-15*sc} ${startY} Z`}
        fill="#22C55E" />
    </g>
  )
}

/* ── Bloom: Body ──────────────────────────────────────────── */
function BloomBody400({ si }: { si: number }) {
  const { rx, ry } = BLOOM_BODY_SIZES[si]
  const bp = bloomBodyPath(rx, ry)
  return (
    <g id="body-main" filter="url(#bloomSoftShadow)">
      <path d={bp} fill="url(#bloomBodyGrad)" stroke="#15803D" strokeWidth={4.5} strokeLinejoin="round" />
      {/* Volume shadow at bottom */}
      <path d={bp} fill="url(#bloomBodyShadow)" />
      {/* Main highlight top-left */}
      <ellipse cx={BCX-rx*0.2} cy={BCY-ry*0.32} rx={rx*0.38} ry={ry*0.22} fill="white" opacity={0.32} />
      {/* Sharp specular highlight */}
      <ellipse cx={BCX-rx*0.35} cy={BCY-ry*0.46} rx={rx*0.12} ry={ry*0.08} fill="white" opacity={0.55} />
    </g>
  )
}

/* ── Bloom: Arms ──────────────────────────────────────────── */
function BloomArms400({ si, emotion }: { si: number; emotion: FlowlingEmotion }) {
  const { rx, ry } = BLOOM_BODY_SIZES[si]
  const sc  = rx / 115
  const bx  = BCX - rx  // left body edge
  const rx2 = BCX + rx  // right body edge
  const ay  = BCY + 10*sc

  if (emotion === 'celebrating') {
    return (
      <g id="body-arms" stroke="#15803D" strokeWidth={3.5*sc} strokeLinecap="round" fill="#4ADE80">
        <path d={`M ${BCX-rx*0.91} ${BCY-ry*0.1} C ${BCX-rx*1.1} ${BCY-ry*0.4}, ${BCX-rx*1.15} ${BCY-ry*0.7}, ${BCX-rx*0.95} ${BCY-ry*0.8}`} />
        <path d={`M ${BCX+rx*0.91} ${BCY-ry*0.1} C ${BCX+rx*1.1} ${BCY-ry*0.4}, ${BCX+rx*1.15} ${BCY-ry*0.7}, ${BCX+rx*0.95} ${BCY-ry*0.8}`} />
      </g>
    )
  }
  return (
    <g id="body-arms" stroke="#15803D" strokeWidth={3.5*sc} strokeLinecap="round" fill="#4ADE80">
      {/* Left arm — from user's design, scaled */}
      <path d={`M ${BCX-82*sc} ${ay} C ${BCX-100*sc} ${ay+10*sc}, ${BCX-104*sc} ${ay+30*sc}, ${BCX-91*sc} ${ay+35*sc}`} />
      {/* Right arm */}
      <path d={`M ${BCX+82*sc} ${ay} C ${BCX+100*sc} ${ay+10*sc}, ${BCX+104*sc} ${ay+30*sc}, ${BCX+91*sc} ${ay+35*sc}`} />
    </g>
  )
}

/* ── Bloom: Crown (stage-specific, 400×450 space) ─────────── */
function BloomCrown400({ si }: { si: number }) {
  const { rx, ry } = BLOOM_BODY_SIZES[si]
  const top = BCY - ry   // body top y
  const cs  = ry / 130   // crown scale

  /* Stage 0: exact paths from the provided SVG reference */
  if (si === 0) {
    return (
      <g id="head-sprout" stroke="#15803D" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
        {/* Stem */}
        <path d={`M ${BCX} ${top+5} C ${BCX} ${top-25}, ${BCX+5} ${top-40}, ${BCX} ${top-55}`} fill="none" />
        {/* Left leaf */}
        <path d={`M ${BCX-2} ${top-50} C ${BCX-40} ${top-70}, ${BCX-60} ${top-45}, ${BCX-5} ${top-40} Z`} fill="url(#bloomLeafGrad)" />
        {/* Right leaf (slightly larger) */}
        <path d={`M ${BCX+2} ${top-52} C ${BCX+45} ${top-80}, ${BCX+70} ${top-50}, ${BCX+5} ${top-42} Z`} fill="url(#bloomLeafGrad)" />
        {/* Specular on right leaf */}
        <path d={`M ${BCX+2} ${top-52} C ${BCX+25} ${top-70}, ${BCX+40} ${top-60}, ${BCX+10} ${top-48} Z`} fill="#DCFCE7" opacity={0.4} stroke="none" />
      </g>
    )
  }

  /* Stage 1: 3 leaves */
  if (si === 1) {
    const ht = 80*cs; const lw = 65*cs
    const leaves3 = [{dx:-lw,dy:ht*0.75},{dx:0,dy:ht},{dx:lw,dy:ht*0.75}]
    return (
      <g stroke="#15803D" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
        <path d={`M ${BCX} ${top+5} C ${BCX} ${top-ht*0.45}, ${BCX+4} ${top-ht*0.75}, ${BCX} ${top-ht}`} fill="none" />
        {leaves3.map((l,i)=>(
          <path key={i}
            d={`M ${BCX} ${top-ht*0.75} C ${BCX+l.dx*0.45} ${top-ht*1.1}, ${BCX+l.dx} ${top-l.dy}, ${BCX+l.dx*0.08} ${top-ht*0.55} Z`}
            fill="url(#bloomLeafGrad)" stroke="#2D8A3B" strokeWidth={2.5} />
        ))}
      </g>
    )
  }

  /* Stage 2: 5 leaves + golden bud */
  if (si === 2) {
    const ht = 105*cs
    const leaves5 = [{dx:-72*cs,dy:78*cs},{dx:-36*cs,dy:100*cs},{dx:0,dy:ht},{dx:36*cs,dy:100*cs},{dx:72*cs,dy:78*cs}]
    return (
      <g stroke="#15803D" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
        <path d={`M ${BCX} ${top+5} C ${BCX} ${top-ht*0.45}, ${BCX+4} ${top-ht*0.8}, ${BCX} ${top-ht}`} fill="none" />
        {leaves5.map((l,i)=>(
          <path key={i}
            d={`M ${BCX} ${top-ht*0.72} C ${BCX+l.dx*0.45} ${top-ht*1.05}, ${BCX+l.dx} ${top-l.dy}, ${BCX+l.dx*0.08} ${top-ht*0.55} Z`}
            fill={i===2?'#5DC974':'url(#bloomLeafGrad)'} stroke="#2D8A3B" strokeWidth={2} />
        ))}
        <circle cx={BCX} cy={top-ht-12*cs} r={18*cs} fill="#FBBF24" stroke="#D97706" strokeWidth={2.5} />
        <circle cx={BCX} cy={top-ht-12*cs} r={9*cs}  fill="#FEF08A" opacity={0.85} />
      </g>
    )
  }

  /* Stage 3: flower headpiece with 6 petals */
  if (si === 3) {
    const ht  = 125*cs
    const pR  = 30*cs
    const fy  = top - ht - pR*1.4
    const leaves5B = [{dx:-80*cs,dy:80*cs},{dx:-40*cs,dy:105*cs},{dx:0,dy:ht},{dx:40*cs,dy:105*cs},{dx:80*cs,dy:80*cs}]
    return (
      <g stroke="#15803D" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
        <path d={`M ${BCX} ${top+5} C ${BCX} ${top-ht*0.45}, ${BCX+4} ${top-ht*0.8}, ${BCX} ${top-ht}`} fill="none" />
        {leaves5B.map((l,i)=>(
          <path key={i}
            d={`M ${BCX} ${top-ht*0.72} C ${BCX+l.dx*0.45} ${top-ht*1.05}, ${BCX+l.dx} ${top-l.dy}, ${BCX+l.dx*0.08} ${top-ht*0.55} Z`}
            fill="url(#bloomLeafGrad)" stroke="#2D8A3B" strokeWidth={2} />
        ))}
        {[0,60,120,180,240,300].map((deg,i)=>{
          const rad = deg*Math.PI/180
          const px = Math.round((BCX+Math.cos(rad)*pR*1.5)*100)/100
          const py = Math.round((fy +Math.sin(rad)*pR*1.5)*100)/100
          return (
            <ellipse key={i} cx={px} cy={py} rx={pR*0.8} ry={pR*0.48}
              fill={i%2===0?'#FFC0CB':'#FFD1DC'} stroke="#F472B6" strokeWidth={1.5}
              transform={`rotate(${deg},${px},${py})`} />
          )
        })}
        <circle cx={BCX} cy={fy} r={24*cs} fill="#FBBF24" stroke="#D97706" strokeWidth={2.5} />
        <circle cx={BCX} cy={fy} r={12*cs} fill="#FEF08A" opacity={0.85} />
      </g>
    )
  }

  /* Stage 4: ancient tree */
  const tH = 160*cs
  const bY = top - tH
  const branches: [number, number, number][] = [
    [-95*cs, -68*cs, 6], [-48*cs, -90*cs, 7], [0, -105*cs, 9], [48*cs, -90*cs, 7], [95*cs, -68*cs, 6]
  ]
  return (
    <g>
      <path d={`M ${BCX-8} ${top+5} C ${BCX-8} ${bY+25} ${BCX+5} ${bY-35} ${BCX} ${bY-55}`}
        fill="none" stroke="#7B5230" strokeWidth={14} strokeLinecap="round" />
      {branches.map(([dx,dy,w],i)=>(
        <g key={i}>
          <line x1={BCX} y1={bY-30} x2={BCX+dx} y2={top+dy} stroke="#7B5230" strokeWidth={w} strokeLinecap="round" />
          <ellipse cx={BCX+dx} cy={top+dy-25} rx={42*cs*(i===2?1.2:1)} ry={24*cs*(i===2?1.2:1)}
            fill={i===2?'#3EAF4D':'#4AB864'} stroke="#2D8A3B" strokeWidth={2} opacity={0.92}
            transform={`rotate(${(dx/cs)*0.4},${BCX+dx},${top+dy-25})`} />
        </g>
      ))}
      <motion.circle cx={BCX} cy={bY-65} r={24*cs} fill="#6BDE82"
        filter="url(#bloomGlow)"
        animate={{r:[22*cs,30*cs,22*cs],opacity:[0.65,1,0.65]}}
        transition={{duration:2.8,repeat:Infinity,ease:'easeInOut'}} />
      <motion.circle cx={BCX} cy={bY-65} r={44*cs} fill="#6BDE82" opacity={0.18}
        animate={{r:[42*cs,55*cs,42*cs],opacity:[0.12,0.28,0.12]}}
        transition={{duration:2.8,repeat:Infinity,ease:'easeInOut'}} />
    </g>
  )
}

/* ── Bloom: Face (eyes, blush, mouth) ─────────────────────── */
function BloomFace400({ si, emotion }: { si: number; emotion: FlowlingEmotion }) {
  const f   = bloomFace(si)
  const ley = BCY + f.eyeY   // eye center y
  const lx  = BCX - f.eyeOff  // left eye cx
  const rx  = BCX + f.eyeOff  // right eye cx
  const bd  = BLINK_DELAY['bloom'] ?? 0

  const blush = (
    <g id="face-blush" filter="url(#bloomBlushBlur)">
      <ellipse cx={BCX-f.bOff} cy={BCY+f.bY} rx={f.bRx} ry={f.bRy} fill="#F43F5E" opacity={0.25} />
      <ellipse cx={BCX+f.bOff} cy={BCY+f.bY} rx={f.bRx} ry={f.bRy} fill="#F43F5E" opacity={0.25} />
    </g>
  )

  const mouthY = BCY + f.mY

  /* Sleeping */
  if (emotion === 'sleeping') {
    const sw = f.eyeRy * 0.32
    return (
      <g id="face-expression">
        {blush}
        <path d={`M ${lx-f.eyeRx} ${ley} Q ${lx} ${ley+f.eyeRy*0.85} ${lx+f.eyeRx} ${ley}`} fill="none" stroke="#0F172A" strokeWidth={sw} strokeLinecap="round" />
        <path d={`M ${rx-f.eyeRx} ${ley} Q ${rx} ${ley+f.eyeRy*0.85} ${rx+f.eyeRx} ${ley}`} fill="none" stroke="#0F172A" strokeWidth={sw} strokeLinecap="round" />
        <ellipse cx={BCX} cy={mouthY+f.mDip*0.3} rx={f.mHW*0.55} ry={f.mDip*0.42} fill="#0F172A" opacity={0.25} />
      </g>
    )
  }

  /* Concentrated */
  if (emotion === 'concentrated') {
    return (
      <g id="face-expression">
        {blush}
        <path d={`M ${lx-f.eyeRx} ${ley} A ${f.eyeRx} ${f.eyeRy} 0 0,0 ${lx+f.eyeRx} ${ley} Z`} fill="#0F172A" />
        <circle cx={lx+f.eyeRx*0.25} cy={ley-f.eyeRy*0.2} r={f.eyeRx*0.38} fill="white" opacity={0.85} />
        <path d={`M ${rx-f.eyeRx} ${ley} A ${f.eyeRx} ${f.eyeRy} 0 0,0 ${rx+f.eyeRx} ${ley} Z`} fill="#0F172A" />
        <circle cx={rx+f.eyeRx*0.25} cy={ley-f.eyeRy*0.2} r={f.eyeRx*0.38} fill="white" opacity={0.85} />
        <path d={`M ${BCX-f.mHW*0.55} ${mouthY} Q ${BCX} ${mouthY+f.mDip*0.3} ${BCX+f.mHW*0.55} ${mouthY}`}
          fill="none" stroke="#0F172A" strokeWidth={f.eyeRx*0.55} strokeLinecap="round" />
      </g>
    )
  }

  /* Tired */
  if (emotion === 'tired') {
    return (
      <g id="face-expression">
        {blush}
        <path d={`M ${lx-f.eyeRx} ${ley} A ${f.eyeRx} ${f.eyeRy} 0 0,1 ${lx+f.eyeRx} ${ley} Z`} fill="#0F172A" />
        <circle cx={lx+f.eyeRx*0.22} cy={ley+f.eyeRy*0.2} r={f.eyeRx*0.3} fill="white" opacity={0.65} />
        <path d={`M ${rx-f.eyeRx} ${ley} A ${f.eyeRx} ${f.eyeRy} 0 0,1 ${rx+f.eyeRx} ${ley} Z`} fill="#0F172A" />
        <circle cx={rx+f.eyeRx*0.22} cy={ley+f.eyeRy*0.2} r={f.eyeRx*0.3} fill="white" opacity={0.65} />
        <ellipse cx={BCX} cy={mouthY+f.mDip*0.25} rx={f.mHW*0.5} ry={f.mDip*0.38} fill="#0F172A" opacity={0.28} />
      </g>
    )
  }

  /* Happy (default) + Encouraging + Celebrating */
  const big     = emotion === 'celebrating'
  const eyeScX  = big ? 1.15 : 1
  const eyeScY  = big ? 1.15 : 1
  const eRx     = f.eyeRx * eyeScX
  const eRy     = f.eyeRy * eyeScY

  return (
    <g id="face-expression">
      {blush}

      {/* Eye shadows */}
      <ellipse cx={lx} cy={ley+eRy*0.95} rx={eRx*1.2} ry={eRy*0.3} fill="#0F172A" opacity={0.08} />
      <ellipse cx={rx} cy={ley+eRy*0.95} rx={eRx*1.2} ry={eRy*0.3} fill="#0F172A" opacity={0.08} />

      {/* Blink wrapper */}
      <motion.g
        animate={{ scaleY:[1,1,1,0.05,1,1,1,1,1,1] }}
        transition={{ duration:6, repeat:Infinity, delay:bd, times:[0,0.33,0.40,0.42,0.45,0.52,0.65,0.78,0.9,1], ease:'easeInOut' }}
        style={{ transformOrigin:`${BCX}px ${ley}px` }}
      >
        {/* Left eye */}
        <g id="eye-left">
          <ellipse cx={lx} cy={ley} rx={eRx} ry={eRy} fill="#0F172A" />
          {/* Large glint (upper-left) */}
          <circle cx={lx-eRx*0.33} cy={ley-eRy*0.45} r={eRx*0.42} fill="#FFFFFF" />
          {/* Small glint (lower-right) */}
          <circle cx={lx+eRx*0.33} cy={ley+eRy*0.3} r={eRx*0.21} fill="#FFFFFF" opacity={0.8} />
        </g>
        {/* Right eye */}
        <g id="eye-right">
          <ellipse cx={rx} cy={ley} rx={eRx} ry={eRy} fill="#0F172A" />
          <circle cx={rx-eRx*0.33} cy={ley-eRy*0.45} r={eRx*0.42} fill="#FFFFFF" />
          <circle cx={rx+eRx*0.33} cy={ley+eRy*0.3} r={eRx*0.21} fill="#FFFFFF" opacity={0.8} />
        </g>
      </motion.g>

      {/* Mouth — smile from the provided SVG, parameterized */}
      {big ? (
        <>
          <path d={`M ${BCX-f.mHW} ${mouthY} Q ${BCX} ${mouthY+f.mDip*1.8} ${BCX+f.mHW} ${mouthY}`}
            fill="none" stroke="#0F172A" strokeWidth={f.eyeRx*0.48} strokeLinecap="round" />
          <ellipse cx={BCX} cy={mouthY+f.mDip*0.8} rx={f.mHW*0.62} ry={f.mDip*0.52} fill="white" opacity={0.5} />
        </>
      ) : (
        <path d={`M ${BCX-f.mHW} ${mouthY} Q ${BCX} ${mouthY+f.mDip} ${BCX+f.mHW} ${mouthY}`}
          fill="none" stroke="#0F172A" strokeWidth={f.eyeRx*0.48} strokeLinecap="round" />
      )}
    </g>
  )
}

/* ── Bloom: Sleep Zzz (400×450) ───────────────────────────── */
function BloomSleepZzz400({ si }: { si: number }) {
  const { rx, ry } = BLOOM_BODY_SIZES[si]
  const sc = ry/130
  const zs = [
    { x:BCX+rx+8,  y:BCY-ry*0.55, sz:20*sc, d:0   },
    { x:BCX+rx+24, y:BCY-ry*0.85, sz:26*sc, d:0.5 },
    { x:BCX+rx+42, y:BCY-ry*1.1,  sz:32*sc, d:1   },
  ]
  return (
    <>
      {zs.map((z,i)=>(
        <motion.text key={i} x={z.x} y={z.y} fontSize={z.sz} fill="#7BAECE" fontWeight="800" textAnchor="middle"
          animate={{opacity:[0,0.9,0],y:[z.y,z.y-35,z.y-70]}}
          transition={{delay:z.d,duration:2.8,repeat:Infinity,ease:'easeOut'}}>z</motion.text>
      ))}
    </>
  )
}

/* ── Bloom: Celebration Stars (400×450) ───────────────────── */
function BloomCelebStars400({ si }: { si: number }) {
  const { rx, ry } = BLOOM_BODY_SIZES[si]
  const stars = [{x:BCX-rx-12,y:BCY-ry*0.75},{x:BCX+rx+20,y:BCY-ry*0.95},{x:BCX,y:BCY-ry-25}]
  return (
    <>
      {stars.map((st,i)=>(
        <motion.text key={i} x={st.x} y={st.y} fontSize={28} textAnchor="middle"
          animate={{scale:[0,1.3,1,0],rotate:[0,15,-10,0]}}
          transition={{delay:i*0.18,duration:1.6,repeat:Infinity,ease:'backOut'}}
          style={{transformOrigin:`${st.x}px ${st.y}px`}}>✨</motion.text>
      ))}
    </>
  )
}

/* ── Bloom: Fire Aura (400×450) ───────────────────────────── */
function BloomFireAura400({ si }: { si: number }) {
  const { rx, ry } = BLOOM_BODY_SIZES[si]
  const sc   = ry/130
  const bY   = BCY + ry - 2
  const offsets = [-35*sc, -12*sc, 12*sc, 35*sc]
  return (
    <>
      {offsets.map((xOff,i)=>(
        <motion.path key={i}
          d={`M${BCX+xOff-12},${bY+18} C${BCX+xOff-10},${bY-14} ${BCX+xOff+10},${bY-14} ${BCX+xOff+12},${bY+18}`}
          fill={i===1||i===2?'#F97316':'#FB923C'} opacity={0.85}
          animate={{scaleY:[1,1.35,0.85,1.2,1],opacity:[0.85,1,0.7,0.95,0.85]}}
          transition={{delay:i*0.18,duration:0.9,repeat:Infinity,ease:'easeInOut'}}
          style={{transformOrigin:`${BCX+xOff}px ${bY+18}px`}} />
      ))}
    </>
  )
}

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

  /* Generic species state (only used when !isBloom) */
  const s = isBloom ? resolveS(si, 'nova') : resolveS(si, species)  // fallback never shown

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
  const w = isBloom
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
          /* ══ BLOOM: PNG base + SVG face overlay ══
             El scale se aplica al contenedor completo (cuerpo + cara juntos)
             para que nunca se desalineen. Los overlays SVG siempre usan si=0
             porque el PNG muestra siempre el diseño de etapa 1. */
          <div style={{
            position: 'relative', width: w, height: h,
            transform: `scale(${BLOOM_PNG_SCALE[si]})`,
            transformOrigin: 'center bottom',
          }}>
            {/* PNG base — etapa 1, tamaño fijo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/Flowlings/bloom/base.png"
              alt="Bloom"
              draggable={false}
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', userSelect: 'none' }}
            />

            {/* SVG overlay — cara y efectos, siempre coordenadas de si=0 */}
            <svg
              viewBox="0 0 500 500"
              xmlns="http://www.w3.org/2000/svg"
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
            >
              <BloomDefs400 si={0} />
              <g id="slot-back" />
              {hasFire && <BloomFireAura400 si={0} />}
              <BloomFace400 si={0} emotion={emotion} />
              {emotion === 'sleeping'    && <BloomSleepZzz400 si={0} />}
              {emotion === 'celebrating' && <BloomCelebStars400 si={0} />}
              <g id="slot-headpiece"      />
              <g id="slot-face-accessory" />
              <g id="slot-body-accessory" />
              <g id="slot-hand-holding"   />
              <g id="slot-aura"           />
            </svg>

            {/* Evolution glow — etapas 3-5 */}
            {si >= 2 && (
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: `radial-gradient(ellipse 60% 50% at 50% 52%, ${
                  si === 2 ? 'rgba(74,222,128,0.14)' :
                  si === 3 ? 'rgba(74,222,128,0.24)' :
                             'rgba(134,239,172,0.34)'
                } 0%, transparent 72%)`,
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
