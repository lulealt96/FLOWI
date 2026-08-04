# ONBOARDING Y MONETIZACIÓN — La Estrategia que Usan las Apps de $35M+

> **Cuándo cargar este archivo:**
> - En la fase de validación (junto con `02-VALIDACION.md`) al decidir el modelo de negocio
> - En la fase de arquitectura (junto con `04-ARQUITECTURA.md`) al diseñar el flujo de usuario
> - Siempre que se diseñe el onboarding o el paywall de la app
> - Junto con `24-GAMIFICACION.md` (el onboarding gamificado y el loop de retención que sostiene la suscripción) y `26-AUTH-MODERNO.md` (registro sin fricción en el momento correcto)
>
> **Por qué existe:** La pregunta más importante de cualquier app de suscripción es dónde y cuándo cobrar. La respuesta tiene datos reales en 2026 y no es intuitiva. Este archivo recoge lo que hacen Duolingo, Cal AI ($35M → adquirida por MyFitnessPal), Noom, Revolut y las apps top — y traduce esos patrones al contexto de una web app vendida por Hotmart.

---

## EL ORDEN DE DISEÑO — el error #1 es diseñar el precio antes que la experiencia

El error más común al monetizar es empezar por el final: elegir el paywall o el precio ANTES de saber qué hábito tiene el usuario. El paywall y el pricing "correctos" no existen en abstracto — existen **para un tipo de app, una frecuencia de uso y un valor percibido concretos**. El paywall de Duolingo no sirve para una app de IA creativa, y el de Cal AI no sirve para una app de finanzas.

Por eso el SO impone un ORDEN. No se diseña el siguiente eslabón sin haber fijado el anterior:

```
1. TIPO DE APP        → ¿bienestar, educación, fitness, IA creativa, productividad o finanzas? (matriz A-F)
2. PROMESA            → la transformación en una frase (Constitución del Producto, 01)
3. FRECUENCIA DE USO  → ¿diaria, semanal, puntual? Decide si necesitas HÁBITO (freemium/gamificación, 24)
                        o RESULTADO inmediato (hard paywall / preview→paywall)
4. PRIMERA VICTORIA   → el "momento aha" que el usuario debe vivir ANTES de que le pidas pagar (01, 32)
5. PAYWALL            → su forma y su momento se DERIVAN de lo anterior (este archivo)
6. PRICING            → value-based, anclado al WTP medido (02) y al margen (40), no al costo de IA
7. RETENCIÓN          → el loop que sostiene la suscripción mes a mes (24, 35)
```

> **La pregunta que ordena todo (responder en la Sesión 1, guardar en ESTADO.md):**
> *¿Esta app resuelve algo DIARIO, SEMANAL o PUNTUAL? ¿El usuario necesita un HÁBITO o un RESULTADO inmediato? ¿El valor está en crear, aprender, ahorrar tiempo, verse/sentirse mejor o ganar dinero?*
> La respuesta decide el modelo de monetización (freemium para hábito vs hard paywall / preview→paywall para resultado), la longitud del onboarding y el loop de retención. Optimizar adquisición (más tráfico/ads) ANTES de tener activación es pagar por perder usuarios.

**Por qué importa, dicho sin rodeos:** el usuario no paga por "una app con IA". Paga cuando la app le demuestra rápido tres cosas — *esto me entiende, esto me ahorra tiempo, esto me da el resultado que quiero*. Primero se diseña esa demostración (la primera victoria); el paywall es solo su consecuencia natural.

---

## LA RESPUESTA A LA PREGUNTA CLAVE

### ¿Cobrar en la landing page o hacer onboarding primero?

La respuesta depende del contexto, pero el dato es claro:

Las apps que combinan un onboarding estructurado con un paywall de prueba gratuita alcanzan 1.78% de conversión install-to-paid — la configuración de mayor rendimiento en todas las categorías de apps de suscripción según el State of In-App Subscriptions 2026.

Los paywalls "duros" (cobro inmediato) convierten 5x mejor que el freemium: 10.7% vs 2.1% al día 35. Pero la ventaja desaparece a largo plazo: la retención al año es prácticamente idéntica (28% freemium vs 27% hard paywall).

**La conclusión real:** ni pagar de entrada ni freemium puro. **El modelo ganador es:**

```
Usuario llega → Onboarding personalizado (micro-compromisos) →
Resultado/plan generado PARA ÉL → Paywall → Pago
```

El paywall no aparece al inicio ni al final — aparece en el momento de máxima inversión emocional del usuario.

---

## LOS 3 MODELOS VALIDADOS (con datos 2026)

### Modelo 1 — Hard Paywall inmediato (landing → pago → app)
```
CUÁNDO USARLO: apps B2B, herramientas de productividad, nicho técnico
VENTAJA: cash inmediato, datos de conversión rápidos, sin "turistas"
DESVENTAJA: elimina usuarios que necesitaban ver el valor antes de pagar
CONVERSIÓN: 10.7% de los que llegan al paywall (vs 2.1% freemium)
```
*Este es el modelo de Hotmart por defecto: la landing vende, el usuario paga, luego accede.*

