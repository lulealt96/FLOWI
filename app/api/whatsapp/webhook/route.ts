import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { processInboundMessage } from '@/lib/whatsapp/processMessage'

// GET — Meta verifica el webhook al configurarlo
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const mode      = searchParams.get('hub.mode')
  const token     = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 })
  }

  return new NextResponse('Forbidden', { status: 403 })
}

// POST — Meta envía mensajes nuevos
export async function POST(req: NextRequest) {
  // 1. Validar firma HMAC para confirmar que viene de Meta
  const rawBody  = await req.text()
  const signature = req.headers.get('x-hub-signature-256') ?? ''
  const appSecret = process.env.WHATSAPP_APP_SECRET ?? ''

  if (appSecret) {
    const expected = 'sha256=' + createHmac('sha256', appSecret).update(rawBody).digest('hex')
    if (signature !== expected) {
      return new NextResponse('Unauthorized', { status: 401 })
    }
  }

  let payload: WebhookPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return new NextResponse('Bad Request', { status: 400 })
  }

  // 2. Extraer mensajes del payload de Meta
  const entries = payload?.entry ?? []
  for (const entry of entries) {
    for (const change of entry.changes ?? []) {
      const messages = change.value?.messages ?? []
      for (const msg of messages) {
        // Solo procesamos mensajes de texto por ahora
        if (msg.type !== 'text') continue

        const waMessageId = msg.id
        const from        = msg.from        // número del remitente
        const body        = msg.text?.body ?? ''

        if (!body.trim()) continue

        // Procesar en background — respondemos 200 inmediatamente a Meta
        processInboundMessage(waMessageId, from, body).catch(err => {
          console.error('[WhatsApp] Error procesando mensaje:', err)
        })
      }
    }
  }

  // Meta exige respuesta 200 rápida
  return NextResponse.json({ status: 'ok' })
}

// ─── Tipos del payload de Meta ────────────────────────────────────────────────
interface WebhookPayload {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: Array<{
          id: string
          from: string
          type: string
          text?: { body: string }
        }>
      }
    }>
  }>
}
