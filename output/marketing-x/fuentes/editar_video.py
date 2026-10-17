from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import json
import subprocess
import wave
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
WORK = ROOT / 'escenas'
CAP = ROOT / 'capturas'
FFMPEG = 'ffmpeg'
FPS = 30
CLIP_SECONDS = 4.25
FADE = 0.25
TOTAL = 36.25

def run(args):
    proc = subprocess.run([FFMPEG, '-hide_banner', '-loglevel', 'error', '-y', *args],
                          capture_output=True, text=True)
    if proc.returncode:
        raise RuntimeError(proc.stderr)

def ui_sequence(prefix, digits, final, before):
    times = json.loads((CAP / (prefix + '-timing.json')).read_text())
    rows = ['ffconcat version 1.0', f"file '{(CAP / before).as_posix()}'", 'duration 0.35']
    previous = 0.0
    for i, stamp in enumerate(times):
        delta = max(0.015, stamp - previous)
        rows += [f"file '{(CAP / f'{prefix}-{i:0{digits}d}.jpg').as_posix()}'", f'duration {delta:.6f}']
        previous = stamp
    rows += [f"file '{(CAP / final).as_posix()}'", f'duration {CLIP_SECONDS - previous - 0.35:.6f}',
             f"file '{(CAP / final).as_posix()}'"]
    path = WORK / (prefix + '.ffconcat')
    path.write_text('\n'.join(rows), encoding='utf-8')
    run(['-safe', '0', '-f', 'concat', '-i', str(path), '-vf',
         'fps=30,scale=430:932:flags=lanczos,format=yuv420p', '-t', str(CLIP_SECONDS),
         '-c:v', 'libx264', '-preset', 'fast', '-crf', '17', str(WORK / (prefix + '-ui.mp4'))])

def scene(i):
    target = WORK / f'clip-{i}.mp4'
    if i in (3, 4):
        feed = 'giro' if i == 3 else 'fijo'
        # The mask is a new, geometric asset for the phone screen, not a redraw of the UI.
        filters = ('[0:v]fps=30,format=yuv420p[base];'
                   '[1:v]fps=30,scale=392:850:flags=lanczos,format=rgb24[ui];'
                   '[2:v]format=gray[mask];[ui][mask]alphamerge[rounded];'
                   '[base][rounded]overlay=764:165:shortest=1,format=yuv420p[v]')
        run(['-filter_complex_threads', '1', '-loop', '1', '-framerate', '30', '-i', str(WORK / f'base-{i}.jpg'),
             '-i', str(WORK / f'{feed}-ui.mp4'), '-loop', '1', '-i', str(WORK / 'mask.png'),
             '-filter_complex', filters, '-map', '[v]', '-an', '-t', str(CLIP_SECONDS),
             '-c:v', 'libx264', '-preset', 'fast', '-crf', '17', '-pix_fmt', 'yuv420p', str(target)])
    else:
        # A restrained camera push preserves margins and keeps captions readable.
        vf = ("scale=1800:1800:flags=lanczos,zoompan="
              "z='1.0+0.018*on/127':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':"
              "d=128:s=1200x1200:fps=30,format=yuv420p")
        run(['-i', str(WORK / f'escena-{i}.jpg'), '-vf', vf, '-an', '-t', str(CLIP_SECONDS),
             '-c:v', 'libx264', '-preset', 'fast', '-crf', '17', '-pix_fmt', 'yuv420p', str(target)])
    print(f'Escena {i + 1}/9 lista', flush=True)

