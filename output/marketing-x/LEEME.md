# Outfit Roulette · materiales para X/Twitter

Preparados en español el 12 de octubre de 2026.

- `outfit-roulette-anuncio.mp4`: anuncio cuadrado de unos 36 segundos, 1200 × 1200, H.264, 30 fps y audio AAC. Incluye música original sintetizada, sonidos de transición, títulos integrados, transiciones y dos secuencias de uso real de la ruleta.
- `imagen-01-tu-ropa.jpg`: anuncio de presentación, 1200 × 1200.
- `imagen-02-gira-guarda.jpg`: anuncio sobre girar, fijar y guardar looks, 1200 × 1200.
- `publicacion.txt`: texto listo para copiar, con el enlace proporcionado por Jason.

## Qué muestra el video

| Tiempo aproximado | Mensaje |
| --- | --- |
| 00–04 s | Tu ropa, más posibilidades |
| 04–08 s | Armario, catálogo y colores |
| 08–12 s | Ocasiones y clima por ciudad |
| 12–16 s | Giro real de la ruleta |
| 16–20 s | Bloquear una prenda y volver a girar |
| 20–24 s | Guardar, reutilizar, registrar uso y compartir looks como texto |
| 24–28 s | Favoritos y lavandería |
| 28–32 s | Personalización, modo caos, datos locales y respaldo |
| 32–36 s | Descarga gratis para Android en GitHub |

Las interfaces proceden de la aplicación ejecutada localmente en su versión web, con un tamaño de pantalla móvil de 430 × 932. Son capturas reales con prendas y looks de demostración; algunos controles nativos de Android pueden tener un aspecto diferente. No se añadieron funciones ficticias. El clima mostrado fue una consulta real de Lima durante la captura y no es una previsión permanente.

El archivo de Android está disponible en [Releases v1.0.0](https://github.com/JasonS-V/Outfit-Roullete/releases/tag/v1.0.0). La llamada a la acción y el texto de la publicación apuntan al [repositorio solicitado](https://github.com/JasonS-V/Outfit-Roullete). No se usaron insignias de Google Play ni se anunció disponibilidad en iOS.

## Referencias y formato

Se buscaron publicaciones similares en X, pero no fue posible verificar anuncios concretos desde la búsqueda pública. Para orientar el mensaje se revisaron las páginas promocionales oficiales de [Whering](https://whering.co.uk/clueless-wardrobe-app) e [Indyx](https://www.myindyx.com/): aprovechar la ropa que ya tienes y mostrar el producto en uso. Los diseños, la marca y las capturas entregadas son los de Outfit Roulette.

El formato cuadrado, H.264, AAC y los textos integrados siguen las [especificaciones creativas oficiales de X](https://help.x.com/en/business-and-advertising/creative-ad-specifications). La pieza de 36 segundos prioriza mostrar las funciones principales; X recomienda anuncios más breves para campañas de respuesta directa.

La música fue creada para esta pieza con síntesis y percusión programadas. No se descargaron canciones ni se reutilizó música de los anuncios de referencia. El diseño usa el icono y la tipografía Inter ya incluidos en el proyecto.

## Archivos de trabajo

Las carpetas `capturas`, `escenas`, `recursos` y `fuentes` conservan las capturas, diseños y montaje reproducible. No se modificó el código de la aplicación. Las comprobaciones de lint y TypeScript pasaron.

Para volver a montar el video con las escenas ya renderizadas: `python fuentes/editar_video.py`. Requiere FFmpeg, NumPy y Pillow. El diseño editable está en `fuentes/diseno.html`.
