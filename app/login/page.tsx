'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

const stagger = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: EASE },
  }),
}

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email o contraseña incorrectos. Intenta de nuevo.')
      setLoading(false)
      return
    }

    router.push('/app')
    router.refresh()
  }

  const handleGoogle = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '48px',
    padding: '0 1rem',
    borderRadius: 'var(--radius-lg)',
    border: '1.5px solid var(--border-default)',
    background: 'var(--surface-secondary)',
    color: 'var(--text-primary)',
    fontSize: '0.9375rem',
    fontFamily: 'var(--font-sans)',
    outline: 'none',
    transition: 'border-color var(--transition-fast)',
  }

  return (
    <div
      className="flowi-bg min-h-dvh flex items-center justify-center p-4"
    >
      <div className="w-full max-w-[390px] mx-auto">

        {/* Logo */}
        <motion.div
          custom={0} variants={stagger} initial="hidden" animate="visible"
          className="text-center"
          style={{ marginBottom: '4rem' }}
        >
          <div className="inline-flex items-end gap-0 mb-3">
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '2.25rem',
              fontWeight: 700,
              letterSpacing: '-0.035em',
              color: 'var(--text-primary)',
              lineHeight: 1,
            }}>
              flow
            </span>
            <span style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '2.25rem',
              fontWeight: 700,
              letterSpacing: '-0.035em',
              color: 'var(--brand-primary)',
              lineHeight: 1,
            }}>
              i
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Tu hub de vida personal
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          custom={1} variants={stagger} initial="hidden" animate="visible"
          style={{
            background: 'var(--surface-primary)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.75rem',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--border-default)',
          }}
        >
          <form onSubmit={handleLogin} className="flex flex-col gap-4">

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--brand-primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-default)')}
              />
            </div>

            {/* Contraseña */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                  Contraseña
                </label>
                <a
                  href="/forgot-password"
                  style={{ fontSize: '0.8125rem', color: 'var(--brand-primary)', fontWeight: 500, textDecoration: 'none' }}
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--brand-primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-default)')}
              />
            </div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  color: 'var(--status-error)',
                  fontSize: '0.875rem',
                  padding: '0.75rem 1rem',
                  background: 'var(--status-error-soft)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                {error}
              </motion.p>
            )}

            {/* Botón entrar */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.97 }}
              style={{
                height: '48px',
                borderRadius: 'var(--radius-lg)',
                background: loading ? 'var(--border-strong)' : 'var(--brand-primary)',
                color: 'var(--brand-primary-text)',
                fontWeight: 600,
                fontSize: '0.9375rem',
                fontFamily: 'var(--font-sans)',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background var(--transition-base)',
                marginTop: '4px',
              }}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </motion.button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-default)' }} />
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>o</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-default)' }} />
          </div>

          {/* Google */}
          <motion.button
            type="button"
            onClick={handleGoogle}
            whileTap={{ scale: 0.97 }}
            style={{
              width: '100%',
              height: '48px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--surface-primary)',
              border: '1.5px solid var(--border-default)',
              color: 'var(--text-primary)',
              fontWeight: 500,
              fontSize: '0.9375rem',
              fontFamily: 'var(--font-sans)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.625rem',
              transition: 'border-color var(--transition-fast), background var(--transition-fast)',
            }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-strong)')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-default)')}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908C16.658 14.251 17.64 11.943 17.64 9.2z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continuar con Google
          </motion.button>
        </motion.div>

        {/* Registro */}
        <motion.p
          custom={2} variants={stagger} initial="hidden" animate="visible"
          style={{
            textAlign: 'center',
            marginTop: '1.25rem',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
          }}
        >
          ¿No tienes cuenta?{' '}
          <a
            href="/register"
            style={{ color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}
          >
            Regístrate
          </a>
        </motion.p>

      </div>
    </div>
  )
}
