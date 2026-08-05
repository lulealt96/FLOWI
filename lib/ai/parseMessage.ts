import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

interface Project {
  id: string
  name: string
  emoji: string
  category: string
}

interface ParsedTask {
  title: string
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
}

export interface ParsedIntent {
  intent_type: 'task' | 'expense' | 'income' | 'habit' | 'unclear'

  // Tareas
  project_id: string | null
  tasks: ParsedTask[]

  // Finanzas
  amount: number | null          // monto numérico
  finance_category: string | null // id de categoría (ver lista abajo)
  finance_description: string | null

  // Hábitos
  habit_name: string | null       // nombre del hábito a marcar

  response_message: string
  needs_clarification: boolean
  clarification_question: string | null
}

const SYSTEM_PROMPT = `Eres Flowi, asistente personal de organización de Luisa. Recibes mensajes de WhatsApp y los clasificas en uno de 4 intents: task, expense, income, habit.

══════════════════════════════════════
CATEGORÍAS DE GASTOS (finance_category):
  food          → comida, restaurante, almuerzo, desayuno, cena, domicilio, mercado, supermercado
  transport     → taxi, uber, didi, bus, metro, gasolina, parqueo, transporte
  home          → arriendo, servicios públicos, hogar, casa, mantenimiento
  health        → médico, farmacia, salud, gym, clínica, medicina, dentista
  entertainment → cine, streaming, concierto, bar, fiesta, entretenimiento, salida, Netflix, Spotify
  shopping      → ropa, zapatos, compras, tienda, regalos para mí
  services      → luz, agua, internet, teléfono, gas, suscripción
  education     → curso, libro, capacitación, universidad, academia
  travel        → viaje, hotel, vuelo, airbnb, vacaciones
  gifts         → regalo para otro, obsequio
  debt          → deuda, cuota, préstamo, tarjeta de crédito, abono
  other_exp     → otros gastos

CATEGORÍAS DE INGRESOS (finance_category):
  salary        → salario, sueldo, quincena, nómina, pago de trabajo fijo
  freelance     → freelance, proyecto, cliente, honorarios
  investment    → inversión, dividendo, ganancia, rendimiento
  gift          → regalo de dinero, propina inesperada
  other_inc     → otros ingresos
══════════════════════════════════════

REGLAS DE CLASIFICACIÓN:
- intent_type = "expense"  → palabras: gasté, pagué, compré, salió, costó, invertí en (gasto), me cobró
- intent_type = "income"   → palabras: gané, recibí, me pagaron, entró, ingresó, me depositaron, cobré
- intent_type = "habit"    → palabras: completé, hice, terminé, logré, cumplí, ya hice, ya completé + [nombre de hábito]
- intent_type = "task"     → agregar tarea, recordarme, no olvidar, pendiente, hacer, llamar, reunión, etc.
- intent_type = "unclear"  → no encaja en ninguna categoría

REGLAS ESTRICTAS:
1. Responde SOLO con JSON válido, sin texto extra, sin markdown, sin \`\`\`json
2. Para expense/income: extrae el monto numérico puro (sin símbolo de moneda, sin puntos de miles)
   Ejemplos: "15.000" → 15000, "20k" → 20000, "1.500.000" → 1500000, "$50" → 50
3. Para habits: habit_name es el nombre exacto que mencionó el usuario (lo usamos para buscar en BD)
4. Para tasks: si no identificas el proyecto → project_id null y pregunta
5. response_message: breve, cálida, en español, confirmando lo entendido con emoji
6. CONTEXTO DE ACLARACIÓN: Si el mensaje actual responde a una pregunta de Flowi sobre qué proyecto usar
   (ej: "en el proyecto trabajo", "el de trabajo", "ese va en finanzas"), revisa el contexto reciente
   para encontrar la tarea original y reconstruye el JSON completo con tasks[] lleno y project_id correcto.
   NUNCA dejes tasks[] vacío si el usuario está respondiendo sobre el proyecto de una tarea previa.

FORMATO JSON (incluye TODOS los campos, pon null en los que no aplican):
{
  "intent_type": "expense|income|habit|task|unclear",
  "project_id": null,
  "tasks": [],
  "amount": null,
  "finance_category": null,
  "finance_description": null,
  "habit_name": null,
  "response_message": "...",
  "needs_clarification": false,
  "clarification_question": null
}`

export async function parseWhatsAppMessage(
  message: string,
  projects: Project[],
  userName: string,
  recentContext: string = ''
): Promise<ParsedIntent> {
  const projectsText = projects.length > 0
    ? projects.map(p => `- ID: ${p.id} | Nombre: ${p.name} ${p.emoji} | Categoría: ${p.category}`).join('\n')
    : '(sin proyectos creados aún)'

  const userPrompt = `Usuario: ${userName}
Proyectos disponibles:
${projectsText}

${recentContext ? `Contexto reciente:\n${recentContext}\n` : ''}
Mensaje recibido: "${message}"

Fecha y hora actual: ${new Date().toISOString()} (zona horaria: América/Bogotá)

Analiza el mensaje y responde con el JSON.`

  const response = await anthropic.messages.create({
    model: process.env.AI_MODEL ?? 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const raw = response.content[0].type === 'text' ? response.content[0].text : ''
  // Strip markdown code fences if the model wrapped the JSON
  const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()

  try {
    const parsed = JSON.parse(text) as ParsedIntent
    // Normalizar amount: remover puntos de miles si vienen como string
    if (parsed.amount !== null && typeof parsed.amount === 'string') {
      parsed.amount = parseFloat((parsed.amount as string).replace(/\./g, '').replace(',', '.')) || null
    }
    return parsed
  } catch {
    return {
      intent_type: 'unclear',
      project_id: null,
      tasks: [],
      amount: null,
      finance_category: null,
      finance_description: null,
      habit_name: null,
      response_message: '🤔 No entendí bien. ¿Puedes repetirlo de otra forma?\n\nEjemplos:\n• "Gasté 15000 en almuerzo"\n• "Completé meditación"\n• "Agregar reunión con cliente al proyecto Trabajo"',
      needs_clarification: true,
      clarification_question: null,
    }
  }
}
