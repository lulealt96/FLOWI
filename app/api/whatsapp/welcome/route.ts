import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@/lib/whatsapp/sendMessage'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { phone, name } = await req.json()
  if (!phone) return NextResponse.json({ ok: false, reason: 'no_phone' })

  const clean = phone.replace(/[\s\-()]/g, '').replace(/^\+/, '')

  const message =
    `¡Hola ${name}! 👋 Soy *Flowi*, tu asistente personal.\n\n` +
    `Así es como puedes usarme:\n\n` +
    `📝 *Agregar tareas*\n"Reunión con el equipo mañana a las 10am"\n\n` +
    `🔔 *Recordatorios*\n"Recuérdame pagar la renta el viernes"\n\n` +
    `📁 *Asignar a proyecto*\n"Llamar al contador → Mi negocio"\n\n` +
    `Solo escríbeme en lenguaje natural y yo lo organizo todo. ¡Empecemos! 🚀`

  try {
    await sendWhatsAppMessage(clean, message)
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Welcome WA error:', e)
    return NextResponse.json({ ok: false, reason: 'send_failed' })
  }
}
