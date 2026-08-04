# ESTADO — Flowi
Última actualización: 2026-08-03 | Sesión actual: 1

## Qué es esta app (3 líneas)
Hub de vida personal que recibe mensajes en lenguaje natural por WhatsApp, los interpreta con IA y los organiza en proyectos y tareas. Dashboard web para visualizar todo. Inicialmente para uso personal de Luisa; diseñada para poder venderse después a mujeres que manejan múltiples contextos de vida.

## Promesa central
"Flowi ayuda a mujeres que manejan múltiples mundos a tener todo organizado sin abrir otra app — solo le hablan a WhatsApp y la IA clasifica cada tarea en el proyecto correcto."

## Reporte de validación
- Veredicto: Oportunidad real — WhatsApp como interfaz principal + español + multi-contexto = brecha no cubierta
- Apps de referencia: LifeO (4.5★) · Lunatask (4.3★) · Life Planner (4.2★, 50K+ reseñas)
- Lo que odian de la competencia: todo mezclado sin separar contextos · notificaciones que ignoran · configuración extensa desde cero
- Brecha LATAM: ninguna app en español combina gestión de proyectos + hábitos + WhatsApp como interfaz principal
- Precio mercado: $5–$15/mes

## Proyectos iniciales de Luisa
Laborales: Ticketcode · Café Delverde · Scoop Sorpresas (ideación)
Personales: Jardín Infantil mamá (contabilidad) · Salud Lucy · Finanzas en pareja · Hábitos · Fechas importantes · LIA (perrita)

## Reglas de la app (lo que NUNCA debe hacer)
- Solo habla cuando Luisa escribe primero (excepción: recordatorios programados + mensaje de bienvenida inicial)
- No mezcla tareas de proyectos distintos sin pedirlo
- No inventa fechas ni prioridades — pregunta antes de asumir
- Muestra lo urgente de hoy, no todos los pendientes a la vez

## Dirección de Arte (NO cambiar sin pedirlo)
- Modo: Claro (light)
- Fondo base: #FAFAF8 con mesh gradient sutil (rosa pálido + lavanda en esquinas)
- Acento principal: #F06B8A (rosa coral) — SOLO en acciones y datos héroe
- Acento secundario: #6B8AF0 (azul pizarra) — categorías y estados
- Superficies: #FFFFFF con shadow: 0 2px 16px rgba(0,0,0,0.06) + border-radius 20px
- Glass: solo en overlays decorativos, nunca sobre contenido
- Tipografía: Plus Jakarta Sans (display + body)
- Personalidad: Cálida · Ordenada · Ligera

## Estrategia de monetización
- Fase 1: personal, sin monetización (solo Luisa)
- Fase 2 (si decide vender): onboarding-first + trial 7 días + suscripción ~$9-12/mes
- Pendiente: diseñar paywall completo si decide escalar

## Gamificación y retención
- Loop: Gatillo [mensaje WA del día] → Acción [clasificar y completar tareas] → Recompensa [confirmación instantánea + vista del día limpio] → Inversión [proyectos e historial acumulado]
- Primera victoria: enviar primer mensaje por WA y ver la tarea creada y clasificada en <10 segundos

## Decisiones técnicas (NO re-discutir)
- Framework: Next.js App Router (necesita webhook para WA + API routes + SSR)
- Stack: Next.js + TypeScript + Tailwind + shadcn/ui + Supabase + WhatsApp Cloud API (Meta) + Claude (Anthropic)
- Idioma UI: Español (LATAM)
- Auth: Supabase Auth — email + Google OAuth (passwordless opcional en v2)
- Modelo IA: claude-haiku-4-5-20251001 para parsing de mensajes WA (rápido y económico); variable AI_MODEL en env
- WA: WhatsApp Cloud API de Meta (gratis hasta 1000 conversaciones/mes)
- Persistencia: Supabase (Postgres con RLS)
- Deploy: Vercel (Cron Jobs para recordatorios)

## Modelo de datos diseñado
### profiles
id (uuid, FK auth.users) · name · avatar_url · whatsapp_phone (text, unique) · created_at · updated_at

### projects
id · user_id (FK, indexed) · name · emoji · color · category ('work'|'personal'|'life') · is_active · sort_order · created_at · updated_at

