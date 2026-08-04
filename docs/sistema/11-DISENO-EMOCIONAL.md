# DISEÑO EMOCIONAL — La Diferencia entre una App Genérica y una Premium

> **Cuándo cargar este archivo:**
> - Antes de construir (junto con `05-CREACION.md` y `10-DESIGN-TOKENS.md`)
> - Al pulir una app existente (junto con `07-PULIDO.md`)
> - Cuando la app "funciona" pero se siente genérica, fría, o "hecha con IA"

## Objetivo
Una app que solo funciona no se diferencia de nada. Lo que vende, retiene y genera boca a boca es cómo SIENTE el usuario cuando la usa. Este archivo convierte una app funcional en una experiencia que la gente recuerda, recomienda y paga por mantener.

---

## LOS 3 NIVELES DEL DISEÑO EMOCIONAL (Don Norman)

Toda experiencia emocional se procesa en 3 niveles. Los 3 deben estar presentes:

### Nivel 1 — Visceral: "Se ve increíble"
La primera reacción instintiva. Ocurre en menos de 50 milisegundos. El usuario aún no ha leído nada, no ha clickeado nada, pero ya SIENTE si la app es profesional o amateur.

**Qué lo activa:**
- Paleta de colores con intención (no defaults de Tailwind)
- Tipografía con carácter (no Inter/Roboto genéricos)
- Espaciado generoso que transmite calma y control
- Gradientes, texturas o efectos sutiles que dan profundidad
- Animaciones de entrada que dan vida a la pantalla
- Contraste visual claro entre lo importante y lo secundario

**Test rápido:** Toma un screenshot de tu app y ponlo al lado de Revolut, Phantom, o Linear. Si tu screenshot se ve plano, gris, o genérico, el nivel visceral está fallando.

**Lo que Revolut hace bien a nivel visceral:**
- Fondo oscuro que transmite premium y sofisticación
- Colores vibrantes solo en datos importantes (balances, gráficos)
- Tarjetas virtuales con gradientes que se sienten como objetos reales
- Tipografía limpia con mucho espacio negativo

**Lo que Phantom hace bien a nivel visceral:**
- Gradientes de purple a blue que se sienten únicos de la marca
- Animaciones fluidas en cada transición (no cortes bruscos)
- Glassmorphism sutil que da profundidad
- El momento de "wallet creada" tiene una animación de celebración que no parece necesaria pero se siente increíble

### Nivel 2 — Conductual: "Se usa sin pensar"
El placer de usar algo que funciona perfectamente. No es visual — es la sensación de fluidez, de que la app anticipa lo que necesitas.

**Qué lo activa:**
- Acciones que se completan en 1-2 toques
- Respuestas instantáneas a cada interacción (<100ms)
- Transiciones suaves entre pantallas (no cortes abruptos)
- Undo inteligente en vez de confirmaciones molestas
- Predictibilidad: el usuario sabe qué va a pasar antes de que pase
- La información correcta en el momento correcto (no antes, no después)

**Lo que Duolingo hace bien a nivel conductual:**
- La lección completa cabe en una pantalla (no hay scroll)
- Feedback inmediato: correcto = verde + sonido + avance, incorrecto = rojo suave + explicación
- El error se siente SEGURO, no punitivo. Animación gentil, no pantalla roja
- Cada sesión dura exactamente el tiempo que el usuario tiene (3-5 min)

**Lo que Revolut hace bien a nivel conductual:**
- Enviar dinero toma 3 toques: elegir contacto → monto → confirmar
- Las transacciones aparecen al instante con animación de deslizamiento
- Swipe para ver más detalles, swipe para volver. Cero fricción.

### Nivel 3 — Reflexivo: "Soy parte de algo"
La historia que el usuario se cuenta a sí mismo sobre la app. La identidad, el orgullo, la pertenencia.

**Qué lo activa:**
- La app hace que el usuario se sienta inteligente/capaz/productivo
- Métricas de progreso que muestran cuánto ha logrado
- Marca con personalidad que el usuario quiere asociar consigo mismo
- Momentos de logro que se pueden compartir
- La sensación de que "esta app me entiende"

**Lo que Duolingo hace bien a nivel reflexivo:**
- "Llevas 47 días de racha" → el usuario se siente disciplinado
- Ligas y rankings → el usuario se siente competitivo
- Duo (la mascota) manda notificaciones con personalidad → se siente como una relación
- El certificado de curso completado → orgullo compartible

