'use client'

import Flowling, { type FlowlingEmotion } from '@/components/Flowling'

const STAGES = [0, 1, 2, 3, 4]
const STAGE_XP = [0, 50, 150, 400, 1000]
const STAGE_LABELS = ['E1', 'E2', 'E3', 'E4', 'E5']

const EMOTIONS: FlowlingEmotion[] = ['happy', 'encouraging', 'tired', 'concentrated']
const EMOTION_LABELS: Record<FlowlingEmotion, string> = {
  happy: 'Feliz',
  encouraging: 'Alentador',
  tired: 'Cansado',
  concentrated: 'Sorprendido',
  celebrating: 'Celebrando',
  sleeping: 'Durmiendo',
}

type Species = 'bloom' | 'kiro' | 'momo' | 'lumi'
const SPECIES_LIST: Species[] = ['bloom', 'kiro', 'momo', 'lumi', 'octi']

export default function TestFlowlingPage() {
  return (
    <div style={{ minHeight: '100dvh', background: '#f5f5f4', paddingBottom: '4rem' }}>

      <div style={{ padding: '2rem 1.5rem 1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.03em' }}>
          Flowlings — todos los estados
        </h1>
        <p style={{ fontSize: '0.8125rem', color: '#888', marginTop: '4px' }}>Preview temporal · localhost:3000/test-flowling</p>
      </div>

      {SPECIES_LIST.map(species => (
        <div key={species}>
          {/* Header de especie */}
          <div style={{ padding: '1rem 1.5rem 0' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#1a1a1a', textTransform: 'capitalize', letterSpacing: '-0.02em' }}>
              {species}
            </h2>
          </div>

          {/* MATRIZ: expresiones × etapas */}
          <Section title="Expresiones × Etapas">
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
                          <Flowling totalXp={STAGE_XP[si]} species={species} emotion={em} size="sm" />
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
                  <Flowling totalXp={STAGE_XP[si]} species={species} emotion="celebrating" size="md" />
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#666', marginTop: '6px' }}>E{si + 1}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Poses: Durmiendo */}
          <Section title="Pose: Durmiendo">
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              {STAGES.map(si => (
                <div key={si} style={{ textAlign: 'center' }}>
                  <Flowling totalXp={STAGE_XP[si]} species={species} emotion="sleeping" size="md" />
                  <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#666', marginTop: '6px' }}>E{si + 1}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>
      ))}

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