def soundtrack():
    sr = 44100
    size = int(TOTAL * sr)
    audio = np.zeros((size, 2), np.float64)
    rng = np.random.default_rng(120126)

    def add(start, signal, gain=1, pan=0):
        offset = int(start * sr)
        if offset >= size:
            return
        signal = signal[:max(0, size-offset)] * gain
        audio[offset:offset + len(signal), 0] += signal * np.sqrt((1-pan)/2)
        audio[offset:offset + len(signal), 1] += signal * np.sqrt((1+pan)/2)

    def tone(note, duration, pluck=True):
        t = np.arange(int(duration * sr)) / sr
        freq = 440 * 2 ** ((note-69)/12)
        wave = np.sin(2*np.pi*freq*t) + 0.24*np.sin(2*np.pi*freq*2*t) + 0.06*np.sin(2*np.pi*freq*3*t)
        if pluck:
            envelope = (1-np.exp(-t/0.004)) * np.exp(-t/0.25)
        else:
            envelope = np.minimum(t/0.18, 1) * np.minimum((duration-t)/0.35, 1)
        return wave * np.maximum(envelope, 0)

    chords = [(60,64,67,71), (57,60,64,67), (53,57,60,64), (55,59,62,64)]
    beat = 0.5
    for bar in range(19):
        chord = chords[(bar // 2) % 4]
        at = bar * 2
        for j, note in enumerate(chord):
            add(at, tone(note, 2.1, False), 0.028, (j-1.5)/3)
        add(at, tone(chord[0]-24, 1.6), 0.10)
        for step in range(8):
            note = chord[[0,2,1,3,2,1,3,2][step]] + 12
            add(at+step*0.25, tone(note, 0.6), 0.035, 0.30*(-1 if step%2 else 1))
        for b in range(4):
            t = np.arange(int(sr*0.24))/sr
            if b % 2 == 0:
                kick = np.sin(2*np.pi*(45*t + 38*0.030*(1-np.exp(-t/0.030)))) * np.exp(-t/0.065)
                add(at+b*beat, kick, 0.18)
            else:
                noise = rng.standard_normal(len(t))
                snap = (noise - np.roll(noise, 1)) * np.exp(-t/0.035)
                add(at+b*beat, snap, 0.019, 0.1)
        for step in range(8):
            t = np.arange(int(sr*0.07))/sr
            noise = rng.standard_normal(len(t))
            hat = (noise - np.roll(noise, 1)) * np.exp(-t/0.012)
            add(at+step*.25, hat, 0.008 if step%2 else 0.011, -.25)

    for at in np.arange(4,33,4):
        t = np.arange(int(sr*0.25))/sr
        noise = rng.standard_normal(len(t))
        whoosh = (noise-np.roll(noise,5)) * np.sin(np.pi*t/.25)**2
        add(at, whoosh, .008, -.2)
    for at, note in [(12.6,84),(13.2,86),(13.7,88),(14.4,91),(16.35,79),(32.25,84),(32.4,88),(32.55,91)]:
        add(at,tone(note,.5),.043,.15)
    time = np.arange(size)/sr
    audio *= (np.minimum(time/.4,1)*np.minimum((TOTAL-time)/1.4,1))[:,None]
    audio /= max(1, np.max(np.abs(audio))/.82)
    path = ROOT / 'recursos/musica-original.wav'
    with wave.open(str(path), 'wb') as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(sr)
        wav.writeframes((audio*32767).astype('<i2').tobytes())
    return path

def main():
    mask = Image.new('L', (392,850), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0,0,391,849), radius=31, fill=255)
    mask.save(WORK / 'mask.png')
    ui_sequence('giro', 2, 'ruleta-despues.jpg', 'ruleta-despues.jpg')
    ui_sequence('fijo', 3, 'fijo-119.jpg', 'bloqueo.jpg')
    with ThreadPoolExecutor(max_workers=2) as pool:
        list(pool.map(scene, range(9)))
    music = soundtrack()
    args = ['-filter_complex_threads', '1']
    for i in range(9):
        args += ['-i', str(WORK / f'clip-{i}.mp4')]
    args += ['-i', str(music)]
    filters = []
    for i in range(9):
        filters.append(f'[{i}:v]settb=AVTB,setpts=PTS-STARTPTS[v{i}]')
    prior = 'v0'
    for i in range(1,9):
        result = f'm{i}'
        filters.append(f'[{prior}][v{i}]xfade=transition=fade:duration={FADE}:offset={i*4}[{result}]')
        prior = result
    filters += [f'[{prior}]fade=t=in:st=0:d=0.20,fade=t=out:st=35.75:d=0.50,scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,setsar=1,format=yuv420p[video]',
                '[9:a]loudnorm=I=-18:TP=-1.5:LRA=7,aresample=48000[audio]']
    args += ['-filter_complex', ';'.join(filters), '-map', '[video]', '-map', '[audio]',
             '-t', str(TOTAL), '-r', '30', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
             '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-c:a', 'aac', '-b:a', '192k',
             '-movflags', '+faststart', '-metadata', 'title=Outfit Roulette · Tu ropa, nuevas combinaciones',
             '-metadata', 'comment=Capturas reales de la vista web móvil. Música original sintetizada para esta campaña.',
             str(ROOT / 'outfit-roulette-anuncio.mp4')]
    run(args)
    print('Video final exportado.', flush=True)

if __name__ == '__main__':
    main()

