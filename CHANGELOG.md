# CHANGELOG — Sistema Operativo (SO)

Registro de cambios del **propio sistema documental** (no de las apps que construye con él).
Formato basado en [Keep a Changelog](https://keepachangelog.com/) (simplificado) + [SemVer](https://semver.org/lang/es/).

**Cómo versionar este SO (semver):** **MAJOR** = cambio de proceso o de estructura (rompe cómo se usa el sistema: sesiones, ruteo, núcleo obligatorio). **MINOR** = doc/pilar nuevo o ampliación con compatibilidad hacia atrás. **PATCH** = correcciones (typos, refs rotas, IDs de modelo, fences, coherencia interna).

---

## [2.11.0] — 2026-06-26

### Added — pilar nuevo `48-RIGOR-DE-ENTREGA.md` + circuit-breaker de costo de IA (que la v1 salga CASI PERFECTA y el usuario corrija lo mínimo)
Pensando fuera de la caja: el patrón de fondo de casi todo lo que el usuario tuvo que corregir (flujos a medias, paywall faltante, output flojo, detalles de encaje, secuencia) es que el SO construye bien pero NO tenía una capa final de RIGOR DE ENTREGA. Nuevo pilar transversal que actúa como QA despiadado + fundador preocupado + operador servicial antes de declarar "listo":
- **`48-RIGOR-DE-ENTREGA.md`** (nuevo): (1) **Auto-QA end-to-end** — manejar la app como usuario real, tocar cada elemento, recorrer cada flujo, 6 estados, casos borde, primer arranque vacío (compilar ≠ probar); (2) **Pre-mortem** (Gary Klein) — imaginar el fracaso a 1 semana y corregir los top riesgos + test del desconocido; (3) **Invariantes que no pueden fallar** — dinero (gating en servidor, webhook idempotente, refund/chargeback), datos (no se pierden, export, soft-delete), seguridad (IDOR, RLS, secretos); (4) **Circuit-breaker de costo de IA** — tope global + por-usuario + kill-switch + alerta (evita la factura sorpresa de miles); (5) **Calidad del OUTPUT de IA** — que el resultado sea bueno/completo/en-marca, no slop (rúbrica/golden set de 31); (6) **Manual del Dueño** — `MANUAL-DEL-DUEÑO.md` con cuentas/claves/deploy/tareas comunes/runbook en lenguaje simple; (7) **Cadencia de mantenimiento** (claves, dominio, backups, deps, costos). + CHECKLIST DE ENTREGA como puerta final.
- **`30-INTEGRACION-IA.md`**: detalle técnico del **circuit-breaker de gasto** (3 capas: por-usuario, global con kill-switch, anti-loop) con código de verificación de presupuesto antes de cada llamada cara.
- **Tejido en el SO**: fila de ruteo en `CLAUDE.md`/`AGENTS.md`; Regla de Oro 6 ("antes de vender, corre 27 Y la puerta 48 — sin 48 no está lista"); Sesión 6 del plan en `INICIO.md` (entregable incluye el checklist de 48 + el manual); `00-SISTEMA-MAESTRO.md` y `REFERENCIA-RAPIDA.md`; `PROMPT-PRE-LANZAMIENTO.txt` ampliado con el punto 10 (rigor de entrega).

Fuentes: técnica de pre-mortem (Gary Klein/HBR), prácticas de SRE/runbooks, y el patrón observado al auditar las apps reales construidas con el SO.

---

## [2.10.0] — 2026-06-26

### Changed — auditoría de 2ª app real ("Habi", hábitos) → color por nicho, micro-craft y persuasión de paywall/onboarding
La 2ª app construida con el SO mejoró mucho (onboarding-first de 9 pasos, paywall, loop de retención, fuente fresca), pero la corrida destapó 3 fallas, corregidas con investigación:
- **Color genérico para el nicho** (la app de hábitos salió marrón oscuro + ámbar, sombría, no motivadora). Fix: **`16` PASO 0.5 + `29`** — la paleta se VALIDA contra los GANADORES del nicho (estudiar 3-5 apps exitosas del nicho exacto y extraer su lógica de color), debe servir al trabajo emocional del nicho (hábitos = positivo, victoria visible, verde=hecho — BJ Fogg), y NO defaultear a "oscuro + 1 acento" (muchos géneros ganan en claro/multicolor). Test: "¿un usuario del nicho sentiría 'esto es para mí' en 1 segundo?".
- **Micro-craft con desencajes** (anillo "1" sobre "/1" sin centrar; chip "🔥 1" con hueco muerto a la derecha). Fix: **`43` nueva sección 8 "Encaje y centrado óptico"** + ítems de checklist — chips/badges ABRAZAN su contenido (`w-fit`, cero hueco muerto), números compuestos en UNA composición centrada ópticamente, centrado óptico real (no solo `items-center`).
- **Paywall/onboarding sin profundidad de persuasión.** Fix: **`02B` nueva sección "LA CAPA DE PERSUASIÓN"** — los 7 principios de Cialdini aplicados (compromiso/consistencia, reciprocidad, prueba social, autoridad, escasez real, simpatía, identidad), gatillos de copywriting (aversión a la pérdida, anclaje, especificidad, emoción-primero, "cada pregunta devuelve algo" de Noom, review prompt a mitad del onboarding de Cal AI, CTA en 1ª persona), con el dato de que ~95% de la decisión es subconsciente — todo con límite ético explícito (gatillo real, nunca dark pattern).

Fuentes: RevenueCat (pricing psychology), Cialdini (*Influence*), casos Duolingo/Noom/Cal AI (UX teardowns), BJ Fogg (visible win), color psychology (Angela Wright), apps de hábitos (Streaks, Productive, Finch, Atoms, Way of Life).

---

## [2.9.0] — 2026-06-26

### Changed — auditoría de una app REAL construida con el SO (app "Imán") → 4 gaps de proceso/producto corregidos
Se auditó end-to-end una app que un usuario construyó con el SO. El SO hizo mucho bien (Constitución, validación FLUJO A, nicho D preview→paywall, pricing, atomicidad de cuota), pero la corrida destapó 4 fallas reales:
- **Secuencia: el paywall y el wow real quedaban para el final.** El agente construyó dos generadores con datos DEMO + onboarding y se fue al backend (cuentas/planes/nube) SIN haber construido el paywall ni probado la primera victoria con IA real. Fix: **`INICIO.md` + Regla 6 de `CLAUDE.md`/`AGENTS.md`** — construir temprano la **"columna vertebral de venta"** completa (primera victoria REAL con IA conectada + onboarding + el MOMENTO DE PAYWALL como pantalla de primera clase + la superficie de retención), aunque la persistencia sea local/mock; "backend primero" = el BFF de la acción core para que el wow sea real, NO posponer lo que vende.
- **"Generador + historial" no es una app de suscripción** (la app salía con pocas utilidades). Fix: **`01-IDEACION.md` + `24`** — el MVP DEBE incluir ≥1 **superficie de retención** (el loop del 24 hecho PANTALLA: calendario, biblioteca que se remixa, métricas), no diferirla a V2; la lista de features para apps de GENERACIÓN ahora incluye la superficie de retención como obligatoria, no opcional. Reconciliado con la disciplina de features: la superficie de retención está PROTEGIDA del recorte porque ES la razón de pagar.
- **El artefacto salía incompleto** (carruseles de texto sin imágenes, pese a prometer "listo para publicar"). Fix: regla de **artefacto completo = igual a la promesa** (si es visual, CON imágenes/diseño, no solo texto); el wow debe IGUALAR la promesa.
- **Faltaba cerrar el loop** (crear→publicar→medir→mejorar). Fix: medir-el-resultado se documenta como la palanca de retención #1, con nota honesta de **factibilidad** (APIs sociales tienen fricción real — empezar liviano: métricas pegadas/subidas por el usuario, o integración acotada), atado al pilar 3 de factibilidad de `01`.

---

## [2.8.0] — 2026-06-26

### Changed — identidad visual con "dientes" anti-genérico (el SO entregaba brand kits que "huelen a IA")
Al probar el SO, sus propuestas de identidad visual salían genéricas (oscuro + acento + glow, o el par editorial "seguro") aunque el protocolo de `16` ya era sofisticado. El problema: la teoría no tenía RESTRICCIONES NEGATIVAS, así que el "default estadístico" de IA se colaba. Investigación (Refactoring UI, "por qué todas las apps de IA se ven iguales", Pendo/NN-g, font-pairing, Marty Neumeier *Zag*) convertida en una capa con teeth:
- **`16-DIRECCION-DE-ARTE.md` — nueva sección "LA CAPA ANTI-IA"**: (1) el look de IA tiene RECETA y banderas rojas nombradas (#000/#fff puro, neón morado/cian, glow regado, tarjeta glass + orbe de gradiente, jerarquía por peso) — 3+ = recházalo; (2) **restricción negativa por defecto** (prohibido neón/negro puro/glow/glass salvo que el arquetipo lo justifique) + referencia positiva concreta; (3) el **MODO oscuro/claro se DERIVA, no se asume oscuro** (claro/editorial suele ser MÁS distintivo hoy); (4) tácticas "se ve diseñado" (casi-negro con tinte, grises con temperatura, profundidad de 3 niveles, un acento por viewport, jerarquía por TAMAÑO, glass solo en overlays); (5) **Zag/Neumeier** + test endurecido: "¿el brand kit se distingue de TODA app de IA y de las otras apps del SO?"; (6) exigir ≥1 dispositivo ownable (textura/foto/ilustración/2ª nota de color), no solo "oscuro + 1 acento".
- **`16` PASO 0.6 + `29`**: la propia "rotación fresca" (Clash, Satoshi, Fraunces) ya se quema como Space Grotesk/Geist → ROTAR, no auto-elegir el par del mood, y dar a la display un TRATAMIENTO propio; opciones frescas añadidas (Bricolage, Schibsted, Familjen, Gambetta, Erode, Instrument Serif, Unbounded…); principios de pareo (contraste por clase, superfamilia, x-height).
- **`CLAUDE.md`/`AGENTS.md`**: reescrita la guía de "Dirección de arte" (antes recomendaba "dark-first por defecto" y "glow/glassmorphism" — justo el look de IA) + nuevo ítem en el checklist de cierre de diseño (capa anti-IA, ≥1 dispositivo ownable, test de no-intercambiabilidad).

Fuentes: Refactoring UI (Wathan/Schoger), "Dark Mode Design That Doesn't Look AI" (RAXXO), AI-Unchained sobre colores genéricos de IA, Google Fonts Knowledge / TypeSmith (font pairing), NN/g, Marty Neumeier (*The Brand Gap*, *Zag*).

---

## [2.7.0] — 2026-06-26

### Changed — ideación ENDURECIDA (cierra 5 huecos detectados al probar el SO) + el criterio de "buena idea" se extiende a la construcción
Tras probar la ideación con un prompt real, salieron 5 fallas (ideas bien presentadas pero flojas como suscripción: uso único disfrazado, "wow" de IA que solo adivina, riesgo legal minimizado, "existe afuera" tomado como prueba de pago LATAM, rúbrica sesgada hacia lo catastrófico-pero-raro). Corregido con evidencia:
- **`01-IDEACION.md` — los 8 pilares ahora tienen 3 GATES DUROS** (descalifican aunque el painkiller sea 19/20): (6) **retención** = gate, no asterisco (uso único/episódico NO se propone como suscripción; o se reformula a recurrente o es otro modelo); (3) **IA real, no simulada** = test "quítale la palabra IA" + test de factibilidad de datos (la IA debe RESOLVER con precisión, no adivinar con cara de certeza); (8) **riesgo regulatorio** (consejo médico/legal/financiero vinculante por un fundador solo = mala base; solo entra como "información, no asesoría"). Rúbrica painkiller **de-sesgada**: modificador de frecuencia + Trampa #2 "catastrófico-pero-raro" (intensidad alta + frecuencia baja = transaccional, no suscripción). Pilar 2: separar **señal de arbitraje** ("existe/levantó plata afuera") de **señal de pago LATAM** (gente gastando dinero hoy aquí). Filtro y anti-patrones reescritos con los gates.
- **`01-IDEACION.md` — nuevo "EL FILTRO DE FEATURE"**: el criterio de "buena idea" NO termina en la ideación, aplica a CADA feature al construir. Evidencia: ~80% de las features se usan poco o nunca, solo ~12% seguido (Pendo 2019; Standish 64% en 2002). 4 preguntas por feature (apoya la promesa · la usaría >50% · test "quítale la palabra IA" · ahora o V2) + cómo decir que no sin ser un "sí señor", coherente con el estándar "enriquecido = valor, no features" de 32.
- **`CLAUDE.md`/`AGENTS.md`**: nueva regla de UX 19 (**disciplina de features**) que hace vivo ese filtro durante toda la construcción, con el dato del 80% y el test anti-gimmick de IA.

Fuentes: RevenueCat State of Subscription Apps 2025/2026, framework painkiller-vs-vitamin (Airbridge), Pendo Feature Adoption Report 2019, Standish CHAOS, NN/g y guías de diseño de features de IA.

---

## [2.6.0] — 2026-06-26

### Added — refuerzo profundo de la generación de IDEAS (anclado en datos reales 2026, no en intuición)
Investigación externa (RevenueCat State of Subscription Apps 2025/2026, framework painkiller-vs-vitamin, caso Cal AI, "why now" de Lenny Rachitsky, señales de demanda en Reddit) convertida en un marco accionable para que el SO proponga ideas GANADORAS, no la primera ocurrencia:
- **`01-IDEACION.md`**: nueva sección mayor **"LOS PILARES DE UNA IDEA GANADORA (con datos 2026)"** — 8 pilares con la evidencia detrás: (1) painkiller > vitamina con rúbrica de 4 preguntas /20 (convierten 5-9× más; la URGENCIA paga, no la frecuencia); (2) problema que millones comparten con demanda revelada (reseñas 1-2★, "ojalá existiera", Reddit); (3) un momento-IA puntual que borra la peor parte (truco de Cal AI ~$30M); (4) "por qué ahora" / capacidad de IA reciente; (5) categoría que monetiza + poder de precio (Salud/Fitness, Foto/Video, Productividad, Finanzas; precio alto = 6× LTV); (6) **retención incorporada** (las apps de IA ganan +41% pero retienen −30-36% → deben ser verticales con razón de volver, no chatbots genéricos); (7) ventaja de distribución (solo 17% llegan a $1k MRR; el arbitraje LATAM ES un canal); (8) alcanzable y defendible. Incluye el filtro en una frase y los anti-patrones que los datos dicen que pierden.
- La **plantilla de propuesta** de `01` ahora exige un "chequeo de pilares" (painkiller score, por qué ahora, por qué retiene, categoría, distribución) y reformular si algún pilar queda débil. El **Banco de Ideas** se marca como semillas que deben afilarse con los pilares.
- El **filtro del Escenario B** (idea propia del usuario) añade el paso de pasar la idea por los pilares y proponer el ángulo que convierte una vitamina/uso-único en painkiller con retención.
- **`INICIO.md`** (FLUJO A): la tarjeta de oportunidades incorpora campos nuevos (💊 por qué duele/painkiller, ⚡ momento-IA, ⏰ por qué ahora, 🔁 por qué retiene, categoría que paga) y una regla: cada oportunidad PASA los 8 pilares antes de mostrarse — nunca "la primera para llenar la lista".

---

## [2.5.0] — 2026-06-26

### Added / Fixed — cierre de los 11 hallazgos de un simulacro de uso completo (dry-run con usuaria no técnica)
Se simuló una corrida entera del SO en voz alta poniéndose en los pies de un usuario no técnico que "quiere que la IA lo haga todo". 0 blockers; se cerraron las **costuras entre piezas** y los **gaps de expectativa** que solo un dry-run destapa:
- **`02-VALIDACION.md`** (alto): el Gate de Demanda ya no puede frenar en seco a un no-técnico. Tres caminos explícitos: FLUJO A → gate cubierto por arbitraje (igual se corre el de viabilidad unitaria 40); quiere validar → fake-door con la landing de 19; no puede/no quiere → ruta de **riesgo asumido** documentada + validación EN PARALELO, con OK explícito (no bloqueo silencioso). El gate es bloqueante de verdad solo para gastar en ads.
- **`18-VENTA-HOTMART.md`** (alto): nueva sección **"Los dos modelos de creación de usuario"** (hard paywall = webhook CREA al pagar; onboarding-first = registro gratis → webhook SUBE a Pro) + el **caveat crítico del email que no coincide** (registro con un correo, compra con otro → cuenta duplicada y progreso huérfano) con 3 mitigaciones (mismo email/pre-rellenar, matchear por id/`src`, flujo de reclamo). Nueva sección **"Prueba de pago de punta a punta"** obligatoria + ítems de checklist (incl. casos del Modelo 2 y reembolso).
- **`40-UNIT-ECONOMICS.md`**: la plantilla ahora la **rellena el AGENTE** estimando los costos; al dueño no técnico solo se le piden 2-3 datos (precio objetivo, afiliados sí/no, ciclo). No más hoja financiera en blanco.
- **`CLAUDE.md`/`AGENTS.md`**: degradación de la verificación visual — sin herramienta de preview NO se le exige al usuario no técnico una captura a 375px ni puntuar /40; se deja "pendiente de preview automático" y no se declara la pantalla lista.
- **`INICIO.md`**: reglas de conducción 8-10 (fijar expectativas al inicio — "hay ~5 cosas que solo tú puedes hacer, te aviso y te guío"; ritmo en sesiones densas; degradar sin web/preview y ofrecer ejemplos en preguntas difíciles), notas de secuencia en el plan (clave de IA en local temprano para probar el wow real; sembrar eventos al construir; modelo de usuario decidido en Sesión 1), y ejemplos en la pregunta "qué NUNCA debe hacer la app".
- **`30-INTEGRACION-IA.md`**: configurar la clave de IA en local temprano para probar la primera victoria con generación REAL (no declarar el onboarding listo sobre un mock).
- **`36-ANALITICA-Y-EVENTOS.md`**: sembrar los eventos de activación/retención AL construir cada pantalla (Sesiones 3-4), no en una sesión de analítica al final.
- **`02B`** y **`PROMPT-ARRANQUE.txt`**: cross-link al seam de `18` cuando hay free tier; y fijación de expectativas en el prompt de arranque.
- **Desambiguación de los dos prompts de auditoría** (mismo "audita" en el nombre, funciones distintas): `PROMPT-AUDITORIA.txt` (audita TU APP, en el menú de usuario) y `PROMPT-AUDITAR-SO.txt` (audita la DOCUMENTACIÓN del SO, uso interno) ahora llevan una línea de cross-pointer al inicio; la fila de ruteo de `CLAUDE.md`/`AGENTS.md` marca el segundo como "uso INTERNO de mantenimiento". No se renombraron (evita romper referencias del zip).

---

## [2.4.1] — 2026-06-26

### Fixed — auditoría integral final (4 pases de coherencia: monetización, meta/ruteo, prompts, diseño/técnico)
Resultado de la auditoría: **0 blockers**, refs cruzadas íntegras (0 rotas), CLAUDE.md = AGENTS.md, ruteo y menú completos. Correcciones aplicadas:
- **`10-DESIGN-TOKENS.md`**: import roto `framer-motion` → `motion/react` (el SO estandariza en Motion; el import viejo habría fallado al construir). *Único hallazgo con impacto de build.*
- **`02B` / `02-VALIDACION`**: unificadas las metas de retención (D7 >20%, D30 >10% en ambos) y de churn (meta aspiracional <8% en ambos + nota: para MODELAR el LTV usar el churn realista 10-20% de `40`). Antes se contradecían (D7 20 vs 25, D30 10 vs 15; churn <5 vs <8).
- **`02B`**: checklist decía matriz "(A-G)" → "(A-F)" (el nicho G/e-commerce se había eliminado).
- **`21-BACKOFFICE`**: el objetivo trial→pago ~45% remitía a `18` (que no lo contiene) → ahora "(ver 02B/02)".
- **`22-LIBRERIAS-Y-CRAFT` / `14-LEYES-DE-DISENO`**: corregida la doctrina de `prefers-reduced-motion` en 22 (decía "animaciones a 0.01ms" — el antipatrón que 10/14 marcan como INCORRECTO; ahora "conservar fades/color, quitar solo movimiento") y suavizada la estadística inflada "~35% (WebAIM)" en 14 y 22 por una frase cualitativa defendible.
- **`11-DISENO-EMOCIONAL`**: hardcode `#2563eb` etiquetado "Colores de la marca" (el azul default que el propio SO prohíbe) → placeholder que remite al brand kit (PASO 0 de 16).
- **`05-CREACION`**: nota añadida — el `<link>` a Google Fonts es para Vite/HTML plano; en Next.js usar `next/font` (ver 28).
- **`CLAUDE.md`/`AGENTS.md`**: alineada la línea de IDENTIDAD con la regla transversal ("por defecto hablas SIMPLE; subes el registro solo si detectas a un técnico").

NITs no corregidos (no rompen nada, decisión del dueño): `PROMPT-NUEVA-APP-FITNESS.txt` es un ejemplo no expuesto en el menú de CLAUDE.md; `PROMPT-AUDITAR-SO.txt` es de uso interno y no está en el menú a propósito; placeholder `system-ui` en el favicon de `20-ASSETS-VISUALES` (se reemplaza al generar el favicon real).

---

## [2.4.0] — 2026-06-26

### Changed — `02B-ONBOARDING-MONETIZACION.md` ampliado (cierre de huecos de pricing/paywall/onboarding por nicho, a partir de investigación externa)
- **Orden de diseño explícito**: nueva sección que fija la secuencia *tipo de app → promesa → frecuencia de uso → primera victoria → paywall → pricing → retención* y prohíbe empezar por el precio. La frecuencia (diaria/semanal/puntual) decide el modelo (hábito→freemium vs resultado→hard paywall/preview→paywall). Mide activación antes que adquisición.
- **Matriz de nichos A-G**: la sección "estrategia por tipo de app" pasó de 3 buckets a los **7 nichos** completos (educación, bienestar, fitness, IA creativa/contenido, productividad, finanzas, e-commerce), cada uno con primera victoria · onboarding · paywall · monetización · retención · qué NO hacer. Añade tabla consolidada de un vistazo y la "fórmula para una app de IA" (qué copiar de Duolingo/Headspace/Cal AI). Antes faltaban IA creativa, educación y e-commerce.
- **Modelo de créditos como packaging visible** + regla **"vende resultados, no tokens"** (ej. "100 guiones/mes", no "500.000 tokens"); tiers Starter/Pro/Max + créditos extra; cuándo usarlo; free tier de 1 preview/generación en apps de IA cara. Es la cara visible del fair-use interno de `30`, validada contra el COGS de `40`. Más caution sobre **lifetime deals**.
- **Los 5 trabajos del onboarding** (segmentar · personalizar · activar · crear deseo · preparar el pago) como el "qué" antes del "cómo" de las 7 reglas.
- **Las 7 preguntas que el paywall debe responder** (qué desbloqueo · por qué ahora · qué pierdo · qué gano · puedo cancelar · cuál plan · salida limpia) + estructura narrativa que las ensambla, con nota anti-dark-pattern sobre la aversión a la pérdida honesta.
- Checklist de estrategia ampliado con las decisiones nuevas (orden, nicho, frecuencia, 5 trabajos, 7 preguntas, créditos en resultados).
- Cross-links nuevos: `40-UNIT-ECONOMICS.md` y `30-INTEGRACION-IA.md` (fair-use interno ↔ créditos visibles); nota de monetización por defecto en `CLAUDE.md`/`AGENTS.md` actualizada con el orden de diseño, la matriz de nichos y los créditos.
- **Removed**: nicho G (e-commerce/marketplace) — TODA app del SO se vende como suscripción recurrente por Hotmart; el comercio por compra única queda fuera del modelo. La matriz quedó en A-F.

### Changed — perfeccionamiento de los pilares de retención y venta (24, 35, 19)
- **`24-GAMIFICACION.md`**: nueva sección **"La métrica de activación — el número mágico que predice la retención"** (acción × cantidad × ventana que separa retenidos de churneados; cómo hallarlo con datos de `36`; calibrar la gamificación para empujar al usuario a cruzarlo) + la **forma de la curva de retención** (decae a cero = no hay producto, ninguna mecánica lo salva; aplana en meseta >0 = PMF, ahí rinde la gamificación). Checklist y conexión con `36` añadidos.
- **`35-LANZAMIENTO-Y-RETENCION.md`**: nueva sección **"Referidos / member-get-member"** (dos formas en el modelo Hotmart: convertir clientes en afiliados de `34`, o recompensa in-app "da y recibe" reconciliada por el webhook de `18`; pedir el referido en el momento de máxima felicidad de `24`; no montarlo antes de que la curva aplane; respetar el margen de `40`) + bloque **"renovación anual — el acantilado del mes 12"** (cadencia pre-renovación que convierte el cobro anual en algo esperado, no una emboscada). Conexiones a `34`/`40` actualizadas; TODO de índices del mantenedor marcado HECHO.
- **`19-PAGINA-DE-VENTAS.md`**: nueva sección **"Message-match"** (el headline del hero debe ecoar la promesa exacta del anuncio/email que trae al visitante — congruencia de *information scent* con `34`, alineada al nivel de consciencia de Schwartz) + ítem en checklist. **Fix**: eliminada la fuga de marca "MECLUB" (nombre de proyecto que se había colado en el SO genérico).
- Ruteo de `35` actualizado en `CLAUDE.md`/`AGENTS.md` y `REFERENCIA-RAPIDA.md` (añadidos referidos y renovación anual).

### Added — regla transversal de comunicación con el usuario no técnico + alertas (orientación 100% a usuario no técnico)
- **`CLAUDE.md`/`AGENTS.md`**: nueva sección **"Comunicación con el usuario y alertas"** (regla transversal, aplica en cada mensaje): (1) hablar SIEMPRE simple, traduciendo cada término técnico la primera vez; (2) cerrar cada etapa preguntando si seguir Y explicando en una frase simple QUÉ es el siguiente paso y PARA QUÉ sirve, esperando confirmación; (3) **protocolo de alertas proactivas** (⚠️ formato qué pasó→por qué importa→qué hacer) para pendientes/omisiones importantes, riesgos de seguridad, algo que cuesta dinero, y —destacado— **el caso de que el usuario pegue una API key/secreto en el chat**: avisar de inmediato y decirle que la rote/regenere.
- **`INICIO.md`**: regla de conducción 3 reforzada (el siguiente paso se explica en simple, no solo se nombra) + nueva regla 7 (hablar simple y avisar lo importante, con remisión a la sección de `CLAUDE.md`).

### Changed — conexión 34 ↔ 36 ↔ 21 (atribución por canal, la pieza que faltaba)
- **`34-ADQUISICION-Y-TRAFICO.md`**: nueva sección **"Medir antes de gastar"** — instrumentar el funnel (36) y **etiquetar cada canal** antes de invertir: afiliados los atribuye Hotmart solo; ads/orgánico/email se etiquetan con el parámetro `src` del checkout de Hotmart (`?src=meta_dolor`, `?src=email_dia3`...) para saber qué canal trae clientes que PAGAN. Conexión con `36` añadida.
- **`36-ANALITICA-Y-EVENTOS.md`**: nueva sección **"Atribución por canal — cómo se llena `source`"** que cierra el círculo: la cadena completa `src` en la URL → la landing la guarda y la arrastra al checkout → el webhook (18) la persiste en `profiles.source` → `identify()` y cada evento la leen. Sin esto, el CAC por canal de `21`/`34` no se podía calcular. Conexión con `34` actualizada.
- **Prompts `.txt` actualizados** (los atajos que disparan estos archivos, en `docs/sistema/`): `PROMPT-MEJORA-ONBOARDING-PAYWALL` (orden de diseño, matriz de nichos A-F, 5 trabajos del onboarding, 7 preguntas del paywall, créditos en resultados, anual como $/mes), `PROMPT-RETENCION` (número mágico + curva de retención + referidos), `PROMPT-LANDING` (message-match), `PROMPT-ADQUISICION` (medir antes de gastar + atribución por `src`/36), `PROMPT-LANZAMIENTO` (referidos + renovación anual), `PROMPT-BACKOFFICE` (ganancia real + avisos al dueño + refs 40/36), `PROMPT-ARRANQUE` (regla de comunicación: hablar simple, explicar el siguiente paso, avisar/rotar API key).
- **`21-BACKOFFICE.md`**: (1) métrica **"Ganancia real"** — la línea de fondo que faltaba (ingresos − Hotmart − afiliados − impuestos − IA de `ai_calls`/31 − infra − email) con % de margen y alerta si la IA supera el ~20% (regla de 30/40); (2) sección **"Avisos automáticos para el dueño"** — el panel empuja alertas en lenguaje simple (IA cara, webhook fallando, churn involuntario, canal que pierde dinero, margen negativo), reflejo de la regla de alertas de `CLAUDE.md` dentro del producto; (3) **reconciliación con `36` y `40`** en "Relación con herramientas externas" (backoffice = vista del dueño / PostHog = herramienta del constructor sobre el MISMO `event_log`; backoffice = ganancia real / `40` = modelo previo; no mezclar bases). Checklist y atribución (captura vía 36) actualizados.

---

## [2.3.0] — 2026-06-21

### Added — Cierre de fugas operativas (capa post-venta y crecimiento orgánico que faltaba)
- **`45-SEO-TECNICO.md`**: lo técnico del orgánico (metadata dinámica/`generateMetadata`, `sitemap.ts`/`robots.ts` nativos, JSON-LD schema.org, SSG/ISR vs CSR para que el bot indexe, hreflang, programmatic SEO legítimo vs spam, GSC). Complementa la estrategia de `34`.
- **`46-EMAIL-DELIVERABILITY.md`**: que el email no caiga en spam — SPF/DKIM/DMARC (DMARC progresivo), subdominio dedicado separando transaccional (`tx.`) de marketing (`news.`), warmup, higiene de lista (double opt-in, suppression vía webhooks), `List-Unsubscribe`, monitoreo (Postmaster Tools), specifics de Resend. Protege los emails de acceso de `18` y el nurturing de `34`.
- **`47-LEGAL-FISCAL-Y-SOPORTE.md`**: operación post-venta — fiscal/legal LATAM (Hotmart como Merchant of Record reduce pero no elimina la carga; ToS/refund/**disclaimer de IA** + limitación de responsabilidad; checklist empezar vs escalar), **soporte al cliente como sistema de retención** (SLA, IA+escalada humana sin loops, rescate de churn ligado a `35`, loop de feedback a `44`), y **trust & safety/moderación** condicional (UGC + outputs de IA, enlaza guardrails de `30`).

### Changed
- `06-TESTING.md`: añadido el gate de **accesibilidad testeada automáticamente** (`@axe-core/playwright`/`jest-axe`/`pa11y-ci` en CI), aclarando que cubre ~30-50% de WCAG y complementa (no reemplaza) el test manual con lector de pantalla y la regla `aria-live` de `15`.

---

## [2.2.0] — 2026-06-21

### Added — Descubrimiento de usuario (a partir de analizar la skill cookiy-ai/user-research-skill: tomar lo bueno, corregir lo malo)
- **`44-DESCUBRIMIENTO-DE-USUARIO.md`**: cierra el eslabón entre "tengo una idea" (01) y "alguien la paga" (02). Toma de la skill lo sólido (Big Q atada a una decisión, screener por comportamiento, protocolo de entrevista anti-sesgo, síntesis trazable con ≥2 fuentes, Opportunity Solution Tree / Opportunity Scoring) y **corrige sus defectos**: **Mom Test explícito** (prohíbe "¿te gustaría/pagarías/usarías?" → comportamiento pasado específico), **fuerzas JTBD/switch** + timeline, **prohíbe synthetic users (entrevistar IAs) como evidencia de demanda**, **prohíbe muestra complaciente / relajar el segmento para llenar cupo** (5 del avatar exacto > 30 tibios; no encontrar 5 ya es señal), y **handoff obligatorio** al gate de pago (02) y a la economía unitaria (40): 44 detecta la señal cualitativa de WTP, 02 la prueba con dinero, 40 la ancla al pricing value-based. Sin sesgo comercial.
- Enlaces cruzados nuevos en `01-IDEACION.md`, `02-VALIDACION.md` (junto al gate de demanda) y `40-UNIT-ECONOMICS.md`; fila de ruteo en `CLAUDE.md`/`AGENTS.md`.

---

## [2.1.0] — 2026-06-20

### Added — Tier "craft de élite" (ingesta de 5 skills de diseño de referencia: frontend-design de Anthropic, UX/UI Pro Max, Emil Kowalski, Huashu, Vercel)
- **`41-CRAFT-DE-ANIMACION.md`**: criterio de animación de élite — framework "¿debe animarse?" por frecuencia de uso (cuándo NO animar), easing perceptual, interrumpibilidad (transition/spring vs keyframe), spring físico, transform-origin, prohibir `scale(0)`, **performance de runtime GPU** (transform/opacity, CSS vars heredables, Framer no-GPU), gestos/drag por velocidad, `clip-path`, **motion narrativo** (Slow-Fast-Boom-Stop, expoOut, chunk-reveal, foco con blur), **View Transitions API nativa**, reduced-motion matizado.
- **`42-UX-WRITING.md`**: microcopy de interfaz — nombrar por lo que el usuario controla, consistencia de verbos acción→confirmación, errores/empty states como dirección.
- **`43-MICRO-CRAFT-Y-EJECUCION.md`**: la última milla verificable — micro-tipografía (`…`/comillas/`tabular-nums`/`text-wrap:balance`), overflow/`min-w-0`, forms (`inputmode`/`autocomplete`/no-bloquear-paste), URL-como-estado, touch nativo (`touch-action`/`overscroll-behavior`/safe-area), dark robusto (`color-scheme`), barrel-files.

### Changed — enriquecimientos
- `16`: PASO 0.45 "mundo del sujeto", test de genericidad, matiz "eje libre" a la lista negra, protocolo de 3 lógicas divergentes, menú de estilos nombrados 2026. `29`: verticales especializados (12 sectores + anti-patrón) + estilos-firma con % de fidelidad CSS.
- `14`: árbol de easing perceptual, complexity matching, densidad por tipo de producto, micro-tipografía, filas anti-slop nuevas. `10`: reduced-motion matizado (no apagar fades), dark robusto, utility `.tabular`.
- `20`: protocolo de activos de marca + sub-portón de logos. `12`: "verdad antes que suposición" + pase junior. `17`: gráfico→caso de uso + accesibilidad de visualizaciones. `07`: severidad en checklist + rúbrica de crítica de 5 ejes + gate de micro-craft.
- `28`: composición de componentes + waterfalls granulares + re-render/INP. `38`: runtime de animación + barrel files. `15`: URL-como-estado + sostenibilidad/peso de assets.

### Fixed
- Lectura fina de los 5 pilares 36-40: corregidos errores reales (comisión de afiliado Hotmart 40-60% vs tarifa 10% en `40` → dos escenarios de margen; sesgo de doble módulo y caso anónimo en `37`; `size-limit`/brotli en `38`; `flush()` vs `shutdown()` y taxonomía en `36`; setup `next-intl` completo en `39`).

---

## [2.0.0] — 2026-06-19

### Added
- **Pilares nuevos** que cierran la cadena de "vendible y operable": `33-RAG-Y-CONTEXTO.md`, `34-ADQUISICION-Y-TRAFICO.md`, `35-LANZAMIENTO-Y-RETENCION.md`, `36-ANALITICA-Y-EVENTOS.md`, `37-FEATURE-FLAGS-Y-EXPERIMENTOS.md`, `38-PERFORMANCE-BUDGET.md`, `39-INTERNACIONALIZACION.md`, `40-UNIT-ECONOMICS.md`.
- **PASO 0 "del brief al brand kit"** en `16-DIRECCION-DE-ARTE.md`: la identidad se DERIVA de la audiencia/ICP, no se copia de un nicho genérico.
- **Núcleo de 9 ítems + verificación-como-artefacto** en `CLAUDE.md` (y su copia byte a byte `AGENTS.md`): cierre con evidencia (tsc/build/dev + render a 375px), no exhortación.
- **DR / Continuidad a nivel app** en `31-EVALS-OBSERVABILIDAD-OPERACION.md` (runbook que orquesta el detalle de DB de `25`).
- **Self-check del propio SO**: `docs/sistema/PLANTILLA-SELF-CHECK.md` + `docs/sistema/PROMPT-AUDITAR-SO.txt` para detectar incoherencias internas antes de reempacar.

### Changed
- **Auditoría integral multi-rol + plan de pulido**: revisión por roles (producto, diseño, UX, backend, DB, auth, ciberseguridad, IA, infra, monetización, distribución, operación).
- **Webhook de Hotmart de producción** en `18-VENTA-HOTMART.md`: firma en tiempo constante sobre el RAW body + idempotencia + máquina de estados.
- **Correctitud de datos** en `25-BASE-DE-DATOS.md`: transacciones atómicas, idempotencia, paginación keyset (no OFFSET profundo), multitenancy con RLS de alto rendimiento.
- **Seguridad** en `09-SEGURIDAD.md`/`27-REVISION-SEGURIDAD.md`: XSS por escape de OUTPUT, SSRF en fetch de URLs, CSRF (SameSite + Origin/double-submit), privacidad LATAM (LGPD/Ley 1581/LFPDPPP).
- **IA seria** en `30-INTEGRACION-IA.md`/`31`/`33`: structured output vía tool use nativo (no parsear texto a ciegas) + RAG solo cuando hace falta + evals con golden set y LLM-judge.
- **Proceso canónico unificado** en 8 sesiones (una sola narrativa de extremo a extremo).
- **Fusión de prompts** redundantes: `PROMPT-AUDITORIA.txt` (modos --rapido/--exhaustivo) y `PROMPT-DISENO.txt`.

### Fixed
- Sincronización de referencias cruzadas (`NN-*.md` / `PROMPT-*.txt`), conteos de docs/sesiones y rangos numéricos — el defecto histórico #1 del SO es la incoherencia interna; esta versión añade versionado y un self-check para contenerlo.
- IDs de modelo vigentes en todos los docs: `claude-opus-4-8` / `claude-sonnet-4-6` / `claude-haiku-4-5` / `fable-5` (sin sufijo de fecha ni versiones 3.x).

---

<!--
Plantilla para entradas futuras (copia y rellena; la más reciente arriba):

## [X.Y.Z] — AAAA-MM-DD
### Added      (pilares/docs/plantillas/prompts nuevos → bump MINOR)
### Changed    (cambios de proceso/estructura → bump MAJOR; ampliaciones compatibles → MINOR)
### Fixed      (correcciones de coherencia/refs/IDs/fences → bump PATCH)
### Removed     (docs/secciones retiradas)
-->
