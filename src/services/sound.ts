/**
 * SoundService (§6.3 + §14): ticks del carrete, golpe de parada y chime final.
 * Los WAV son sintetizados localmente (assets/sounds). Si el audio falla,
 * la app sigue funcionando en silencio.
 */

import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

type SoundKey = 'tick' | 'tunc' | 'chime';

const SOURCES: Record<SoundKey, number> = {
  tick: require('@/assets/sounds/tick.wav') as number,
  tunc: require('@/assets/sounds/tunc.wav') as number,
  chime: require('@/assets/sounds/chime.wav') as number,
};

let enabled = true;
const players: Partial<Record<SoundKey, AudioPlayer | null>> = {};
let lastTickAt = 0;
const TICK_MIN_INTERVAL_MS = 70;

function getPlayer(key: SoundKey): AudioPlayer | null {
  if (key in players) return players[key] ?? null;
  try {
    players[key] = createAudioPlayer(SOURCES[key]);
    return players[key] ?? null;
  } catch {
    players[key] = null;
    return null;
  }
}

async function replay(player: AudioPlayer | null) {
  if (!player) return;
  try {
    await player.seekTo(0);
    player.play();
  } catch {
    // Silencio antes que interrupción.
  }
}

export function setSoundEnabled(value: boolean) {
  enabled = value;
  if (!value) {
    for (const key of Object.keys(players) as SoundKey[]) {
      try {
        players[key]?.pause();
      } catch {
        // ignorar
      }
    }
  }
}

/** Tic del crucero; limitado a ~14 por segundo para no saturar el motor de audio. */
export function playTick() {
  if (!enabled) return;
  const now = Date.now();
  if (now - lastTickAt < TICK_MIN_INTERVAL_MS) return;
  lastTickAt = now;
  void replay(getPlayer('tick'));
}

/** Golpe seco al detenerse un carrete. */
export function playTunc() {
  if (!enabled) return;
  void replay(getPlayer('tunc'));
}

/** Chime ascendente al completarse el giro entero. */
export function playChime() {
  if (!enabled) return;
  void replay(getPlayer('chime'));
}