### Modelo 2 — Onboarding + Paywall de prueba (el más poderoso para consumidores)
```
CUÁNDO USARLO: apps B2C, wellness, productividad personal, fitness, finanzas
VENTAJA: conversión brutal cuando el onboarding construye compromiso real
DESVENTAJA: más complejo de implementar, requiere un onboarding excepcional
CONVERSIÓN: hasta +234% vs un paywall sin onboarding previo
DATO CLAVE: 82% de los que inician una prueba lo hacen en el día 0 —
  si no los enganchas en la primera sesión, ya los perdiste
```
*Este es el modelo de Duolingo, Cal AI, Noom, Calm, Headspace.*

### Modelo 3 — Freemium → Upgrade (el modelo más común, pero el menos eficiente)
```
CUÁNDO USARLO: apps de colaboración donde el viral loop depende del crecimiento
VENTAJA: base de usuarios grande, crece por boca a boca
DESVENTAJA: la mayoría nunca paga (2.1% conversión), soporte costoso
CONVERSIÓN: 2.1% (la peor de las tres opciones en revenue por install)
```
*Este es el modelo de Notion, Slack, Figma.*

---

## EL MODELO RECOMENDADO PARA ESTE SO

Para web apps vendidas por Hotmart en LATAM, el modelo óptimo combina lo mejor de los tres:

```
PASO 1 — LANDING: vender el RESULTADO (no la app). CTA → "Empieza tu prueba gratis"
  (o "Accede ahora" si es hard paywall). Ver 19-PAGINA-DE-VENTAS.md.

PASO 2 — ONBOARDING (DENTRO DE LA APP, después del registro/pago):
  El usuario ya está dentro. El onboarding no es un tour — es la construcción
  de SU resultado personalizado. Cada paso crea compromiso.

PASO 3 — PAYWALL (si hay free tier) o ACTIVACIÓN (si ya pagó):
  Si pagó: el onboarding lleva directo a su primera victoria (momento aha).
  Si hay free tier: el paywall aparece después del onboarding, cuando ya
  invirtió tiempo y vio el resultado.

PASO 4 — PRIMER VALOR INMEDIATO:
  Dentro de los primeros 60 segundos, el usuario debe sentir que la app
  ya le está ayudando. Sin esto, la retención colapsa.
```

**Decisión estratégica inicial que el agente debe hacer con el usuario:**
> "¿Tu app tiene una propuesta de valor que se puede demostrar ANTES de pagar (y tiene sentido ofrecer un free tier), o el valor está claro desde la landing y conviene cobrar directo?"

> **Implicación técnica (no la pases por alto):** si eliges **free tier / onboarding-first**, habrá usuarios GRATIS que se registran ANTES de pagar, y la compra de Hotmart debe **SUBIR** esa cuenta a Pro (no crear una nueva). Ese seam —y su bug típico, el email del registro que no coincide con el de la compra— está documentado en `18-VENTA-HOTMART.md` → "Los dos modelos de creación de usuario". Decidir el modelo aquí; implementarlo según `18` y `26-AUTH-MODERNO.md`.

---

## EL ONBOARDING QUE CONVIERTE — PATRONES DE LAS MEJORES APPS

### El patrón de Cal AI ($35M → adquirida 2026)

Cal AI empieza con un video demo corto, incluye personalización profunda a lo largo del flujo, está lleno de animaciones e interacciones, pide una reseña a mitad del onboarding, genera un plan personalizado, y solo entonces muestra el paywall: un "free trial" anual con 75% de descuento.

Cal AI mejoró significativamente sus tasas de conversión añadiendo preguntas al onboarding que no afectaban la funcionalidad de la app pero aumentaban el engagement del usuario.

Lección clave: **las preguntas del onboarding no tienen que ser solo funcionales — también son herramientas de construcción de compromiso.** Cada pregunta que el usuario responde es un micro-compromiso que aumenta su inversión emocional.

### El patrón de Noom (hasta 113 pantallas de onboarding)

El onboarding de Noom convierte a través de construcción progresiva de compromiso: las preguntas sensibles se enmarcan con contexto, las expectativas se establecen deliberadamente, y el paywall aparece solo después de que los usuarios han invertido tiempo y energía emocional significativos. La pantalla de carga que anima mientras "construye tu plan" no es relleno — es el argumento de apertura del paywall.

Lección clave: **el "loading screen" que genera el plan del usuario es en realidad el inicio del pitch de venta.** El usuario ve su resultado renderizarse en tiempo real y ya quiere protegerlo pagando.

### El patrón de Duolingo (gradual engagement + loss aversion)

El onboarding de Duolingo guía a los usuarios a través de un ejercicio real antes de pedir que se registren. El registro se siente como un pequeño paso dentro de un proceso más grande, en vez de un obstáculo frustrante en el camino a lograr valor.

Duolingo convierte el tiempo en el producto y el progreso acumulado en disposición a pagar mediante loss aversion y formación de hábitos — no solo mediante paywalls de fricción.

Lección clave: **el momento del registro o pago debe sentirse como un paso natural dentro de un proceso que ya empezó, no como una puerta.**

---

## LOS 5 TRABAJOS DEL ONBOARDING (qué debe LOGRAR, antes de cómo se diseña)

Un onboarding que convierte no es solo "corto" — es **estratégico**. Antes de pensar pantallas, verificar que el flujo hace estos 5 trabajos en orden. Si falta uno, el paywall llega frío:

