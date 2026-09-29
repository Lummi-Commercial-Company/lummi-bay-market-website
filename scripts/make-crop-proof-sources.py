#!/usr/bin/env python3
"""Render the two stand-in photographs used by docs/proofs/promo-crop-ladder.html.

There is no store photography yet, and the crop ladder cannot be judged without
something to crop. These are deliberate stand-ins, not proposed artwork:
  A  counter.jpg   — subject centred, inside the 5:1 safe band. Survives every crop.
  B  storefront.jpg — subject low in the frame. Cut in half by the full-width crop.

Both are supplied at 2400 x 1350 (16:9), which is what the proof concludes a
promo master should be: 16:9 is the tallest crop in the ladder, so every other
crop is a purely vertical trim of it and nothing is ever lost sideways.

No tribal motifs: section 07 of the spec sheet bars them from the promo region.

Usage:  python3 scripts/make-crop-proof-sources.py docs/proofs/img
"""
import os
import random
import sys
from PIL import Image, ImageDraw, ImageFilter

W, H = 2400, 1350
SS = 2                                   # supersample factor
SAFE_TOP, SAFE_BOT = (H - W // 5) // 2, (H + W // 5) // 2   # the 5:1 band: 435..915


def vgrad(size, stops):
    """Vertical gradient. stops = [(position 0..1, (r,g,b)), ...]."""
    w, h = size
    img = Image.new("RGB", (1, h))
    px = img.load()
    for y in range(h):
        t = y / (h - 1)
        for i in range(len(stops) - 1):
            p0, c0 = stops[i]
            p1, c1 = stops[i + 1]
            if p0 <= t <= p1:
                k = 0 if p1 == p0 else (t - p0) / (p1 - p0)
                px[0, y] = tuple(round(c0[j] + (c1[j] - c0[j]) * k) for j in range(3))
                break
        else:
            px[0, y] = stops[-1][1]
    return img.resize((w, h), Image.BILINEAR)


def bokeh(img, rng, n, radius, palette, alpha=54):
    """Out-of-focus highlights, drawn then blurred with the plate behind them."""
    w, h = img.size
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for _ in range(n):
        r = rng.randint(radius // 2, radius)
        x, y = rng.randint(-r, w + r), rng.randint(-r, h + r)
        d.ellipse((x - r, y - r, x + r, y + r), fill=palette[rng.randrange(len(palette))] + (alpha,))
    layer = layer.filter(ImageFilter.GaussianBlur(radius * 0.45))
    img.alpha_composite(layer) if img.mode == "RGBA" else img.paste(
        Image.alpha_composite(img.convert("RGBA"), layer).convert("RGB"), (0, 0))
    return img


def counter(path):
    """A: warm interior, a cup dead centre, everything inside the safe band."""
    rng = random.Random(7)
    w, h = W * SS, H * SS
    img = vgrad((w, h), [(0.0, (46, 32, 22)), (0.45, (92, 60, 38)),
                         (0.72, (146, 104, 66)), (1.0, (74, 48, 31))])
    bokeh(img, rng, 26, 190 * SS, [(255, 214, 150), (255, 176, 96), (210, 150, 90)])
    img = img.filter(ImageFilter.GaussianBlur(9 * SS))

    d = ImageDraw.Draw(img, "RGBA")
    cx, cy = w // 2, (SAFE_TOP + SAFE_BOT) // 2 * SS
    cw, ch = 280 * SS, 320 * SS          # cup body, comfortably inside the 480px band

    # cast shadow on the counter
    d.ellipse((cx - cw, cy + ch // 2 - 30 * SS, cx + cw, cy + ch // 2 + 46 * SS),
              fill=(20, 12, 8, 120))
    # handle
    d.ellipse((cx + cw // 2 - 30 * SS, cy - 60 * SS, cx + cw // 2 + 92 * SS, cy + 80 * SS),
              outline=(238, 232, 220, 255), width=26 * SS)
    # body + rim
    d.rounded_rectangle((cx - cw // 2, cy - ch // 2, cx + cw // 2, cy + ch // 2),
                        radius=28 * SS, fill=(244, 240, 231, 255))
    d.ellipse((cx - cw // 2, cy - ch // 2 - 22 * SS, cx + cw // 2, cy - ch // 2 + 22 * SS),
              fill=(226, 219, 205, 255))
    d.ellipse((cx - cw // 2 + 18 * SS, cy - ch // 2 - 10 * SS,
               cx + cw // 2 - 18 * SS, cy - ch // 2 + 14 * SS), fill=(78, 48, 30, 255))
    # steam
    steam = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    sd = ImageDraw.Draw(steam)
    for k in (-1, 0, 1):
        x = cx + k * 58 * SS
        sd.line([(x, cy - ch // 2 - 30 * SS), (x + 26 * SS, cy - ch // 2 - 90 * SS),
                 (x - 14 * SS, cy - ch // 2 - 150 * SS), (x + 18 * SS, cy - ch // 2 - 200 * SS)],
                fill=(255, 250, 244, 120), width=14 * SS, joint="curve")
    img.paste(Image.alpha_composite(img.convert("RGBA"),
              steam.filter(ImageFilter.GaussianBlur(11 * SS))).convert("RGB"), (0, 0))

    img.resize((W, H), Image.LANCZOS).save(path, "JPEG", quality=78,
                                           optimize=True, progressive=True)
    return path


def storefront(path):
    """B: dusk sky over a low roofline — the subject sits below the safe band."""
    rng = random.Random(11)
    w, h = W * SS, H * SS
    img = vgrad((w, h), [(0.0, (16, 30, 62)), (0.42, (28, 78, 143)),
                         (0.62, (86, 132, 168)), (0.74, (214, 150, 96)),
                         (0.80, (120, 92, 78)), (1.0, (34, 34, 40))])
    bokeh(img, rng, 14, 150 * SS, [(255, 226, 178), (150, 200, 226)], alpha=38)
    img = img.filter(ImageFilter.GaussianBlur(7 * SS))

    d = ImageDraw.Draw(img, "RGBA")
    roof = 900 * SS                       # below SAFE_BOT (915) — that is the point
    # canopy on two posts, then the store block beneath it
    d.rectangle((300 * SS, roof, 1180 * SS, roof + 62 * SS), fill=(28, 34, 46, 255))
    for px_ in (360, 1080):
        d.rectangle((px_ * SS, roof + 62 * SS, (px_ + 34) * SS, h), fill=(28, 34, 46, 255))
    d.rectangle((1320 * SS, roof + 96 * SS, 2180 * SS, h), fill=(22, 27, 38, 255))
    for i in range(6):                    # lit windows, well under the band
        x = (1380 + i * 132) * SS
        d.rectangle((x, roof + 170 * SS, x + 92 * SS, roof + 300 * SS),
                    fill=(252, 226, 160, 255))
    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse((1300 * SS, roof + 60 * SS, 2200 * SS, h),
                                 fill=(255, 208, 132, 46))
    img.paste(Image.alpha_composite(img.convert("RGBA"),
              glow.filter(ImageFilter.GaussianBlur(60 * SS))).convert("RGB"), (0, 0))

    img.resize((W, H), Image.LANCZOS).save(path, "JPEG", quality=78,
                                           optimize=True, progressive=True)
    return path


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "docs/proofs/img"
    os.makedirs(out, exist_ok=True)
    for f in (counter(os.path.join(out, "crop-counter.jpg")),
              storefront(os.path.join(out, "crop-storefront.jpg"))):
        print(f"{f}  {os.path.getsize(f) / 1024:.0f} KB")
    print(f"safe band (5:1) = y {SAFE_TOP}..{SAFE_BOT} of {H}")