**Lo que Phantom hace bien a nivel reflexivo:**
- El portafolio se ve elegante, no como un Excel de números
- El usuario se siente como un "early adopter sofisticado"
- La estética premium transmite que sus activos están en un lugar serio

---

## IMPLEMENTACIÓN PRÁCTICA: 7 Capas de Emoción

### Capa 1: Personalidad de la App
Toda app tiene personalidad, incluso si no la defines a propósito. Si no la defines, la personalidad por defecto es "herramienta genérica sin alma."

**Ejercicio: Define la personalidad en 3 adjetivos**
Ejemplo:
- App de productividad: "Precisa, tranquila, confiable" (como un asistente senior)
- App de fitness: "Energética, motivadora, directa" (como un coach personal)
- App de finanzas: "Segura, elegante, clara" (como un banker suizo)
- App de educación: "Amigable, paciente, celebratoria" (como un buen profesor)
- App creativa: "Inspiradora, audaz, fluida" (como un director artístico)

**Estos 3 adjetivos definen TODO:**
- El tono del copy (formal/casual, entusiasta/sereno)
- La paleta de colores (vibrante/sobria, cálida/fría)
- Las animaciones (rápidas y enérgicas / suaves y fluidas)
- Los sonidos (si se usan)
- La mascota o avatar (si se usa)
- Los momentos de celebración (explosión de confetti vs. check sutil)

### Capa 2: Primer Contacto (los primeros 10 segundos)
El usuario forma una opinión en 50ms. En 10 segundos ya decidió si se queda o se va.

**Checklist del primer contacto:**
```
[ ] ¿La primera pantalla comunica QUÉ HACE la app en <5 segundos?
[ ] ¿Hay un elemento visual que capture la atención? (no solo texto)
[ ] ¿El color primario se siente diferenciado? (no el azul default de Tailwind)
[ ] ¿La tipografía tiene personalidad?
[ ] ¿Hay una animación sutil de entrada? (fade-in del contenido, no pantalla estática)
[ ] ¿El CTA principal es imposible de ignorar?
[ ] ¿Se siente premium o se siente template?
```

**Patrón de animación de primer contacto:**
```css
/* Los elementos aparecen escalonados, no todos de golpe */
.hero-title { animation: fadeSlideUp 0.6s ease-out 0.1s both; }
.hero-subtitle { animation: fadeSlideUp 0.6s ease-out 0.2s both; }
.hero-cta { animation: fadeSlideUp 0.6s ease-out 0.3s both; }
.hero-visual { animation: fadeSlideUp 0.6s ease-out 0.4s both; }

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Capa 3: Momentos de Celebración
Los momentos donde la app reconoce los logros del usuario. La mayoría de las apps los ignoran. Las apps premium los convierten en micro-momentos de dopamina.

**Cuándo celebrar:**
- Primera acción completada: "¡Tu primera [X] está lista! 🎉"
- Hito de uso: "Llevas 10 / 50 / 100 resultados generados"
- Racha de días: "3 días consecutivos usándolo. ¡Vas muy bien!"
- Conversión a Pro: "Bienvenido/a al equipo Pro. Ahora tienes acceso a todo."
- Logro inesperado: "Tu resultado de hoy fue 40% más largo que el promedio. ¡Productividad!"

**Cómo celebrar (niveles de intensidad):**
```
Nivel 1 — Sutil (para acciones frecuentes):
  Toast con ícono ✓ y mensaje breve. Desaparece en 3s.
  Ejemplo: "Guardado ✓"

Nivel 2 — Notable (para hitos):
  Banner animado con mensaje personalizado.
  Ejemplo: "🎉 ¡Primer resultado generado! Ya eres parte del club."

Nivel 3 — Celebración (para logros importantes):
  Animación especial: confetti, burst de partículas, o animación del logo.
  Ejemplo: Al completar el onboarding o al hacer upgrade a Pro.
  Duración: 1.5-2 segundos. Nunca más. Nunca bloquear la app.
```

**Implementación de confetti simple:**
```typescript
// Librería ligera: canvas-confetti (2KB gzipped)
import confetti from 'canvas-confetti';