```
1. SEGMENTAR   → saber quién es el usuario (nicho, objetivo, nivel). 1-2 preguntas.
2. PERSONALIZAR→ mostrarle algo construido CON sus respuestas (no una bienvenida genérica).
3. ACTIVAR     → que HAGA una acción de valor (no que lea sobre la app). Primera victoria.
4. CREAR DESEO → mostrar lo que PODRÍA conseguir (el resultado renderizándose, el plan, la preview).
5. PREPARAR EL PAGO → que el paywall se sienta como el paso natural siguiente, no como una puerta.
```

> Estos 5 trabajos son el "qué". Las 7 reglas de abajo son el "cómo". Un onboarding largo que segmenta y personaliza pero nunca ACTIVA (el usuario no logró nada con sus propias manos) convierte peor que uno corto que sí da la primera victoria.

---

## LAS 7 REGLAS DEL ONBOARDING DE ALTA CONVERSIÓN

Basadas en la investigación de 2026 y los patrones de las apps top:

```
1. UNA DECISIÓN POR PANTALLA (Ley de Hick aplicada al onboarding)
   Una pregunta, una opción, un avance. Nada más en pantalla.
   Los "quiz" de onboarding que convierten tienen 1 elemento por paso.

2. CADA PREGUNTA CAMBIA ALGO REAL
   Solo preguntar lo que afecta la experiencia O construye compromiso.
   Las preguntas decorativas que no personalizan nada destruyen conversión.
   PERO: las preguntas que no afectan la funcionalidad pero aumentan el
   engagement (Cal AI) sí tienen lugar — son micro-compromisos.

3. BARRA DE PROGRESO SIEMPRE VISIBLE
   El efecto goal gradient: las personas se esfuerzan más mientras más cerca
   están de completar un objetivo. Una barra al 70% genera más urgencia que
   una al 0%. El progreso predispone a completar.

4. PERSONALIZACIÓN QUE SE VE
   El onboarding debe decir "basado en tus respuestas, tu plan es X" —
   no una pantalla genérica de bienvenida. Usar el nombre, el objetivo,
   las respuestas del usuario en el resultado que se muestra.

5. ANIMACIÓN DEL RESULTADO ANTES DEL PAYWALL
   El "loading screen" que genera el plan (como Noom) es la preparación
   del paywall. El usuario ve algo construirse para él — cuando llega el
   precio, ya lo quiere proteger.

6. LA PRIMERA VICTORIA ANTES DE 60 SEGUNDOS
   Si no hay free tier: el primer resultado útil debe aparecer
   inmediatamente después del pago/registro.
   Si hay free tier: la primera victoria lleva al paywall de forma natural.

7. SKIP DISPONIBLE EN PASOS NO CRÍTICOS
   Paradójicamente, dar la opción de saltar aumenta la conversión porque
   reduce la resistencia. El usuario que elige quedarse está más comprometido.
```

---

## ¿CUÁNTAS PANTALLAS/PREGUNTAS DEBE TENER EL ONBOARDING? (con datos 2026)

La longitud larga NO es exagerada cuando el onboarding construye un PLAN PERSONALIZADO — los líderes van largo a propósito:
```
Noom     → hasta ~113 pantallas (10-15 min). El quiz largo ES el motor de conversión.
Cal AI   → ~20 pasos (preguntas + insights + features) → plan personalizado → trial corto.
Duolingo → ~7 preguntas rápidas + un ejercicio real ANTES de pedir registro.
Yuka (utilidad) → deliberadamente CORTO: el valor es obvio, el quiz solo estorba.
```
**LA REGLA POR TIPO DE APP (el factor que más mueve la conversión — decidir ANTES de diseñar):**
```
BIENESTAR / FITNESS / FINANZAS / HÁBITOS (el valor se PERSONALIZA):
  → 15-25 micro-pantallas (preguntas + insights + barra de progreso) que terminan en
    "Tu plan personalizado está listo" e INMEDIATAMENTE el paywall.
  → 15-20 preguntas NO es exagerado aquí: es el estándar de las apps de $35M+. Cada pregunta es un
    micro-compromiso (sesgo de inversión). Alargar el onboarding SUBE la conversión a pago
    (QUITTR; Cal AI: 61 experimentos de paywall → 57% trial→pago).

UTILITARIAS / HERRAMIENTAS (el valor es OBVIO):
  → ≤5 pantallas, o ir DIRECTO al valor. Un quiz largo aquí MATA la conversión: es fricción pura
    ("si el valor es obvio, el quiz retrasa al usuario de experimentarlo" — RevenueCat 2026).
  → Ventana útil: 30-60 segundos hasta la primera victoria.
```
> El agente DEBE clasificar la app (¿personaliza un plan, o es utilidad de valor obvio?) y fijar la
> longitud del onboarding antes de diseñar. Meter 20 preguntas en una utilidad espanta; meter 5 en
> una app de bienestar deja conversión sobre la mesa.

---

## EL DISEÑO DEL PAYWALL QUE CONVIERTE

### La anatomía de un paywall de alta conversión

