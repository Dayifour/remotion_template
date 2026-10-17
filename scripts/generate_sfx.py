"""Synthétise les couches sonores du film DouminiDouman (aucune dépendance externe).

  public/sfx/whoosh.wav      transitions (bruit filtré en balayage)
  public/sfx/whoosh-soft.wav transitions secondaires
  public/sfx/pop.wav         apparitions et réceptions de Doumi
  public/sfx/tick.wav        épingles de la carte, ajouts au panier, cartes bénéfices
  public/sfx/scan.wav        lecture du QR code de la table
  public/sfx/success.wav     commande envoyée, logo final
  public/sfx/ding.wav        notification « nouvelle commande »
  public/music/bed.wav       boucle façon balafon (à remplacer par une vraie musique si besoin)

Usage : python scripts/generate_sfx.py
"""
import math
import random
import struct
import wave
from pathlib import Path

SR = 44100
ROOT = Path(__file__).resolve().parent.parent
random.seed(7)


def write(path: Path, left, right=None, gain=1.0):
    right = right if right is not None else left
    peak = max(1e-9, max(max(abs(x) for x in left), max(abs(x) for x in right)))
    k = gain / peak
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        frames = bytearray()
        for l, r in zip(left, right):
            frames += struct.pack("<hh", int(max(-1, min(1, l * k)) * 32767), int(max(-1, min(1, r * k)) * 32767))
        w.writeframes(bytes(frames))
    print("ok", path.relative_to(ROOT))


def whoosh(duration, f_lo, f_hi, peak_at=0.55):
    n = int(SR * duration)
    out_l, out_r = [], []
    lp1 = lp2 = 0.0
    for i in range(n):
        t = i / n
        env = (t / peak_at) ** 2 if t < peak_at else ((1 - t) / (1 - peak_at)) ** 1.6
        fc = f_lo + (f_hi - f_lo) * math.sin(math.pi * min(1, t / (peak_at * 1.4))) ** 1.5
        a = 1 - math.exp(-2 * math.pi * fc / SR)
        x = random.uniform(-1, 1)
        lp1 += a * (x - lp1)
        lp2 += a * (lp1 - lp2)
        bp = lp1 - lp2 * 0.85
        pan = 0.5 + 0.35 * math.sin(math.pi * (t - 0.5))
        out_l.append(bp * env * (1 - pan) * 2)
        out_r.append(bp * env * pan * 2)
    return out_l, out_r


def pop():
    n = int(SR * 0.22)
    out = []
    phase = 0.0
    for i in range(n):
        t = i / SR
        f = 380 + 900 * math.exp(-t * 38)  # chute de hauteur rapide = « bloop »
        phase += 2 * math.pi * f / SR
        env = (1 - math.exp(-t * 900)) * math.exp(-t * 22)
        out.append((math.sin(phase) + 0.25 * math.sin(2 * phase)) * env)
    return out


def tick():
    n = int(SR * 0.09)
    out = []
    for i in range(n):
        t = i / SR
        env = math.exp(-t * 70)
        out.append((math.sin(2 * math.pi * 1760 * t) * 0.6 + math.sin(2 * math.pi * 2640 * t) * 0.3) * env)
    return out


def bell(freqs, duration, decay):
    """Petite cloche : partiels sinusoïdaux à décroissance exponentielle."""
    n = int(SR * duration)
    out = [0.0] * n
    for k, (f, amp, start) in enumerate(freqs):
        s0 = int(start * SR)
        for i in range(s0, n):
            t = (i - s0) / SR
            env = min(1, t / 0.003) * math.exp(-t * decay * (1 + 0.5 * k))
            out[i] += amp * math.sin(2 * math.pi * f * t) * env
    return out


def scan():
    # deux bips montants, comme un lecteur qui reconnaît le code
    return bell([(1318.5, 1, 0), (2637, 0.25, 0), (1975.5, 1, 0.09), (3951, 0.2, 0.09)], 0.4, 14)


def success():
    # arpège majeur lumineux (sol – si – ré – sol)
    notes = [392.0, 493.9, 587.3, 784.0]
    return bell([(f, 1 - i * 0.12, i * 0.075) for i, f in enumerate(notes)] + [(1568, 0.15, 0.225)], 1.2, 5)


def ding():
    # notification : deux notes douces (mi – la)
    return bell([(1318.5, 1, 0), (2637, 0.2, 0), (1760, 0.9, 0.14), (3520, 0.18, 0.14)], 1.0, 6)


