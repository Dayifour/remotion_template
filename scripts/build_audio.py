"""Voix off + beat : génère, cale et mixe la bande son de la vidéo Yelen Sugu.

1. Analyse le beat (ressources/…mpeg) : temps et premiers temps de mesure.
2. Synthétise chaque réplique de src/audio/script.json (edge-tts, voix féminine).
3. Pose chaque réplique sur sa mesure (« bar »), resserre le débit si elle déborde.
4. Traite la voix (EQ de présence, compression, légère réverbération) et la mixe
   sur le beat avec un ducking par sidechain : la musique s'efface sous la voix.

Sorties :
  public/audio/mix.wav          bande son finale (voix + musique), 48 kHz stéréo
  src/audio/timeline.json       temps (s) des répliques, mots, sous-titres, mesures

Usage : <venv>/python scripts/build_audio.py   (edge-tts, mutagen, numpy, librosa, soundfile)
"""
import asyncio
import hashlib
import json
import re
import subprocess
import unicodedata
from pathlib import Path

import edge_tts
import librosa
import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "src" / "audio" / "script.json"
TIMELINE = ROOT / "src" / "audio" / "timeline.json"
CACHE = ROOT / "public" / "voice"
OUT = ROOT / "public" / "audio"
SR = 48000
TICKS = 10_000_000
GAP = 0.18  # silence minimal entre deux répliques
MAX_TEMPO = 1.14  # accélération maximale tolérée pour tenir dans la mesure


def ff(*args: str) -> None:
    subprocess.run(["ffmpeg", "-v", "error", "-y", *args], check=True)


def norm(text: str) -> str:
    text = unicodedata.normalize("NFD", re.sub(r"(?<=\w)[.-](?=\w)", " ", text.lower()))
    return re.sub(r"[^a-z0-9]", "", "".join(c for c in text if not unicodedata.combining(c)))


def align_captions(text: str, words: list) -> list:
    """Rattache chaque mot affiché (graphie, ponctuation) à l'instant où il est prononcé."""
    tokens: list[str] = []
    for t in text.split():
        if tokens and not any(ch.isalnum() for ch in t):
            tokens[-1] += " " + t
        else:
            tokens.append(t)
    out, j = [], 0
    for i, t in enumerate(tokens):
        j = min(j, len(words) - 1)
        out.append({"text": t, "start": words[j]["start"], "end": words[j]["end"]})
        target, joined, k = norm(t), "", j
        while k < len(words) and len(joined) < len(target):
            joined += norm(words[k]["text"])
            k += 1
        # graphie et prononciation diffèrent (Yelen / Yélèn, Wave / Ouève) : on avance d'un mot
        j = k if joined == target or k > j else round((i + 1) * len(words) / len(tokens))
        out[-1]["end"] = words[max(0, min(k, len(words)) - 1)]["end"]
    return out


async def tts(line: dict, cfg: dict) -> tuple[Path, list]:
    spoken = line.get("tts", line["text"])
    key = hashlib.sha1(f"{cfg['voice']}|{cfg['rate']}|{cfg['pitch']}|{spoken}".encode()).hexdigest()[:10]
    mp3, meta = CACHE / f"{line['id']}-{key}.mp3", CACHE / f"{line['id']}-{key}.json"
    if not meta.exists():
        comm = edge_tts.Communicate(spoken, cfg["voice"], rate=cfg["rate"], pitch=cfg["pitch"], boundary="WordBoundary")
        words = []
        with mp3.open("wb") as f:
            async for chunk in comm.stream():
                if chunk["type"] == "audio":
                    f.write(chunk["data"])
                elif chunk["type"] == "WordBoundary":
                    s = chunk["offset"] / TICKS
                    words.append({"text": chunk["text"], "start": s, "end": s + chunk["duration"] / TICKS})
        meta.write_text(json.dumps(words, ensure_ascii=False), encoding="utf-8")
    return mp3, json.loads(meta.read_text(encoding="utf-8"))


def load(path: Path, tempo: float = 1.0) -> np.ndarray:
    tmp = CACHE / "_tmp.wav"
    af = f"atempo={tempo:.4f}" if abs(tempo - 1) > 1e-3 else "anull"
    ff("-i", str(path), "-af", af, "-ar", str(SR), "-ac", "1", str(tmp))
    y, _ = sf.read(tmp, dtype="float32")
    tmp.unlink()
    return y


def downbeats(music: Path, offset: float, count: int) -> list[float]:
    y, sr = librosa.load(music, sr=22050, mono=True)
    _, b = librosa.beat.beat_track(y=y, sr=sr, bpm=136, tightness=400)
    bt = librosa.frames_to_time(b, sr=sr)
    S = np.abs(librosa.stft(y, n_fft=2048, hop_length=512))
    low = S[librosa.fft_frequencies(sr=sr) < 150].sum(0)
    t = librosa.frames_to_time(np.arange(S.shape[1]), sr=sr, hop_length=512)
    phase = int(np.argmax([np.mean([low[np.searchsorted(t, x)] for x in bt[p::4]]) for p in range(4)]))
    raw = bt[phase::4]
    # le tempo est stable : une droite ajustée sur toutes les mesures gomme le jitter du détecteur
    period, t0 = np.polyfit(np.arange(len(raw)), raw, 1)
    first = int(np.ceil((offset - 0.05 - t0) / period))
    return [round(t0 + (first + i) * period - offset, 4) for i in range(count + 2)], float(period)


