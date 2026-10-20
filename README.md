# Offside Football — Simulador educativo

Simulador educativo bilingüe, gratuito y local para aprender el fuera de juego. El modo de práctica aporta una forma jugable de experimentar con la regla:

- **Aprender**: simulador SVG original con cinco jugadores arrastrables y escenarios de Regla 11.
- **Practicar**: primera entrega de fútbol 4v4 con Phaser; usuario azul, rival rojo y arqueros automáticos.

## Ejecutar

Requiere Node.js 22.18+ (recomendado Node 24 LTS) y npm.

```sh
npm install
npm run dev
npm test
npm run build
npm run preview
```

Abrir la URL que muestra Vite. Para PWA usar la compilación de producción con `npm run preview` o un servidor HTTPS. Tras la primera carga y finalización de la instalación del service worker, ambos modos quedan disponibles sin conexión. No se necesitan APIs, cuentas ni servicios de IA. No se solicitan recursos de CDN.

## Controles

WASD o flechas: movimiento; J: pase; K: tiro; L: quitar balón; Tab: cambiar jugador de campo. En móvil, joystick y botones equivalentes. El aro blanco identifica al seleccionado y el amarillo al destinatario del pase. Los arqueros no pueden seleccionarse. Pase y tiro actúan sobre el seleccionado cuando posee el balón.

La orientación se conserva al soltar el joystick o las teclas y se representa con una marca visible. Al recuperar el balón, el foco cambia al receptor azul de campo; el arquero permanece automático. Arqueros amarillo (azul) y violeta (rojo); no se les puede quitar el balón mientras lo tienen.

Con la orientación se elige al compañero de campo más alineado, usando distancia como desempate. La orientación inicial apunta hacia el arco rival. Si no existiera una dirección válida, se prefiere la línea despejada más cercana y, si todas están bloqueadas, el compañero más cercano. Posesión azul habilita botones de ataque; el jugador debe tener el balón para ejecutarlos.

## Partido y alcance

Dos minutos de simulación; victoria anticipada a siete goles. Empate al terminar: gol de oro sin límite. Cambiar de pestaña pausa el partido. La línea amarilla pertenece únicamente al último equipo que tocó el balón. **Es orientativa: no hay sanciones de fuera de juego en esta entrega.** Los límites rebotan el balón; no hay faltas, córners, laterales ni saques reglamentarios. No hay repeticiones todavía.

## Tecnología y publicación

TypeScript 5.9, Phaser 3.90.0, Vite 7 y pruebas con `node:test`. Phaser 3.90 es una versión estable de la serie 3, suficiente para gráficos 2D y controles; se fija para reducir variaciones durante el aprendizaje. Phaser 4 existe y su migración se evaluará por separado. Referencia: https://phaser.io/news/2025/05/phaser-v390-released

`npm run build` genera `dist/` con base relativa (`./`), compatible con `/simulador-fuera-de-juego/`. El plugin de compilación genera el service worker con todos los archivos de salida, incluidos bundles, idiomas y modo Aprender. Publicar únicamente el contenido de `dist/` mediante el mecanismo de Pages aprobado por el responsable; el repositorio fuente ya no se sirve directamente como aplicación compilada. No se modificó la configuración de GitHub Pages.

Documentación: [diseño](docs/GAME_DESIGN.md), [arquitectura](docs/ARCHITECTURE.md), [hoja de ruta y validación](docs/ROADMAP.md).

El tiro siempre apunta al arco rival: ángulo relativo al ataque de −90° (arriba) a +90° (abajo), interpolado linealmente entre y=218 y y=322; 0° apunta al centro. Direcciones hacia atrás saturan al extremo superior o inferior según el signo vertical. «Elevación» significa posición vertical en la pantalla, no altura física del balón.

Controles táctiles actuales: botones circulares en tres vértices de un rombo: Cambiar arriba, Pase/Quitar a la izquierda (según posesión), Tiro a la derecha. La IA conserva un jugador de cobertura, uno presiona y los demás cubren receptores con distancia. Arquero calibrado con reacción de 240 ms y velocidad intermedia; balance pendiente de evaluación en móvil.
