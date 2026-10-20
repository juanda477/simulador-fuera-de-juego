# Hoja de ruta

1. Primera entrega: configuración, preservación de Aprender, cancha 4v4, controles, IA elemental, goles, reloj, PWA y pruebas.
2. Mejorar jugabilidad: arqueros con salidas, decisiones temporizadas configurables, tiros dirigidos, recuperación y separación física más robustas; pruebas en dispositivos físicos.
3. Reglas: snapshots al toque, candidatos en posición adelantada, intervención, cambio de posesión y reinicios. Matriz de casos de Regla 11 en ambos sentidos. No sancionar con posiciones actuales de un pase anterior.
4. Repeticiones: buffer circular de estados, reconstrucción, pausa explicativa y líneas del instante del toque.
5. Accesibilidad, selector de dificultad y pulido bilingüe.
6. Integración autorizada `feat/juego` → `desarrollo` → `master`; publicación posterior autorizada de dist en Pages.

## Validación de esta entrega

Validación ejecutada el 19 de octubre de 2026:

- `npm test`: 11 pruebas aprobadas, ninguna fallida.
- `npm run build`: TypeScript estricto y Vite correctos. Aviso de bundle grande por Phaser (~1.22 MB, ~338 kB gzip).
- `git diff --check`: correcto.
- Verificación de rutas de dist: enlaces relativos correctos; 10 archivos precargados, con ambos modos y los idiomas del simulador. Los idiomas del juego están integrados en el bundle.
- Chrome en localhost: cancha, ocho jugadores, balón, marcador, cronómetro y pausa comprobados visualmente. Navegación a Aprender y cambio al escenario «Arquero adelantado» correctos, con actualización del veredicto.
- Pendiente: prueba de instalación y recarga en modo avión, pruebas táctiles en un móvil físico y prueba de publicación real bajo subdirectorio. No se ha desplegado.

 Las pruebas cubren selección sin arqueros, movimiento normalizado, cruce completo de gol, siete goles, tiempo y gol de oro, reinicio, pase, referencia de fuera de juego, aislamiento de snapshots y determinismo de un partido completo.

## Limitaciones conocidas

IA elemental; arqueros se desplazan verticalmente y no realizan salidas avanzadas. Sin faltas ni reinicios reglamentarios. Sin arbitraje de fuera de juego ni repeticiones. Posesión, colisiones y dirección de tiro simplificadas. No se debe interpretar el juego como un árbitro reglamentario completo.

## Ajustes tras la prueba móvil

El responsable confirmó acceso y juego básico en móvil, pausa/continuación, nuevo partido y acceso al simulador. Ajustados foco automático al recuperar, orientación persistente, destinatario del pase, puntería por ángulo y colores/protección de arqueros. Validación de estos ajustes: `npm test` aprobó las 16 pruebas; `npm run build` y `git diff --check` finalizaron correctamente. Las nuevas pruebas cubren posesión protegida en ambos equipos, recuperación sin selección del arquero, pase tras soltar el control y tiros en ambos sentidos. Pendiente confirmar estas sensaciones en el dispositivo.

## Segunda revisión móvil

Corregidos botones táctiles para responder al tocar mientras se mantiene el joystick, posición del balón según orientación y salida automática de todos los jugadores de campo del área del arquero poseedor antes de su distribución. Se repara defensivamente cualquier foco inválido sobre un arquero. Validación: 20 pruebas aprobadas (incluida entrada multitáctil simulada, balón en cuatro direcciones y salida del área para ambos equipos); compilación TypeScript/Vite y diff sin errores. Confirmación física de los ajustes pendiente en el móvil del responsable.

## Entrada móvil: comprobación pendiente

El responsable reportó que Pase/Tiro funcionan en PC pero siguen fallando en móvil. Se incorporaron eventos touchstart/move/end/cancel nativos con identificador independiente para el dedo del joystick; botones manejan touchstart sin esperar clic. Pointer Events quedan para mouse/lápiz y se evita duplicar acciones táctiles. CSS impide gestos y selección en los botones. Se desactiva la entrada de Phaser (los controles son DOM propios) para evitar procesamiento global concurrente. No se ha confirmado aún la causa en el dispositivo físico ni la resolución. Validación: 21 pruebas aprobadas, incluida secuencia de dos dedos con liberación independiente; compilación correcta. Próxima comprobación: Pase/Tiro con joystick suelto y mantenido en el navegador del usuario.

## Balance ofensivo y explicación de la línea

El responsable confirmó que los botones ya funcionan en móvil. Ajustados alcance/potencia de tiros, puntería IA al extremo contrario y arqueros más lentos con reacción de 350 ms. Rótulo bilingüe visible de fuera de juego comprobado en Chrome. Validación: 24 pruebas aprobadas, incluida reacción retardada, tiro IA desde fuera del área y gol desde fuera del área ante un arquero descolocado; build correcto. Queda pendiente valorar dificultad y legibilidad en móvil.

## Enfoque educativo, defensa y controles

Se prioriza Aprender en navegación e identidad; Jugar se presenta como Practicar. Rótulo de fuera de juego compacto. Defensa con cobertura permanente, un presionante y marca de receptores con espacio. Tres botones circulares en rombo incompleto y Pase/Quitar contextual, sin alterar la entrada multitáctil nativa ya confirmada por el usuario. Arquero ajustado a un punto intermedio: velocidad 108, reacción 240 ms, radio 21 y tiros a 580. Validación: 27 pruebas aprobadas y build correcto; disposición de botones comprobada visualmente en Chrome. Pendiente confirmar comodidad y balance en móvil.

## 20 de octubre: cobertura, apoyos y rebotes

Cobertura alineada verticalmente con el balón; apoyos con observaciones cada 0,6 s para permitir carreras que queden adelantadas al retroceder; primera parada de tiros de 280 unidades o más produce rebote corto. Se conservan origen/tipo/equipo del tiro. Validación: 31 pruebas aprobadas, incluido seguimiento de banda, demora que genera posición adelantada en ambos sentidos, rechazo de tiros largos frente a captura de pases/tiros cortos, e imposibilidad de rechazar dos veces el mismo tiro. Compilación TypeScript/Vite y diff correctos. Pendiente confirmar sensaciones en móvil.
