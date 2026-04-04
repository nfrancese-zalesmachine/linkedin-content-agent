# Formato: Lead Magnet

## Qué es un buen Lead Magnet en este contexto

Un documento de 3,000-5,000 palabras que un founder o director de ventas B2B usaría como guía de trabajo real. No un PDF de marketing. Un recurso que la persona guarda, vuelve a leer, y comparte con su equipo.

**Promesa base:** debe ser específica y cuantificable.
- Buena: "el playbook para construir un sistema de outbound que genera 30 reuniones/mes sin SDRs"
- Mala: "todo lo que necesitas saber sobre outbound moderno"

---

## Benchmarks de referencia (estructura comprobada)

### FETE Framework (Clay)
**Por qué funciona:** Un mental model de 4 pasos (Find, Enrich, Transform, Export) que organiza un proceso complejo. Cada paso es accionable independientemente.

**Lección:** Los mejores LMs tienen un framework central al que vuelve todo. Dale un nombre.

### HeyReach Lead Magnet Outreach Playbook
**Por qué funciona:** Promesa específica con número ("723+ leads/mes"), secuencia de 4 pasos, datos de tasa de respuesta mínima garantizada.

**Lección:** Los números en el título aumentan la descarga. No "más leads" sino "X leads/mes".

### Instantly.ai AI Outbound Playbook
**Por qué funciona:** Estructura de 3 fases, resultado medible ("15 demos en 10 días"), cada fase con herramienta específica.

**Lección:** Dividir en fases con timelines. "Semana 1: X. Semana 2: Y."

---

## Estructura del documento (8 secciones obligatorias)

### Sección 1 — Introducción: El Problema y la Promesa
- El problema específico que vive el ICP (1 párrafo)
- Por qué las soluciones actuales no alcanzan (1-2 párrafos)
- La promesa del documento: qué va a poder hacer después de leerlo
- **Longitud objetivo:** 300-400 palabras

### Sección 2 — El Framework Central
- Darle un nombre al framework (acrónimo o nombre memorable)
- Explicar la lógica de por qué funciona
- Diagrama de las partes (texto si no hay imagen)
- **Longitud objetivo:** 400-500 palabras

### Secciones 3-6 — Implementación paso a paso (4 secciones)
Cada sección sigue esta plantilla:

```
## [Nombre del Paso/Módulo]

**Qué es:** [definición en 1-2 líneas]

**Por qué importa:** [el costo de no hacerlo bien]

**Cómo implementarlo:**
1. [paso concreto con herramienta específica]
2. [paso concreto]
3. [paso concreto]

**Ejemplo real:**
[caso de ZalesMachine o cliente genérico con números]

**Error más común:**
❌ Lo que hace la mayoría: [descripción]
✅ Lo que funciona: [descripción]
```
- **Longitud objetivo por sección:** 400-600 palabras

### Sección 7 — Los 7 Errores Más Comunes
- Lista de 7 errores específicos de este proceso
- Cada error: nombre + por qué pasa + cómo evitarlo (3-5 líneas por error)
- **Longitud objetivo:** 500-700 palabras

### Sección 8 — Plan de 30 Días
- Semana 1: configurar base / definir ICP
- Semana 2: construir el stack / primeras pruebas
- Semana 3: lanzar y medir
- Semana 4: iterar con datos
- Cada semana: 3-5 acciones específicas con herramientas nombradas
- **Longitud objetivo:** 300-400 palabras

---

## Reglas de estilo para Lead Magnets

- **Tono:** más detallado que los posts, pero mismo DNA. Sin corporativo.
- **Datos:** cada afirmación lleva un número o una fuente. No "es mejor" sino "genera 3x más respuestas".
- **Herramientas:** nombrar siempre (Clay, n8n, HeyReach, Instantly, Supabase, etc.)
- **Ejemplos:** al menos 1 caso real por sección (puede ser "un cliente reciente" sin nombrar)
- **Comparaciones:** usar la tabla ❌/✅ para mostrar contrastes
- **Longitud por sección:** respetar los rangos — no rellenar ni cortar

---

## Formato de output del sistema

El sistema genera el LM en markdown, sección por sección. Luego se ensambla.

Cada sección sigue este formato de output del agente:

```json
{
  "sectionIndex": 1,
  "title": "El Problema que Nadie Quiere Nombrar",
  "content": "## El Problema que Nadie Quiere Nombrar\n\n[contenido completo en markdown]\n\n...",
  "wordCount": 350
}
```

El documento final se crea concatenando todas las secciones con un `---` entre cada una.
