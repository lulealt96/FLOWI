import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AvatarStar from '@/components/AvatarStar'
import { getAvatarLevel } from '@/lib/areas/defaults'

export default async function AreasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: areas } = await supabase
    .from('areas')
    .select('id, name, emoji, color, description, order_index')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('order_index')

  const { data: avatars } = await supabase
    .from('area_avatars')
    .select('area_id, xp, level')
    .eq('user_id', user.id)

  const { data: evalRows } = await supabase
    .from('area_evaluations')
    .select('area_id, score, evaluated_at')
    .eq('user_id', user.id)
    .order('evaluated_at', { ascending: false })

  const latestEval: Record<string, number> = {}
  evalRows?.forEach(e => { if (!(e.area_id in latestEval)) latestEval[e.area_id] = e.score })

  const xpByArea: Record<string, number> = {}
  avatars?.forEach(a => { xpByArea[a.area_id] = a.xp })

  const avgScore = areas && areas.length > 0
    ? Math.round(areas.reduce((s, a) => s + (latestEval[a.id] ?? 0), 0) / areas.length)
    : 0

  return (
    <div style={{ minHeight: '100dvh', paddingBottom: '5rem' }}>
      <div style={{ padding: '2rem 1.5rem 1rem' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
          Tu vida
        </p>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
          Áreas de vida
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Promedio general: <strong style={{ color: 'var(--brand-primary)' }}>{avgScore}/100</strong>
        </p>
      </div>

      <div style={{ padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {(areas ?? []).map(area => {
          const xp = xpByArea[area.id] ?? 0
          const avatarLevel = getAvatarLevel(xp)
          const score = latestEval[area.id] ?? 0

          return (
            <Link key={area.id} href={`/app/areas/${area.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)',
                padding: '1.125rem 1.25rem', border: '1px solid var(--border-default)',
                display: 'flex', alignItems: 'center', gap: '1rem',
                borderLeft: `4px solid ${area.color}`,
                boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
              }}>
                <AvatarStar xp={xp} color={area.color} emoji={area.emoji} size="sm" showLevel />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                    {area.name}
                  </p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {area.description}
                  </p>
                  {/* Score bar */}
                  <div style={{ marginTop: '8px', height: '4px', borderRadius: '99px', background: 'var(--surface-secondary)', overflow: 'hidden', maxWidth: '160px' }}>
                    <div style={{ height: '100%', borderRadius: '99px', background: area.color, width: `${score}%`, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: '1.5rem', fontWeight: 900, color: area.color, lineHeight: 1 }}>{score}</p>
                  <p style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>/100</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
