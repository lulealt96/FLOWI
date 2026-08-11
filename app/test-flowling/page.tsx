'use client'

import Flowling, { type FlowlingEmotion } from '@/components/Flowling'

const STAGES = [0, 1, 2, 3, 4]
const STAGE_XP = [0, 50, 150, 400, 1000]
const STAGE_LABELS = ['E1 Semilla', 'E2 Brote', 'E3 Planta', 'E4 Árbol', 'E5 Guardián']

const EMOTIONS: FlowlingEmotion[] = ['happy', 'encouraging', 'tired', 'concentrated']
const EMOTION_LABELS: Record<FlowlingEmotion, string> = {
  happy: 'Feliz',
  encouraging: 'Alentador',
  tired: 'Cansado',
  concentrated: 'Sorprendido',
  celebrating: 'Celebrando',
  sleeping: 'Durmiendo',
}

export default function TestFlowlingPage() {
  return (
    <div style={{ minHeight: '100dvh', background: '#f5f5f4', paddingBottom: '4rem' }}>

      <div style={{ padding: '2rem 1.5rem 1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.03em' }}>
          Bloom — todos los estados
        </h1>
        <p style={{ fontSize: '0.8125rem', color: '#888', marginTop: '4px' }}>Preview temporal · localhost:3000/test-flowling</p>
      </div>

      {/* MATRIZ: expresiones × etapas */}
      <Section title="Expresiones estándar × Etapas">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', minWidth: '100%' }}>
            <thead>
              <tr>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.75rem', color: '#888', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #e5e5e5' }}>
                  Expresión
                </th>
                {STAGE_LABELS.map(l => (
                  <th key={l} style={{ padding: '8px 12px', textAlign: 'center', fontSize: '0.75rem', color: '#888', fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #e5e5e5' }}>
                    {l}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {EMOTIONS.map(em => (
                <tr key={em} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px', fontSize: '0.875rem', fontWeight: 600, color: '#444', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                    {EMOTION_LABELS[em]}
                  </td>
                  {STAGES.map(si => (
                    <td key={si} style={{ padding: '8px', textAlign: 'center', verticalAlign: 'middle' }}>
                      <Flowling totalXp={STAGE_XP[si]} species="bloom" emotion={em} size="sm" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Poses: Celebrando */}
      <Section title="Pose: Celebrando">
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {STAGES.map(si => (
            <div key={si} style={{ textAlign: 'center' }}>
              <Flowling totalXp={STAGE_XP[si]} species="bloom" emotion="celebrating" size="md" />
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#666', marginTop: '6px' }}>Etapa {si + 1}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Poses: Durmiendo */}
      <Section title="Pose: Durmiendo">
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {STAGES.map(si => (
            <div key={si} style={{ textAlign: 'center' }}>
              <Flowling totalXp={STAGE_XP[si]} species="bloom" emotion="sleeping" size="md" />
              <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#666', marginTop: '6px' }}>Etapa {si + 1}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Ambiente hero card */}
      <Section title="Ambiente (hero card del dashboard)">
        {STAGES.map(si => (
          <div key={si} style={{ marginBottom: '0.75rem' }}>
            <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', marginBottom: '6px' }}>
              Etapa {si + 1}
            </p>
            <div style={{
              borderRadius: '16px', border: '1px solid #e5e5e5',
              padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem',
              overflow: 'hidden', position: 'relative',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/Flowlings/bloom/Ambiente/ambiente_bloom.png" alt="" draggable={false}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.72) 45%, rgba(255,255,255,0.88) 100%)', pointerEvents: 'none' }} />
              <div style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>
                <Flowling totalXp={STAGE_XP[si]} species="bloom" emotion="happy" size="md" />
              </div>
              <div style={{ flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
                <p style={{ fontSize: '1rem', fontWeight: 800, color: '#1a1a1a', marginBottom: '4px' }}>Bloom Etapa {si + 1}</p>
                <p style={{ fontSize: '0.8125rem', color: '#555', marginBottom: '0.5rem' }}>¡Vas muy bien! Sigue así.</p>
                <div style={{ height: '4px', borderRadius: '99px', background: '#e5e5e5', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: '99px', background: '#1EA86B', width: `${(si + 1) * 20}%` }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </Section>

    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '0.75rem 1.5rem' }}>
      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>
        {title}
      </p>
      <div style={{
        background: 'white', borderRadius: '16px',
        border: '1px solid #e5e5e5', padding: '1.25rem',
        overflowX: 'auto',
      }}>
        {children}
      </div>
    </div>
  )
}
