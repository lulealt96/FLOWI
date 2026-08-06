export type SpeciesId = 'bloom' | 'nova' | 'kiro' | 'momo' | 'octi' | 'ember' | 'lumi' | 'sage'

export interface SpeciesConfig {
  id:       SpeciesId
  name:     string
  emoji:    string
  tagline:  string
  dark:     string                     // eye / mouth color
  stages:   [string, string][]         // [c1, c2] per stage (0-4)
  feature:  string
  traits:   string[]
}

export const SPECIES: Record<SpeciesId, SpeciesConfig> = {
  bloom: {
    id: 'bloom', name: 'Bloom', emoji: '🌱', tagline: 'Crecimiento y bienestar',
    dark: '#1C4D38',
    stages: [
      ['#C8EEDF','#9DDEC6'],
      ['#8DD9B3','#6CC99A'],
      ['#52C48D','#38B274'],
      ['#30B578','#1EA365'],
      ['#1EA86B','#0D9254'],
    ],
    feature: 'leaf',
    traits: ['Constante', 'Saludable', 'En equilibrio'],
  },
  nova: {
    id: 'nova', name: 'Nova', emoji: '⚡', tagline: 'Productividad y precisión',
    dark: '#1e2d6e',
    stages: [
      ['#DBEAFE','#BAD8FD'],
      ['#BFDBFE','#93C5FD'],
      ['#6B8AF0','#4F6EDD'],
      ['#4361C4','#2D4DA8'],
      ['#2D4B9F','#1E3484'],
    ],
    feature: 'antenna',
    traits: ['Eficiente', 'Directo', 'Analítico'],
  },
  kiro: {
    id: 'kiro', name: 'Kiro', emoji: '🦊', tagline: 'Organización y emprendimiento',
    dark: '#7C2D12',
    stages: [
      ['#FEF3C7','#FDE68A'],
      ['#FED7AA','#FDBA74'],
      ['#F97316','#EA7006'],
      ['#EA580C','#C84B0A'],
      ['#C2410C','#A33508'],
    ],
    feature: 'fox-ears',
    traits: ['Organizador', 'Emprendedor', 'Ágil'],
  },
  momo: {
    id: 'momo', name: 'Momo', emoji: '🐼', tagline: 'Equilibrio y calma',
    dark: '#1F2937',
    stages: [
      ['#F9FAFB','#F3F4F6'],
      ['#F3F4F6','#E5E7EB'],
      ['#E5E7EB','#D1D5DB'],
      ['#D1D5DB','#9CA3AF'],
      ['#9CA3AF','#6B7280'],
    ],
    feature: 'panda-ears',
    traits: ['Equilibrado', 'Tranquilo', 'Presente'],
  },
  octi: {
    id: 'octi', name: 'Octi', emoji: '🐙', tagline: 'Multitarea y creatividad',
    dark: '#2e1065',
    stages: [
      ['#F5F3FF','#EDE9FE'],
      ['#EDE9FE','#DDD6FE'],
      ['#C4B5FD','#A78BFA'],
      ['#A78BFA','#8B5CF6'],
      ['#7C3AED','#6D28D9'],
    ],
    feature: 'tentacles',
    traits: ['Multitarea', 'Curioso', 'Adaptable'],
  },
  ember: {
    id: 'ember', name: 'Ember', emoji: '🐉', tagline: 'Disciplina y retos',
    dark: '#7F1D1D',
    stages: [
      ['#FEF2F2','#FECACA'],
      ['#FECACA','#FCA5A5'],
      ['#F87171','#EF4444'],
      ['#EF4444','#DC2626'],
      ['#DC2626','#B91C1C'],
    ],
    feature: 'horns',
    traits: ['Disciplinado', 'Retador', 'Persistente'],
  },
  lumi: {
    id: 'lumi', name: 'Lumi', emoji: '👻', tagline: 'Creatividad y expresión',
    dark: '#701a75',
    stages: [
      ['#FDF4FF','#FAE8FF'],
      ['#FAE8FF','#F5D0FE'],
      ['#F0ABFC','#E879F9'],
      ['#E879F9','#D946EF'],
      ['#C026D3','#A21CAF'],
    ],
    feature: 'sparkles',
    traits: ['Creativo', 'Expresivo', 'Libre'],
  },
  sage: {
    id: 'sage', name: 'Sage', emoji: '🦉', tagline: 'Aprendizaje y sabiduría',
    dark: '#78350F',
    stages: [
      ['#FFFBEB','#FEF3C7'],
      ['#FEF3C7','#FDE68A'],
      ['#FDE68A','#FCD34D'],
      ['#F59E0B','#D97706'],
      ['#D97706','#B45309'],
    ],
    feature: 'owl-feathers',
    traits: ['Estudioso', 'Reflexivo', 'Sabio'],
  },
}

