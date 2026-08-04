import { createAdminClient } from '@/lib/supabase/admin'
import { parseWhatsAppMessage } from '@/lib/ai/parseMessage'
import { sendWhatsAppMessage } from '@/lib/whatsapp/sendMessage'

export async function processInboundMessage(
  waMessageId: string,
  fromPhone: string,
  body: string
): Promise<void> {
  const supabase = createAdminClient()

  // 1. Idempotencia: ignorar si ya procesamos este mensaje
  const { data: existing } = await supabase
    .from('wa_conversations')
    .select('id')
    .eq('wa_message_id', waMessageId)
    .single()

  if (existing) return

  // 2. Identificar usuario por número de teléfono
  const phone = fromPhone.replace(/\D/g, '')   // solo dígitos
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('whatsapp_phone', phone)
    .single()

  if (!profile) {
    await sendWhatsAppMessage(
      fromPhone,
      '👋 Hola! No encontré tu cuenta en Flowi. Regístrate en la app y vincula tu número en Ajustes.'
    )
    return
  }

  // 3. Registrar mensaje entrante
  await supabase.from('wa_conversations').insert({
    user_id:       profile.id,
    wa_message_id: waMessageId,
    direction:     'inbound',
    body,
  })

  // 4. Cargar proyectos del usuario
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, emoji, category')
    .eq('user_id', profile.id)
    .eq('is_active', true)
    .order('sort_order')

  // 5. Contexto reciente (últimos 3 mensajes)
  const { data: recent } = await supabase
    .from('wa_conversations')
    .select('direction, body')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(3)

  const recentContext = (recent ?? [])
    .reverse()
    .map(m => `${m.direction === 'inbound' ? 'Luisa' : 'Flowi'}: ${m.body}`)
    .join('\n')

  // 6. Parsear con IA
  const intent = await parseWhatsAppMessage(
    body,
    projects ?? [],
    profile.name,
    recentContext
  )

  // 7. Guardar intent en el registro del mensaje
  await supabase
    .from('wa_conversations')
    .update({ parsed_intent: intent })
    .eq('wa_message_id', waMessageId)

  // 8. Crear tareas si hay proyecto identificado y tareas extraídas
  if (intent.project_id && intent.tasks.length > 0) {
    const tasksToInsert = intent.tasks.map(t => ({
      user_id:     profile.id,
      project_id:  intent.project_id!,
      title:       t.title,
      priority:    t.priority,
      due_date:    t.due_date,
      status:      'pending' as const,
      source:      'whatsapp' as const,
      raw_message: body,
    }))

    await supabase.from('tasks').insert(tasksToInsert)
  }

  // 9. Responder al usuario por WhatsApp
  const replyText = intent.needs_clarification && intent.clarification_question
    ? `${intent.response_message}\n\n${intent.clarification_question}`
    : intent.response_message

  await sendWhatsAppMessage(fromPhone, replyText)

  // 10. Registrar mensaje saliente
  await supabase.from('wa_conversations').insert({
    user_id:       profile.id,
    wa_message_id: `out_${waMessageId}`,
    direction:     'outbound',
    body:          replyText,
  })
}
