# Posts de Nicolas Francese — Ejemplos por Pilar

Estos son posts reales de alta performance de Nicolas, organizados por pilar de contenido.
Usarlos como referencia de voz, estructura y estilo. NO copiarlos. Usarlos para calibrar tono.

---

## Pilar 1 — GTM Engineering & Outbound

### Ejemplo 1 (👍28 💬5)
```
resolvimos el mayor cuello de botella de outbound, GTM engineering y los LLMs:

el contexto.

durante meses vi lo mismo en equipos de gtm y Sales

- utilizaban Clay o herramientas de personalización, pero sin contexto del prospect o de la empresa
- flujos de n8n bien armados, pero sin criterio
- AI escribiendo… sin entender el negocio

usando Claude Code, Cursor, Railway y Supabase logré construir

→ una capa de contexto real por cliente
pains, value props, buyer personas, industria, icp, casos de uso, diferenciación vs competencia, case studies

→ inputs claros sobre cómo escribir buen outbound
cómo pensar cold emails y mensajes de linkedin, no solo "prompts"

→ una base de datos en supabase
con toda la info viva de los clientes de zalesmachine

→ una api hosteada en railway
para consumir ese contexto directo desde clay, n8n o cualquier herramienta que lea via api.

resultado:

copys ultra hiper-personalizados y al mismo tiempo relevante para esa persona y empresa.

nuestro foco es implementar tecnología para estar cada vez mas cerca de la lógica y accionar de un SDR/BDR top-performer.

qué pasaría si tu outbound realmente entendiera a tu cliente antes de escribirle?

#gtmengineering #outbound #ai
```

### Ejemplo 2 (👍29)
```
cómo estás implementando AI en tu empresa?

las compañías están apurándose para implementar AI en todos los departamentos.

para 2027, el 85% de las organizaciones dependerá de ellos.

pero la verdad es que, en la mayoría de los casos, lo que muchos creen que es un agente de IA…

en realidad es solo un flujo de trabajo inteligente.

[diferencia entre non-agentic workflow / agentic workflow / AI Agents con ejemplos concretos de follow-up a un lead]

A. non-agentic workflow → el humano hace todo el razonamiento
B. agentic workflow → semi-autónomo, ahorra tiempo pero no se adapta
C. AI Agents → personalizado. contextual. coordina múltiples herramientas.
```

### Ejemplo 3 (👍60 💬6)
```
recordatorio amigable del día - a nadie le importa tu producto

lo que importa es en quién se convierte el cliente después de usarlo

la mayoría de los vendedores muestra esto:

cliente potencial + producto

y espera que el prospecto haga la cuenta mental

pero nadie compra una herramienta

compran lo que esa herramienta les permite hacer

una buena venta no explica el producto, vende el beneficio del producto,
la transformacion que va a causar

no vendas el power-up, vendé al mario tirando fuego

porque eso es lo que el cliente quiere comprar
```

---

## Pilar 2 — Automatizaciones B2B (Clay, n8n, Claude Code)

### Ejemplo 4 (👍28 💬5) — mismo que Pilar 1 Ejemplo 1
*(El post sobre la capa de contexto con Clay, n8n, Claude Code aplica a ambos pilares)*

### Ejemplo 5 (👍26)
```
buscas una guía práctica para estructurar tu campaña outbound de principio a fin?

➝ define con precisión tu ICP
quién es tu cliente ideal? tamaño, industria, rol, ubicación.

➝ generación y enriquecimiento de leads
LinkedIn Sales Navigator + Icypeas, Apollo, Clay, Snov.io

➝ añadí datos concretos
tecnologías usadas (BuiltWith), señales de crecimiento (Firecrawl), event-triggers (Apify, Trigify.io)

➝ secuencia de outreach personalizada
"Vi que están contratando…", "Noté que usás X herramienta…"
lo podes hacer desde Clay integrado con Claude, OpenAI o Gemini

➝ orquestación
clay para orquestar, Smartlead/Instantly para cold emails, HeyReach para leads actualizados

probar ➝ iterar ➝ optimizar ➝ escalar
```

---

## Pilar 3 — Content-Led Growth (LinkedIn como canal)

### Ejemplo 6 — qué funcionó en GTM (👍7 💬4)
```
qué funcionó en gtm en 2025 y qué va a funcionar en 2026 (basado en datos globales)

lo que sí funcionó en 2025:

1. eficiencia sobre crecimiento desmedido
...rule of 40, cac payback saludable, foco en margen. el "growth at all costs" murió.

2. expansión > adquisición masiva
nrr arriba de 120% fue el verdadero motor.

3. precisión en el targeting
menos leads, más cuentas correctas.

2026 no es más de lo mismo optimizado. es una evolución.

la diferencia en una frase:
2025 fue optimizar el funnel. 2026 es rediseñar el sistema.

como lo están pensando ustedes?
```

---

## Pilar 4 — Casos de Éxito con Números

### Ejemplo 7 (👍21 💬7)
```
en una campaña reciente, usamos whatsapp como canal complementario a email..

volumen bajo a propósito.
15 contactos.
2 demos agendadas.
13% de conversión.

la reacción típica es:
"es poco volumen".

la lectura puede ser:
es altísima intención.

whatsapp no es un canal para spamear.
es un canal para aparecer cuando el contexto ya existe.

funciona mejor cuando:
el prospect ya tuvo contacto previo
hay reconocimiento de marca
el mensaje no vende, reengancha
```

### Ejemplo 8 (👍69 💬8)
```
nuestro workspace de HeyReach.io en 2025.

este año fue un año de puro crecimiento para ZalesMachine...

- superamos los 20 clientes activos (startups VC-Backed, corporaciones valuadas en +20B)
- nuestro equipo creció 5x
- automatizamos +50 flujos operativos internos

pero no todo fue color de rosas.
también nos equivocamos, aprendimos, corregimos y mejoramos.

[contexto cultural de ZalesMachine: estar a la altura, high-performance teams]
```

---

## Pilar 5 — Herramientas & Frameworks

### Ejemplo 9 (👍12)
```
el equipo preocupado por los ads,
por el launch,
por hacer más "ruido",

- cuando no está claro para quién es el producto
- el mensaje cambia cada mes
- nadie ha hablado con suficientes clientes
...

más tráfico sobre una base débil no arregla nada.

el gtm no se rompe arriba. se rompe abajo.

cómo se construye profundidad?

- hablando con clientes hasta que empieces a escuchar patrones
- definiendo un icp tan específico que puedas decir a quién NO es para tu producto
...

la profundidad no es sexy.
pero es lo único que sostiene el crecimiento cuando el buzz se apaga.
```

### Ejemplo 10 (👍18 💬4)
```
estos son los errores más comunes que vemos en campañas b2b (y cómo evitarlos)

➝ relevancia sin personalización. O personalización sin relevancia.
combinar relevancia + personalización es lo que hace la diferencia.

➝ icp demasiado amplio
cuanto más específico es el perfil ideal, más efectivo es el outreach

➝ secuencias genéricas sin contexto real
si el mensaje podría enviarse a cualquiera, no conecta con nadie

➝ métricas superficiales en lugar de conversión
200 respuestas suenan bien, 0 demos agendadas no.

la buena noticia:
nada de esto es estructural
son errores comunes que se corrigen rápido con ajustes específicos
```
