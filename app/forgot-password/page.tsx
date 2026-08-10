'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || loading) return
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })
    setLoading(false)
    if (err) {
      setError('No pudimos enviar el correo. Verifica el email e intenta de nuevo.')
    } else {
      setSent(true)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem', background: 'var(--bg-base)',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        style={{ width: '100%', maxWidth: '400px' }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.05em', fontFamily: 'var(--font-sans)' }}>
            <span style={{ color: 'var(--brand-primary)' }}>fl</span>
            <span style={{ color: 'var(--text-primary)' }}>owi</span>
          </p>
        </div>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: EASE }}
            style={{
              background: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)',
              padding: '2rem', border: '1px solid var(--border-default)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📬</div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Revisa tu correo
            </h1>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              Te enviamos un enlace a <strong>{email}</strong> para restablecer tu contraseña. Puede tardar unos minutos.
            </p>
            <Link href="/login" style={{
              display: 'block', width: '100%', height: '52px', lineHeight: '52px',
              borderRadius: 'var(--radius-lg)', background: 'var(--brand-primary)',
              color: 'white', fontWeight: 700, fontSize: '1rem',
              textDecoration: 'none', textAlign: 'center', fontFamily: 'var(--font-sans)',
            }}>
              Volver al inicio
            </Link>
          </motion.div>
        ) : (
          <div style={{
            background: 'var(--surface-primary)', borderRadius: 'var(--radius-xl)',
            padding: '2rem', border: '1px solid var(--border-default)',
          }}>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
              ¿Olvidaste tu contraseña?
            </h1>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', marginBottom: '1.75rem', lineHeight: 1.5 }}>
              Ingresa tu email y te enviamos un enlace para crear una nueva.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  autoFocus
                  autoComplete="email"
                  required
                  style={{
                    width: '100%', height: '48px', padding: '0 1rem',
                    borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-default)',
                    background: 'var(--surface-primary)', color: 'var(--text-primary)',
                    fontSize: '1rem', fontFamily: 'var(--font-sans)', outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--brand-primary)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border-default)')}
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)',
                    background: 'var(--status-error-soft)', color: 'var(--status-error)',
                    fontSize: '0.875rem', fontWeight: 500,
                  }}
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={!email.trim() || loading}
                style={{
                  height: '52px', borderRadius: 'var(--radius-lg)',
                  background: !email.trim() || loading ? 'var(--border-default)' : 'var(--brand-primary)',
                  color: 'white', fontWeight: 700, fontSize: '1rem',
                  border: 'none', cursor: !email.trim() || loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-sans)', transition: 'background 0.2s',
                }}
              >
                {loading ? 'Enviando...' : 'Enviar enlace'}
              </button>
            </form>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
          <Link href="/login" style={{ color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none' }}>
            ← Volver al login
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
