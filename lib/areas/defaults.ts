export interface AreaDefault {
  name: string
  emoji: string
  color: string
  description: string
  order_index: number
  questions: string[]
}

export const DEFAULT_AREAS: AreaDefault[] = [
  {
    name: 'Salud y Cuerpo Físico',
    emoji: '💪',
    color: '#10B981',
    description: 'Bienestar físico, energía, alimentación y ejercicio',
    order_index: 0,
    questions: [
      'Siento un buen nivel de energía',
      'Procuro tener una dieta equilibrada',
      'Mi estado de salud es bueno',
      'Me caracteriza la resistencia y perseverancia',
    ],
  },
  {
    name: 'Desarrollo Personal',
    emoji: '🧠',
    color: '#6B8AF0',
    description: 'Crecimiento, aprendizaje, valores y propósito',
    order_index: 1,
    questions: [
      'Dedico tiempo a mi crecimiento personal',
      'Invierto en mí misma',
      'Tengo buena imagen de mí misma y autoestima',
      'Manejo adecuadamente el estrés',
    ],
  },
  {
    name: 'Relaciones',
    emoji: '❤️',
    color: '#F06B8A',
    description: 'Familia, pareja, amigos y vínculos importantes',
    order_index: 2,
    questions: [
      'Separo el tiempo adecuado para la familia',
      'Mi relación de pareja es satisfactoria',
      'Hay buena relación con los amigos',
      'Tengo buena comunicación con mis seres queridos',
    ],
  },
  {
    name: 'Dinero y Finanzas',
    emoji: '💰',
    color: '#F59E0B',
    description: 'Ingresos, ahorros, inversiones y presupuesto',
    order_index: 3,
    questions: [
      'Tengo una economía sana',
      'Mi presupuesto personal está bien administrado',
      'Mis gastos son menores a mis ingresos',
      'Puedo ahorrar mensualmente',
    ],
  },
  {
    name: 'Trabajo y/o Estudio',
    emoji: '💼',
    color: '#8B5CF6',
    description: 'Carrera, proyectos profesionales y formación',
    order_index: 4,
    questions: [
      'Mi trabajo y/o carrera son estimulantes',
      'Mi ambiente de trabajo es agradable',
      'Siento que valoran mis capacidades',
      'Me preparo continuamente para crecer',
    ],
  },
  {
    name: 'Comunidad',
    emoji: '🌱',
    color: '#14B8A6',
    description: 'Amistades, entorno, equipo y medio ambiente',
    order_index: 5,
    questions: [
      'Tengo amistades de calidad',
      'Cuento con gente en quien puedo confiar',
      'Aporto a otras personas y trasciendo',
      'Participo en la comunidad y trabajos sociales',
    ],
  },
  {
    name: 'Recreación',
    emoji: '🎮',
    color: '#F97316',
    description: 'Hobbies, entretenimiento, descanso y diversión',
    order_index: 6,
    questions: [
      'Dedico tiempo para recrearme y entretenerme',
      'Practico algún hobby',
      'Logro desconectarme del trabajo en mi tiempo libre',
      'Puedo tener paz y tranquilidad',
    ],
  },
  {
    name: 'Espiritualidad',
    emoji: '✨',
    color: '#EC4899',
    description: 'Propósito, paz interior, metas y realización personal',
    order_index: 7,
    questions: [
      'Tengo claras mis metas',
      'Soy coherente en mi vida con mis valores',
      'Vivo en confianza y gratitud',
      'Busco actividades para mi crecimiento personal',
    ],
  },
]

// XP thresholds per avatar level
export const AVATAR_LEVELS = [
  { level: 1, minXp: 0,   label: 'Semilla',    description: 'Apenas empezando' },
  { level: 2, minXp: 15,  label: 'Brote',      description: 'Tomando impulso' },
  { level: 3, minXp: 40,  label: 'Creciendo',  description: 'Con ritmo propio' },
  { level: 4, minXp: 90,  label: 'Floreciendo', description: 'En pleno desarrollo' },
  { level: 5, minXp: 180, label: 'Estrella',   description: 'Área dominada' },
]

export function getAvatarLevel(xp: number) {
  for (let i = AVATAR_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= AVATAR_LEVELS[i].minXp) return AVATAR_LEVELS[i]
  }
  return AVATAR_LEVELS[0]
}

export function getNextLevel(xp: number) {
  const current = getAvatarLevel(xp)
  return AVATAR_LEVELS.find(l => l.level === current.level + 1) ?? null
}

// ── FLOWLING (avatar global único por usuario) ──────────────────────────────

export const FLOWLING_LEVELS = [
  { level: 1, minXp: 0,    label: 'Semilla',          stageIdx: 0, description: 'Acaba de despertar' },
  { level: 2, minXp: 50,   label: 'Brote',            stageIdx: 1, description: 'Tomando impulso' },
  { level: 3, minXp: 150,  label: 'Explorador',       stageIdx: 2, description: 'Explorando su potencial' },
  { level: 4, minXp: 400,  label: 'Maestro del Flow', stageIdx: 3, description: 'Dominando su vida' },
  { level: 5, minXp: 1000, label: 'Guardián Flow',    stageIdx: 4, description: 'Ser de luz y equilibrio' },
]

export function getFlowlingLevel(xp: number) {
  for (let i = FLOWLING_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= FLOWLING_LEVELS[i].minXp) return FLOWLING_LEVELS[i]
  }
  return FLOWLING_LEVELS[0]
}

export function getFlowlingNextLevel(xp: number) {
  const cur = getFlowlingLevel(xp)
  return FLOWLING_LEVELS.find(l => l.level === cur.level + 1) ?? null
}
