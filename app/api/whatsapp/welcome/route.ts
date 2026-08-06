import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@/lib/whatsapp/sendMessage'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { phone, name, flowlingName } = await req.json()
  if (!phone) return NextResponse.json({ ok: false, reason: 'no_phone' })

  const clean = phone.replace(/[\s\-()]/g, '').replace(/^\+/, '')
  const fName = flowlingName || 'Bloom'

  const message =
    `¡Hola ${name}! Soy *${fName}*, tu Flowling 🌱 Acabo de nacer contigo en Flowi.\n\n` +
    `Puedo ayudarte con tus tareas, recordatorios y proyectos. Escríbeme cuando quieras — aquí estaré.\n\n` +
    `¿Por dónde empezamos? 🚀`

  try {
    await sendWhatsAppMessage(clean, message)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Welcome WA error:', e)
    return NextResponse.json({ ok: false, reason: 'send_failed' })
  }
}
