# Diseño de la experiencia educativa

El producto es un simulador para comprender el fuera de juego. Aprender es la entrada principal; Practicar añade un contexto jugable para experimentar con pases, posiciones y líneas. El objetivo de las próximas entregas es explicar decisiones de Regla 11, no ampliar el juego de fútbol por sí mismo. La primera entrega corresponde a un nivel introductorio.

## Primera entrega

Vista aérea horizontal: azul ataca a la derecha y rojo a la izquierda, sin cambio de lado. Cada equipo tiene un arquero y tres jugadores de campo. Usuario controla un único jugador azul; sus compañeros y todo el rojo usan IA local determinista.

Aros blanco y amarillo: selección y destino del pase. Joystick direccional o WASD/flechas; J pase, K tiro, L recuperación, Tab cambio cíclico entre tres jugadores. Sin dirección, pase al compañero de campo más cercano con trayectoria despejada (rivales dentro de una elipse de tolerancia de 15 unidades bloquean la línea); si todos están bloqueados, al más cercano. Con dirección se maximiza el producto escalar normalizado, descontando distancia / 2000. No hay pases al arquero en esta entrega. La orientación persiste al soltar el control; se usa tanto en la selección del destinatario como en su aro de previsualización. Inicialmente se mira hacia el arco rival.

La recuperación azul selecciona automáticamente al poseedor de campo. Los arqueros nunca se seleccionan y no se les puede quitar el balón mientras lo poseen (simplificación sin disputa de balón en pies/manos). Amarillo identifica al arquero azul y violeta al rojo.

Tiro: ángulo atan2(y, x relativo al sentido de ataque), limitado a ±90° y mapeado linealmente al segmento interior del arco y=218..322. Arriba apunta al extremo superior, abajo al inferior, horizontal hacia delante al centro. Ángulos hacia atrás saturan al extremo correspondiente; exactamente hacia atrás sin componente vertical se resuelve al inferior. Se reservan dos unidades adicionales de margen respecto al límite válido para el centro del balón. No hay altura física del balón.

Arquero sigue la posición vertical del balón dentro de la boca, captura a mayor radio y distribuye. Jugadores buscan espacios laterales con posesión, presionan con el más cercano y marcan con los demás. Sin dueño buscan interceptar. La posesión rival puede recuperarse por proximidad con un enfriamiento; el seleccionado requiere botón Quitar. IA decide pases bajo presión y tiros a menos de 420 unidades de portería, apuntando al extremo contrario a la posición del arquero. Dificultad parametrizada en `src/config/settings.ts`, sin selector público todavía.

## Tiempo y gol

120 segundos de simulación; pausar no consume tiempo. Siete goles termina inmediatamente. Empate a los 120 segundos activa gol de oro ilimitado. Cruce completo del balón por la línea de fondo dentro de la boca reducida por su radio cuenta como gol. Reinicio central simplificado para quien recibió el gol. Bandas y fondos fuera de portería rebotan el balón.

## Regla 11

Referencia oficial consultada: https://www.theifab.com/laws/latest/offside/

La posición adelantada no es por sí misma una infracción. Se juzga en el toque del compañero y requiere intervención posterior, interferencia con un adversario u obtención de ventaja en los casos previstos. Importan el balón, el penúltimo adversario (arquero incluido), el campo rival y las partes válidas del cuerpo. Existen excepciones de recepción directa desde saque de meta, banda y esquina; una parada o rebote no equivale automáticamente a juego deliberado del defensor.

En esta entrega solo se dibuja el límite `max(centro, balón, penúltimo rival)` para azul y el mínimo equivalente para rojo. Solo se muestra el del último equipo que tocó el balón. Los centros de los círculos representan posiciones: no se modelan partes del cuerpo. El modo Aprender conserva su evaluación didáctica existente.

En una entrega posterior se registrará un snapshot en cada toque relevante, con atacantes elegibles y contexto de reinicio. Se evaluará la intervención sobre ese snapshot, nunca sobre posiciones actuales. Se documentarán aparte las aproximaciones para obstrucción visual y desafío al rival. La repetición usará historial circular de estados; no video.

