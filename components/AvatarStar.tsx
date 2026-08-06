'use client'

import { motion } from 'motion/react'
import { getAvatarLevel, getNextLevel, AVATAR_LEVELS } from '@/lib/areas/defaults'

interface Props {
  xp: number
  color: string
  emoji: string
  size?: 'sm' | 'md' | 'lg'
  showLevel?: boolean
  showXp?: boolean
}

const SIZES = { sm: 48, md: 72, lg: 96 }

// Star stages: each level adds visual complexity
function StarShape({ size, color, level }: { size: number; color: string; level: number }) {
  const s = size
  const cx = s / 2
  const cy = s / 2
  const outerR = s * 0.44
  const innerR = outerR * 0.42
  const spikes = 5 + (level - 1)  // 5→9 spikes as level grows

  const points: string[] = []
  for (let i = 0; i < spikes * 2; i++) {
    const angle = (Math.PI / spikes) * i - Math.PI / 2
    const r = i % 2 === 0 ? outerR : innerR
    points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`)
  }

  const glowId = `glow-${color.replace('#', '')}`

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ overflow: 'visible' }}>
      <defs>
        <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation={level >= 4 ? 3 : level >= 3 ? 1.5 : 0.5} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Outer glow ring (levels 3+) */}
      {level >= 3 && (
        <circle cx={cx} cy={cy} r={outerR + 4} fill={color} opacity={0.12} />
      )}

      {/* Star body */}
      <polygon
        points={points.join(' ')}
        fill={color}
        opacity={0.15 + (level - 1) * 0.18}
        filter={`url(#${glowId})`}
      />
      <polygon
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        opacity={0.6 + (level - 1) * 0.1}
      />
    </svg>
  )
}

export default function AvatarStar({ xp, color, emoji, size = 'md', showLevel = false, showXp = false }: Props) {
  const avatarLevel = getAvatarLevel(xp)
  const nextLevel = getNextLevel(xp)
  const px = SIZES[size]
  const progress = nextLevel
    ? ((xp - avatarLevel.minXp) / (nextLevel.minXp - avatarLevel.minXp)) * 100
    : 100

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <div style={{ position: 'relative', width: px, height: px }}>
        {/* Animated star background */}
        <motion.div
          style={{ position: 'absolute', inset: 0 }}
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20 + avatarLevel.level * 5, repeat: Infinity, ease: 'linear' }}
        >
          <StarShape size={px} color={color} level={avatarLevel.level} />
        </motion.div>

        {/* Emoji center */}
        <motion.div
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: px * 0.36,
            lineHeight: 1,
          }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          {emoji}
        </motion.div>

        {/* Level badge */}
        {showLevel && (
          <div style={{
            position: 'absolute', bottom: -4, right: -4,
            width: 20, height: 20, borderRadius: '50%',
            background: color, color: 'white',
            fontSize: 10, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid white',
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
          }}>
            {avatarLevel.level}
          </div>
        )}
      </div>

      {/* Level label */}
      {showLevel && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.6875rem', fontWeight: 700, color, marginBottom: '2px' }}>
            Nv. {avatarLevel.level} · {avatarLevel.label}
          </p>
          {showXp && nextLevel && (
            <div style={{ width: px, height: 3, borderRadius: 99, background: 'var(--surface-secondary)', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{ height: '100%', borderRadius: 99, background: color }}
              />
            </div>
          )}
          {showXp && !nextLevel && (
            <p style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>¡Nivel máximo!</p>
          )}
        </div>
      )}
    </div>
  )
}
