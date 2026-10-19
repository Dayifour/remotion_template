"""Bruitages complémentaires (synthèse) : notification, tap, impact du drop, montée.

Usage : <venv>/python scripts/generate_sfx_extra.py   (numpy, soundfile)
"""
from pathlib import Path
import numpy as np
import soundfile as sf

SR = 48000
OUT = Path(__file__).resolve().parent.parent / "public" / "sfx"
rng = np.random.default_rng(7)


def t(d):
    return np.arange(int(SR * d)) / SR


def env(n, a, r):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na)
    e[-nr:] *= np.exp(-np.linspace(0, 6, nr))
    return e


def bell(f, d, amp=1.0):
    x = t(d)
    s = sum(a * np.sin(2 * np.pi * f * m * x) * np.exp(-x * k) for m, a, k in [(1, 1, 5), (2.76, 0.35, 9), (5.4, 0.12, 14)])
    return amp * s * env(len(x), 0.002, d * 0.9)


def save(name, y, peak=0.8):
    y = y / (np.abs(y).max() + 1e-9) * peak
    sf.write(OUT / name, np.stack([y, y], 1).astype(np.float32), SR)
    print(name, f"{len(y) / SR:.2f}s")


# notification : deux notes claires (mi6 → si5), façon téléphone Android
n = np.zeros(int(SR * 1.1))
for off, f in [(0, 1318.5), (0.13, 1975.5)]:
    b = bell(f, 0.9, 0.9)
    i = int(off * SR)
    n[i:i + len(b)] += b[: len(n) - i]
save("notif.wav", n, 0.75)

# tap d'écran : clic court et sec
x = t(0.05)
tap = (rng.standard_normal(len(x)) * np.exp(-x * 220) + 0.6 * np.sin(2 * np.pi * 2400 * x) * np.exp(-x * 160))
save("tap.wav", tap, 0.6)

# impact du drop : sous-grave qui descend + souffle
x = t(1.6)
f = 90 * np.exp(-x * 2.2) + 38
boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 2.6)
noise = rng.standard_normal(len(x)) * np.exp(-x * 7) * 0.25
k = np.ones(48) / 48
save("impact.wav", boom + np.convolve(noise, k, "same"), 0.9)

# montée : souffle filtré qui s'ouvre (1,8 s), coupé net
x = t(1.8)
w = rng.standard_normal(len(x))
y = np.zeros_like(w)
a = 0.0
for i in range(len(w)):
    c = 0.01 + 0.4 * (x[i] / 1.8) ** 2
    a += c * (w[i] - a)
    y[i] = a
save("riser.wav", y * (x / 1.8) ** 2, 0.55)

# coche validée : petite note ronde montante
x = t(0.35)
ff = 880 * (1 + 0.5 * np.minimum(x / 0.06, 1))
save("check.wav", np.sin(2 * np.pi * np.cumsum(ff) / SR) * env(len(x), 0.003, 0.3), 0.55)
