# PLANTILLA — SELF-CHECK DE COHERENCIA DEL SO

Checklist que un agente recorre para detectar **incoherencias internas del propio Sistema Operativo** (el defecto histórico #1: referencias cruzadas que se desincronizan). Corre cada chequeo, pega la salida, marca ✅/❌ y reporta. Si todo está ✅ → el SO se puede reempacar.

Todos los comandos asumen que estás en la raíz del SO (`/Users/damian_romeero/app-prueba-so/`). Si no, ajusta las rutas o haz `cd` primero.

---

## (a) Toda ref `NN-*.md` y `PROMPT-*.txt` resuelve a un archivo existente

Extrae cada referencia citada en los docs y verifica que el archivo exista.

```bash
# Refs a docs numerados (ej. 33-RAG-Y-CONTEXTO.md) que NO existen:
cd docs/sistema && \
grep -rhoE '[0-9]{2}[AB]?-[A-ZÁÉÍÓÚÑ0-9-]+\.md' . | sort -u | while read f; do
  [ -e "$f" ] || echo "ROTA (doc): $f"
done

# Refs a prompts (ej. PROMPT-AUDITORIA.txt) que NO existen:
grep -rhoE 'PROMPT-[A-ZÁÉÍÓÚÑ0-9-]+\.txt' . | sort -u | while read f; do
  [ -e "$f" ] || echo "ROTA (prompt): $f"
done
```
Esperado: **sin salida**. Cualquier línea `ROTA:` es una ref colgada → corregir el texto o crear el archivo.

---

## (b) AGENTS.md == CLAUDE.md byte a byte, y == copias en patuno/

Los cuatro archivos (raíz y proyecto de ejemplo `patuno/`) deben ser idénticos.

```bash
# Raíz: AGENTS.md vs CLAUDE.md
diff -q AGENTS.md CLAUDE.md && echo "OK raiz" || echo "DIFIEREN raiz"

# patuno: AGENTS.md vs CLAUDE.md
diff -q patuno/AGENTS.md patuno/CLAUDE.md && echo "OK patuno" || echo "DIFIEREN patuno"

# Raíz vs patuno (basta comparar uno; si A==B en cada lado, comparar los CLAUDE.md cruza todo)
diff -q CLAUDE.md patuno/CLAUDE.md && echo "OK raiz-vs-patuno" || echo "DIFIEREN raiz-vs-patuno"
```
Esperado: **OK** en las tres. Si difieren, copiar la versión canónica (raíz) a las demás.

---

## (c) Fences (triple backtick) balanceados en cada doc

Cada doc debe tener un número PAR de delimitadores de bloque de código.

```bash
cd docs/sistema && for f in *.md; do
  n=$(grep -c "$(printf '\140\140\140')" "$f")
  [ $((n % 2)) -ne 0 ] && echo "IMPAR ($n): $f"
done
echo "fin"
```
Esperado: solo `fin` (sin líneas `IMPAR`). Un fence impar rompe el render del doc → buscar el bloque sin cerrar.

---

## (d) Sin contradicciones de números (conteo de docs, sesiones, rangos)

Verifica que el conteo real de docs coincida con lo que el SO AFIRMA de sí mismo.

```bash
# Conteo real de docs numerados (incluye 02B):
cd docs/sistema && ls | grep -E '^[0-9]{2}[AB]?-.*\.md$' | wc -l

# Rango real (primero y último):
ls | grep -E '^[0-9]{2}[AB]?-.*\.md$' | sort | sed -n '1p;$p'

# Dónde el SO afirma un conteo/rango — revisar a mano que coincida con lo de arriba:
cd ../.. && grep -rniE 'docs? numerados|[0-9]+ ?docs|01-[0-9]{2}|sesiones|pilares' \
  CLAUDE.md docs/sistema/00-SISTEMA-MAESTRO.md docs/sistema/INICIO.md \
  docs/sistema/REFERENCIA-RAPIDA.md CHANGELOG.md
```
Esperado: el número que afirman los docs == el `wc -l`; el rango citado == el rango real; el conteo de sesiones es consistente entre los docs que lo mencionan. Revisar las coincidencias a ojo.

---

## (e) IDs de modelo vigentes

Solo se permiten: `claude-opus-4-8`, `claude-sonnet-4-6`, `claude-haiku-4-5`, `fable-5`. Sin sufijo de fecha y sin versiones 3.x.

```bash
cd /Users/damian_romeero/app-prueba-so && \
# IDs prohibidos (versiones viejas o con fecha):
grep -rniE 'claude-[0-9]|claude-(opus|sonnet|haiku)-[0-9]+-[0-9]+-[0-9]{8}|gpt-|gemini' \
  CLAUDE.md docs/sistema/ ; \
# Sanity: lista los IDs vigentes encontrados (para confirmar que solo aparecen estos):
echo "--- vigentes ---" ; \
grep -rhoE 'claude-(opus|sonnet|haiku)-[0-9]+-[0-9]+|fable-[0-9]+' docs/sistema/ CLAUDE.md | sort | uniq -c
```
Esperado: la primera búsqueda **sin salida**; bajo `--- vigentes ---` solo `claude-opus-4-8 / claude-sonnet-4-6 / claude-haiku-4-5 / fable-5`.

---

## (f) Cada doc numerado aparece en la tabla de ruteo de CLAUDE.md

Ningún doc puede quedar huérfano (sin entrada en la tabla que decide qué leer).

```bash
cd /Users/damian_romeero/app-prueba-so && for f in docs/sistema/[0-9]*.md; do
  base=$(basename "$f")
  grep -q "$base" CLAUDE.md || echo "FALTA EN RUTEO: $base"
done
echo "fin"
```
Esperado: solo `fin`. Cada `FALTA EN RUTEO:` es un doc no ruteado → añadir su fila a la tabla de `CLAUDE.md` (y replicar en `AGENTS.md` + copias por el chequeo (b)).

---

## REPORTE

| Chequeo | Resultado | Incoherencias encontradas |
|---|---|---|
| (a) refs `NN-*.md` / `PROMPT-*.txt` | | |
| (b) AGENTS==CLAUDE (raíz + patuno) | | |
| (c) fences balanceados | | |
| (d) conteos/rangos/sesiones | | |
| (e) IDs de modelo | | |
| (f) docs en tabla de ruteo | | |

Si TODO ✅ → el SO es coherente y se puede reempacar. Si hay ❌ → corregir primero, re-correr el chequeo afectado, y solo entonces reempacar.
