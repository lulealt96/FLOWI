'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { House, Star, Bell, Gear, WhatsappLogo } from '@phosphor-icons/react'

const NAV = [
  { href: '/app',           label: 'Inicio',         Icon: House },
  { href: '/app/areas',     label: 'Mis áreas',      Icon: Star  },
  { href: '/app/reminders', label: 'Recordatorios',  Icon: Bell  },
  { href: '/app/settings',  label: 'Ajustes',        Icon: Gear  },
]

export default function SideNav({ waNumber }: { waNumber?: string }) {
  const pathname = usePathname()

  return (
    <aside style={{
      position: 'fixed', top: 0, left: 0, bottom: 0, width: '240px',
      background: 'var(--surface-primary)',
      borderRight: '1px solid var(--border-default)',
      display: 'flex', flexDirection: 'column',
      zIndex: 40,
    }}>
      {/* Brand */}
      <div style={{ padding: '1.75rem 1.5rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--brand-primary) 0%, #c4527a 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ color: 'white', fontSize: '1.125rem', lineHeight: 1 }}>✦</span>
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.04em', fontFamily: 'var(--font-sans)' }}>
            Flowi
          </span>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '0 0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {NAV.map(({ href, label, Icon }) => {
          const active = href === '/app' ? pathname === '/app' : pathname.startsWith(href)
          return (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                background: active ? 'rgba(240,107,138,0.1)' : 'transparent',
                color: active ? 'var(--brand-primary)' : 'var(--text-secondary)',
                fontWeight: active ? 700 : 500,
                fontSize: '0.9375rem',
                fontFamily: 'var(--font-sans)',
                transition: 'all 0.15s',
              }}>
                <Icon weight={active ? 'fill' : 'regular'} size={20} />
                {label}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* WhatsApp CTA */}
      <div style={{ padding: '1rem 0.75rem 1.75rem' }}>
        <a
          href={`https://wa.me/${waNumber ?? '573015322872'}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none' }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.625rem',
            padding: '0.75rem 0.875rem',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, #F06B8A 0%, #c4527a 100%)',
            color: 'white',
            fontSize: '0.875rem', fontWeight: 600, fontFamily: 'var(--font-sans)',
            boxShadow: '0 4px 12px rgba(240,107,138,0.3)',
          }}>
            <WhatsappLogo size={18} weight="fill" />
            Escribir a Flowi
          </div>
        </a>
      </div>
    </aside>
  )
}
