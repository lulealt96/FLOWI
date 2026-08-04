# 📖 INSTRUCCIONES — Cómo Usar Este Sistema Operativo

> Lee este archivo primero. En 10 minutos vas a saber exactamente qué es este sistema, cómo funciona, y cómo sacarle el máximo provecho — incluso si nunca has creado una app.

---

## ¿Qué es esto?

Un sistema de documentos especializados (más de 40) que convierte a la IA (Codex, Claude Code, o Claude Chat) en un equipo completo de producto: estratega, diseñador UX, desarrollador full-stack senior, experto en backend y bases de datos, especialista en auth y ciberseguridad, diseñador de gamificación, QA tester y experto en monetización. Tú pones la idea (o ni siquiera eso) y el sistema guía a la IA para producir una web app profesional, monetizable y sin errores.

**Lo que NO es:** un curso para leer. Los archivos no son para que tú los estudies — son instrucciones para la IA. Tu trabajo es cargar el archivo correcto en el momento correcto y aprobar o ajustar lo que la IA propone.

---

## Los Archivos del Sistema, en Orden

### 📌 Empieza aquí (para ti, el humano)
| # | Archivo | Para qué sirve |
|---|---------|----------------|
| — | **INSTRUCCIONES.md** | Este archivo. El manual de uso. |
| — | **REFERENCIA-RAPIDA.md** | Chuleta con los prompts exactos para copiar y pegar en cada sesión. |

### 🤖 Archivos automáticos (van en la raíz del proyecto, una sola vez)
| # | Archivo | Para qué sirve |
|---|---------|----------------|
| — | **CLAUDE.md** | Lo lee Claude Code automáticamente. Reglas de código, diseño, seguridad y verificación condensadas. |
| — | **AGENTS.md** | Lo lee Codex automáticamente. Idéntico a CLAUDE.md. Pon AMBOS siempre. |

### 🔢 Las 8 fases del proceso (se cargan en orden, una o dos por sesión)
| # | Archivo | Fase | Pregunta que responde |
|---|---------|------|----------------------|
| 00 | **00-SISTEMA-MAESTRO.md** | Base | Solo si usas Claude Chat u otra IA sin auto-carga. En Codex/Claude Code NO lo necesitas (lo reemplazan CLAUDE.md/AGENTS.md). |
| 01 | **01-IDEACION.md** | Fase 0 | ¿Qué app construimos y con qué features? |
| 02 | **02-VALIDACION.md** | Fase 1 | ¿Vale la pena? ¿Cómo retiene y cuánto cobra? |
| 03 | **03-PRINCIPIOS-APP-EXITOSA.md** | Fase 2 | ¿Cómo debe sentirse y comportarse la app? |
| 04 | **04-ARQUITECTURA.md** | Fase 3 | ¿Qué pantallas, flujos y datos tiene? |
| 05 | **05-CREACION.md** | Fase 4 | ¿Cómo se construye el código? |
| 06 | **06-TESTING.md** | Fase 5 | ¿Funciona todo de verdad? |
| 07 | **07-PULIDO.md** | Fase 6 | ¿Se siente profesional y premium? |
| 08 | **08-DEPLOY.md** | Fase 7 | ¿Cómo la pongo en internet y cobro? |