La eliminación de texto excesivo y el diseño enfocado en un mensaje claro aumentaron la conversión de install-to-trial en un 72%. Los paywalls cortos con reseñas reales del App Store y un dato impactante sobre el resultado de la app superan a los paywalls largos con muchas features listadas.

```
ELEMENTOS OBLIGATORIOS:
✅ Encabezado que refleja el objetivo DEL USUARIO (no los features del producto)
   "Tu plan para [su meta] está listo" vs "Accede a todas las funciones"
✅ El resultado personalizado visible (usa su nombre, su meta, su respuesta)
✅ Prueba social específica: número de usuarios O reseña real con nombre y foto
✅ Las 3 funciones más importantes — sin más
✅ Precio con ancla: el mensual como referencia "cara" y el anual mostrado como $/mes (NUNCA el total), con "2 meses gratis"
✅ CTA con beneficio: "Empezar mi plan" vs "Suscribirse"
✅ Garantía visible: "30 días o te devolvemos el dinero" (reduce el miedo)
✅ Fecha exacta de cuándo se cobra (si hay trial)

ELEMENTOS QUE MATAN LA CONVERSIÓN:
❌ Listas largas de features (crea fatiga de decisión)
❌ Varios planes con diferencias confusas
❌ Precio mensual solo sin ancla anual
❌ CTA genérico ("Enviar", "Continuar", "Suscribirse")
❌ Sin garantía ni reversión de riesgo
❌ Pantalla idéntica para todos (ignorar la personalización del onboarding)
```

### Las 7 preguntas que el paywall debe responder (la narrativa, no solo los elementos)

Un buen paywall no es una lista de precios — es un argumento. Antes de cerrar el diseño, verificar que la pantalla responde estas 7 preguntas en la cabeza del usuario, en este orden. Si una queda sin responder, ahí se cae la conversión:

```
1. ¿QUÉ DESBLOQUEO?      → el resultado/transformación, no las features (encabezado).
2. ¿POR QUÉ AHORA?       → el momento (acabas de ver tu plan/preview; tu prueba termina el día X).
3. ¿QUÉ PIERDO SI NO SIGO?→ aversión a la pérdida honesta (tu plan/progreso queda sin completar).
4. ¿QUÉ GANO HOY?        → el valor inmediato al pagar (acceso completo, primera victoria protegida).
5. ¿PUEDO CANCELAR?      → reversión de riesgo (cancela cuando quieras, garantía de devolución).
6. ¿CUÁL PLAN ME CONVIENE?→ un plan recomendado OBVIO (anual como $/mes, badge, pre-seleccionado).
7. ¿Y SI NO QUIERO AHORA?→ salida limpia ("Ahora no" / seguir con versión limitada), sin culpa.
```

**Estructura narrativa que ensambla las 7** (de arriba a abajo en la pantalla):
```
Headline de RESULTADO  → "Crea contenido con IA sin empezar desde cero" (responde 1)
Subheadline PERSONAL   → "Preparamos tu ruta según tu nicho y objetivo" (usa sus respuestas)
Beneficios concretos   → máx 3, en lenguaje de resultado (responde 1 y 4)
Prueba social          → número real o reseña con nombre (baja el riesgo percibido)
Plan recomendado       → anual $/mes pre-seleccionado + "2 meses gratis" (responde 6)
Confianza/reversión    → garantía + fecha de cobro + "cancela cuando quieras" (responde 5 y 2)
CTA con beneficio      → "Desbloquear mi plan" (responde 4)
Salida limpia          → "Ahora no" (responde 7, sin confirmshaming)
```

> La regla 3 (aversión a la pérdida) es la más fácil de convertir en dark pattern. Hacerla HONESTA: "tu plan queda sin completar" (real) ✅ — no "vas a fracasar sin esto" (culpa) ❌. Ver ética de gamificación en `03` y `24`.

### LA CAPA DE PERSUASIÓN — cómo las "máquinas de conversión" venden (psicología + copywriting)

Un paywall y un onboarding que convierten no solo están "bien diseñados" — están construidos sobre psicología de la decisión. El dato base: **~95% de las decisiones de compra/registro son subconscientes y emocionales; la lógica solo JUSTIFICA después** (Cialdini). Por eso la emoción inicia la acción y los datos la respaldan. Estos son los gatillos que usan Duolingo, Noom, Cal AI y las top — aplicados con ÉTICA (gatillo real, nunca manipulación; ver `03`):

```
LOS 7 PRINCIPIOS DE CIALDINI, APLICADOS AL ONBOARDING + PAYWALL:
1. COMPROMISO Y CONSISTENCIA → micro-compromisos en el onboarding. Quien YA invirtió tiempo, convierte.
   Duolingo: pre-comprometerse a una meta diaria + racha ANTES de la 1ª lección. Pide pequeñas decisiones
   que el usuario quiera honrar.
2. RECIPROCIDAD → dar valor ANTES de pedir pago (la preview, el plan, un insight gratis). Noom: cada
   pregunta DEVUELVE algo (un dato, una validación) — el usuario siente que ya recibió antes de pagar.
3. PRUEBA SOCIAL → "+12.000 personas ya lo usan", reseña con nombre y foto, rating. 97% de la gente se
   deja influir por reseñas. Específica > abstracta.
4. AUTORIDAD → respaldo creíble (método, ciencia, experto, números reales). Noom apoya en CBT/ciencia.
5. ESCASEZ / URGENCIA → solo si es REAL (oferta de fundador que expira, cupos reales). Falsa = dark pattern.
6. SIMPATÍA (liking) → hablarle como un aliado, en su lenguaje, con su nombre y su meta. Cal AI: tono
   cercano + personalización profunda + pedir reseña a mitad del onboarding (cuando el ánimo está alto).
7. UNIDAD / IDENTIDAD → "para personas como tú que [identidad]". Atoms (James Clear): hábitos basados en
   identidad — "conviértete en alguien que [meta]".
```

