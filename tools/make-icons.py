#!/usr/bin/env python3
"""Countdown VI — generate the app icon + splash images.

The 1024x1024 AppIcon and the splash PNGs are binary, so they are NOT stored
in the git repo by the push path (the GitHub push path is UTF-8 only).
They must be uploaded to the repo via the GitHub web UI (Add file →
Upload files) into their asset-catalog directories. Codemagic builds
from the repo, so a build without the PNGs in the repo produces a bundle
with no app icon and App Store Connect rejects the upload (ITMS-90022 /
ITMS-90023 / ITMS-90713 — seen on build #2, Nov 13, 2026).

Run this locally to regenerate everything:

    pip install pillow numpy
    python3 tools/make-icons.py

It writes:
  - ios/App/App/Assets.xcassets/AppIcon.appiconset/ — the full 18-size
    icon set (iPhone + iPad + 1024 marketing) + Contents.json
  - ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732*.png
  - store/icon-1024.png (the marketing icon for App Store Connect)

Design: original gradient artwork only — no Rockstar logos, art, or assets.
"""
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PINK = (255, 46, 136)
TEAL = (0, 229, 199)
PURPLE = (124, 92, 255)
BG = (11, 11, 20)


def font(size: int, bold: bool = True):
    candidates = [
        "/System/Library/Fonts/HelveticaNeue.ttc",  # macOS
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except OSError:
                continue
    return ImageFont.load_default()


def gradient(size: int, c1, c2, diagonal=True):
    """Diagonal two-color gradient as an RGB image."""
    x = np.linspace(0, 1, size)[None, :]
    y = np.linspace(0, 1, size)[:, None]
    t = (x + y) / 2 if diagonal else x
    arr = np.zeros((size, size, 3), dtype=np.uint8)
    for i in range(3):
        arr[:, :, i] = (c1[i] * (1 - t) + c2[i] * t).astype(np.uint8)
    return Image.fromarray(arr, "RGB")


def draw_centered(draw, cx, y, text, fnt, fill):
    bbox = draw.textbbox((0, 0), text, font=fnt)
    w = bbox[2] - bbox[0]
    draw.text((cx - w / 2 - bbox[0], y), text, font=fnt, fill=fill)
    return bbox[3] - bbox[1]


def make_icon(path: str):
    size = 1024
    img = Image.new("RGB", (size, size), BG)
    # Diagonal gradient band across the lower half.
    band = gradient(size, PINK, TEAL)
    mask = Image.new("L", (size, size), 0)
    md = ImageDraw.Draw(mask)
    md.polygon([(0, size), (size, size * 0.42), (size, size), (0, size)], fill=255)
    img.paste(band, (0, 0), mask)
    # Subtle vignette dots (stars) in the dark area.
    d = ImageDraw.Draw(img)
    import random

    random.seed(7)
    for _ in range(60):
        x = random.randint(30, size - 30)
        y = random.randint(30, int(size * 0.45))
        r = random.randint(2, 5)
        d.ellipse([x - r, y - r, x + r, y + r], fill=(255, 255, 255, 90))
    # Big VI + COUNTDOWN.
    f_big = font(430)
    draw_centered(d, size / 2, 150, "VI", f_big, (255, 255, 255))
    f_small = font(92)
    draw_centered(d, size / 2, 640, "COUNTDOWN", f_small, (255, 255, 255))
    img.save(path, "PNG")
    print("wrote", path)


def make_splash(path: str):
    size = 2732
    img = Image.new("RGB", (size, size), BG)
    d = ImageDraw.Draw(img)
    f_big = font(560)
    draw_centered(d, size / 2, size / 2 - 420, "VI", f_big, (255, 255, 255))
    f_small = font(150)
    draw_centered(d, size / 2, size / 2 + 220, "COUNTDOWN", f_small, (167, 167, 189))
    # Gradient underline bar.
    bar = gradient(1200, PINK, TEAL, diagonal=False).resize((1200, 26))
    img.paste(bar, ((size - 1200) // 2, size // 2 + 480))
    img.save(path, "PNG")
    print("wrote", path)


def icon_sizes():
    """The full iOS AppIcon set: (idiom, size, scale, filename, pixels)."""
    iphone = [
        ("iphone", "20x20", "2x", "iphone-20@2x.png", 40),
        ("iphone", "20x20", "3x", "iphone-20@3x.png", 60),
        ("iphone", "29x29", "2x", "iphone-29@2x.png", 58),
        ("iphone", "29x29", "3x", "iphone-29@3x.png", 87),
        ("iphone", "40x40", "2x", "iphone-40@2x.png", 80),
        ("iphone", "40x40", "3x", "iphone-40@3x.png", 120),
        ("iphone", "60x60", "2x", "iphone-60@2x.png", 120),
        ("iphone", "60x60", "3x", "iphone-60@3x.png", 180),
    ]
    ipad = [
        ("ipad", "20x20", "1x", "ipad-20.png", 20),
        ("ipad", "20x20", "2x", "ipad-20@2x.png", 40),
        ("ipad", "29x29", "1x", "ipad-29.png", 29),
        ("ipad", "29x29", "2x", "ipad-29@2x.png", 58),
        ("ipad", "40x40", "1x", "ipad-40.png", 40),
        ("ipad", "40x40", "2x", "ipad-40@2x.png", 80),
        ("ipad", "76x76", "1x", "ipad-76.png", 76),
        ("ipad", "76x76", "2x", "ipad-76@2x.png", 152),
        ("ipad", "83.5x83.5", "2x", "ipad-83.5@2x.png", 167),
    ]
    marketing = [("ios-marketing", "1024x1024", "1x", "AppIcon-512@2x.png", 1024)]
    return iphone + ipad + marketing


def write_appicon_set(icon_dir: str, icon_1024_path: str):
    """Downscale the 1024 master to every required size + Contents.json.

    Added Nov 13, 2026: the first Codemagic upload failed (ITMS-90022 /
    ITMS-90023 / ITMS-90713) because the icon set held ONLY the 1024
    marketing icon — the bundle had no iPhone/iPad device icons. The PNGs
    are binary and must be uploaded to the repo via the GitHub web UI
    (the push path is UTF-8 text only); Contents.json goes via push-files.
    """
    import json

    master = Image.open(icon_1024_path)
    images = []
    for idiom, size, scale, filename, px in icon_sizes():
        if px == 1024:
            # The master already lives at this path; just reference it.
            pass
        else:
            resized = master.resize((px, px), Image.LANCZOS)
            resized.save(os.path.join(icon_dir, filename), "PNG")
        images.append(
            {"filename": filename, "idiom": idiom, "scale": scale, "size": size}
        )
    contents = {"images": images, "info": {"author": "xcode", "version": 1}}
    with open(os.path.join(icon_dir, "Contents.json"), "w") as f:
        json.dump(contents, f, indent=2)
        f.write("\n")
    print(f"wrote {len(images)} AppIcon entries to {icon_dir}")


def main():
    icon_dir = os.path.join(ROOT, "ios/App/App/Assets.xcassets/AppIcon.appiconset")
    splash_dir = os.path.join(ROOT, "ios/App/App/Assets.xcassets/Splash.imageset")
    store_dir = os.path.join(ROOT, "store")
    for d in (icon_dir, splash_dir, store_dir):
        os.makedirs(d, exist_ok=True)
    make_icon(os.path.join(icon_dir, "AppIcon-512@2x.png"))
    make_icon(os.path.join(store_dir, "icon-1024.png"))
    write_appicon_set(icon_dir, os.path.join(store_dir, "icon-1024.png"))
    for name in ("splash-2732x2732.png", "splash-2732x2732-1.png", "splash-2732x2732-2.png"):
        make_splash(os.path.join(splash_dir, name))
    print("done — icon + splash images generated")


if __name__ == "__main__":
    main()
