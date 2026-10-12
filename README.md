# <img src="assets/ORicon.png" alt="Ícono de Outfit Roulette" width="44" height="44"> Outfit Roulette

**Tu ropa, nuevas combinaciones.** Outfit Roulette es una app para Android que te ayuda a decidir qué ponerte con las prendas que ya tienes. Elige una ocasión, gira la ruleta y ajusta el resultado a tu gusto.

> Disponible para Android · Código abierto · Sin cuenta ni inicio de sesión

[![Ver release v1.0.0 para Android](https://img.shields.io/badge/Descargar-Android%20v1.0.0-7B4EEA?style=for-the-badge&logo=android&logoColor=white)](https://github.com/JasonS-V/Outfit-Roullete/releases/tag/v1.0.0)

## Qué puedes hacer

- **Crear tu armario:** añade prendas desde un catálogo de básicos, elige su color y organiza tus favoritas. La ropa marcada como «en lavandería» queda fuera de los giros.
- **Encontrar un look:** la ruleta combina prendas según la ocasión, el clima, los colores y el uso reciente. Puedes deslizar un carrete para cambiar una prenda o bloquearla para conservarla en el siguiente giro.
- **Guardar tus combinaciones:** ponles nombre, consúltalas en tu Lookbook, vuelve a cargarlas en la ruleta, registra cuándo las usas y compártelas como texto.
- **Adaptarla a ti:** ajusta tu preferencia de temperatura, el tema, el idioma, el sonido y la vibración. También puedes activar el modo caos para obtener combinaciones más inesperadas.

## Tus datos, en tu dispositivo

No necesitas registrarte. El armario, los looks, el historial y las preferencias se guardan localmente. Puedes exportarlos a un archivo JSON e importarlos en otro dispositivo; **la importación reemplaza los datos actuales** después de pedirte confirmación.

El clima es opcional: puedes elegir una ciudad o permitir el acceso a tu ubicación aproximada. Esta función necesita internet para consultar [Open-Meteo](https://open-meteo.com/). Si no la configuras, la ruleta sigue funcionando con una temperatura templada.

## Desarrollo

El proyecto usa Expo SDK 57, React Native, Expo Router y TypeScript. Para ejecutarlo localmente necesitas Node.js y pnpm:

```bash
pnpm install
pnpm start
```

Comprobaciones del proyecto:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

## Código abierto y apoyo

El código está disponible en este repositorio. Si encuentras un problema o quieres proponer una mejora, puedes abrir un issue o enviar un pull request.

Outfit Roulette se puede usar gratis. Si quieres apoyar su desarrollo, puedes [donar en Ko-fi](https://ko-fi.com/aizendev); la donación es completamente opcional.