```
GATILLOS DE COPYWRITING (el lenguaje que convierte):
- AVERSIÓN A LA PÉRDIDA (2× más fuerte que ganar): enmarca lo que PIERDE, no solo lo que gana.
  ✅ "No pierdas el plan que armaste" · ✅ "Deja de perder 2 horas por carrusel" — no solo "ahorra tiempo".
- ANCLAJE: muestra primero el precio ALTO (mensual) para que el anual se sienta ganga (ver pricing abajo).
- ESPECIFICIDAD: "$1.847 en 21 días" convierte más que "gana dinero rápido". El número concreto da crédito.
- EMOCIÓN PRIMERO, LÓGICA DESPUÉS: el titular toca la emoción (la transformación); los bullets dan la
  razón lógica para justificar la compra que la emoción ya inició.
- "CADA PREGUNTA DEVUELVE ALGO" (Noom): en el onboarding, tras un dato sensible, responde con
  reconocimiento/insight ("la mayoría que empieza como tú ve [X] en 2 semanas"). Nunca solo "siguiente".
- EL LOADING QUE CONSTRUYE EL PLAN es persuasión: el usuario VE su resultado armándose → ya lo quiere proteger.
- CTA en primera persona y de beneficio: "Empezar MI plan" > "Suscribirse" (el usuario se apropia de la acción).
- REVIEW PROMPT a mitad del onboarding (Cal AI), en el pico emocional, no al final.
```

> **Límite ético (no negociable):** estos gatillos venden DANDO valor real, no explotando. Prohibido: urgencia/escasez falsa, culpa ("no, prefiero seguir fracasando"), prueba social inventada, esconder el precio o la cancelación. Un gatillo deshonesto es deuda de confianza (ver `03` y `47`). La diferencia entre máquina de conversión y dark pattern es si el usuario, al pagar, recibe lo que la emoción le prometió.

### La estrategia de pricing en el paywall

El pricing anual presentado junto al mensual hace que el plan anual se sienta como una ganga. Los precios que terminan en .99 pueden subir la conversión 3-7%, especialmente en LATAM y Asia.

```
ESTRUCTURA DE PRICING RECOMENDADA (regla de oro: el ANUAL siempre se muestra como precio MENSUAL):
- Plan mensual: $X/mes (el ancla — el "caro").
- Plan anual: mostrarlo como "$Y/mes" (facturado anualmente), NUNCA el total anual en grande.
  → Así el anual se ve MÁS BARATO que el mensual de un vistazo — esa comparación es la que vende.
  → El total anual va solo en letra chica (transparencia/cumplimiento): "$Y/mes · se cobra $Z/año".
  → Pre-seleccionado por defecto + badge "Más popular / Mejor valor" → +15-20% eligen anual (Mojo).
  → Mostrar el ahorro como "2 MESES GRATIS" (≈17%) — convierte mejor que un "%". Descuento óptimo 15-20%.

DATO LATAM (CLAVE para Hotmart): mostrar el anual como mensual dio +60% de ARPU y, EN BRASIL,
  +45% de ingreso por impresión de paywall (Mojo/RevenueCat) — "particularmente efectivo en mercados
  de menor ingreso". Es de las palancas más rentables para una app vendida por Hotmart en LATAM.

PARA LATAM:
- Precios en número redondo o .99 (ej: $19.99 en vez de $20)
- Descomponer el precio por día/semana ("menos de $1 al día") reduce el sticker shock
- La garantía de devolución es más importante aquí que en mercados anglosajones
```

Las apps de precio alto convierten 2x mejor que las de precio bajo: mediana de 2.8% vs 1.4%. Cobrar más no reduce necesariamente la conversión — puede aumentarla si comunica más valor.

### Modelo de CRÉDITOS / uso (clave en apps de IA con costo variable alto)

Cuando cada acción cuesta dinero real (imagen, audio, video, generaciones largas), la suscripción "plana ilimitada" puede destruir el margen — un usuario intensivo se come la ganancia de diez. Ahí el modelo correcto es **suscripción + cuota de créditos por plan**, con compra de créditos extra. Esto NO sustituye al fair-use interno de `30` (control de costo en el servidor) — es su cara visible: convierte el límite en un eje de pricing en vez de en un freno invisible.

```
CUÁNDO USAR CRÉDITOS:
- La app usa IA cara por acción (imagen/audio/video, o texto muy largo).
- Hay usuarios intensivos que justifican un tier superior.
- Quieres evitar abuso sin poner un "ilimitado" que mienta.

ESTRUCTURA TIPO (ajustar números al COGS real de 30/40):
- Starter:  ~30 generaciones/mes   → para probar y enganchar.
- Pro:      ~150 generaciones/mes  → el plan recomendado (cubre al usuario frecuente).
- Max:      ~500 generaciones/mes + prioridad/cola rápida → para el usuario intensivo.
- Créditos extra: "compra 100 generaciones adicionales" (ingreso incremental sin cambiar de plan).
```

