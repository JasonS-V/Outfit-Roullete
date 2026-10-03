# -*- coding: utf-8 -*-
"""
Generador de sonidos para la ruleta tipo tragamonedas (estilo arcade boutique).

Sintetiza tres efectos de sonido usando solo la librería estándar de Python
(math, wave, struct, random) y los guarda como WAV de 44.1 kHz, 16 bits, mono:

  - tick.wav  : micro clic agudo (tic de ruleta), unos 40 ms
  - tunc.wav  : golpe seco medio al detenerse cada carrete, unos 120 ms
  - chime.wav : campanita ascendente al completar el giro, unos 650 ms

Uso:
    python scripts/generate_sounds.py

Los archivos se escriben en assets/sounds/ (ruta resuelta a partir de la
ubicación de este script, así que funciona desde cualquier directorio).
"""

import math
import os
import random
import struct
import wave

# --------------------------------------------------------------- parámetros
SR = 44100          # frecuencia de muestreo, en Hz
BITS = 16           # profundidad de bits (PCM con signo)
CANALES = 1         # mono
PICO = 0.75         # nivel máximo tras normalizar (deja margen y evita recortes)

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIR_SONIDOS = os.path.join(RAIZ, "assets", "sounds")


def ms_a_frames(ms):
    """Convierte milisegundos a cantidad de muestras (frames) a 44.1 kHz."""
    return int(round(SR * ms / 1000.0))


def normalizar(muestras, pico=PICO):
    """Escala la señal para que su valor absoluto máximo quede en 'pico'."""
    tope = max(abs(v) for v in muestras)
    if tope < 1e-9:
        return list(muestras)
    factor = pico / tope
    return [v * factor for v in muestras]


def escribir_wav(ruta, muestras):
    """Escribe una lista de flotantes en [-1, 1] como WAV PCM 16 bits mono."""
    datos = bytearray()
    for s in muestras:
        v = int(round(max(-1.0, min(1.0, s)) * 32767.0))
        datos += struct.pack("<h", v)   # entero de 16 bits con signo (little endian)
    with wave.open(ruta, "wb") as w:
        w.setnchannels(CANALES)
        w.setsampwidth(BITS // 8)
        w.setframerate(SR)
        w.writeframes(bytes(datos))


def aplicar_fade_out(muestras, ms):
    """Aplica una rampa lineal hasta cero en los últimos 'ms' milisegundos."""
    n = min(ms_a_frames(ms), len(muestras))
    for k in range(n):
        muestras[len(muestras) - n + k] *= 1.0 - (k + 1) / float(n)


def generar_tick():
    """Micro clic agudo de unos 40 ms con decaimiento muy rápido (tic de ruleta).

    Tono principal de 1700 Hz (dentro del rango 1.2 a 2 kHz) más una octava
    tenue que muere antes: brillo limpio, sin estridencia.
    """
    n = ms_a_frames(40)
    f = 1700.0
    tau = 0.0045                    # decaimiento muy rápido: 4.5 ms
    muestras = []
    for i in range(n):
        t = i / SR
        env = math.exp(-t / tau)
        v = math.sin(2.0 * math.pi * f * t)
        v += 0.30 * math.sin(2.0 * math.pi * 2.0 * f * t) * math.exp(-t / (tau * 0.6))
        muestras.append(v * env)
    return normalizar(muestras)


def generar_tunc():
    """Golpe seco medio de unos 120 ms (tope de carrete).

    El seno cae de 260 Hz a 160 Hz con una constante de 18 ms, así que el tono
    percibido queda cerca de 180 Hz, con un chasquido de impacto muy corto.
    """
    n = ms_a_frames(120)
    f_ini, f_fin = 260.0, 160.0
    tau_tono = 0.018                # rapidez de la caída de tono
    tau_amp = 0.035                 # decaimiento de la amplitud
    rnd = random.Random(7)          # semilla fija para que el resultado sea reproducible
    fase = 0.0
    muestras = []
    for i in range(n):
        t = i / SR
        f = f_fin + (f_ini - f_fin) * math.exp(-t / tau_tono)
        fase += 2.0 * math.pi * f / SR
        env = math.exp(-t / tau_amp)
        v = math.sin(fase)
        v += 0.30 * math.sin(2.0 * fase) * math.exp(-t / (tau_amp * 0.5))
        if t < 0.004:               # chasquido de impacto: ruido en los primeros 4 ms
            v += 0.25 * rnd.uniform(-1.0, 1.0) * (1.0 - t / 0.004)
        muestras.append(v * env)
    aplicar_fade_out(muestras, 8)
    return normalizar(muestras)


def generar_chime():
    """Campanita ascendente de unos 650 ms (giro completo).

    Tres notas (C5, E5, G5) separadas 120 ms, cada una con ataque suave de
    12 ms, cola exponencial y dos armónicos tenues que decaen antes.
    """
    n = ms_a_frames(650)
    notas = [523.25, 659.25, 783.99]    # C5, E5, G5
    paso_ms = 120                       # separación entre notas
    ataque = 0.012                      # ataque suave de 12 ms
    tau = 0.130                         # cola principal de cada nota
    muestras = [0.0] * n
    for k, f in enumerate(notas):
        inicio = ms_a_frames(k * paso_ms)
        for i in range(inicio, n):
            t = (i - inicio) / SR
            env = math.exp(-t / tau)
            if t < ataque:
                # rampa de coseno elevado: entrada dulce, sin clic inicial
                env *= 0.5 - 0.5 * math.cos(math.pi * t / ataque)
            v = math.sin(2.0 * math.pi * f * t)
            v += 0.30 * math.sin(2.0 * math.pi * 2.0 * f * t) * math.exp(-t / (tau * 0.45))
            v += 0.12 * math.sin(2.0 * math.pi * 3.0 * f * t) * math.exp(-t / (tau * 0.30))
            muestras[i] += v * env
    aplicar_fade_out(muestras, 40)
    return normalizar(muestras)


def verificar(archivos):
    """Relee los WAV escritos con el módulo wave y muestra una tabla resumen."""
    print("")
    print("Verificacion (modulo wave):")
    linea = "-" * 72
    print(linea)
    print("%-10s %10s %10s %6s %8s %10s %10s"
          % ("archivo", "frames", "rate", "bits", "canales", "dur_ms", "bytes"))
    print(linea)
    for nombre, ruta in archivos:
        with wave.open(ruta, "rb") as w:
            frames = w.getnframes()
            rate = w.getframerate()
            bits = w.getsampwidth() * 8
            canales = w.getnchannels()
        dur_ms = frames * 1000.0 / rate
        print("%-10s %10d %10d %6d %8d %10.2f %10d"
              % (nombre, frames, rate, bits, canales, dur_ms, os.path.getsize(ruta)))
    print(linea)


def main():
    os.makedirs(DIR_SONIDOS, exist_ok=True)
    trabajos = [
        ("tick.wav", generar_tick),
        ("tunc.wav", generar_tunc),
        ("chime.wav", generar_chime),
    ]
    archivos = []
    for nombre, generar in trabajos:
        ruta = os.path.join(DIR_SONIDOS, nombre)
        escribir_wav(ruta, generar())
        archivos.append((nombre, ruta))
        print("Generado: %s" % ruta)
    verificar(archivos)


if __name__ == "__main__":
    main()