def at_bar(db: list[float], bar: float) -> float:
    i = int(bar)
    return db[i] + (bar - i) * (db[i + 1] - db[i])


async def main() -> None:
    cfg = json.loads(SCRIPT.read_text(encoding="utf-8"))
    CACHE.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    music_src = ROOT / cfg["music"]["file"]
    offset = cfg["music"]["offset"]
    db, period = downbeats(music_src, offset, cfg["end_bar"] + 2)
    total = db[cfg["end_bar"]] + 1.2

    lines = cfg["lines"]
    starts = [at_bar(db, l["bar"]) for l in lines]
    voice = np.zeros(int((total + 1) * SR), dtype=np.float32)
    out_lines = []
    for i, l in enumerate(lines):
        mp3, words = await tts(l, cfg)
        lead = words[0]["start"] if words else 0
        speech = (words[-1]["end"] - lead) if words else 0
        limit = (starts[i + 1] if i + 1 < len(lines) else total - 1.0) - starts[i] - GAP
        tempo = min(MAX_TEMPO, max(1.0, speech / limit)) if limit > 0 else MAX_TEMPO
        y = load(mp3, tempo)
        # la première syllabe tombe pile sur la mesure : on retire le silence d'attaque du TTS
        y = y[int(lead / tempo * SR):]
        a = int(starts[i] * SR)
        voice[a:a + len(y)] += y[: len(voice) - a]
        ws = [{"text": w["text"], "start": round(starts[i] + (w["start"] - lead) / tempo, 3),
               "end": round(starts[i] + (w["end"] - lead) / tempo, 3)} for w in words]
        end = ws[-1]["end"] if ws else starts[i]
        flag = "  <- déborde" if speech / tempo > limit + 1e-3 else ""
        print(f"{l['id']:<9} mesure {l['bar']:>5}  {starts[i]:6.2f}s → {end:6.2f}s  tempo x{tempo:.2f}{flag}")
        out_lines.append({"id": l["id"], "text": l["text"], "start": round(starts[i], 3), "end": end,
                          "words": ws, "captions": align_captions(l["text"], ws)})

    # pistes intermédiaires
    raw_voice, music = CACHE / "_voice.wav", CACHE / "_music.wav"
    sf.write(raw_voice, voice, SR)
    ff("-ss", f"{offset}", "-t", f"{total}", "-i", str(music_src), "-ar", str(SR), "-ac", "2",
       "-af", f"afade=t=in:d=0.04,afade=t=out:st={db[cfg['end_bar'] - 1]:.3f}:d={total - db[cfg['end_bar'] - 1]:.3f}",
       str(music))

    # Voix : nettoyage du bas, chaleur, présence, air, compression douce, petite pièce.
    voice_fx = (
        "highpass=f=85,equalizer=f=220:t=q:w=1.2:g=1.5,equalizer=f=450:t=q:w=1.4:g=-2.5,"
        "equalizer=f=3200:t=q:w=1.0:g=3,equalizer=f=6500:t=q:w=2:g=-1.5,treble=g=2.5:f=11000,"
        "acompressor=threshold=-20dB:ratio=3.5:attack=4:release=90:makeup=4dB,"
        "aecho=0.85:0.6:42|71:0.12|0.07,loudnorm=I=-15:TP=-2:LRA=7,aformat=channel_layouts=stereo"
    )
    graph = (
        f"[0:a]{voice_fx},asplit=2[v][key];"
        # le beat sous la voix : creux de -9 dB dans les médiums, la grosse caisse reste
        "[1:a]volume=0.5,asplit=2[mlow][mhigh];"
        "[mlow]lowpass=f=140,volume=0.8[lo];[mhigh]highpass=f=140[hi0];"
        "[hi0][key]sidechaincompress=threshold=0.02:ratio=6:attack=20:release=420:makeup=1[hi];"
        "[lo][hi]amix=inputs=2:normalize=0[m];"
        "[v][m]amix=inputs=2:normalize=0:weights=1 1,alimiter=limit=0.89:level=false[out]"
    )
    ff("-i", str(raw_voice), "-i", str(music), "-filter_complex", graph, "-map", "[out]",
       "-ar", str(SR), "-t", f"{total}", str(OUT / "mix.wav"))
    ff("-i", str(music), "-t", f"{total}", str(OUT / "music.wav"))
    raw_voice.unlink()
    music.unlink()

    TIMELINE.write_text(json.dumps({
        "duration": round(total, 3),
        "barPeriod": round(period, 4),
        "downbeats": db,
        "lines": out_lines,
    }, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"Durée {total:.2f}s · mesure {period:.3f}s → {OUT / 'mix.wav'}")


if __name__ == "__main__":
    asyncio.run(main())
