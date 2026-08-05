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
  const phone = fromPhone.replace(/\D/g, '')
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
    .map(m => `${m.direction === 'inbound' ? profile.name : 'Flowi'}: ${m.body}`)
    .join('\n')

  // 6. Parsear con IA
  const intent = await parseWhatsAppMessage(
    body,
    projects ?? [],
    profile.name,
    recentContext
  )

  // 7. Guardar intent
  await supabase
    .from('wa_conversations')
    .update({ parsed_intent: intent })
    .eq('wa_message_id', waMessageId)

  // 8. Ejecutar acción según intent_type
  let replyText = intent.response_message

  // ─── FINANZAS ──────────────────────────────────────────────────────────────
  if (intent.intent_type === 'expense' || intent.intent_type === 'income') {
    const financeProject = (projects ?? []).find(p =>
      /finanz|presupuest|gasto|budget|dinero|plata/i.test(p.name)
    )

    if (!financeProject) {
      replyText = '💰 Para registrar gastos/ingresos necesitas un proyecto de finanzas en la app. Créalo en Proyectos → +.'
    } else if (!intent.amount || intent.amount <= 0) {
      replyText = '🤔 No pude leer el monto. ¿Cuánto fue? Ej: "Gasté 15000 en almuerzo"'
    } else {
      const today = new Date().toISOString().split('T')[0]
      const category = intent.finance_category ??
        (intent.intent_type === 'expense' ? 'other_exp' : 'other_inc')

      await supabase.from('transactions').insert({
        user_id:     profile.id,
        project_id:  financeProject.id,
        type:        intent.intent_type,
        amount:      intent.amount,
        category,
        description: intent.finance_description ?? '',
        date:        today,
      })
    }
  }

  // ─── HÁBITOS ───────────────────────────────────────────────────────────────
  else if (intent.intent_type === 'habit') {
    const habitProject = (projects ?? []).find(p =>
      /hábit|habit/i.test(p.name)
    )

    if (!habitProject) {
      replyText = '⚡ Para marcar hábitos necesitas un proyecto de hábitos en la app.'
    } else if (!intent.habit_name) {
      replyText = '🤔 No entendí qué hábito completaste. ¿Puedes ser más específico? Ej: "Completé meditación"'
    } else {
      // Cargar hábitos del usuario
      const { data: habits } = await supabase
        .from('habits')
        .select('id, name')
        .eq('project_id', habitProject.id)
        .eq('user_id', profile.id)

      const habitLower = intent.habit_name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

      // Fuzzy match: buscar el hábito que más se parezca al mencionado
      const matched = (habits ?? []).find(h => {
        const hLower = h.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
        return hLower.includes(habitLower) || habitLower.includes(hLower)
      })

      if (!matched) {
        const habitList = (habits ?? []).map(h => `• ${h.name}`).join('\n')
        replyText = `🤔 No encontré el hábito "${intent.habit_name}". Tus hábitos actuales:\n${habitList || '(sin hábitos — créalos en la app)'}\n\nEscríbelo igual que aparece arriba.`
      } else {
        const today = new Date().toISOString().split('T')[0]

        // Verificar si ya está registrado hoy
        const { data: alreadyDone } = await supabase
          .from('habit_logs')
          .select('id')
          .eq('habit_id', matched.id)
          .eq('date', today)
          .single()

        if (alreadyDone) {
          replyText = `✅ Ya habías marcado *${matched.name}* hoy. ¡Sigue así! 🔥`
        } else {
          await supabase.from('habit_logs').insert({
            habit_id: matched.id,
            user_id:  profile.id,
            date:     today,
          })
          // La respuesta ya viene del intent (con el nombre correcto)
        }
      }
    }
  }

  // ─── TAREAS ────────────────────────────────────────────────────────────────
  else if (intent.intent_type === 'task') {
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

    if (intent.needs_clarification && intent.clarification_question) {
      replyText = `${intent.response_message}\n\n${intent.clarification_question}`
    }
  }

  // ─── ENVIAR RESPUESTA ──────────────────────────────────────────────────────
  await sendWhatsAppMessage(fromPhone, replyText)

  await supabase.from('wa_conversations').insert({
    user_id:       profile.id,
    wa_message_id: `out_${waMessageId}`,
    direction:     'outbound',
    body:          replyText,
  })
}
