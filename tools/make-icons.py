#!/usr/bin/env python3
"""Countdown VI — generate the app icon + splash images.

The 1024x1024 AppIcon and the splash PNGs are binary, so they are NOT stored
in the git repo (the GitHub push path is UTF-8 only). Run this on the Mac
before the first Xcode build:

    pip install pillow numpy
    python3 tools/make-icons.py

It writes:
  - ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png
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


def main():
    icon_dir = os.path.join(ROOT, "ios/App/App/Assets.xcassets/AppIcon.appiconset")
    splash_dir = os.path.join(ROOT, "ios/App/App/Assets.xcassets/Splash.imageset")
    store_dir = os.path.join(ROOT, "store")
    for d in (icon_dir, splash_dir, store_dir):
        os.makedirs(d, exist_ok=True)
    make_icon(os.path.join(icon_dir, "AppIcon-512@2x.png"))
    make_icon(os.path.join(store_dir, "icon-1024.png"))
    for name in ("splash-2732x2732.png", "splash-2732x2732-1.png", "splash-2732x2732-2.png"):
        make_splash(os.path.join(splash_dir, name))
    print("done — icon + splash images generated")


if __name__ == "__main__":
    main()
