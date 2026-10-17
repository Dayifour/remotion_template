"""Prépare les captures d'écran réelles de DouminiDouman pour le film.

  ../scrennshots/*.png  ->  public/screens/<nom>.jpg

Pour chaque capture : on retire l'interface du navigateur (onglets, barre
d'adresse, barre latérale), et l'ancien logo « Douma » encore visible sur
certaines captures est remplacé par le logo officiel (frontend/public/brand-logo.png).

Usage : python scripts/prepare_screens.py   (nécessite Pillow)
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT.parent / "scrennshots"
LOGO = ROOT.parent / "frontend" / "public" / "brand-logo.png"
OUT = ROOT / "public" / "screens"

# nom de sortie, fichier source, zone conservée (gauche, haut, droite, bas),
# fenêtre de recherche de l'ancien logo (coordonnées source) ou None
SHOTS = [
    ("accueil", "2026-10-04 17-13-57", (69, 108, 1837, 1037), (100, 112, 240, 192)),
    ("restaurant", "2026-10-04 18-10-03", (69, 108, 1837, 1040), (100, 112, 240, 192)),
    ("carte", "2026-10-05 09-44-50", (52, 108, 1833, 1038), (90, 104, 220, 182)),
    ("plat", "2026-10-05 09-44-40", (626, 290, 1266, 861), None),
    ("avis", "2026-10-05 09-44-17", (52, 108, 1833, 1038), (90, 104, 220, 182)),
    ("commander", "2026-10-05 09-45-04", (52, 108, 1833, 1038), (90, 104, 220, 182)),
    ("suivi", "2026-10-05 09-45-42", (640, 160, 1250, 1005), None),
    ("commandes", "2026-10-04 17-25-58", (69, 106, 1837, 1040), (80, 112, 200, 190)),
    ("vue-ensemble", "2026-10-04 17-27-20", (69, 106, 1837, 1040), (80, 112, 200, 190)),
    ("etablissements", "2026-10-04 17-26-18", (69, 106, 1837, 1040), (80, 112, 200, 190)),
    ("itineraire", "2026-10-04 17-27-56", (680, 107, 1837, 1037), None),
    ("statistiques", "2026-10-04 17-25-09", (69, 106, 1837, 1040), (80, 112, 200, 190)),
    ("apparence", "2026-10-04 17-23-22", (69, 106, 1837, 1040), (80, 112, 200, 190)),
    ("qr-codes", "2026-10-04 17-24-04", (69, 106, 1837, 1040), (80, 112, 200, 190)),
    ("modes", "2026-10-04 17-24-31", (69, 106, 1837, 1040), (80, 112, 200, 190)),
    ("equipe", "2026-10-04 17-25-26", (69, 106, 1837, 1040), (80, 112, 200, 190)),
    ("restaurants", "2026-10-04 17-25-16", (69, 106, 1837, 1040), (80, 112, 200, 190)),
    ("abonnement", "2026-10-04 17-25-48", (69, 106, 1837, 1040), (80, 112, 200, 190)),
]

# Photos de plats découpées dans la carte réelle (« Saveurs de Ségou ») pour l'écran du téléphone
THUMBS = [
    ("plat-riz-gras", "2026-10-05 09-44-50", (336, 252, 556, 527)),
    ("plat-sauce-feuille", "2026-10-05 09-44-50", (571, 252, 791, 527)),
    ("plat-tiguadegue", "2026-10-05 09-44-50", (806, 252, 1026, 527)),
]


def replace_logo(im: Image.Image, box: tuple[int, int, int, int], logo: Image.Image) -> None:
    """Efface l'ancien logo (pixels saturés de la fenêtre) et pose le logo officiel à sa place."""
    x0, y0, x1, y1 = box
    bg = im.getpixel((x1 - 2, y0 + 2))
    xs, ys = [], []
    for y in range(y0, y1):
        for x in range(x0, x1):
            r, g, b = im.getpixel((x, y))[:3]
            if max(r, g, b) - min(r, g, b) > 60:  # orange / jaune du logo
                xs.append(x)
                ys.append(y)
    if not xs:
        return
    lx0, lx1, ly0, ly1 = min(xs) - 3, max(xs) + 4, min(ys) - 3, max(ys) + 4
    im.paste(bg, (lx0, ly0, lx1, ly1))
    h = ly1 - ly0
    w = round(h * logo.width / logo.height)
    mark = logo.resize((w, h), Image.LANCZOS)
    im.paste(mark, (lx0, ly0), mark)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    logo = Image.open(LOGO).convert("RGBA")
    for name, stamp, crop, logo_box in SHOTS:
        im = Image.open(SRC / f"Screenshot from {stamp}.png").convert("RGB")
        if logo_box:
            replace_logo(im, logo_box, logo)
        im.crop(crop).save(OUT / f"{name}.jpg", quality=92)
        print("ok", name, im.crop(crop).size)
    for name, stamp, crop in THUMBS:
        Image.open(SRC / f"Screenshot from {stamp}.png").convert("RGB").crop(crop).save(OUT / f"{name}.jpg", quality=92)
        print("ok", name)


if __name__ == "__main__":
    main()