def music_bed(seconds=100, bpm=108):
    """Boucle chaleureuse façon balafon, pentatonique de sol : I – vi – IV – V,
    basse ronde, shaker en doubles croches et grosse caisse feutrée."""
    n = int(SR * seconds)
    L = [0.0] * n
    R = [0.0] * n
    beat = 60 / bpm
    step = beat / 4  # double croche
    bar = beat * 4
    midi = lambda m: 440 * 2 ** ((m - 69) / 12)
    roots = [55, 52, 48, 50]  # sol, mi, do, ré (graves)
    scale = [67, 69, 71, 74, 76, 79, 81, 83, 86]  # sol pentatonique

    def add(start, samples_l, samples_r):
        for i, (a, b) in enumerate(zip(samples_l, samples_r)):
            k = start + i
            if k >= n:
                break
            L[k] += a
            R[k] += b

    def balafon(f, vel, pan, length=0.55):
        m = int(SR * length)
        sl, sr = [], []
        for i in range(m):
            t = i / SR
            click = random.uniform(-1, 1) * math.exp(-t * 900) * 0.25
            v = (
                math.sin(2 * math.pi * f * t) * math.exp(-t * 7)
                + 0.35 * math.sin(2 * math.pi * f * 3.93 * t) * math.exp(-t * 26)
                + 0.12 * math.sin(2 * math.pi * f * 9.2 * t) * math.exp(-t * 60)
                + click
            ) * vel * min(1, t / 0.002)
            sl.append(v * (1 - pan))
            sr.append(v * pan)
        return sl, sr

    # motif de balafon sur 16 pas (indices dans la gamme, None = silence), varié par mesure
    motifs = [
        [0, None, 2, 3, None, 2, 4, None, 3, None, 2, None, 4, 3, None, 1],
        [1, None, 3, 4, None, 3, 5, None, 4, None, 3, 2, None, 4, None, 2],
        [2, None, 4, 5, None, 4, 6, None, 5, 4, None, 3, None, 5, None, 4],
        [0, None, 3, 2, None, 4, 3, None, 6, None, 5, None, 4, None, 3, 2],
    ]
    steps = int(seconds / step)
    voice = [balafon(midi(m), 1, 0.5) for m in scale]  # cache des timbres
    for s_i in range(steps):
        b = int(s_i * step / bar)
        idx = motifs[b % 4][s_i % 16]
        start = int(s_i * step * SR)
        if idx is not None and b >= 1:  # le balafon entre après une mesure
            vel = 0.05 if s_i % 4 == 0 else 0.035
            pan = 0.5 + 0.28 * math.sin(s_i * 0.7)
            sl, sr = voice[idx]
            add(start, [x * vel * 2 * (1 - pan) for x in sl], [x * vel * 2 * pan for x in sr])
        # shaker : bruit aigu, accent à contretemps
        acc = 0.022 if s_i % 4 == 2 else 0.009
        m = int(SR * 0.05)
        hp = prev = 0.0
        sh = []
        for i in range(m):
            x = random.uniform(-1, 1)
            hp = 0.85 * (hp + x - prev)
            prev = x
            sh.append(hp * math.exp(-i / SR * 70) * acc)
        add(start, [v * 0.8 for v in sh], sh)
        # grosse caisse feutrée sur 1, le « et » de 2, et 3
        if s_i % 16 in (0, 6, 8):
            m = int(SR * 0.3)
            ph = 0.0
            k = []
            for i in range(m):
                t = i / SR
                ph += 2 * math.pi * (50 + 70 * math.exp(-t * 30)) / SR
                k.append(math.sin(ph) * math.exp(-t * 9) * 0.16)
            add(start, k, k)

    # basse ronde : fondamentale de l'accord, rythme « 1 . . 3 »
    for b in range(int(seconds / bar) + 1):
        f = midi(roots[b % 4] - 12)
        for off, length in ((0, beat * 1.5), (beat * 2.5, beat * 1.2)):
            start = int((b * bar + off) * SR)
            m = int(length * SR)
            sl = []
            for i in range(m):
                t = i / SR
                env = min(1, t / 0.01) * math.exp(-t * 2.2) * min(1, (length - t) / 0.05)
                sl.append((math.sin(2 * math.pi * f * t) + 0.2 * math.sin(4 * math.pi * f * t)) * env * 0.13)
            add(start, sl, sl)

    # nappe très discrète (tierce + quinte de l'accord) pour lier l'ensemble
    for b in range(int(seconds / bar) + 1):
        root = roots[b % 4] + 12
        third = 4 if b % 4 != 1 else 3
        start = int(b * bar * SR)
        m = int(bar * SR * 1.1)
        for j, iv in enumerate((0, third, 7)):
            f = midi(root + iv)
            sl, sr = [], []
            for i in range(m):
                t = i / SR
                env = min(1, t / 0.6) * min(1, (m / SR - t) / 0.4)
                v = math.sin(2 * math.pi * f * t) * env * 0.012
                sl.append(v * (0.6 if j % 2 else 0.4))
                sr.append(v * (0.4 if j % 2 else 0.6))
            add(start, sl, sr)

    fade = int(1.5 * SR)
    for i in range(fade):
        g = i / fade
        L[i] *= g
        R[i] *= g
        L[n - 1 - i] *= g
        R[n - 1 - i] *= g
    return L, R


if __name__ == "__main__":
    sfx = ROOT / "public" / "sfx"
    write(sfx / "whoosh.wav", *whoosh(0.7, 300, 5200), gain=0.8)
    write(sfx / "whoosh-soft.wav", *whoosh(0.5, 400, 2800, peak_at=0.5), gain=0.55)
    write(sfx / "pop.wav", pop(), gain=0.7)
    write(sfx / "tick.wav", tick(), gain=0.35)
    write(sfx / "scan.wav", scan(), gain=0.45)
    write(sfx / "success.wav", success(), gain=0.5)
    write(sfx / "ding.wav", ding(), gain=0.5)
    write(ROOT / "public" / "music" / "bed.wav", *music_bed(seconds=100), gain=0.8)