> **REGLA DE ORO — vende RESULTADOS, no la unidad técnica.** El usuario promedio no compra "tokens" ni "500.000 tokens"; compra resultados. Empaqueta y nombra la cuota en la unidad que el usuario entiende:
> - ❌ "Incluye 500.000 tokens" · "2.000 créditos de cómputo"
> - ✅ "Incluye 100 guiones al mes" · "30 videos generados" · "50 análisis de contenido"
>
> Internamente puedes medir en tokens/créditos de proveedor (ElevenLabs, etc. — ver `30`), pero la UI y el paywall hablan en resultados. Mostrar también el contador como resultado ("Te quedan 42 guiones este mes"), nunca como saldo técnico. La economía de cada tier de créditos se valida contra el COGS y la "regla de 30" (IA < 20% del precio) en `40-UNIT-ECONOMICS.md`.

> **Free tier en apps de IA cara:** no regales generaciones ilimitadas. El patrón que protege margen Y crea deseo: **1 resultado o preview gratis** → paywall para completar/exportar/generar más. Ver el nicho "IA creativa" abajo.

### Lifetime deals — usar con pinzas

Un pago único "de por vida" puede servir para **validación temprana** (caja rápida, primeros testimonios), pero destruye el ingreso recurrente si das demasiado acceso para siempre: el costo de servir (IA, infra) sigue corriendo mes a mes contra un ingreso que ya cobraste una vez. Si se usa: limitarlo en el tiempo o en cupo, y nunca como modelo principal de una app con COGS de IA continuo. La suscripción recurrente es el modelo por defecto del SO (ver `40`).

---

## ESTRATEGIA SEGÚN EL TIPO DE APP (decidir antes de diseñar)

El tipo de app es el factor que MÁS mueve la conversión. No hay un onboarding ni un paywall "mejor" en abstracto — hay uno correcto para cada hábito y valor percibido. Abajo, los 7 nichos con su estrategia completa (primera victoria → onboarding → paywall → monetización → retención). Elegir el del proyecto y fijar todo ANTES de diseñar.

### A) EDUCACIÓN / APRENDIZAJE (idiomas, cursos, skills) — referencia: Duolingo
```
OBJETIVO:        crear HÁBITO y progreso visible (el valor se acumula con el uso diario).
PRIMERA VICTORIA: completar la primera lección/ejercicio real (no leer una explicación).
ONBOARDING:      ~7 preguntas rápidas (meta + nivel) + un ejercicio real ANTES de pedir registro.
PAYWALL:         después de la primera victoria. "Ya completaste tu primera práctica. Continúa sin
                 límites, con ejercicios personalizados y seguimiento avanzado."
MONETIZACIÓN:    FREEMIUM útil + premium (quitar fricción, acelerar progreso, desbloquear funciones).
                 Freemium tiene sentido aquí porque necesitas volumen y hábito, y el uso mejora el producto.
RETENCIÓN:       rachas, niveles, metas diarias, recordatorios (loop "Educación/idiomas" de 24).
NO HACER:        cobrar antes de que entienda CÓMO aprende · clases largas al inicio · esconder
                 demasiado tras el pago si necesitas hábito · rankings que distraigan del aprendizaje.
```

### B) BIENESTAR / MEDITACIÓN / SALUD MENTAL — referencias: Headspace, Calm
```
OBJETIVO:        confianza, calma y continuidad (relación de largo plazo, sin presión).
PRIMERA VICTORIA: una primera sesión corta (respirar, dormir, enfocarse) que el usuario SIENTE.
ONBOARDING:      suave y emocional. Preguntar el objetivo emocional (dormir mejor, reducir estrés,
                 enfocarse) con lenguaje tranquilo. 15-25 micro-pantallas que terminan en "tu plan listo".
PAYWALL:         tras la mini-experiencia. "Tu plan de calma está listo. Empieza con sesiones guiadas
                 para dormir mejor y reducir estrés." Vender continuidad, no urgencia agresiva.
MONETIZACIÓN:    TRIAL gratis (5-9 días, óptimo) + anual destacado. Onboarding LARGO + trial CORTO.
RETENCIÓN:       rutina emocional diaria (dormir, meditar, respirar) — el loop, no la presión.
NO HACER:        copy agresivo "última oportunidad" · saturar de descuentos · hacer sentir culpa ·
                 prometer resultados exagerados.
```

