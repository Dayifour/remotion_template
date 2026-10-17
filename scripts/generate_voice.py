"""Génère la voix off de Doumi à partir de src/audio/script.json.

Sorties :
  public/voice/<id>.mp3          une piste par réplique
  src/audio/voice-manifest.json  durées + timings mot à mot (source de vérité du montage)

Usage : python scripts/generate_voice.py  (nécessite `pip install edge-tts mutagen`)
"""
import asyncio
import json
import re
import unicodedata
from pathlib import Path

import edge_tts
from mutagen.mp3 import MP3

ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "src" / "audio" / "script.json"
MANIFEST = ROOT / "src" / "audio" / "voice-manifest.json"
VOICE_DIR = ROOT / "public" / "voice"
TICKS_PER_SECOND = 10_000_000  # edge-tts exprime les offsets en unités de 100 ns


def norm(text: str) -> str:
    """Forme comparable d'un mot : minuscules, sans accents ni ponctuation (« .cloud » se lit « point cloud »)."""
    text = unicodedata.normalize("NFD", re.sub(r"(?<=\w)\.(?=\w)", "point", text.lower()))
    return re.sub(r"[^a-z0-9]", "", "".join(c for c in text if not unicodedata.combining(c)))


def align_captions(text: str, words: list, line_id: str) -> list:
    """Aligne le texte affiché (ponctuation, majuscules, graphie de marque) sur les mots prononcés.

    Un mot affiché peut correspondre à plusieurs mots prononcés
    (« DouminiDouman » = « Doumini » + « Douman », « douminidouman.cloud » = « … point cloud »).
    Les signes isolés (« ! », « ? », « : ») sont rattachés au mot précédent.
    """
    tokens: list[str] = []
    for t in text.split():
        if tokens and not any(ch.isalnum() for ch in t):
            tokens[-1] += " " + t
        else:
            tokens.append(t)
    if not words:
        return [{"text": t, "start": 0.0} for t in tokens]
    out = []
    j = 0
    for i, t in enumerate(tokens):
        j = min(j, len(words) - 1)
        out.append({"text": t, "start": words[j]["start"]})
        target = norm(t)
        joined = ""
        k = j
        while k < len(words) and len(joined) < len(target):
            joined += norm(words[k]["text"])
            k += 1
        if joined == target:
            j = k
        else:
            print(f"  ! {line_id} : « {t} » non aligné, répartition proportionnelle")
            j = round((i + 1) * len(words) / len(tokens))
    return out


async def synthesize(line: dict, cfg: dict) -> dict:
    out = VOICE_DIR / f"{line['id']}.mp3"
    communicate = edge_tts.Communicate(
        line.get("tts", line["text"]),
        cfg["voice"],
        rate=cfg.get("rate", "+0%"),
        pitch=cfg.get("pitch", "+0Hz"),
        boundary="WordBoundary",
    )
    words = []
    with out.open("wb") as f:
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                f.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                start = chunk["offset"] / TICKS_PER_SECOND
                words.append({
                    "text": chunk["text"],
                    "start": round(start, 3),
                    "end": round(start + chunk["duration"] / TICKS_PER_SECOND, 3),
                })
    duration = MP3(out).info.length
    return {
        "captions": align_captions(line["text"], words, line["id"]),
        "id": line["id"],
        "section": line["section"],
        "text": line["text"],
        "file": f"voice/{out.name}",
        "duration": round(duration, 3),
        "speechStart": words[0]["start"] if words else 0,
        "speechEnd": words[-1]["end"] if words else round(duration, 3),
        "words": words,
    }


async def main() -> None:
    cfg = json.loads(SCRIPT.read_text(encoding="utf-8"))
    VOICE_DIR.mkdir(parents=True, exist_ok=True)
    lines = [await synthesize(line, cfg) for line in cfg["lines"]]
    manifest = {"voice": cfg["voice"], "rate": cfg.get("rate"), "lines": lines}
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    for l in lines:
        print(f"{l['id']:<9} {l['duration']:5.2f}s  (parole {l['speechStart']:.2f}->{l['speechEnd']:.2f}s)")
    print(f"Total parole : {sum(l['duration'] for l in lines):.2f}s -> {MANIFEST.relative_to(ROOT)}")


if __name__ == "__main__":
    asyncio.run(main())
