#!/usr/bin/env python3
"""Render the default Open Graph share card — ADR 0022.

Canvas 1200 x 630 on an opaque --lb-navy ground, the supplied on-dark lockup
scaled (never redrawn) into the centred title-safe box, and the waterline band
across the foot. No text is baked in: og:title and og:description are supplied
live by the platform beside the image.

Everything except the lockup is drawn at 4x and downsampled. The lockup is
scaled straight from the 3x master in one LANCZOS pass, which is sharper than
upsampling it to 4x and back down.

Usage:  python3 scripts/make-share-card.py public/brand/share/<name>.jpg
A new card ships under a NEW filename — platforms cache an unfurl against the
page URL, so overwriting one does not update links already shared.
"""
import sys
from PIL import Image, ImageDraw

W, H = 1200, 630
SS = 4                                  # supersample factor

NAVY = (0x1C, 0x4E, 0x8F)               # --lb-navy
TEAL = (0x0F, 0xB5, 0xC4)               # --lb-teal

SAFE_X, SAFE_Y, SAFE_W, SAFE_H = 315, 60, 570, 510   # title-safe box
LOCKUP = "public/brand/logo-market-on-dark@3x.png"
LOCKUP_W = 500                          # inside the 570 title-safe width, so the
                                        # square crop keeps a margin either side

BAND_H = 72                             # waterline band height at 1x


def bezier(p0, p1, p2, p3, steps=160):
    for i in range(steps + 1):
        t = i / steps
        u = 1 - t
        yield (u**3 * p0[0] + 3 * u*u*t * p1[0] + 3 * u*t*t * p2[0] + t**3 * p3[0],
               u**3 * p0[1] + 3 * u*u*t * p1[1] + 3 * u*t*t * p2[1] + t**3 * p3[1])


def waterline_points():
    """The site's <Waterline /> path, in its own 1200 x 18 viewBox."""
    segs = [((0, 11), (100, 2), (200, 20), (300, 11)),
            ((300, 11), (400, 2), (500, 2), (600, 11)),
            ((600, 11), (700, 20), (800, 20), (900, 11)),
            ((900, 11), (1000, 2), (1100, 2), (1200, 11))]
    pts = []
    for s in segs:
        pts.extend(bezier(*s))
    return pts


def main(out):
    card = Image.new("RGB", (W * SS, H * SS), NAVY)

    # --- waterline: teal fading into the navy ground, exactly as the token
    # layer defines it (--lb-teal -> --lb-navy). On a navy card the right-hand
    # end resolves to the ground colour and disappears. That is the gradient
    # doing what it is specified to do, not a rendering fault.
    k = BAND_H / 18.0
    top = H - BAND_H
    wave = [(x * SS, (top + y * k) * SS) for x, y in waterline_points()]
    wave += [(W * SS, H * SS), (0, H * SS)]

    band = Image.new("RGB", (W * SS, H * SS), NAVY)
    grad = Image.new("RGB", (W, 1))
    for x in range(W):
        t = x / (W - 1)
        grad.putpixel((x, 0), tuple(round(TEAL[i] + (NAVY[i] - TEAL[i]) * t) for i in range(3)))
    band.paste(grad.resize((W * SS, H * SS), Image.BILINEAR))

    mask = Image.new("L", (W * SS, H * SS), 0)
    ImageDraw.Draw(mask).polygon(wave, fill=255)
    card.paste(band, (0, 0), mask)

    card = card.resize((W, H), Image.LANCZOS)

    # --- lockup, scaled from the 3x master and never altered otherwise
    art = Image.open(LOCKUP).convert("RGBA")
    art = art.crop(art.getbbox())                       # drop transport padding
    h = round(art.height * LOCKUP_W / art.width)
    art = art.resize((LOCKUP_W, h), Image.LANCZOS)
    x = SAFE_X + (SAFE_W - LOCKUP_W) // 2
    y = SAFE_Y + (SAFE_H - h) // 2
    card.paste(art, (x, y), art)

    assert x >= SAFE_X and x + LOCKUP_W <= SAFE_X + SAFE_W
    assert y >= SAFE_Y and y + h <= SAFE_Y + SAFE_H

    card.save(out, "JPEG", quality=80, optimize=True, progressive=True, subsampling=0)
    print(f"{out}  {card.size[0]}x{card.size[1]}  lockup {LOCKUP_W}x{h} at ({x},{y})")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "public/brand/share/share-default-2026-09.jpg")
