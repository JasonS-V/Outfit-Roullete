# <img src="assets/ORicon.png" alt="Outfit Roulette icon" width="44" height="44"> Outfit Roulette

**Your clothes, new combinations.** Outfit Roulette is an Android app that helps you decide what to wear using the clothes you already own. Pick an occasion, spin the roulette, and adjust the result to your liking.

> Available for Android · Open source · No account or sign-in required

[![Download Android v1.0.0](https://img.shields.io/badge/Download-Android%20v1.0.0-7B4EEA?style=for-the-badge&logo=android&logoColor=white)](https://github.com/JasonS-V/Outfit-Roullete/releases/tag/v1.0.0)

## What you can do

- **Build your wardrobe:** add clothes from a catalog of basics, choose their colors, and mark your favorites. Clothes marked as being in the laundry are excluded from spins.
- **Find an outfit:** the roulette combines clothes based on the occasion, weather, colors, and recent wear. Swipe a reel to change one item or lock it to keep it for the next spin.
- **Save your combinations:** name them, browse them in your Lookbook, load them back into the roulette, track when you wear them, and share them as text.
- **Make it yours:** adjust your temperature preference, theme, language, sound, and vibration. You can also turn on Chaos Mode for more unexpected combinations.

## Your data stays on your device

No registration is needed. Your wardrobe, saved outfits, wear history, and preferences are stored locally. You can export them to a JSON file and import them on another device; **importing replaces your current data** after you confirm.

Weather is optional: choose a city or allow access to your approximate location. This feature needs an internet connection to check [Open-Meteo](https://open-meteo.com/). If you don't set it up, the roulette still works using a mild default temperature.

## Development

The project uses Expo SDK 57, React Native, Expo Router, and TypeScript. To run it locally, you need Node.js and pnpm:

```bash
pnpm install
pnpm start
```

Project checks:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

## Open source and support

The source code is available in this repository. If you find a bug or have an idea for an improvement, you can open an issue or submit a pull request.

Outfit Roulette is free to use. If you'd like to support its development, you can [donate on Ko-fi](https://ko-fi.com/aizendev); donations are entirely optional.
