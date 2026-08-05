'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { House, FolderSimple, CheckSquare, Bell, Gear } from '@phosphor-icons/react'

const NAV = [
  { href: '/app',            label: 'Inicio',      Icon: House         },
  { href: '/app/projects',   label: 'Proyectos',   Icon: FolderSimple  },
  { href: '/app/tasks',      label: 'Tareas',      Icon: CheckSquare   },
  { href: '/app/reminders',  label: 'Recordatorios', Icon: Bell        },
  { href: '/app/settings',   label: 'Ajustes',     Icon: Gear          },
]

export default function BottomNav() {
  const pathname = usePathname()

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
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              transition: 'all var(--transition-fast)',
            }}
          >
            <Icon
              weight={isActive ? 'fill' : 'regular'}
              size={22}
              color={isActive ? 'var(--brand-primary)' : 'var(--text-tertiary)'}
            />
            <span style={{
              fontSize: '0.625rem',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? 'var(--brand-primary)' : 'var(--text-tertiary)',
              letterSpacing: '0.01em',
            }}>
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