function celebrate() {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: [/* reemplazar por los colores REALES del brand kit (PASO 0 de 16) — NO el azul default */], // del brand kit, no hex genérico
  });
}
```

---

### Sistema de Gamificación Profundo (más allá de las rachas)

> **Sistema completo en `24-GAMIFICACION.md`.** Este archivo (11) define el *tono emocional* de la gamificación (los 3 adjetivos, la intensidad de cada celebración, celebrar solo hitos reales). El archivo `24` define el *sistema*: loop del hábito (Hooked), mecánica de rachas con streak freeze, XP y niveles, recompensa variable, ligas, re-enganche, modelo de datos y anti-patrones. Cárgalos juntos al diseñar retención. Lo de abajo es el resumen de tipos de logros — el detalle vive en `24`.

Una racha de días es el nivel 0 de la gamificación. Las apps que mejor retienen tienen múltiples tipos de reconocimiento. Si la app tiene algún elemento de uso frecuente o progreso, implementar AL MENOS 3 de estos:

```
TIPOS DE LOGROS (elegir los que aplican al nicho de la app):

1. RACHAS DE CONSTANCIA (uso diario/semanal consecutivo)
   → 3 días, 7 días, 30 días, 100 días
   → Recuperación de racha: "Llevas 1 día de pausa — tu racha anterior fue X días"
   → Nunca mostrar "perdiste tu racha" en negativo — siempre en positivo

2. HITOS DE VOLUMEN (cuánto ha hecho el usuario en total)
   → 1er contenido, 10, 50, 100, 500 creados/publicados/completados
   → Estos no se pierden nunca — son acumulativos y permanentes

3. RÉCORDS PERSONALES (el mejor resultado del usuario vs su propio historial)
   → "Tu semana más productiva" / "Tu mejor mes" / "Nuevo récord"
   → Comparar contra el propio usuario, nunca contra otros (sin presión social)

4. METAS COMPLETADAS (objetivos que el usuario se puso)
   → El usuario define una meta → la app celebra cuando se alcanza
   → "Querías publicar 3 veces por semana — lo lograste 4 semanas seguidas"

5. PRIMERAS VECES (onboarding progresivo y natural)
   → Primera publicación / Primera semana completada / Primera marca creada
   → Los "primeras veces" son los logros más fáciles y más motivadores

6. NIVEL DE MAESTRÍA (basado en uso avanzado)
   → Desbloquear features o vistas avanzadas al demostrar dominio del básico
   → "Ya dominas [función X] — aquí tienes [función Y] más avanzada"

REGLAS DE LA GAMIFICACIÓN ÉTICA:
- Los logros se ganan con progreso REAL, no con tiempo en la app
- Nunca quitar un logro ya ganado
- Nunca mostrar logros de otros usuarios para crear presión social
- La recuperación siempre es fácil (efecto Zeigarnik positivo)
- Los logros tienen íconos/visuales únicos que se acumulan en el perfil
- Celebrar con la intensidad correcta según el nivel (no confetti por guardar un borrador)
```

### Capa 4: Respuesta Emocional al Error
Cómo maneja la app los errores define más la experiencia que cómo maneja los éxitos.

**Principio Duolingo: "Fallar debe sentirse seguro."**

```
❌ Error frío:
  → Pantalla roja con "Error 500"
  → El usuario siente: "Se rompió. Es mi culpa?"

❌ Error genérico:
  → Toast: "Algo salió mal"
  → El usuario siente: "¿Y ahora qué hago?"

✅ Error empático:
  → Pantalla suave con ícono amigable
  → "No pudimos generar tu resultado. A veces pasa.
     Intenta con un texto más corto o prueba de nuevo →"
  → El usuario siente: "Ok, no es grave, lo intento de nuevo"

✅ Error con personalidad (si la app lo permite):
  → "Ups, la IA se tomó un café. Dale un segundo e inténtalo de nuevo ☕"
  → El usuario siente: "Jaja, ok, le doy retry"
```

**Regla de oro:** El mensaje de error debe hacer que el usuario sienta que TODO ESTÁ BAJO CONTROL, no que algo se rompió. Y siempre debe ser ACCIONABLE: además de empático, dice exactamente qué hacer a continuación. "No pudimos generar tu resultado" es empático pero incompleto; "No pudimos generar tu resultado. Intenta con un texto más corto o toca Reintentar" es empático Y accionable. Todo error termina con una salida clara.

### Capa 5: Transiciones y Movimiento
El movimiento comunica relaciones, jerarquía y cambio de estado. No es decoración.

**Principios de movimiento:**

```
1. Entrar y salir: Todo lo que aparece, aparece con animación (fade + slide).
   Todo lo que desaparece, desaparece con animación (fade out).
   Nunca pop-in/pop-out instantáneo.