### C) FITNESS / NUTRICIÓN / TRACKING — referencias: Cal AI, MyFitnessPal, Strava
```
OBJETIVO:        reducir fricción brutalmente y mostrar progreso (Cal AI: foto → estimación en segundos).
PRIMERA VICTORIA: el primer registro/análisis hecho (foto de comida, primer tracking).
ONBOARDING:      rápido + personalizado. Pedir lo mínimo, dar una acción inmediata antes del primer registro.
                 15-25 micro-pantallas + plan animado (Cal AI: 61 experimentos de paywall → 57% trial→pago).
PAYWALL:         tras el primer análisis. "Ya analizamos tu primer registro. Desbloquea seguimiento
                 inteligente, historial y recomendaciones personalizadas."
MONETIZACIÓN:    TRIAL (5-9 días) + anual; CRÉDITOS si la IA por acción es cara. Email recordatorio Día 5-6.
RETENCIÓN:       check-ins diarios/semanales, progreso, racha (loop "Fitness/nutrición" de 24).
NO HACER:        vender desde la INSEGURIDAD corporal · usar vergüenza/culpa/comparación física ·
                 prometer resultados irreales · onboarding largo ANTES del primer registro · hablar
                 solo de números (hablar de control, claridad, constancia).
```

### D) IA CREATIVA / CONTENIDO / VIDEO / DISEÑO — el nicho central de muchas apps de este SO
```
OBJETIVO:        resultado inmediato y "wow moment". El usuario no quiere aprender la herramienta —
                 quiere PRODUCIR algo ya.
PRIMERA VICTORIA: el primer resultado generado (una preview usable en <2 minutos).
ONBOARDING:      ULTRA corto. "¿Qué quieres crear?" → caso de uso → preview rápida. Plantillas por caso
                 (anuncio, guion, carrusel, video, avatar, landing). El usuario NO escribe prompts desde cero.
PAYWALL:         después de la PREVIEW. "Tu primer guion está listo. Desbloquea la versión completa,
                 edítala y genera variaciones listas para publicar."
MONETIZACIÓN:    1 preview/generación gratis → paywall para completar/exportar/generar más.
                 SUSCRIPCIÓN + CRÉDITOS (la IA por acción es cara — ver sección de créditos arriba y 30/40).
                 Cobrar por: exportar, generar más, calidad premium, guardar proyectos, plantillas premium.
RETENCIÓN:       calendario y producción, NO "entra a jugar". "Hoy toca crear tu guion del día" ·
                 "Te faltan 2 piezas para completar tu semana" · "Tu calendario está al 70%"
                 (loop "Creación de contenido" de 24).
NO HACER:        mostrar 40 herramientas en la primera pantalla · hablar de modelos/tokens/parámetros ·
                 hacer escribir prompts desde cero · regalar IA ilimitada si el costo es alto.
```

### E) PRODUCTIVIDAD / ORGANIZACIÓN / NOTAS / CALENDARIO — referencias: Notion, Linear
```
OBJETIVO:        ahorrar tiempo y reducir caos (vender "menos desorden", no "más funciones").
PRIMERA VICTORIA: la primera tarea organizada / algo ordenado (agenda, lista priorizada, resumen listo).
ONBOARDING:      problema → solución. Conectar con un dolor concreto y mostrar un resultado rápido.
                 Modelo 1 (hard paywall) o Modelo 2 corto; la primera tarea completada en minutos.
PAYWALL:         después de ordenar algo. "Organizamos tu semana. Desbloquea automatizaciones,
                 recordatorios inteligentes y planificación recurrente."
MONETIZACIÓN:    SUSCRIPCIÓN. Cobrar por automatizaciones, integraciones, recordatorios, colaboración.
RETENCIÓN:       automatizaciones y sistema acumulado (loop "Productividad" de 24).
NO HACER:        empezar pidiendo mil permisos · pedir conectar calendario/Gmail/archivos ANTES de
                 explicar el beneficio · vender "más features" en vez de "menos caos".
```

### F) FINANZAS / INVERSIÓN / DINERO — referencias: Revolut, Wise
```
OBJETIVO:        confianza, claridad y control. Aquí NO va un paywall juguetón — el usuario necesita seguridad.
PRIMERA VICTORIA: un diagnóstico o visualización inicial de su situación.
ONBOARDING:      confianza + datos claros. Mostrar transparencia, privacidad y seguridad. La prueba social
                 (número de usuarios, auditorías) va ANTES del paywall.
PAYWALL:         después del diagnóstico. "Tu panorama financiero está listo. Desbloquea reportes
                 avanzados, alertas y recomendaciones personalizadas."
MONETIZACIÓN:    premium / reportes / alertas / automatización. Modelo 2 con énfasis en confianza.
RETENCIÓN:       alertas y reportes periódicos.
NO HACER:        prometer ganancias · urgencia agresiva · ocultar costos · gamificación que haga
                 parecer el dinero un juego.
```

> **Por qué no hay nicho de e-commerce/marketplace aquí:** TODA app de este SO se vende como **suscripción recurrente por Hotmart** (ver `18`/`40`). El comercio con checkout de productos o membresía de marketplace queda fuera del modelo — si una idea solo monetiza por compra única, no encaja con este SO (revisar la idea en `01`/`02`).

### MATRIZ ESTRATÉGICA CONSOLIDADA (de un vistazo)

