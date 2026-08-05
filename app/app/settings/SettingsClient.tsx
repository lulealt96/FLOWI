'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, User, Phone, Mail, ChevronRight } from 'lucide-react'

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1]

export default function SettingsClient({ email, name: initialName, phone: initialPhone }: {
  email: string; name: string; phone: string
}) {
  const [name, setName]   = useState(initialName)
  const [phone, setPhone] = useState(initialPhone)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const router = useRouter()

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({
        name: name.trim(),
        whatsapp_phone: phone.trim() || null,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id)
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', height: '48px', padding: '0 1rem',
    borderRadius: 'var(--radius-lg)',
    border: '1.5px solid var(--border-default)',
    background: 'var(--surface-secondary)',
    color: 'var(--text-primary)',
    fontSize: '0.9375rem', fontFamily: 'var(--font-sans)',
    outline: 'none',
  }

  return (
    <div style={{ padding: '0 0 2rem' }}>
      {/* Header */}
      <div style={{ padding: '3rem 1.5rem 1.5rem' }}>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontWeight: 500, marginBottom: '2px' }}>Tu cuenta</p>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>Ajustes</h1>
      </div>

      <div style={{ padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Perfil */}
        <motion.section
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          style={{
            background: 'var(--surface-primary)',
            borderRadius: 'var(--radius-xl)',
            padding: '1.25rem',
            border: '1px solid var(--border-default)',
            boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
          }}
        >
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1rem' }}>
            Perfil
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <User size={14} /> Nombre
              </label>
              <input
                value={name} onChange={e => setName(e.target.value)}
                placeholder="Tu nombre"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--brand-primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-default)')}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Mail size={14} /> Correo
              </label>
              <input value={email} disabled style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Phone size={14} /> WhatsApp
              </label>
              <input
                value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+57 300 000 0000"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'var(--brand-primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border-default)')}
              />
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                Este número te identifica cuando le escribes a Flowi
              </p>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={saving}
              style={{
                height: '48px', borderRadius: 'var(--radius-lg)',
                background: saved ? '#6BC96B' : 'var(--brand-primary)',
                color: 'var(--brand-primary-text)',
                fontWeight: 600, fontSize: '0.9375rem', fontFamily: 'var(--font-sans)',
                border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'background 0.3s',
              }}
            >
              {saving ? 'Guardando...' : saved ? '¡Guardado! ✓' : 'Guardar cambios'}
            </motion.button>
          </div>
        </motion.section>

        {/* Sesión */}
        <motion.section
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease: EASE }}
          style={{
            background: 'var(--surface-primary)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-default)',
            overflow: 'hidden',
            boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
          }}
        >
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '1rem 1.25rem',
              display: 'flex', alignItems: 'center', gap: '0.875rem',
              background: 'none', border: 'none', cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'rgba(240,107,138,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <LogOut size={16} color="var(--status-error)" />
            </div>
            <span style={{ flex: 1, fontSize: '0.9375rem', fontWeight: 500, color: 'var(--status-error)' }}>
              Cerrar sesión
            </span>
            <ChevronRight size={16} color="var(--text-tertiary)" />
          </button>
        </motion.section>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
          flowi · v1.0
        </p>
      </div>
    </div>
  )
}
