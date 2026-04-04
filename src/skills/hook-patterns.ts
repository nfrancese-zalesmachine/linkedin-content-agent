import type { ContentPillar } from '../types/index.js';

// Hand-curated hook patterns per pillar, based on real posts from Nicolas
const HOOK_PATTERNS: Record<ContentPillar, string[]> = {
  1: [ // GTM Engineering & Outbound
    'Declaración polémica: "[afirmación contraintuitiva sobre GTM/outbound]"',
    'Número + resultado inesperado: "X [acción]. Y [resultado que sorprende]."',
    'El error que todos cometen: "[lo que hace la mayoría] no arregla nada."',
    'La diferencia en una frase: "[2025 fue X. 2026 es Y.]"',
    'El cuello de botella nombrado: "resolvimos el mayor cuello de botella de [área]: [la causa real]."',
    'Contraste de fases: "en teoría, [X]. en la práctica, [Y opuesto]."',
    'El sistema roto: "el [proceso] no se rompe [donde todos creen]. se rompe [donde nadie mira]."',
  ],
  2: [ // Automatizaciones B2B
    'El tiempo ahorrado: "el [X]% del tiempo en [tarea] se va en pasos que un flujo de n8n puede hacer."',
    'El stack mínimo: "[herramienta 1] para [función 1]. [herramienta 2] para [función 2]. [herramienta 3] para [función 3]."',
    'La diferencia técnica: "la mayoría usa [herramienta] sin [componente clave]. por eso no escala."',
    'El proyecto real: "usé [herramientas específicas] para construir [sistema]. así funciona."',
    'El error de implementación: "el problema no es [herramienta]. es que la usan sin [elemento crítico]."',
    'La automatización que nadie ve: "[tarea manual que todos asumen necesaria] la puede hacer un flujo de [X] segundos."',
    'La pregunta que revela el problema: "si tu [proceso] requiere [N] pasos manuales, es una señal."',
  ],
  3: [ // Content-Led Growth
    'La paradoja del contenido: "publicás seguido y los números no mejoran. el problema no es la frecuencia."',
    'El dato del algoritmo: "linkedin premia [métrica real]. la mayoría optimiza para [métrica equivocada]."',
    'La estrategia real vs. la percibida: "estar activo en linkedin no es lo mismo que tener estrategia de contenido."',
    'El loop que pocos ven: "outbound funciona mejor cuando hay contenido que lo precede. así se cierra el loop."',
    'La métrica que importa: "likes no predicen pipeline. [otra métrica] sí."',
    'El formato ganador: "carousels generan [X] veces más engagement que imágenes simples en B2B. por esto."',
    'El post que no escribís: "el contenido que más genera DMs no es el más pulido. es el más honesto."',
  ],
  4: [ // Casos de Éxito con Números
    'El número inesperado: "[N] contactos. [M] demos. [%] de conversión."',
    'El resultado que parece pequeño pero no lo es: "[métrica pequeña]. la lectura es [interpretación no obvia]."',
    'El año en números: "en [año], [logro 1]. [logro 2]. [logro 3]. pero no todo fue color de rosas."',
    'El antes y después: "antes: [situación]. después de [cambio]: [resultado con número]."',
    'La campaña que falló: "lanzamos [campaña]. no funcionó. esto aprendimos."',
    'El cliente sin nombre: "un cliente de [industria/tamaño] tenía [problema]. en [tiempo], [resultado]."',
    'El reconocimiento como prueba: "[empresa reconocida] nos eligió como [reconocimiento]. así llegamos ahí."',
  ],
  5: [ // Herramientas & Frameworks
    'El error listado: "estos son los [N] errores más comunes en [proceso] (y cómo evitarlos)"',
    'La guía práctica: "guía para [objetivo concreto] de principio a fin."',
    'El framework con nombre: "el [nombre del framework]: [descripción en 5 palabras]."',
    'El checklist implícito: "antes de lanzar una campaña, checklist rápido:"',
    'El proceso simplificado: "[proceso complejo] en [N] pasos. sin herramientas caras."',
    'La comparación de enfoques: "[enfoque A] vs. [enfoque B]. cuándo usar cada uno."',
    'La pregunta que abre el framework: "si tu [proceso] no tiene [componente], esto es lo que está pasando."',
  ],
};

export function getHookPatterns(pillar: ContentPillar): string {
  const patterns = HOOK_PATTERNS[pillar];
  return patterns
    .map((p, i) => `Patrón ${i + 1}: ${p}`)
    .join('\n');
}

export function getAllHookPatterns(): string {
  return (Object.keys(HOOK_PATTERNS) as unknown as ContentPillar[])
    .map(p => `### Pilar ${p}\n${getHookPatterns(p)}`)
    .join('\n\n');
}
