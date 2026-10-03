# DESIGN.md · Outfit Roulette ("Boutique Arcade")

> Dirección de diseño del producto, derivada del documento maestro (v1.0 §15).
> Este archivo + `Outfit_Roulette_Master_Plan.md` son la fuente de verdad para la UI.

## Design Read

Reading this as: app móvil de decisión diaria de outfit para estudiantes 16-28 (LATAM),
en un lenguaje visual "Boutique Arcade" (superficies pastel por categoría, tinta ciruela,
un único acento chicle, física de tragamonedas táctil), dial ENERGY 2 / RHYTHM 2 / MOTION 3.

## Dials

- **ENERGY 2:** juego con energía medida: un acento fuerte (chicle) y cuatro pasteles
  funcionales, sin ruido decorativo.
- **RHYTHM 2:** ritmo constante entre pantallas, con quiebres deliberados: la fusión
  "Una pieza" y el momento del giro.
- **MOTION 3:** el giro ES el producto: aceleración, frenado escalonado, rebote y tics.
  El resto de la app es calmada, para que el giro destaque.

## Razones (una línea por decisión, R-31)

- **Pastel por carrete:** cada categoría tiene color propio y la ruleta se lee de un
  vistazo sin depender de la ropa real.
- **Tinta ciruela (#1B1630) en vez de negro puro:** conserva contraste AAA y da
  temperatura de boutique frente al negro genérico.
- **Un solo acento (chicle #FF3D8B):** el color de acción único convierte GIRAR en el
  punto focal de la pantalla.
- **Amarillo candado (#FFD60A) con tinta encima:** estado "fijado" exclusivo del candado,
  8.5:1 de contraste, inconfundible frente al acento.
- **Figtree:** geométrica redonda, amable y legible en pantallas pequeñas; sostiene el
  tono de juego de boutique.
- **Siluetas sticker (trazo grueso redondeado):** se leen como piezas de juego, rinden
  a 40 px en la rejilla y esquivan el render fotorrealista de otras apps de armario.
- **Radios diferenciados (20 tarjetas, 28 hojas, pastilla solo en chips y CTA):** la
  variación de radio marca jerarquía; lo pastilla se reserva a filtros y acción principal.
- **Sombra solo en elementos flotantes (CTA GIRAR, hojas, FAB, toasts):** una sola
  elevación por pantalla mantiene el foco.
- **Modo claro y oscuro desde el día 1:** la app se usa a las 6:30 AM y de noche; ambos
  modos comparten tokens y se prueban juntos.
- **Estados completos (vacío, carga, error):** el clima tiene sus tres estados; el
  armario y el lookbook tienen estados vacíos con salida directa a la acción.

## Reglas de microcopy

- Sin em dash en ningún texto de UI (R-02).
- Voz cercana peruana por defecto ("casaca", "chompa", "zapatillas"); diccionario
  regional del plan §19 para siguientes iteraciones.
- Los números visibles son reales y se calculan del estado del usuario (R-17).

## Accesibilidad

- Texto AA/AAA verificado por tokens (§15.1); el candado usa doble canal (forma + color).
- Áreas táctiles mínimas de 48 dp; acentos de teclado visibles en web.
- La ruleta completa funciona sin sonido ni vibración (son extras apagables).
