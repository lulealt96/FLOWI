# SISTEMA DE DESIGN TOKENS

## Objetivo
Definir un sistema de colores, tipografía, espaciado y efectos basado en tokens semánticos (CSS variables) que garantice consistencia visual, habilite dark mode desde el primer día, y permita cambiar toda la apariencia de la app modificando un solo archivo.

---

## ¿Por Qué Tokens y No Clases de Color Directas?

```css
/* ❌ INCORRECTO — Color hardcodeado */
.card { background: #ffffff; color: #1a1a1a; border: 1px solid #e5e5e5; }

/* ✅ CORRECTO — Token semántico */
.card { background: var(--surface-primary); color: var(--text-primary); border: 1px solid var(--border-default); }
```

Con tokens:
- Cambiar de tema (claro/oscuro) es modificar variables, no 200 clases.
- Los colores tienen SIGNIFICADO (--surface-primary dice "fondo principal", #ffffff no dice nada).
- La mayoría de usuarios prefiere dark mode hoy (verificar el dato exacto para tu nicho). Sin tokens, implementar dark mode requiere reescribir todo el CSS.

---

## Estructura de Tokens

### Tokens de Color — Dark Theme (base)

El SO es **dark-first**: el tema oscuro es el `:root` base y el claro es la variante opcional.

> **Set de tokens canónico.** Los nombres semánticos largos (`--surface-primary`, `--text-primary`,
> `--brand-primary`) se definen aquí, y abajo se exponen los **alias cortos** que usan `14`, `16` y `29`:
> `--bg`, `--surface`, `--accent`, `--text`. Documentado UNA vez aquí; los demás archivos lo citan.
>
> **El acento (`--accent`/`--brand-primary`) es un PLACEHOLDER NEUTRO.** El acento real lo fija el
> brand kit del PASO 0 de `16`. No hardcodear un azul (#2563eb) como si fuera la marca.
>
> **La rampa de neutros es un PLACEHOLDER frío** (grises puros sin tinte). Reemplazarla por
> neutros con tinte (cálido o frío según la marca) en el PASO 0.5 de `16` — un dark con un
> sutil tinte se ve más intencional que el gris puro.

```css
:root {
  /* ====== SUPERFICIES (fondos) — dark base ====== */
  --surface-base: #0A0A0B;           /* Fondo de página */
  --surface-primary: #0F0F12;        /* Cards, modales, contenedores principales */
  --surface-secondary: #141417;      /* Secciones alternas, sidebars */
  --surface-tertiary: #1A1A1F;       /* Inputs, áreas recesadas */
  --surface-elevated: #1A1A1F;       /* Elementos flotantes (dropdowns, tooltips) */
  --surface-overlay: rgba(0,0,0,0.7); /* Overlay detrás de modales */
  
  /* ====== TEXTOS ====== */
  --text-primary: #E8E8EA;           /* Títulos y texto principal */
  --text-secondary: #A1A1AA;         /* Descripciones, subtítulos */
  --text-tertiary: #71717A;          /* Placeholders, texto auxiliar */
  --text-inverse: #0A0A0B;           /* Texto sobre fondos de color */
  --text-link: var(--brand-primary); /* Links */
  
  /* ====== BORDES ====== */
  --border-default: #27272A;         /* Bordes normales */
  --border-strong: #3F3F46;          /* Bordes con más contraste */
  --border-focus: var(--brand-primary); /* Focus rings */
  
  /* ====== MARCA — PLACEHOLDER NEUTRO (el acento real lo fija el PASO 0 de 16) ====== */
  --brand-primary: #E8E8EA;          /* PLACEHOLDER neutro — NO un azul de marca; reemplazar */
  --brand-primary-hover: #FFFFFF;    /* Hover del color principal (placeholder) */
  --brand-primary-soft: rgba(232,232,234,0.10); /* Fondo sutil del acento (placeholder) */
  --brand-primary-text: #0A0A0B;     /* Texto sobre color principal */

  /* ====== ALIAS CORTOS — set canónico que citan 14/16/29 ====== */
  --bg: var(--surface-base);         /* fondo de página */
  --surface: var(--surface-primary); /* superficie de cards/contenedores */
  --text: var(--text-primary);       /* texto principal */
  --accent: var(--brand-primary);    /* acento (placeholder neutro hasta el PASO 0 de 16) */
  
  /* ====== ESTADOS SEMÁNTICOS ====== */
  --status-success: #22c55e;
  --status-success-soft: rgba(34,197,94,0.12);
  --status-error: #ef4444;
  --status-error-soft: rgba(239,68,68,0.12);
  --status-warning: #f59e0b;
  --status-warning-soft: rgba(245,158,11,0.12);
  --status-info: #38bdf8;
  --status-info-soft: rgba(56,189,248,0.12);
  
  /* ====== SOMBRAS (más profundas en dark) ====== */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.4);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.5);
  --shadow-lg: 0 10px 25px -5px rgba(0,0,0,0.6);
  --shadow-overlay: 0 25px 50px -12px rgba(0,0,0,0.7);
  
  /* ====== RADIOS ====== */
  --radius-sm: 0.375rem;   /* 6px — chips, badges */
  --radius-md: 0.5rem;     /* 8px — inputs, botones */
  --radius-lg: 0.75rem;    /* 12px — cards */
  --radius-xl: 1rem;       /* 16px — modales, secciones */
  --radius-full: 9999px;   /* Circular — avatares, pills */
  
  /* ====== TIPOGRAFÍA ====== */
  --font-display: 'TU_FUENTE_DISPLAY', system-ui, sans-serif;
  --font-body: 'TU_FUENTE_BODY', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  
  /* Tamaños */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  --text-4xl: 2.25rem;    /* 36px */
  
  /* Pesos */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;

  /* Tracking (letter-spacing) — los displays usan tracking-tight */
  --tracking-tight: -0.02em;
  --tracking-tighter: -0.03em;

  /* Leading (line-height) */
  --leading-tight: 1.1;   /* displays / titulares grandes */
  --leading-snug: 1.2;    /* subtítulos */
  --leading-base: 1.5;    /* cuerpo de texto */
  --leading-relaxed: 1.6; /* párrafos largos */
  
  /* ====== ESPACIADO ====== */
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  
  /* ====== CURVAS DE EASING (14-LEYES-DE-DISENO es el dueño único de las curvas) ====== */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);     /* salidas: rápido y desacelera (default UI) */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);         /* entradas: acelera al salir */
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* rebote sutil (overshoot) */

  /* ====== TRANSICIONES (construidas sobre las curvas de arriba) ====== */
  --transition-fast: 150ms var(--ease-out);
  --transition-base: 200ms var(--ease-out);
  --transition-slow: 300ms var(--ease-out);
  --transition-spring: 500ms var(--ease-spring);
  
  /* ====== Z-INDEX (escala fija, nunca inventar valores) ====== */
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-overlay: 30;
  --z-modal: 40;
  --z-toast: 50;
}

/* ====== UTILITY: números tabulares (métricas, tablas, contadores) ====== */
/* Sin esto, las cifras "bailan" al actualizarse porque cada dígito tiene ancho distinto.
   Aplicar en columnas de números, dashboards, timers, precios. (Regla en 14, micro-tipografía.) */
.tabular { font-variant-numeric: tabular-nums; }
```

### Tokens de Color — Light Theme (variante opcional)

El dark es el base (`:root`). El claro es un override que solo invierte lo que cambia.

```css
[data-theme="light"] {
  --surface-base: #ffffff;
  --surface-primary: #ffffff;
  --surface-secondary: #f9fafb;
  --surface-tertiary: #f3f4f6;
  --surface-elevated: #ffffff;
  --surface-overlay: rgba(0,0,0,0.5);
  
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;
  --text-inverse: #ffffff;
  
  --border-default: #e5e7eb;
  --border-strong: #d1d5db;

  /* acento placeholder neutro también en claro — el real lo fija el PASO 0 de 16 */
  --brand-primary: #18181B;
  --brand-primary-hover: #000000;
  --brand-primary-soft: rgba(24,24,27,0.06);
  --brand-primary-text: #ffffff;
  
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 25px -5px rgba(0,0,0,0.1);
}
```

### Dark Mode Robusto a Nivel Plataforma (lo que los tokens solos NO arreglan)

Los tokens controlan tu CSS, pero hay tres piezas nativas del navegador/SO que ignoran tus variables y se ven rotas en dark si no las declaras explícitamente:

```css
/* 1. color-scheme: arregla scrollbars, inputs nativos, autofill, date pickers
      del navegador para que rendericen en su variante oscura */
:root { color-scheme: dark; }
[data-theme="light"] { color-scheme: light; }
```

```html
<!-- 2. theme-color: pinta la barra del navegador (mobile) y el chrome del SO
        para que matcheen el fondo de la app, no quede una franja blanca arriba -->
<meta name="theme-color" content="#0A0A0B" media="(prefers-color-scheme: dark)">
<meta name="theme-color" content="#ffffff"  media="(prefers-color-scheme: light)">
```

```css
/* 3. <select> nativo: en Windows dark mode el desplegable hereda blanco-sobre-blanco
      (bug real). Forzar background-color y color explícitos. */
select {
  background-color: var(--surface-tertiary);
  color: var(--text-primary);
}
```

Sin `color-scheme`, un dark mode "perfecto" en tu CSS aún muestra scrollbars claras e inputs nativos blancos — la señal #1 de un dark mode a medias.

### Implementar el Toggle de Tema

```typescript
// hooks/useTheme.ts
function useTheme() {
  // El SO es dark-first: :root = dark. El claro es un override [data-theme="light"].
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    // 1. Respetar preferencia guardada
    const saved = localStorage.getItem('theme');
    if (saved) return saved as 'light' | 'dark';
    // 2. Default = dark (base del SO); pasar a claro solo si el sistema lo pide explícito
    return window.matchMedia('(prefers-color-scheme: light)').matches
      ? 'light' : 'dark';
  });

  useEffect(() => {
    // dark es :root → solo seteamos el atributo para el override claro
    if (theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  return { theme, toggleTheme };
}
```

**Regla para MVP**: Si implementar dark mode no es prioridad, IGUALMENTE usar tokens semánticos. Así cuando quieras agregar dark mode después, es agregar un bloque CSS, no reescribir la app.

---

## Tokens de Accesibilidad

### Contraste de Color — Mínimos Obligatorios (WCAG 2.2 AA)

```
Texto normal (<18px):        4.5:1 ratio mínimo con su fondo
Texto grande (≥18px bold):   3:1 ratio mínimo con su fondo
Elementos de UI (íconos, bordes): 3:1 ratio mínimo con su fondo
Focus indicators:            3:1 ratio con el fondo adyacente
```

**Herramientas para verificar**: Usar la extensión "Colour Contrast Checker" en el navegador, o WebAIM Contrast Checker online.

**Errores comunes de contraste:**
```css
/* ❌ FALLA — gris claro sobre blanco (ratio ~2:1) */
.subtitle { color: #d1d5db; background: #ffffff; }

/* ✅ PASA — gris suficientemente oscuro (ratio ~4.6:1) */
.subtitle { color: #6b7280; background: #ffffff; }

/* ❌ FALLA — texto blanco sobre azul claro */
.badge { color: #ffffff; background: #93c5fd; }

/* ✅ PASA — texto oscuro sobre azul claro */
.badge { color: #1e3a5f; background: #93c5fd; }
```

### Target Size — Áreas Táctiles Mínimas (WCAG 2.2)

```css
/* WCAG 2.2 Level AA: mínimo 24x24px */
/* Recomendación para apps touch: 44x44px */

.button, .link-touchable, [role="button"] {
  min-height: 44px;
  min-width: 44px;
  /* Si el elemento visual es más pequeño, usar padding */
  padding: 8px 16px;
}

/* Íconos clickeables necesitan área táctil expandida */
.icon-button {
  position: relative;
  width: 24px;
  height: 24px;
}
.icon-button::before {
  content: '';
  position: absolute;
  inset: -10px; /* Expande el área táctil sin cambiar el visual */
}
```

### Focus Visible — Obligatorio para Navegación por Teclado

```css
/* Base: focus visible solo con teclado (no con mouse) */
:focus-visible {
  outline: 2px solid var(--border-focus);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* Eliminar el outline de mouse pero mantener el de teclado */
:focus:not(:focus-visible) {
  outline: none;
}
```

### Reduce Motion — Respetar Preferencia del Usuario

**`prefers-reduced-motion` NO significa "cero animación".** Significa: el usuario tiene una condición vestibular (mareo, náusea) que dispara el MOVIMIENTO y la POSICIÓN, no el color ni la opacidad. Matar todas las transiciones a `0.01ms` es un error común: rompe fades y cambios de color que ayudan a *comprender* qué pasó (un elemento que aparece sin fade se siente como un glitch, no como respeto a la accesibilidad).

Regla correcta: **quitar solo movimiento/posición (transform, translate, scale grandes, parallax, autoplay); conservar opacity/color.**

```css
/* ❌ INCORRECTO — mata TODA animación, incluidos fades inofensivos */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* ✅ CORRECTO — neutraliza movimiento, deja fades y color */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    /* corta loops y scroll animado (lo que marea) */
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }
  /* anula desplazamiento/escala pero NO toca opacity ni color */
  [data-motion],
  .stagger-1, .stagger-2, .stagger-3, .stagger-4 {
    transform: none !important;
    animation-name: fade-only !important; /* mismo timing, sin translateY */
  }
}
@keyframes fade-only { from { opacity: 0 } to { opacity: 1 } }
```

Para valores de posición controlados en JS (Framer Motion / animaciones por estado), usar el hook para **sustituir el valor de movimiento, no para apagar todo**:

```tsx
import { useReducedMotion } from 'motion/react';

const reduce = useReducedMotion();
// el fade se queda; el desplazamiento se anula
const variants = {
  hidden:  { opacity: 0, y: reduce ? 0 : 12 },
  visible: { opacity: 1, y: 0 },
};
```

**Esto es obligatorio, no opcional.** Algunos usuarios tienen condiciones vestibulares que pueden causar mareos o náuseas con el movimiento. Respetar la preferencia es accesibilidad básica — pero respetarla bien es conservar lo que comunica y quitar solo lo que marea. (Detalle de animación accesible en `41-CRAFT-DE-ANIMACION.md`.)

---

## HTML Semántico — Estructura Correcta

La estructura HTML de la app debe usar las etiquetas correctas, no solo `<div>` para todo:

```html
<!-- ✅ CORRECTO — HTML Semántico -->
<body>
  <header role="banner">
    <nav aria-label="Navegación principal">
      <!-- Links de navegación -->
    </nav>
  </header>
  
  <main id="main-content">
    <section aria-labelledby="section-title">
      <h1 id="section-title">Título de la sección</h1>
      <article>
        <!-- Contenido de un resultado/item -->
      </article>
    </section>
    
    <aside aria-label="Barra lateral">
      <!-- Contenido secundario -->
    </aside>
  </main>
  
  <footer role="contentinfo">
    <!-- Links legales, contacto -->
  </footer>
</body>

<!-- ❌ INCORRECTO — Div soup -->
<body>
  <div class="header">
    <div class="nav">...</div>
  </div>
  <div class="content">
    <div class="section">
      <div class="title">...</div>
    </div>
  </div>
</body>
```

**¿Por qué importa?** Los lectores de pantalla usan las etiquetas semánticas para construir un índice de la página. Sin ellas, los usuarios con discapacidad visual no pueden navegar la app. También mejora el SEO.

---

## Formularios Accesibles — Patrón Correcto

```html
<!-- ✅ CORRECTO — Label asociado, error descriptivo, aria-attributes -->
<div class="field">
  <label for="email">Correo electrónico</label>
  <input 
    id="email"
    type="email" 
    aria-describedby="email-error"
    aria-invalid="true"
    placeholder="tu@email.com"
  />
  <p id="email-error" role="alert" class="error">
    Ingresa un correo válido
  </p>
</div>

<!-- ❌ INCORRECTO — Sin label, sin asociación -->
<div>
  <input type="email" placeholder="Email" />
  <p class="error">Error</p>
</div>
```

### Validación de Formularios — Cuándo Validar

```
Al escribir (onBlur): Validar cuando el usuario SALE del campo. 
  No validar mientras escribe (frustrante).

Al enviar (onSubmit): Validar todo de nuevo antes de enviar. 
  Enfocar automáticamente el primer campo con error.

Validación inline: Mostrar el error DEBAJO del campo, no en un toast 
  o en la parte superior de la página.

Éxito inline: Mostrar checkmark verde cuando el campo es válido 
  (solo para campos que el usuario puede dudar, como passwords).
```

---

## Core Web Vitals — Las 3 Métricas que Importan

### LCP (Largest Contentful Paint) — Objetivo: <2.5 segundos
Mide cuánto tarda el elemento más grande visible en cargar.

**Cómo optimizar:**
- El contenido principal debe cargar primero (no detrás de JS pesado)
- Imágenes en formatos modernos (WebP, AVIF)
- Fuentes con `font-display: swap` para no bloquear el render
- Precargar recursos críticos: `<link rel="preload">`

### INP (Interaction to Next Paint) — Objetivo: <200ms
Mide la latencia entre la acción del usuario y la respuesta visual.

**Cómo optimizar:**
- Event handlers livianos (no computación pesada en onClick)
- Debounce en inputs que disparan re-renders
- Web Workers para procesamiento pesado
- React: evitar re-renders innecesarios con useMemo/useCallback

### CLS (Cumulative Layout Shift) — Objetivo: <0.1
Mide cuánto se mueve el layout mientras carga.

**Cómo optimizar:**
- Siempre definir width/height en imágenes y videos
- Reservar espacio para contenido dinámico (skeleton loaders)
- Fuentes con `font-display: optional` o `swap` + `size-adjust`
- No insertar contenido arriba del viewport después del render inicial

---

## Cómo Usar Este Archivo

### Integración con Tailwind CSS

Los tokens CSS se integran con Tailwind extendiendo el config:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        surface: {
          base: 'var(--surface-base)',
          primary: 'var(--surface-primary)',
          secondary: 'var(--surface-secondary)',
          tertiary: 'var(--surface-tertiary)',
        },
        brand: {
          primary: 'var(--brand-primary)',
          'primary-hover': 'var(--brand-primary-hover)',
          'primary-soft': 'var(--brand-primary-soft)',
        },
        txt: { // 'text' está reservado en Tailwind
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
        },
      },
      fontFamily: {
        display: 'var(--font-display)',
        body: 'var(--font-body)',
      },
      borderRadius: {
        DEFAULT: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
    }
  }
}
```

Así puedes escribir `bg-surface-primary text-txt-secondary` en vez de clases hexadecimales, y al cambiar el token CSS cambia toda la app.

Si NO usas Tailwind config personalizado, usar las variables directamente en los estilos inline o en clases CSS:
```tsx
<div style={{ background: 'var(--surface-primary)', color: 'var(--text-primary)' }}>
```

### Pasos de Implementación

1. **Al inicio del proyecto**: Copiar los tokens CSS al archivo global de estilos
2. **Personalizar**: Cambiar --brand-primary y las fuentes según la marca de la app
3. **Referenciar siempre tokens**: NUNCA usar colores hexadecimales directos en componentes
4. **Verificar contraste**: Cada vez que elijas un color de texto sobre un fondo
5. **Probar con teclado**: Navegar la app entera solo con Tab, Enter y Escape
6. **Probar reduce-motion**: Activar "reduce motion" en el sistema y verificar que la app funcione sin animaciones