| Nicho | Primera victoria | Onboarding | Paywall | Monetización | Retención |
|---|---|---|---|---|---|
| Educación | Completar 1ª lección | Metas + nivel + ejercicio real | Después de probar | Freemium + premium | Rachas / progreso |
| Bienestar | Primera sesión corta | Suave / emocional | Tras mini-experiencia | Trial + anual | Rutina diaria |
| Fitness / tracking | Primer registro/análisis | Rápido + personalizado | Tras el 1er análisis | Trial / créditos / premium | Check-ins |
| IA creativa | Primer resultado generado | Ultra corto, por caso de uso | Tras la preview | Créditos + suscripción | Calendario / proyectos |
| Productividad | Primera tarea organizada | Problema → solución | Tras ordenar algo | Suscripción | Automatizaciones |
| Finanzas | Diagnóstico inicial | Confianza + datos claros | Tras el diagnóstico | Premium / reportes | Alertas / reportes |

> **Nota sobre trial (aplica a B/C/F):** trial gratis de 7 días con tarjeta (modalidad Hotmart); el punto óptimo es 5-9 días (~45% trial→pago, Adapty 2026; Cal AI usa 3). El patrón ganador es **onboarding LARGO + trial CORTO**, no al revés. Programar email de recordatorio el Día 5-6 ("tu prueba termina, esto perderás"). Config en `18-VENTA-HOTMART.md`. Los loops de retención por nicho están desarrollados en `24-GAMIFICACION.md`.

### LA FÓRMULA PARA UNA APP DE IA (qué copiar de cada referencia)

No copiar 100% a ninguna. Tomar lo correcto de cada una:
```
De Duolingo:  progreso visible, hábito, rachas útiles, pequeñas victorias.
De Headspace: onboarding emocional, claridad, calma, promesa simple.
De Cal AI:    reducir fricción brutalmente y dar resultado inmediato.
De apps de IA: preview antes del pago, créditos, exportación premium, plantillas listas.

La fórmula:
"Dime qué quieres crear → te doy una preview útil → desbloquea la versión completa →
 vuelve cada día para completar tu sistema de contenido."
```

---

## MÉTRICAS CLAVE A MEDIR (implementar desde el día 1)

```
ONBOARDING
- Tasa de completación del onboarding (meta: >70%)
- Tasa de abandono por paso (identificar el paso donde más se van)
- Tiempo hasta la primera victoria (<60 segundos es el objetivo)
- Tasa de activación (% que completa la primera acción de valor)

PAYWALL
- Vista del paywall → inicio de trial o compra (tasa de conversión del paywall)
- Trial → pago (meta: >40%; el punto óptimo de duración es 5-9 días, Adapty 2026)
- Día 0 de cancelación (el 55% de las cancelaciones ocurren el Día 0 — si es >20%, el onboarding no construye suficiente compromiso)

RETENCIÓN
- D1 (meta: >40%), D7 (meta: >20%), D30 (meta: >10%)
- Churn mensual (meta aspiracional <8%; para MODELAR el LTV usa el churn realista 10-20% de `40-UNIT-ECONOMICS.md`)
```

---

## CHECKLIST DE ONBOARDING Y PAYWALL

```
DISEÑO DEL ONBOARDING
[ ] 1 decisión por pantalla
[ ] Barra de progreso visible en todo el onboarding
[ ] Cada pregunta personaliza el resultado O construye compromiso
[ ] "Skip" disponible en pasos no críticos
[ ] Animación que genera el "plan personalizado" antes del paywall
[ ] La primera victoria del usuario ocurre antes de los 60 segundos

DISEÑO DEL PAYWALL
[ ] Encabezado con el objetivo del usuario (no features del producto)
[ ] El resultado personalizado visible (nombre, meta, respuestas del onboarding)
[ ] Prueba social específica (número real o reseña con nombre)
[ ] Máximo 3 features destacados
[ ] Precio con ancla: mensual vs anual con % de ahorro
[ ] CTA con beneficio ("Empezar mi plan")
[ ] Garantía de devolución visible
[ ] Fecha exacta de cobro si hay trial

ESTRATEGIA
[ ] Orden de diseño respetado: tipo de app → promesa → frecuencia → primera victoria → paywall → pricing → retención (no al revés)
[ ] Nicho identificado y su estrategia tomada de la matriz (A-F): primera victoria, onboarding, paywall, monetización y retención fijados ANTES de diseñar
[ ] Frecuencia de uso definida (diaria/semanal/puntual) → modelo elegido (freemium=hábito · hard paywall / preview→paywall=resultado)
[ ] El onboarding hace los 5 trabajos (segmentar · personalizar · activar · crear deseo · preparar el pago)
[ ] El paywall responde las 7 preguntas (qué desbloqueo · por qué ahora · qué pierdo · qué gano · puedo cancelar · cuál plan · salida limpia)
[ ] Decisión tomada: ¿hard paywall, onboarding→paywall, o freemium?
[ ] Trial definido: 7 días por defecto (óptimo 5-9 días) — onboarding largo + trial corto, no al revés
[ ] Longitud del onboarding fijada por tipo de app (15-25 pantallas bienestar/fitness · ≤5 utilidad)
[ ] Si la IA por acción es cara: créditos por plan definidos y empaquetados en RESULTADOS (no tokens), validados contra el COGS (40)
[ ] Plan anual mostrado como $/mes (NUNCA el total), pre-seleccionado, con badge y "2 meses gratis"
[ ] Pricing en .99 si el mercado es LATAM; precio descompuesto por día/semana
[ ] Métricas de onboarding y paywall configuradas para medir desde el día 1
```