### 🧩 Archivos transversales (se combinan con las fases cuando aplican)
| # | Archivo | Cuándo cargarlo |
|---|---------|-----------------|
| 09 | **09-SEGURIDAD.md** | Siempre antes de desplegar. Si la app maneja usuarios, datos o pagos. |
| 10 | **10-DESIGN-TOKENS.md** | Junto con la fase de creación (05). Sistema de colores, dark mode, accesibilidad. |
| 11 | **11-DISENO-EMOCIONAL.md** | Junto con creación (05) y pulido (07). Lo que hace que la app se sienta como Revolut o Duolingo y no como un template. |
| 12 | **12-FLUJO-AGENTICO.md** | Siempre que trabaje un agente (Codex/Claude Code). Verificación, framework, costos de IA. |
| 13 | **13-INFRA-ESCALABILIDAD.md** | Arquitectura de referencia, qué se rompe con 500-1000 usuarios y checklist para vender/escalar. |
| 14 | **14-LEYES-DE-DISENO.md** | Los 12 mandamientos + especificaciones numéricas exactas de tipografía, espaciado, movimiento y jerarquía. El antídoto contra el diseño "hecho con IA". |
| 15 | **15-PATRONES-UX.md** | Los patrones de UX con impacto MEDIDO en retención: rendimiento percibido, onboarding, empty states, auth sin fricción, gestos, háptica. La clave de la diferenciación 2026. |
| 16 | **16-DIRECCION-DE-ARTE.md** | Cómo elegir una identidad visual audaz y cohesiva — el "gusto" que separa lo correcto de lo memorable. Paleta, tipografía, craft, cohesión. |
| 17 | **17-VISUALIZACION-DATOS.md** | Gráficos, anillos, donuts, dashboards con specs exactas (principio Tufte). Para apps de fitness, finanzas, salud, analítica. |
| 18 | **18-VENTA-HOTMART.md** | Flujo completo de venta por Hotmart: producto fachada, webhook + hottok, creación/baja de usuarios, emails con Resend. Configuración por defecto. |
| 19 | **19-PAGINA-DE-VENTAS.md** | Estructura validada + copy de respuesta directa + visuales para landing pages de alta conversión. |
| 20 | **20-ASSETS-VISUALES.md** | Qué imágenes necesita la app (logo, favicon, OG, hero) y cómo generarlas con ChatGPT/Gemini + placeholders limpios. |
| 21 | **21-BACKOFFICE.md** | Construye un panel de admin para el dueño: ventas, usuarios, errores y métricas en lenguaje claro. |
| 22 | **22-LIBRERIAS-Y-CRAFT.md** | Las librerías concretas (Motion, Phosphor, Lottie, Recharts) y las animaciones que toda app DEBE tener. El antídoto contra el diseño estático. |
| 23 | **23-SKILLS-COMUNIDAD.md** | Skills de diseño de la comunidad (frontend-design oficial, UI/UX Pro Max) que complementan el sistema. Opcional. |
| 24 | **24-GAMIFICACION.md** | Retención y hábito: loop Hooked, rachas con streak-freeze, XP, recompensa variable, ligas, re-enganche. Lo que hace que la gente vuelva (como Duolingo). |
| 25 | **25-BASE-DE-DATOS.md** | Backend serio: diseño de esquema, índices, migraciones zero-downtime, EXPLAIN, RLS de alto rendimiento, pooling. |
| 26 | **26-AUTH-MODERNO.md** | Auth 2026: passkeys/WebAuthn, rotación de tokens, rate limits por endpoint, MFA, anti-enumeración. |
| 27 | **27-REVISION-SEGURIDAD.md** | Auditoría antes de vender: OWASP Top 10:2025, semgrep, npm audit, secretos, threat model ligero. |
| 28 | **28-INGENIERIA-NEXTJS.md** | Si la app es Next.js: Server/Client components, Server Actions, caché, Core Web Vitals. |
| 29 | **29-REFERENCIA-VISUAL.md** | Lookup rápido de paletas y tipografías por nicho (subconjunto curado de ui-ux-pro-max). |
| 30 | **30-INTEGRACION-IA.md** | Integración de IA multimodal: texto (streaming, prompt caching, tiering), imagen y audio (async + Storage), resiliencia (reintentos, timeouts, degradación) y economía por modalidad. Para apps que generan con IA. |
| 31 | **31-EVALS-OBSERVABILIDAD-OPERACION.md** | Operación profesional de IA: evals (golden set para no degradar al cambiar modelo/prompt), observabilidad (tabla `ai_calls`, costo real, alertas de gasto), CI/CD con gates, runbook de incidentes y soporte al usuario. El salto de "funciona" a "operación seria". |
| 32 | **32-DEL-MVP-AL-PRODUCTO.md** | El listón anti-MVP-básico: míralo RENDERIZADO a 375px, nav al fondo (no min-h-full), profundidad (no fondo plano), pantallas llenas de valor (no vacías), CTA vivo. Con el caso real de por qué las apps quedan básicas. El salto de "funciona" a "se vende". |
| — | **PLANTILLA-REVISION-PANTALLA.md** | Plantilla estructurada de 15 puntos para revisar cada pantalla antes de aprobarla (misión, elementos, estados, IA, criterios de aceptación). |
| 02B | **02B-ONBOARDING-MONETIZACION.md** | La estrategia validada de onboarding y paywall basada en Duolingo, Cal AI y Noom. Hard paywall vs onboarding-first. Diseño del paywall que convierte. |
| — | **INICIO.md** | Protocolo de arranque: el agente lo ejecuta cuando le dices "comenzar". Pregunta crear vs mejorar, pide referencias visuales y las analiza. |
| — | **PLANTILLA-ESTADO.md** | Plantilla de la memoria del proyecto (ESTADO.md) que el agente mantiene. |

---

## Paso 0 — Antes de empezar (una sola vez en tu computadora)

Si nunca usaste una herramienta así, esto es lo único que necesitas instalar. ~15 minutos.

