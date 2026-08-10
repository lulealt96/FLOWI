'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useTransition, useState, useEffect } from 'react'
import { House, Star, Bell, Gear } from '@phosphor-icons/react'

const NAV = [
  { href: '/app',             label: 'Inicio',   Icon: House },
  { href: '/app/areas',       label: 'Áreas',    Icon: Star  },
  { href: '/app/reminders',   label: 'Alertas',  Icon: Bell  },
  { href: '/app/settings',    label: 'Ajustes',  Icon: Gear  },
]

export default function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  useEffect(() => {
    setPendingHref(null)
  }, [pathname])

  function handleNav(href: string) {
    if (pathname === href) return
    setPendingHref(href)
    startTransition(() => { router.push(href) })
  }

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: '480px',
      height: '64px',
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(16px)',
      borderTop: '1px solid var(--border-default)',
      borderLeft: '1px solid var(--border-default)',
      borderRight: '1px solid var(--border-default)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      zIndex: 50,
    }}>
      {NAV.map(({ href, label, Icon }) => {
        const isActive = pathname === href || (href !== '/app' && pathname.startsWith(href))
        const isLoading = pendingHref === href && isPending
        return (
          <button
            key={href}
            onClick={() => handleNav(href)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              padding: '6px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'opacity 0.15s',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? (
              <div style={{
                width: '22px', height: '22px', borderRadius: '50%',
                border: '2.5px solid var(--border-default)',
                borderTopColor: 'var(--brand-primary)',
                animation: 'spin 0.7s linear infinite',
              }} />
            ) : (
              <Icon
                weight={isActive ? 'fill' : 'regular'}
                size={22}
                color={isActive ? 'var(--brand-primary)' : 'var(--text-tertiary)'}
              />
            )}
            <span style={{
              fontSize: '0.625rem',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--brand-primary)' : 'var(--text-tertiary)',
              letterSpacing: '0.01em',
            }}>
              {label}
            </span>
          </button>
        )
      })}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </nav>
  )
}
