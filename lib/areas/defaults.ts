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
      'Estoy conforme con mi apariencia',
      'Siento un buen nivel de energía',
      'Mi peso y masa corporal son adecuados',
      'Procuro tener una dieta equilibrada',
      'Me caracteriza la resistencia y perseverancia',
      'Mi estado de salud es bueno',
      'Soy mi palabra en cuanto a mi salud',
    ],
  },
  {
    name: 'Desarrollo Personal',
    emoji: '🧠',
    color: '#6B8AF0',
    description: 'Crecimiento, aprendizaje, valores y propósito',
    order_index: 1,
    questions: [
      'Soy coherente en lo que pienso, digo y hago',
      'Dedico tiempo a mi crecimiento personal',
      'Invierto en mí misma',
      'Disfruto momentos de tranquilidad y paz',
      'Actúo basada en principios y valores',
      'Tengo buena imagen de mí misma y autoestima',
      'Manejo adecuadamente el estrés',
      'Soy mi palabra en desarrollo personal',
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
      'La relación con mis padres es buena',
      'Hay buena relación con los amigos',
      'Tengo buena comunicación con mis seres queridos',
      'Siento que mi familia tiene una buena vida',
      'En la familia soy fuente de unión',
      'Soy mi palabra en mis relaciones',
    ],
  },
  {
    name: 'Dinero y Finanzas',
    emoji: '💰',
    color: '#F59E0B',
    description: 'Ingresos, ahorros, inversiones y presupuesto',
    order_index: 3,
    questions: [
      'Gano lo suficiente para una vida tranquila',
      'Tengo una economía sana',
      'Mi presupuesto personal está bien administrado',
      'Llevo un buen control de compras grandes',
      'Administro bien las compras del día a día',
      'Mis gastos son menores a mis ingresos',
      'Puedo ahorrar mensualmente',
      'Soy mi palabra en mis finanzas',
    ],
  },
  {
    name: 'Trabajo y/o Estudio',
    emoji: '💼',
    color: '#8B5CF6',
    description: 'Carrera, proyectos profesionales y formación',
    order_index: 4,
    questions: [
      'Genero posibilidades de desarrollo',
      'Mi trabajo y/o carrera son estimulantes',
      'Trabajo en un lugar que me gusta',
      'Mi ambiente de trabajo es agradable',
      'Siento que valoran mis capacidades',
      'Me preparo continuamente para crecer',
      'Soy mi palabra en mi trabajo y carrera',
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
      'Cuido a mis amistades',
      'Cuento con gente en quien puedo confiar',
      'Participo en la comunidad y trabajos sociales',
      'Aporto a otras personas y trasciendo',
      'Soy responsable con el medio ambiente',
      'Soy equipo con quienes me rodean',
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
      'Hago ejercicio o deporte de forma continua',
      'Practico algún hobby',
      'Disfruto la lectura, cine, teatro o cultura',
      'Logro desconectarme del trabajo en mi tiempo libre',
      'Puedo tener paz y tranquilidad',
      'Disfruto mi tiempo libre y mi soledad',
      'Soy mi palabra en mi recreación',
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
      'Busco actividades para mi crecimiento personal',
      'Trabajo mis puntos débiles',
      'Vivo en confianza y gratitud',
      'Me ocupo del crecimiento de los míos',
      'Soy mi palabra en mi espiritualidad',
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
