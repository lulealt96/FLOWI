# ASSETS VISUALES — Qué Imágenes Necesita la App y Cómo Generarlas

> **Cuándo cargar este archivo:**
> - Cuando la app o la página de ventas necesitan elementos visuales (logo, favicon, imágenes)
> - Junto con `16-DIRECCION-DE-ARTE.md` (los assets deben seguir la dirección de arte)
>
> **Regla:** la IA no puede generar imágenes de marca por sí misma dentro del flujo de código. Cuando llegue el momento, debe DECIRLE al usuario exactamente qué imágenes generar, con qué herramienta, y con qué prompt — y mientras tanto, dejar placeholders limpios para no bloquear el desarrollo.

---

## QUÉ ASSETS NECESITA TODA APP (lista de verificación)

```
OBLIGATORIOS
[ ] Favicon (el ícono de la pestaña del navegador) — 512x512px, fondo sólido o transparente
[ ] Logo del producto (para header de la app y de la landing) — versión horizontal + ícono solo
[ ] Open Graph image (la preview al compartir el link en redes/WhatsApp) — 1200x630px

SEGÚN LA APP / LANDING
[ ] Imagen/screenshot del producto para el hero de la página de ventas
[ ] Ilustraciones o íconos custom para los bloques de beneficios (si el set de Lucide no basta)
[ ] Imágenes dentro de la app (avatares por defecto, estados vacíos ilustrados, banners)
[ ] Imágenes de fondo o texturas (solo si la dirección de arte las pide)
```

**Regla de mínimos:** no inflar. Para íconos de interfaz, usar Lucide React (ya disponible, gratis, cohesivo) — NO generar imágenes para eso. Generar imágenes solo para: logo, favicon, OG image, hero del producto, e ilustraciones de marca puntuales.

---

## CÓMO GENERARLAS (recomendación por defecto al usuario)

Cuando llegue el momento, la IA le dice al usuario:

> "Necesito que generes estas [N] imágenes. Te recomiendo usar **ChatGPT** (con generación de imágenes) o **Gemini** — ambos sirven y probablemente ya tienes acceso. Para íconos/logos más afinados, Ideogram o Recraft son aún mejores, pero con ChatGPT/Gemini alcanza perfecto. Aquí tienes el prompt exacto para cada una:"

Y entrega los prompts listos para pegar, alineados con la dirección de arte (paleta, personalidad, estilo) definida en `16-DIRECCION-DE-ARTE.md`.

### Plantillas de prompt para el usuario

**Logo / ícono de marca:**
```
"Logo minimalista para una app llamada [nombre], de [nicho/qué hace].
Estilo: [moderno/geométrico/orgánico según la personalidad].
Color principal: [hex del acento]. Fondo transparente.
Símbolo simple y memorable, que funcione en tamaño pequeño (favicon).
Sin texto, solo el ícono. Plano, sin sombras 3D."
```

**Favicon** (puede derivarse del logo): pedir la versión cuadrada 512x512 del ícono, fondo sólido del color de marca o transparente.

**Open Graph image (preview al compartir):**
```
"Imagen de 1200x630px para compartir [nombre app] en redes sociales.
Fondo [color de marca]. El logo + el headline '[promesa principal]'.
Estética premium, [personalidad]. Texto grande y legible."
```

**Hero del producto** (si no se usa un screenshot real):
```
"Mockup/visual de la app [nombre] en un teléfono, mostrando [pantalla principal].
Estilo limpio, fondo [color], estética [referencia visual]. Premium, moderno."
```
Nota: SIEMPRE preferir un screenshot real del producto sobre una imagen generada para el hero — convierte más (ver `19-PAGINA-DE-VENTAS.md`).

---

## PLACEHOLDERS MIENTRAS TANTO (no bloquear el desarrollo)

Mientras el usuario genera las imágenes, la IA deja placeholders limpios y profesionales, NUNCA cuadros grises rotos:

```tsx
{/* PLACEHOLDER LOGO — reemplazar con el logo generado en /public/logo.svg */}
<div className="flex items-center gap-2">
  <div className="w-9 h-9 rounded-xl bg-[var(--brand-primary)] flex items-center
       justify-center text-white font-bold text-lg">
    {/* Inicial del nombre como placeholder elegante */}
    K
  </div>
  <span className="font-bold text-lg">[Nombre App]</span>
</div>

{/* PLACEHOLDER IMAGEN — reemplazar con [descripción]. Tamaño: [WxH]px */}
<div className="aspect-video rounded-2xl bg-gradient-to-br
     from-[var(--brand-primary-soft)] to-[var(--surface-tertiary)]
     flex items-center justify-center">
  <span className="text-[var(--text-tertiary)] text-sm">
    Imagen del producto (pendiente)
  </span>
</div>
```

