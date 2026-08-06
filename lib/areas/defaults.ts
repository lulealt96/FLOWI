export interface AreaDefault {
  name: string
  emoji: string
  color: string
  description: string
  order_index: number
}

export const DEFAULT_AREAS: AreaDefault[] = [
  {
    name: 'Salud y Cuerpo Físico',
    emoji: '💪',
    color: '#10B981',
    description: 'Bienestar físico, energía, alimentación y ejercicio',
    order_index: 0,
  },
  {
    name: 'Desarrollo Personal',
    emoji: '🧠',
    color: '#6B8AF0',
    description: 'Crecimiento, aprendizaje, valores y propósito',
    order_index: 1,
  },
  {
    name: 'Relaciones',
    emoji: '❤️',
    color: '#F06B8A',
    description: 'Familia, pareja, amigos y vínculos importantes',
    order_index: 2,
  },
  {
    name: 'Dinero y Finanzas',
    emoji: '💰',
    color: '#F59E0B',
    description: 'Ingresos, ahorros, inversiones y presupuesto',
    order_index: 3,
  },
  {
    name: 'Trabajo y/o Estudio',
    emoji: '💼',
    color: '#8B5CF6',
    description: 'Carrera, proyectos profesionales y formación',
    order_index: 4,
  },
  {
    name: 'Comunidad',
    emoji: '🌱',
    color: '#14B8A6',
    description: 'Amistades, entorno, equipo y medio ambiente',
    order_index: 5,
  },
  {
    name: 'Recreación',
    emoji: '🎮',
    color: '#F97316',
    description: 'Hobbies, entretenimiento, descanso y diversión',
    order_index: 6,
  },
  {
    name: 'Espiritualidad',
    emoji: '✨',
    color: '#EC4899',
    description: 'Propósito, paz interior, metas y realización personal',
    order_index: 7,
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