2. Dirección con significado:
   - Avanzar en un flujo → contenido entra desde la derecha
   - Retroceder → contenido entra desde la izquierda
   - Abrir detalle → contenido sube desde abajo (bottom sheet)
   - Cerrar/descartar → contenido baja o se desvanece

3. Duración:
   - Micro (hover, toggle): 100-150ms
   - Estándar (modales, toasts): 200-300ms
   - Transiciones de página: 300-400ms
   - Celebraciones: 500-800ms
   - NUNCA más de 1 segundo. Se siente lento.

4. Curva de easing:
   - Entrar: ease-out (rápido al inicio, suave al final)
   - Salir: ease-in (suave al inicio, rápido al final)
   - Movimiento continuo: ease-in-out
   - Rebote/spring: cubic-bezier(0.34, 1.56, 0.64, 1)
   - NUNCA linear (se siente robótico)
```

### Capa 6: Sonido y Háptica (Opcional pero Premium)
Las apps que más se recuerdan usan sonido: Duolingo, Slack (knock brush), iMessage.

**Cuándo añadir sonido:**
- Acción completada exitosamente (un "ding" sutil)
- Error (un "bonk" suave, no un pitido agresivo)
- Logro/celebración (fanfarria breve)
- Notificación (sonido distintivo de la marca)

**Reglas de sonido:**
- SIEMPRE dar opción de silenciar
- Desactivado por defecto en web apps (activar solo si el usuario lo elige)
- Sonidos de <1 segundo para acciones frecuentes
- El sonido debe ser CONSISTENTE con la personalidad (app seria = sonidos sobrios)

**Háptica en mobile (si es PWA o nativa):**
```javascript
// Vibración sutil al completar acción
navigator.vibrate?.(10); // 10ms — apenas perceptible pero se siente

// Vibración de error
navigator.vibrate?.([15, 50, 15]); // Doble pulso corto
```

### Capa 7: La Pregunta Final — "¿Esto se siente genérico?"

Antes de dar la app por terminada, hacer esta auditoría:

```
VISCERAL (se ve)
[ ] ¿Los colores se sienten únicos o son defaults de Tailwind?
[ ] ¿La tipografía tiene personalidad o es Inter/system-ui?
[ ] ¿Hay al menos un elemento visual memorable? (gradiente, ilustración, forma)
[ ] ¿Las pantallas tienen "espacio para respirar" o están apretadas?
[ ] ¿Hay una animación de entrada en la primera pantalla?

CONDUCTUAL (se usa)
[ ] ¿Las acciones principales se completan en ≤3 toques?
[ ] ¿Hay feedback inmediato en cada interacción? (<100ms)
[ ] ¿Las transiciones entre pantallas son suaves?
[ ] ¿Los errores se sienten seguros y guían hacia la solución?
[ ] ¿El loading se siente activo (mensajes, skeleton) o muerto (spinner)?

REFLEXIVO (se siente)
[ ] ¿La app tiene personalidad definida? (3 adjetivos)
[ ] ¿Hay momentos de celebración en hitos del usuario?
[ ] ¿El copy suena como una persona, no como un software?
[ ] ¿El usuario se siente más capaz/inteligente/productivo al usarla?
[ ] ¿Hay algo que haría que el usuario le muestre la app a un amigo?

DIFERENCIACIÓN
[ ] Si quito el logo, ¿se distingue de cualquier otra app del nicho?
[ ] ¿Hay un "momento WOW" que no esperaba encontrar?
[ ] ¿La primera impresión dice "profesional" o "hecho con template"?
```

---

## ANTI-PATRONES EMOCIONALES

```
❌ Celebrar todo: Si todo tiene confetti, nada tiene confetti.
   Solo celebrar hitos genuinos.

❌ Humor forzado: "¡Oopsie doopsie! Algo salió malito 🙈"
   El humor debe encajar con la personalidad. Si la app es seria, no seas gracioso.

❌ Animaciones en todo: Si todo se mueve, nada se destaca y la app se siente lenta.
   Las animaciones son para momentos de cambio de estado, no para decoración.

❌ Dark mode como personalidad: El modo oscuro no es sustituto de diseño emocional.
   Una app fea en modo oscuro sigue siendo una app fea.

