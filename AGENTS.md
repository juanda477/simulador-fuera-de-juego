# Instrucciones de desarrollo

- Trabajar en `feat/juego` para esta entrega. Integración posterior autorizada por el responsable: `feat/juego` → `desarrollo` → `master`.
- No crear commits, push, despliegues ni modificar GitHub Pages sin autorización explícita.
- Conservar el simulador original (`app.js`, locales originales y copia en `public/learn`).
- Simulación TypeScript pura, sin referencias a Phaser o al DOM en match/entities/ai/physics/rules.
- Tick fijo a 60 Hz. Phaser representa el estado; no decide reglas ni física.
- IA local. Ningún servicio externo, token ni recurso gráfico remoto.
- Textos de juego en `locales/game.es.json` y `locales/game.en.json`.
- Ejecutar `npm test` y `npm run build`; documentar validaciones y limitaciones.
- Rutas relativas compatibles con GitHub Pages bajo subdirectorio; precache completo de producción.
- La primera entrega no sanciona fuera de juego ni implementa repeticiones.