### tasks
id · user_id (FK, indexed) · project_id (FK, indexed) · title · description · status ('pending'|'in_progress'|'done') · priority ('low'|'medium'|'high') · due_date (timestamptz) · source ('whatsapp'|'web'|'reminder') · raw_message (texto original del WA) · created_at · updated_at

### reminders
id · user_id (FK, indexed) · task_id (FK nullable, indexed) · project_id (FK nullable, indexed) · message · scheduled_at (timestamptz, indexed) · sent_at · status ('pending'|'sent'|'failed') · recurrence ('daily'|'weekly'|null) · created_at · updated_at

### wa_conversations
id · user_id (FK, indexed) · wa_message_id (text, unique) · direction ('inbound'|'outbound') · body · parsed_intent (jsonb) · created_at

## Flujo WhatsApp + IA
1. Luisa escribe al número de WA de Flowi
2. Meta envía el mensaje al webhook: POST /api/whatsapp/webhook
3. Next.js valida firma HMAC + identifica usuario por número de teléfono
4. Claude recibe: mensaje + lista de proyectos de Luisa + contexto del historial reciente
5. Claude devuelve JSON: { project_id, tasks: [{title, due_date, priority}], response_message }
6. Se crean las tareas en Supabase
7. Se envía mensaje de confirmación de vuelta a Luisa por WA

## Mapa de pantallas
1. /login — Acceso con email o Google
2. /onboarding — Bienvenida + vincular número WA + crear primeros proyectos
3. /app — Dashboard principal (hoy: tareas urgentes + proyectos activos)
4. /app/projects/[id] — Vista detalle de un proyecto con sus tareas
5. /app/tasks — Vista global de todas las tareas (con filtros)
6. /app/reminders — Gestión de recordatorios programados
7. /app/settings — Perfil, número WA, preferencias

## Sesiones completadas ✅
- Sesión 1 — Arquitectura + base del proyecto — 2026-08-03
  · Next.js 16 + TypeScript + Tailwind inicializado
  · Design tokens Flowi en globals.css (light-first, rosa coral + azul pizarra)
  · Plus Jakarta Sans configurada como fuente del sistema
  · Supabase client/server/admin en lib/supabase/
  · Variables de entorno completas en .env.local
  · tsc ✓ · build ✓ · dev server ✓ en puerto 3000

- Sesión 2 — Auth + BD + Onboarding + Dashboard — 2026-08-03
  · app/login/page.tsx ✓ · app/register/page.tsx ✓
  · app/auth/callback/route.ts ✓
  · supabase/migrations/001_initial_schema.sql — 5 tablas con RLS aplicado ✓
  · app/onboarding/page.tsx — 3 pasos: nombre, proyectos pre-cargados, WA ✓
  · app/app/layout.tsx — protección de ruta + BottomNav ✓
  · components/BottomNav.tsx — nav 5 destinos, Phosphor icons fill/regular ✓
  · app/app/page.tsx — dashboard SSR con datos reales de Supabase ✓
  · app/app/DashboardClient.tsx — UI: greeting, banner WA, tareas urgentes, grid proyectos ✓
  · tsc ✓ en todo

## Sesión en progreso 🔧
- Sesión 3 — WhatsApp webhook + parsing IA + vistas secundarias (projects/tasks/settings)

## Próximas sesiones 📋
- Sesión 2: Identidad visual (tokens CSS, tipografía, componentes base)
- Sesión 3: WhatsApp webhook + parsing IA (el corazón)
- Sesión 4: Dashboard web
- Sesión 5: Recordatorios + estados completos
- Sesión 6: Pulido + deploy

## Pendientes del usuario (acciones que solo Luisa puede hacer)
- [ ] Crear cuenta de Meta para Developers (para el número de WhatsApp oficial) — se guía cuando lleguemos
- [ ] Activar proyecto en Vercel para el deploy — se guía cuando lleguemos
- [ ] Comprar dominio (opcional al inicio)

## Problemas conocidos
(ninguno aún)

## Notas para la próxima sesión
- Supabase ya configurado con credenciales en .env.local ✅
- El proyecto se llama "flowi" — carpeta ya existe en el sistema
- Arrancar con: npx create-next-app@latest . (en la carpeta flowi)