❌ Copiar la personalidad de otra app: Duolingo funciona siendo juguetón porque
   es educación. Una app de finanzas con mascota y confetti se sentiría infantil.
   Tu personalidad debe nacer de TU audiencia.

❌ Sonidos sin control de volumen: Si el usuario no puede silenciarlos,
   es una agresión, no una feature.

❌ Micro-interacciones que interfieren: La animación no debe bloquear
   la siguiente acción del usuario. Nunca obligar a esperar una animación.
```

---

## PLANTILLA: Definición de Diseño Emocional para tu App

Al inicio de cada proyecto, completar:

```markdown
## DISEÑO EMOCIONAL — [Nombre de la App]

### Personalidad
3 adjetivos: [___], [___], [___]
Si la app fuera una persona, sería: [descripción en 1 línea]
Tono de voz: [formal/casual] + [entusiasta/sereno] + [técnico/simple]

### Primer Contacto
Qué siente el usuario en los primeros 10 segundos: [___]
Elemento visual memorable: [___]
Animación de entrada: [sí/no, descripción]

### Momentos de Celebración
1. [Hito] → [Tipo de celebración]
2. [Hito] → [Tipo de celebración]
3. [Hito] → [Tipo de celebración]

### Experiencia de Error
Tono de los errores: [empático/humorístico/neutro]
Mensaje de error genérico: "[___]"

### Movimiento
Estilo general: [suave y fluido / rápido y enérgico / mínimo y preciso]
Duración base: [___]ms

### Sonido (si aplica)
[Sí/No]
Estilo: [___]
```


---

## LA FÓRMULA DE DISEÑO EMOCIONAL (los 7 elementos que hacen que el usuario quiera volver)

El diseño emocional no es decoración. Es la suma de sensaciones que hacen que el usuario sienta que fue entendido, que puede hacerlo y que fue diseñado para él. No es sobre colores ni animaciones — si eliminas colores, ilustraciones y animaciones, la app todavía debe sentirse clara y humana por su flujo, copy, feedback, control y progreso. Los visuales amplifican esa base; no la reemplazan.

| Elemento | Qué debe producir | Cómo medirlo |
|---|---|---|
| **Claridad** | El usuario entiende qué hacer y por qué importa | ¿Lo entiende sin explicación? |
| **Progreso** | La app muestra avance visible y celebra hitos reales | ¿El usuario siente que avanza? |
| **Control** | Se puede corregir, volver, cancelar, editar y decidir | ¿El usuario se siente seguro explorando? |
| **Personalidad** | La app tiene una voz reconocible y coherente | ¿Suena distinto a un template genérico? |
| **Ritmo** | La experiencia alterna foco, acción, espera y recompensa sin saturar | ¿Hay momentos de calma entre acciones? |
| **Confianza** | La app explica, no manipula, no exagera y respeta datos | ¿El usuario se siente seguro dando sus datos? |
| **Memoria** | Recuerda lo útil para reducir esfuerzo (no para invadir) | ¿La app recuerda lo importante sin pedir de más? |

**Prueba práctica de la fórmula:** Elimina mentalmente colores, ilustraciones y animaciones. ¿La app todavía se siente clara, progresiva, controlable, con personalidad, rítmica, confiable y con memoria? Si no, el diseño emocional está en la superficie, no en la estructura.

### Reglas de voz y personalidad
```
- Definir rasgos de tono con ejemplos permitidos Y prohibidos (ej: "optimista, directa, juguetona;
  nunca culposa, sarcástica ni exagerada")
- Modular según el contexto del usuario:
  - Éxito: más expresivo
  - Decisión: ser claro sobre todo
  - Error: ser calmado y accionable
  - Sensible (pago, pérdida, dato importante): ser sobrio, nunca gracioso
- Nunca: culpar al usuario por no volver, convertir notificaciones en memes,
  usar cercanía falsa con datos sensibles
- La personalidad debe hacer MÁS CLARO y agradable el uso, no competir con la tarea
```

### Mandamiento del diseño emocional
**Diseñar emoción, no decoración.** Una animación puede confirmar, orientar, celebrar o explicar. Si solo retrasa, distrae o intenta parecer premium, es decoración. Duolingo no funciona por su mascota — funciona porque la mascota está integrada al sistema de motivación. Lo mismo aplica a cualquier app: no agregar una mascota si el flujo sigue siendo frío o confuso.
