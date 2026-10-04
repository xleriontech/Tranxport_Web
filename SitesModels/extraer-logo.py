"""Extrae el logo del EPS de Illustrator a PNG web con transparencia.

El EPS (DOS EPS con preview TIFF paletizado de 2 muestras/px) no lo abre
ningun visor del sistema, asi que se decodifica el preview manualmente:
  - strip de pixeles: 1143x1012x2 bytes al final del TIFF (offset = len - count)
  - plano 0 = indices de paleta (colormap en 0x234CE6), plano 1 = se ignora
  - recorte fijo del wordmark + fondo blanco a transparente por umbral
    (esto tambien elimina las guias del artboard de Illustrator)
  - logo-blanco.png se deriva del alfa de logo-color.png (todo a blanco)

Uso:  python extraer-logo.py
Sale:  ../site/logo-color.png  (azul, fondos claros)
       ../site/logo-blanco.png (blanco, fondos oscuros)
"""
from PIL import Image
import struct
from pathlib import Path

BASE = Path(__file__).resolve().parent
EPS = BASE / "TranxportLogo.eps"
OUT = BASE.parent / "site"
W, H = 1143, 1012
CROP = (55, 40, 1050, 275)  # wordmark TRANXPORT (sin tagline)
BG, TOL = (255, 255, 255), 30


def main():
    raw = EPS.read_bytes()
    t = raw[535874:535874 + 2366092]  # preview TIFF dentro del DOS EPS
    cmap = struct.unpack("<768H", t[0x234CE6:0x234CE6 + 1536])
    pal = []
    for i in range(256):
        pal += [cmap[i] >> 8, cmap[256 + i] >> 8, cmap[512 + i] >> 8]
    off = 2366092 - 2313432  # StripByteCounts = W*H*2
    data = t[off:off + W * H * 2]
    idx = Image.frombytes("P", (W, H), bytes(data[0::2]))
    idx.putpalette(pal)
    rgb = idx.convert("RGB").crop(CROP)
    px = rgb.load()
    rgba = Image.new("RGBA", rgb.size, (0, 0, 0, 0))
    pr = rgba.load()
    for y in range(rgb.size[1]):
        for x in range(rgb.size[0]):
            r, g, b = px[x, y]
            d = max(abs(r - BG[0]), abs(g - BG[1]), abs(b - BG[2]))
            if d:
                pr[x, y] = (r, g, b, min(255, d * 255 // TOL))
    rgba.save(OUT / "logo-color.png")
    w = Image.new("RGBA", rgb.size, (0, 0, 0, 0))
    pw, pc = w.load(), rgba.load()
    for y in range(rgb.size[1]):
        for x in range(rgb.size[0]):
            if pc[x, y][3]:
                pw[x, y] = (255, 255, 255, pc[x, y][3])
    w.save(OUT / "logo-blanco.png")
    print("ok:", rgba.size)


if __name__ == "__main__":
    main()
