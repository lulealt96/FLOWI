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
  due_date: string | null  // ISO string o null
}

export interface ParsedIntent {
  project_id: string | null   // null = no pudo clasificar
  tasks: ParsedTask[]
  response_message: string    // mensaje de confirmación para enviar al usuario
  needs_clarification: boolean
  clarification_question: string | null
}

const SYSTEM_PROMPT = `Eres Flowi, un asistente personal de organización que ayuda a Luisa a gestionar sus proyectos y tareas.

Tu trabajo es: recibir un mensaje de WhatsApp en lenguaje natural, identificar qué proyecto corresponde y extraer las tareas mencionadas.

REGLAS ESTRICTAS:
1. Responde SOLO con JSON válido, sin texto extra, sin markdown, sin \`\`\`json
2. No inventes fechas — si el usuario no menciona fecha, due_date es null
3. No inventes prioridades sin contexto — usa "medium" por defecto
4. Palabras que indican prioridad alta: urgente, hoy, ya, importante, ASAP, deadline, vence
5. Si no puedes identificar el proyecto, project_id es null y pregunta al usuario
6. La respuesta (response_message) debe ser breve, cálida y en español, confirmando lo que entendiste
7. Si el mensaje no tiene tareas claras, tasks es [] y pide más detalle

FORMATO DE RESPUESTA:
{
  "project_id": "uuid-del-proyecto-o-null",
  "tasks": [
    {
      "title": "título claro y accionable de la tarea",
      "priority": "low|medium|high",
      "due_date": "2026-08-05T00:00:00.000Z o null"
    }
  ],
  "response_message": "✅ Listo [nombre]! Agregué X tarea(s) a [proyecto]...",
  "needs_clarification": false,
  "clarification_question": null
}`

export async function parseWhatsAppMessage(
  message: string,
  projects: Project[],
  userName: string,
  recentContext: string = ''
): Promise<ParsedIntent> {
  const projectsText = projects.map(p =>
    `- ID: ${p.id} | Nombre: ${p.name} ${p.emoji} | Categoría: ${p.category}`
  ).join('\n')

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

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  try {
    return JSON.parse(text) as ParsedIntent
  } catch {
    // Si el JSON falla, respuesta de fallback segura
    return {
      project_id: null,
      tasks: [],
      response_message: '🤔 No entendí bien. ¿Puedes repetirlo de otra forma? Por ejemplo: "Agregar tarea X al proyecto Y para mañana".',
      needs_clarification: true,
      clarification_question: '¿A qué proyecto pertenece esto?',
    }
  }
}