**Favicon temporal con SVG inline** (funciona ya, se reemplaza después):
```html
<link rel="icon" href="data:image/svg+xml,
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <rect width='100' height='100' rx='22' fill='%23[COLOR]'/>
    <text x='50' y='68' font-size='60' font-weight='bold' fill='white'
      text-anchor='middle' font-family='system-ui'>[INICIAL]</text>
  </svg>" />
```

---

## PROTOCOLO DE ACTIVOS DE MARCA (la regla que separa una demo IA de algo creíble)

> **Por qué existe:** una app o un deck que nombra "Spotify", "Nike" o "iPhone" y los dibuja con una silueta CSS o una caja de color de marca grita "esto lo hizo una IA sin acceso a nada real". Un logo oficial y una foto de producto real comunican credibilidad en milisegundos — y la credibilidad es lo que se vende. Esta sección es de cumplimiento OBLIGATORIO, no "si lo tengo a mano".

### Regla de hierro

```
Si en el diseño aparece CUALQUIER producto o marca reconocible
→ su LOGO OFICIAL es un activo OBLIGATORIO del entregable.
No es opcional. No es "lo agrego si lo encuentro fácil".
Falta un logo de una marca nombrada = el entregable NO está terminado.
```

### Principio: ACTIVOS REALES > PALETA

El color de marca es lo último, no lo primero. Un logo oficial y una foto de producto real comunican más marca que el hex exacto del acento.

```
JERARQUÍA DE LO QUE COMUNICA MARCA (de más a menos):
1. Logo oficial embebido          ← imprescindible
2. Foto de producto real           ← imprescindible si el producto se muestra
3. Tipografía y layout coherentes
4. Color de marca                  ← lo último, nunca el sustituto de 1 y 2

PROHIBIDO: reemplazar una foto de producto real por una silueta CSS,
un emoji, o una caja con el color de marca. Si no tenés la foto, conseguila
(ver cadena de fallback); no la inventes con un <div>.
```

### SUB-PORTÓN DE LOGOS (para comparativas, rankings y decks)

Antes de empezar a construir un deck/comparativa/ranking que nombre varias marcas, hacé un **portón de control**: listá cada marca nombrada y confirmá que su logo está embebido. Si falta uno → **STOP**, conseguilo antes de seguir.

```
SUB-PORTÓN DE LOGOS — completar ANTES de construir
Marca nombrada        Logo embebido (ruta/URL)         Estado
--------------------  -------------------------------  --------
Spotify               /assets/logos/spotify.svg        [ ] OK
Apple Music           /assets/logos/apple-music.svg    [ ] OK
YouTube Music         (pendiente)                      [ ] FALTA → STOP
...

Regla: una sola fila en FALTA = no se empieza a maquetar. Cero excepciones.
```

### Cadena de fallback para conseguir los activos

```
LOGOS (probar en orden hasta obtener uno válido):
  1. svgl.app            → SVG limpios de marcas conocidas
  2. simpleicons.org     → set enorme de logos monocromos en SVG
  3. favicon del dominio → https://www.google.com/s/2/favicons?domain=marca.com
                           (o /favicon.ico del sitio oficial) como último recurso

IMÁGENES / FOTOS DE PRODUCTO:
  1. Wikimedia Commons   → fotos con licencia, atribución clara
  2. Unsplash            → fotos de alta calidad
  Siempre con User-Agent conforme en las requests automatizadas
  (ej: "AppName/1.0 (contacto@dominio)") — sin esto, Wikimedia/Unsplash bloquean.
```

> Regla de cierre de esta sección: si el entregable nombra marcas y NO tiene sus logos reales, no se entrega. Es lo que separa "una demo de IA" de "algo que el cliente cree que es real" — y eso es exactamente lo que se está vendiendo.

---

## REGLAS DE ASSETS

```
[ ] Todas las imágenes optimizadas: WebP/AVIF, <200KB (ver 13-INFRA-ESCALABILIDAD.md)
[ ] El logo en SVG cuando sea posible (escala sin perder calidad)
[ ] Los assets siguen la paleta y personalidad de 16-DIRECCION-DE-ARTE.md
[ ] La IA entrega al usuario la LISTA exacta de qué generar + el prompt de cada uno
[ ] Mientras tanto, placeholders limpios (gradientes/iniciales), nunca cuadros rotos
[ ] OG image configurada (sin esto, el link compartido se ve roto en WhatsApp/redes)
[ ] Favicon configurado (sin esto, la pestaña se ve amateur)
[ ] Toda marca/producto reconocible que aparece tiene su LOGO OFICIAL embebido (no silueta CSS)
[ ] Para deck/comparativa/ranking: SUB-PORTÓN DE LOGOS completo (cero filas en FALTA)
[ ] Ninguna foto de producto real reemplazada por un <div> de color de marca
```
