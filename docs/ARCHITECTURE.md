# Arquitectura

## Capas

- `src/match/engine.ts`: creación, ticks, posesión, acciones, marcador y ciclo del partido.
- `src/entities/types.ts`: contratos serializables del estado.
- `src/physics/movement.ts`: distancias, movimiento y cruce barrido de línea de gol.
- `src/ai/tactics.ts`: estados guard/support/press/mark/intercept/attack y objetivos locales.
- `src/rules/offside.ts`: referencia visual y snapshot independiente del renderizado.
- `src/controls/input.ts`: teclado, multitáctil por Pointer Events y acciones consumibles.
- `src/scenes/Pitch.ts`: dibujo procedural Phaser; sin recursos externos.
- `src/main.ts`: composición, acumulador fijo y UI DOM.
- `src/config/settings.ts`: parámetros iniciales de dificultad.
- `src/ui`, `src/replay`: espacios reservados; UI inicial en main y repeticiones pendientes.
- `locales/game.*.json`: textos de juego; `locales/es.json` y `en.json` conservan los del simulador.
- `public/learn`: copia del simulador original con rutas autónomas. La copia omite el registro del worker legado; lo controla el worker raíz de producción. El archivo app.js original permanece intacto.

## Reloj

Phaser entrega delta real, main acumula hasta 100 ms por frame y avanza pasos de 1/60 segundo. Una caída prolongada de FPS ralentiza el reloj en lugar de crear saltos o avalanchas de ticks. El cambio de pestaña pausa. Las acciones se consumen una vez; el movimiento es continuo y normalizado.

## Física y determinismo

Simulación propia de círculos y balón con velocidad y amortiguación exponencial. Separación elemental de cuerpos, rebote de límites y captura por radio. Colisión de gol barrida para evitar perder goles rápidos. No se usa Arcade Physics para conservar lógica comprobable en Node. No hay aleatoriedad ni solicitudes de IA.

## Build y PWA

Vite con base relativa. Plugin `offline-assets` recorre dist tras compilar y genera precache de todos sus archivos. El worker usa cache-first y fallback de navegación a inicio si no existe la URL exacta; rutas conocidas se precargan. El worker anterior de la raíz fuente no entra en dist. Actualizaciones esperan el ciclo normal de cierre de pestañas; no fuerzan recarga durante el partido. LocalStorage conserva idioma con tolerancia a almacenamiento deshabilitado.

Dependencias: solo Phaser en runtime; TypeScript, Vite y tipos Node para desarrollo. Node ejecuta pruebas TypeScript con strip-types. Las versiones exactas instaladas quedan en package-lock.json.

La memoria de apoyos (destino y siguiente observación) vive en Player y se serializa con el partido. La metadata flight del balón distingue pases, tiros y rechaces. `physics/goalkeeping.ts` resuelve rebotes de tiros lejanos sin dependencias de Phaser. Todos los plazos usan tiempo de simulación.
