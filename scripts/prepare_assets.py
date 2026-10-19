"""Découpe les photos produits dans la capture de la Boutique (ressources/) et les agrandit.

Usage : <venv>/python scripts/prepare_assets.py   (Pillow)
"""
from pathlib import Path
from PIL import Image, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "ressources" / "WhatsApp Image 2026-10-19 at 4.24.15 PM.jpeg"
OUT = ROOT / "public" / "products"
# (x0, y0, x1, y1) dans la capture 576 × 1280 — cadres intérieurs des cartes produit
CROPS = {
    "galaxy-a55": (35, 456, 270, 668),
    "ecouteurs": (307, 456, 542, 668),
    "clavier": (35, 911, 270, 1120),
    "souris": (307, 911, 542, 1120),
}

OUT.mkdir(parents=True, exist_ok=True)
img = Image.open(SRC).convert("RGB")
for name, box in CROPS.items():
    c = img.crop(box)
    c = c.resize((c.width * 3, c.height * 3), Image.LANCZOS)
    c = c.filter(ImageFilter.UnsharpMask(radius=2.2, percent=70, threshold=2))
    c = ImageEnhance.Contrast(c).enhance(1.04)
    c.save(OUT / f"{name}.jpg", quality=93)
    print(name, c.size)
