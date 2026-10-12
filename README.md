# Outfit Roulette

**"Gira. Bloquea. Vístete."** La ruleta interactiva que decide tu outfit diario en
menos de 5 segundos usando tu propia ropa y adaptada al clima de hoy.

## Estado actual

Funcionando de punta a punta:

- **Ruleta (Hero):** 4 carretes con física de desaceleración escalonada (0.9s a 1.8s),
  rebote de aterrizaje, ticks de sonido y vibración al cruzar cada fila.
- **Candados 🔒** con doble canal (forma + color + vibración), arrastre manual de
  carretes con imán y bloqueo automático al elegir a mano.
- **"Una pieza" (§6.1):** los carretes Superior e Inferior se fusionan en tarjeta doble
  cuando la ruleta saca un vestido/enterizo; su candado fija la pieza completa.
- **SpinEngine (§13):** canalización determinista de 4 etapas con tests unitarios
  (color, formalidad, clima, frescura, subuso, penalizaciones, relajación, caos).
- **Clima (Open-Meteo):** detección automática por ubicación y búsqueda
  manual de ciudad, umbrales 26/18/14 con ajuste personal (+2 friolento / -2 caluroso).
- **Onboarding de 90 segundos** con starter pack de básicos (9 recomendadas, 6
  premarcadas) y primer giro guiado con tip del candado.
- **Armario:** parrilla por categorías, búsqueda, detalle con favoritas, lavandería,
  eliminación con confirmación y exclusión de lavandería en los giros.
- **Looks:** guardar con deshacer, "Para hoy" por temperatura, cargar en la ruleta con
  candados, registrar uso, compartir (hoja nativa / portapapeles en web).
- **Perfil:** sonido, vibración, modo caos, capa en templado, preferencia térmica,
  estadísticas reales, borrado de datos y exportación/importación de respaldos JSON.
- **Datos locales:** armario, looks, usos, último giro, ajustes y ciudad se conservan
  en el dispositivo sin cuenta.
- **Biblioteca de básicos:** 80 prendas del plan §10.3 representadas con 46 siluetas
  vectoriales recolorables (3 capas) y 16 colores de teñido.
- **Sonido:** tick/tunc/chime sintetizados localmente (WAV 44.1kHz).

Pendiente (siguientes sprints, según el plan): cámara + recorte local (Sprint 3),
video vertical 9:16 (Sprint 4), RevenueCat (Sprint 4),
las siluetas restantes hasta las 80 del plan (pase de arte continuo).

## Cómo correr

```bash
pnpm install
pnpm start          # Expo dev server
pnpm web            # versión web
pnpm test           # tests unitarios (vitest)
pnpm typecheck      # tsc estricto
```

Los datos se guardan localmente. En Ajustes → Datos puedes exportar un respaldo
JSON e importarlo en otro dispositivo; importar reemplaza los datos existentes.
La temperatura requiere conexión a Open-Meteo y permiso de ubicación si eliges GPS.

## Estructura

```
src/
  app/            Rutas (Expo Router): (tabs)/ruleta|armario|looks|perfil, onboarding, garment/new
  components/
    roulette/     RouletteReel (física del giro), LockButton
    silhouettes/  46 formas vectoriales recolorables + renderizador
    ui/           AppText, Chip, PrimaryButton, Sheet, Toast
    weather/      Chip de clima, buscador de ciudad, hoja de configuración
  context/        AppContext: armario, looks, giros, candados, clima, ajustes
  data/           Catálogo de 80 básicos, starter pack, paleta de 16 colores
  engine/         SpinEngine puro (sin RN): color, formalidad, clima, selección
  services/       Clima (Open-Meteo), respaldo, hápticos, sonido
  theme/          Tokens "Boutique Arcade" + tipografía Figtree
  utils/          Compartir, confirmaciones destructivas
tests/            Tests del motor, tema y respaldos (vitest)
scripts/          generate_sounds.py (síntesis de los WAV)
assets/sounds/    tick.wav, tunc.wav, chime.wav
```

## Calidad

- Filtro anti-slop aplicado durante el desarrollo (sin controles muertos, contraste
  AA, estados vacío/carga/error, microcopy específico, sin em dash).
- `DESIGN.md` documenta dirección, diales y una razón por decisión.
- TypeScript estricto; el motor es puro y 100% testeable con `rng` inyectado.

## Créditos de arte

Los íconos de pestañas, la ruleta y las siluetas de prendas son dibujos propios en SVG,
inspirados en cultura pop de los 90 y el armario computarizado de Clueless, sin usar
marcas, tipografías ni materiales protegidos (plan §1.4).
