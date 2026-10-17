"""Extrait les tracés vectoriels du logo officiel pour la mascotte Doumi.

  ../frontend/public/icon.svg  ->  src/brand/logo-paths.json

Le logo DouminiDouman se compose de quatre formes : la toque (orange), l'arc
orange qui coiffe le cœur, le cœur jaune et la virgule orange qui le souligne.
On les conserve telles quelles (repère 1500 × 1500 du SVG d'origine) pour que
l'avatar soit littéralement le logo, animé.

Il rend aussi le lettrage seul (« Doumini » + « Douman »), fond transparent,
dans le même repère : public/brand/logo-text.png (3000 × 3000 px).

Usage : python scripts/extract_logo.py   (le rendu du lettrage nécessite `pip install cairosvg`)
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT.parent / "frontend" / "public" / "icon.svg"
OUT = ROOT / "src" / "brand" / "logo-paths.json"
TEXT_PNG = ROOT / "public" / "brand" / "logo-text.png"
NAMES = ["hat", "arc", "swoosh", "heart"]  # ordre d'apparition dans icon.svg


def main() -> None:
    svg = SRC.read_text(encoding="utf-8")
    shapes = []
    for m in re.finditer(r"<path\b([^>]*)>", svg):
        fill = re.search(r'fill="([^"]+)"', m.group(1))
        d = re.search(r' d="([^"]+)"', m.group(1))
        if fill and d and len(d.group(1)) > 500:  # les glyphes du texte sont dans des <g>, sans fill propre
            shapes.append({"fill": fill.group(1), "d": d.group(1)})
    if len(shapes) != len(NAMES):
        raise SystemExit(f"{len(shapes)} formes trouvées, {len(NAMES)} attendues : le logo a changé ?")
    out = {name: shape for name, shape in zip(NAMES, shapes)}
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out, indent=2), encoding="utf-8")
    print("ok", OUT.relative_to(ROOT), ", ".join(f"{k} {v['fill']}" for k, v in out.items()))

    # lettrage seul : on retire les fonds blancs et les quatre formes
    text_only = re.sub(r'<rect [^>]*fill="#ffffff"[^>]*/>', "", svg)
    for shape in shapes:
        text_only = text_only.replace(f'd="{shape["d"]}"', 'd=""')
    try:
        import cairosvg
    except ImportError:
        print("cairosvg absent : public/brand/logo-text.png non régénéré")
        return
    TEXT_PNG.parent.mkdir(parents=True, exist_ok=True)
    cairosvg.svg2png(bytestring=text_only.encode(), write_to=str(TEXT_PNG), output_width=3000, output_height=3000)
    print("ok", TEXT_PNG.relative_to(ROOT))


if __name__ == "__main__":
    main()
