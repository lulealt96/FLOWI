'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Flowling, { type FlowlingEmotion } from '@/components/Flowling'
import { SPECIES } from '@/lib/flowlings/species'

const EMOTIONS: FlowlingEmotion[] = ['happy', 'celebrating', 'sleeping', 'encouraging', 'concentrated', 'tired']
const SPECIES_IDS = Object.keys(SPECIES)
const XP_PER_STAGE = [0, 100, 500, 2000, 8000]

export default function FlowlingPreview() {
  const router = useRouter()
  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (!user) router.replace('/login')
    })
  }, [router])

  return (
    <div style={{ background: '#FAFAF8', minHeight: '100dvh', padding: '2rem 1.5rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem', color: '#1C0D14' }}>
        Flowling Preview
      </h1>
      <p style={{ fontSize: '0.875rem', color: '#9E7080', marginBottom: '2.5rem' }}>
        Página temporal de desarrollo — /flowling-preview
      </p>

      {/* Bloom — all 5 stages */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#F06B8A', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          🌱 Bloom — 5 etapas de evolución
        </h2>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {XP_PER_STAGE.map((xp, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <Flowling totalXp={xp} species="bloom" emotion="happy" size="lg" showInfo />
              <p style={{ fontSize: '0.7rem', color: '#9E7080', marginTop: '0.5rem' }}>Etapa {i + 1} · {xp} XP</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bloom — all emotions (stage 2) */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#F06B8A', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          🌱 Bloom — Emociones (etapa 3)
        </h2>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {EMOTIONS.map((e) => (
            <div key={e} style={{ textAlign: 'center' }}>
              <Flowling totalXp={500} species="bloom" emotion={e} size="md" />
              <p style={{ fontSize: '0.7rem', color: '#9E7080', marginTop: '0.5rem' }}>{e}</p>
            </div>
          ))}
        </div>
      </section>

      {/* All species — stage 1 */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#F06B8A', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Todas las especies — Etapa 1 (0 XP)
        </h2>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {SPECIES_IDS.map((id) => (
            <div key={id} style={{ textAlign: 'center' }}>
              <Flowling totalXp={0} species={id} emotion="happy" size="md" showInfo />
            </div>
          ))}
        </div>
      </section>

      {/* All species — stage 3 */}
      <section>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#F06B8A', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Todas las especies — Etapa 3 (500 XP)
        </h2>
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {SPECIES_IDS.map((id) => (
            <div key={id} style={{ textAlign: 'center' }}>
              <Flowling totalXp={500} species={id} emotion="happy" size="md" showInfo />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