1. **Node.js** (el motor que corre las apps): descárgalo de [nodejs.org](https://nodejs.org) (versión LTS) e instálalo con doble clic. Es el único requisito técnico.
2. **Claude Code** (el agente que construye, lee CLAUDE.md): es una herramienta de terminal/escritorio de Anthropic. Instálalo siguiendo su guía oficial. *(Alternativa: Codex, que lee AGENTS.md.)*
3. **Abrir la terminal** y situarte en la carpeta del proyecto:
   - **Mac**: abre la app *Terminal* (Spotlight → "Terminal"); escribe `cd ` y arrastra la carpeta del proyecto a la ventana, Enter.
   - **Windows**: en el Explorador, entra a la carpeta, clic en la barra de ruta, escribe `cmd`, Enter.
4. **Abrir el agente en esa carpeta** (`claude` en la terminal, o abrir la carpeta desde la app). Listo: ya puedes pegar el primer prompt.

> No necesitas saber programar. El agente escribe el código; tú apruebas, ajustas y revisas el resultado renderizado. Si algo del Paso 0 se traba, pídele ayuda al propio agente describiéndole tu sistema operativo.

---

## Setup Inicial (5 minutos, una sola vez por proyecto)

1. **Crea la carpeta de tu proyecto** y dentro copia:
   - `CLAUDE.md` y `AGENTS.md` → en la **raíz** del proyecto
   - La carpeta completa del sistema → en `docs/sistema/` dentro del proyecto

```
mi-app/
├── CLAUDE.md          ← lo lee Claude Code automáticamente
├── AGENTS.md          ← lo lee Codex automáticamente
├── ESTADO.md          ← lo crea y mantiene el agente (memoria del proyecto)
├── docs/
│   └── sistema/       ← todos los archivos del sistema (01-47 + 02B) + plantillas
└── src/               ← el código de tu app
```

2. **Para arrancar, pega el PROMPT-ARRANQUE.txt** (incluido en el sistema) en tu primer mensaje a Codex o Claude Code. Es mejor que solo decir "comenzar" porque le indica al agente que lea SOLO el CLAUDE.md primero (eficiente, sin malgastar tokens) y luego te pregunte qué quieres hacer. El agente detecta si hay proyecto en curso, o te pregunta crear-desde-cero vs mejorar-existente, y te pide referencias visuales para definir la dirección.

3. **Eso es todo.** A partir de aquí, **el agente lee los archivos por sí mismo**: cuando le pidas definir la idea, leerá la ideación; cuando le pidas código, leerá creación + tokens + diseño emocional. Ya no necesitas subir archivos manualmente en cada sesión — la tabla de ruteo dentro de CLAUDE.md/AGENTS.md le dice qué leer para cada tipo de tarea.

4. **El agente además mantiene `ESTADO.md`**: un archivo con las decisiones tomadas, lo hecho y lo pendiente. Es su memoria entre sesiones — cuando vuelvas mañana, el agente lo lee y retoma exactamente donde quedó, sin que tengas que explicarle nada.

> **Nota**: Si usas Claude Chat u otra IA de chat (no un agente con acceso a archivos), ahí sí aplica el método manual: cargar `00-SISTEMA-MAESTRO.md` + el archivo de la fase en cada sesión, como indica la REFERENCIA-RAPIDA.

---

## Los 3 Caminos de Uso

### 🛣️ Camino A: "No tengo idea / Tengo una idea vaga" (proceso completo)

Con el setup hecho (sistema en `docs/sistema/`), ya no subes archivos — solo das la instrucción y el agente lee lo que necesita:

```
SESIÓN 1 → "Vamos a definir una nueva app. Sigue la fase de ideación del sistema."
           Resultado: App Brief + ESTADO.md creado

SESIÓN 2 → "Continúa con la validación y los principios UX."
           Resultado: Viabilidad + pricing + retención (todo queda en ESTADO.md)

SESIÓN 3 → "Diseña la arquitectura completa."
           Resultado: Pantallas + flujos + modelo de datos

SESIÓN 4 → "Construye el MVP completo siguiendo el sistema."
           Resultado: EL CÓDIGO de tu app, verificado (tsc ✓ build ✓ dev ✓)

SESIÓN 5 → "Ejecuta el testing completo y aplica el pulido."
           Resultado: App testeada, corregida y con acabado premium

SESIÓN 6 → "Revisa seguridad y guíame en el deploy."
           Resultado: App segura, legal y EN VIVO
```

En cada sesión nueva, el agente lee `ESTADO.md` y retoma solo. Si notas que no lo hizo, dile: "lee el ESTADO.md primero".

### 🛣️ Camino B: "Ya tengo una app y quiero mejorarla"

Una sola sesión de auditoría:

```
Subir: 03-PRINCIPIOS-APP-EXITOSA.md + 06-TESTING.md + 07-PULIDO.md + 11-DISENO-EMOCIONAL.md
     + los archivos de tu app (o abrir Codex/Claude Code en la carpeta del proyecto)

Prompt: "Audita esta app contra los principios, ejecuta los tests, aplica el pulido
y el diseño emocional. No me preguntes qué quiero — tú decides qué necesita.
Corrige todo y dame el reporte de cambios."
```

Y antes de relanzarla: una sesión extra con `09-SEGURIDAD.md`.

### 🛣️ Camino C: "Solo quiero que la IA codee bien" (modo mínimo)

Pon `CLAUDE.md` + `AGENTS.md` en la raíz del proyecto. Nada más. Cada sesión de código ya aplicará automáticamente: tokens de diseño, accesibilidad, seguridad de API keys, verificación con build/typecheck, y diseño emocional básico.

---

## Reglas de Oro para Sacarle el Máximo Provecho

**1. Nunca cargues todos los archivos a la vez.** Saturas el contexto de la IA y le queda poco espacio para pensar. Carga solo los de la fase actual (máximo 3 por sesión).

**2. Guarda los entregables de cada fase.** El App Brief, la arquitectura, las decisiones de diseño — pégalos al inicio de la siguiente sesión. La IA no recuerda entre sesiones; tú eres la memoria del proyecto.

**3. Exige el reporte de verificación.** Al final de cada sesión de código, la IA debe reportar: `tsc ✓ | build ✓ | dev ✓`. Si no lo hace, pídeselo: "ejecuta la verificación del ciclo agéntico antes de cerrar". Esa es la diferencia entre código bonito y código que funciona.

**4. Aprueba o ajusta, no redescribas.** El sistema está diseñado para que la IA proponga y tú digas "sí", "no" o "cambia X". Si te encuentras escribiendo párrafos largos explicando lo que quieres, algo falló en una fase anterior — vuelve a ella.

**5. No te saltes la validación (Fase 1).** Es tentador ir directo al código. Pero una app sin estrategia de retención ni economía de IA calculada es una app que pierde dinero aunque funcione perfecto.

**6. Respeta el límite de 3-5 features.** El sistema va a resistirse cuando quieras meter 10 funciones. Déjalo. Las apps que venden hacen UNA cosa increíblemente bien.

**7. La fase de pulido no es opcional.** La diferencia entre "app hecha con IA" y "app que la gente paga" está en las sesiones 5 y 6, no en la 4.

**8. Si la IA se desvía de las reglas**, recuérdaselo con una línea: "revisa el CLAUDE.md / el archivo de principios y corrige". Los agentes a veces pierden el hilo en sesiones largas — es normal, solo redirígelos.

**9. Actualiza el sistema con lo que aprendas.** ¿Descubriste un error recurrente? ¿Un patrón que funciona? Agrégalo al archivo correspondiente. Este sistema es un activo vivo, no un PDF muerto.

---

## Preguntas Frecuentes

**¿Funciona con cualquier IA?**
Está optimizado para Codex (lee AGENTS.md) y Claude Code (lee CLAUDE.md). En Claude Chat, ChatGPT u otra IA de chat, carga `00-SISTEMA-MAESTRO.md` + el archivo de fase como contexto manual.

**¿Cuánto tarda crear una app completa?**
Con el proceso completo: 6 sesiones de trabajo (entre 1 y 3 días reales según tu ritmo). Una app simple sin backend puede salir en 2-3 sesiones.

**¿Necesito saber programar?**
No para usarlo. Sí ayuda entender conceptos básicos (qué es un deploy, qué es una API) para tomar mejores decisiones cuando la IA te pregunte. El sistema explica lo necesario en el camino.

**¿Qué hago si la app da errores?**
Sesión con `06-TESTING.md` + `12-FLUJO-AGENTICO.md` y el prompt: "ejecuta el ciclo completo de verificación, encuentra todos los errores y corrígelos sin avanzar hasta que tsc y build pasen limpios".

**¿Puedo usar esto para apps de clientes o para enseñar?**
Sí. El sistema es agnóstico al nicho: funciona para tu app, la de un cliente, o como material de enseñanza del proceso profesional completo.

**¿En qué orden leo los archivos si quiero entender el sistema a fondo?**
INSTRUCCIONES → REFERENCIA-RAPIDA → 03-PRINCIPIOS → 11-DISENO-EMOCIONAL → CLAUDE.md. Con esos 5 entiendes la filosofía completa. El resto son manuales de ejecución para la IA.