## Posesión del arquero y controles táctiles

Mientras un arquero sostiene el balón, los seis jugadores de campo salen de su área grande, incluso el seleccionado (movimiento automático temporal). Se usa el rectángulo del área ampliado por el radio del jugador y margen: x<166 o x>794, y entre 132 y 408. No pueden volver a entrar hasta el pase automático del arquero; este espera a que todos salgan. Es una simplificación de jugabilidad, no una obligación general de las reglas del fútbol. El otro arquero conserva su posición. Pase/Tiro permanecen deshabilitados si el seleccionado no tiene el balón, el partido está pausado o terminó.

Los botones táctiles capturan pointerdown para permitir joystick y acción simultáneos; activación por teclado sigue disponible sin duplicar la pulsación. La pelota en posesión se dibuja a 22 unidades del centro en la dirección de orientación, también al caminar hacia atrás o lateralmente.

## Balance de tiros y arqueros

Los arqueros se desplazan a 108 unidades/s (jugadores IA: 125; usuario: 155), observan el balón cada 240 ms y capturan a 21 unidades. Su objetivo se conserva entre observaciones, dando una ventana para cambios de dirección. Tiros a 580 unidades/s frente a pases de 330. Parámetros configurables, aún sujetos a prueba de sensaciones en móvil. La IA dispara desde hasta 420 unidades y selecciona el extremo más alejado del arquero; no se garantiza el gol.

La línea amarilla lleva un rótulo dentro del campo, localizado, que nombra el límite de fuera de juego, el equipo y su sentido de ataque. Aclara que es una referencia sin sanción, se mueve con la línea y se mantiene dentro de los bordes de pantalla.

## Roles defensivos y controles compactos

Un jugador IA de campo conserva cobertura en el propio tercio (objetivo x=180..340 para azul o 620..780 para rojo). Si el defensor recibe o el usuario lo selecciona, otro asume el rol; no se limita el movimiento manual. Al defender, un único jugador presiona al poseedor. La cobertura acompaña la altura del balón (y=50..490), conservando profundidad defensiva; el restante cubre a un receptor a 65 unidades por el lado de su propia portería. La presión asignada al seleccionado depende de que el usuario la ejecute. Los objetivos del equipo se calculan antes de mover a nadie para mantener un reparto consistente durante el tick.

Tres botones circulares ocupan los vértices superior, izquierdo y derecho de un rombo: Cambiar; Pase/Quitar contextual; Tiro. El vértice inferior queda vacío. Teclas J/L/K/Tab conservadas. Rótulo de línea reducido a «Fuera de juego» y flecha de ataque, con explicación de su carácter orientativo en el pie.

## Seguimiento del balón, apoyos y rebotes

Ajuste del 20 de octubre de 2026: el defensor de cobertura usa la posición del balón en ambos ejes y ya no toma la altura de un receptor rival. Así acompaña cambios de banda sin abandonar su profundidad defensiva.

El apoyo ofensivo observa al poseedor cada 0,6 segundos y mantiene su objetivo de carrera entre observaciones, con destino 90 unidades por delante y un carril lateral estable. Al retroceder el poseedor, el apoyo tarda hasta 0,6 s en actualizar el destino. Puede permanecer en posición adelantada; no se le fuerza a estar habilitado ni se sanciona todavía. Al salir del rol de apoyo su nuevo rol responde inmediatamente.

Se conserva en el balón la procedencia de la acción (pase o tiro, origen y equipo). Cuando el arquero alcanza un tiro adversario cuyo origen está a 280 unidades o más, la primera parada produce un rebote a 180 unidades/s hacia el campo, con componente lateral según el impacto. Durante 0,18 s no puede recapturarse. Pases, tiros cortos y balones ya rechazados se atrapan normalmente. La procedencia ofensiva del tiro se conserva durante el rebote para no confundir una parada con un pase o una posesión deliberada. No es arbitraje de ventaja de Regla 11 todavía.