export const SPECIES_LIST = Object.values(SPECIES)

// ── Quiz ────────────────────────────────────────────────────────────────────

export interface QuizOption {
  emoji:  string
  label:  string
  scores: Partial<Record<SpeciesId, number>>
}

export interface QuizQuestion {
  question: string
  options:  QuizOption[]
}

export const QUIZ: QuizQuestion[] = [
  {
    question: '¿Cómo describirías tu forma de ser?',
    options: [
      { emoji: '🌿', label: 'Constante y cuido mis hábitos',           scores: { bloom: 3, momo: 2 } },
      { emoji: '⚡', label: 'Eficiente y voy directo a lo que importa', scores: { nova: 3, kiro: 2  } },
      { emoji: '🌊', label: 'Creativa y sigo la inspiración',           scores: { lumi: 3, octi: 2  } },
      { emoji: '🔥', label: 'Me reto y me exijo para crecer',           scores: { ember: 3, sage: 2 } },
    ],
  },
  {
    question: '¿Qué te da más satisfacción en el día a día?',
    options: [
      { emoji: '💆', label: 'Sentirme en equilibrio y con energía',     scores: { momo: 3, bloom: 2 } },
      { emoji: '🎯', label: 'Completar proyectos y lograr mis metas',   scores: { kiro: 3, nova: 2  } },
      { emoji: '📚', label: 'Aprender algo nuevo cada semana',          scores: { sage: 3, nova: 1  } },
      { emoji: '🎨', label: 'Crear algo único que nadie más haría',     scores: { octi: 3, lumi: 2  } },
    ],
  },
  {
    question: '¿Cómo prefieres organizarte y trabajar?',
    options: [
      { emoji: '📋', label: 'Con rutinas y sistemas bien definidos',    scores: { nova: 3, kiro: 2  } },
      { emoji: '🧩', label: 'Con varios proyectos abiertos a la vez',   scores: { octi: 3, ember: 1 } },
      { emoji: '🧘', label: 'Con pausas y sin presión de tiempo',       scores: { bloom: 3, momo: 2 } },
      { emoji: '🏆', label: 'Con metas claras y retos que superar',     scores: { ember: 3, sage: 2 } },
    ],
  },
  {
    question: '¿Qué área de tu vida quieres transformar más?',
    options: [
      { emoji: '💪', label: 'Mi salud, energía y bienestar',            scores: { bloom: 3, momo: 2 } },
      { emoji: '🚀', label: 'Mi productividad y proyectos',             scores: { kiro: 3, nova: 2  } },
      { emoji: '🧠', label: 'Mi aprendizaje y crecimiento personal',    scores: { sage: 3, octi: 1  } },
      { emoji: '✨', label: 'Mi creatividad y expresión',                scores: { lumi: 3, ember: 1 } },
    ],
  },
]

export function computeQuizResult(answers: number[]): SpeciesId[] {
  const scores: Record<string, number> = {}
  QUIZ.forEach((q, qi) => {
    const ai = answers[qi]
    if (ai < 0) return
    Object.entries(q.options[ai].scores).forEach(([sp, pts]) => {
      scores[sp] = (scores[sp] ?? 0) + (pts ?? 0)
    })
  })
  const ranked = (Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .map(([sp]) => sp) as SpeciesId[])
  // Fill remaining slots with species not in results to always return 3
  const all: SpeciesId[] = ['bloom','nova','kiro','momo','octi','ember','lumi','sage']
  const extra = all.filter(s => !ranked.includes(s))
  return [...ranked, ...extra].slice(0, 3)
}
