"""Genera el favicon desde la X del logo (logo-blanco.png).

La X se funde con N y P en el wordmark, asi que se aisla con dos
borrados quirurgicos (solo en memoria, el logo no se toca):
  - asta de la N: x 385-403, y 0-140 (el pie de la X vive mas abajo)
  - asta de la P: x 547+, y 0-150 (la punta inferior de la X queda debajo)
Recorte fijo de la X + fondo azul navy con esquinas redondeadas.

Uso:  python crear-favicon.py
Sale: ../site/favicon.ico|favicon-16.png|favicon-32.png|apple-touch-icon.png
"""
from PIL import Image, ImageDraw
from pathlib import Path

BASE = Path(__file__).resolve().parent
SITE = BASE.parent / "site"
NAVY = (26, 58, 82, 255)


def main():
    w = Image.open(SITE / "logo-blanco.png").convert("RGBA").copy()
    px = w.load()
    W, H = w.size
    for y in range(0, 140):
        for x in range(385, 403):
            px[x, y] = (255, 255, 255, 0)
    for y in range(0, 150):
        for x in range(547, W):
            px[x, y] = (255, 255, 255, 0)
    x = w.crop((404, 0, 547, 172))
    S = 256
    s = min(220 / x.size[0], S / x.size[1])
    xi = x.resize((round(x.size[0] * s), round(x.size[1] * s)), Image.LANCZOS)
    base = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    base.paste(xi, ((S - xi.size[0]) // 2, (S - xi.size[1]) // 2), xi)
    bg = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    ImageDraw.Draw(bg).rounded_rectangle([0, 0, S - 1, S - 1], radius=56, fill=NAVY)
    bg.paste(base, (0, 0), base)
    bg.convert("RGB").save(SITE / "apple-touch-icon.png")
    bg.resize((32, 32), Image.LANCZOS).save(SITE / "favicon-32.png")
    bg.resize((16, 16), Image.LANCZOS).save(SITE / "favicon-16.png")
    bg.save(SITE / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    print("ok", xi.size)


if __name__ == "__main__":
    main()
