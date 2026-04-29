"""Compose App Store-style marketing frames from raw UI screenshots.

Input:  docs/screenshots/raw/0{1,2,3}-*.png
Output: docs/screenshots/0{1,2,3}-*.png

Visual philosophy: "Quiet Instrument." Two-color palette (accent green / ink black),
one typeface, generous negative space. Phone bezel quiet, tagline restrained,
the UI is the statement.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# ---------- canvas ---------------------------------------------------------
W, H = 1242, 2688
BG_INK = (10, 10, 10)           # #0a0a0a — ink-950
ACCENT = (34, 197, 94)          # #22c55e — accent-500
TEXT_PRIMARY = (245, 245, 245)  # near-white
TEXT_MUTED = (110, 110, 110)    # ink-400-ish

# ---------- phone bezel ----------------------------------------------------
BEZEL_W, BEZEL_H = 800, 1734    # matches raw screenshot ratio (393:852 = 0.461)
SCREEN_INSET = 22                # bezel thickness around the screen
SCREEN_W = BEZEL_W - SCREEN_INSET * 2
SCREEN_H = BEZEL_H - SCREEN_INSET * 2
BEZEL_RADIUS = 84
SCREEN_RADIUS = 64
BEZEL_X = (W - BEZEL_W) // 2
BEZEL_Y = 600

# ---------- typography ----------------------------------------------------
FONT_PATH = "/System/Library/Fonts/SFNS.ttf"
FONT_PATH_FALLBACK = "/System/Library/Fonts/HelveticaNeue.ttc"

def load_font(size, weight_idx=0):
    """SFNS.ttf is a variable font — Pillow picks a default cut. weight_idx is
    used only for fallbacks where multiple faces live in a TTC."""
    try:
        return ImageFont.truetype(FONT_PATH, size)
    except Exception:
        return ImageFont.truetype(FONT_PATH_FALLBACK, size, index=weight_idx)


def rounded_rect(draw, xy, radius, fill, outline=None, width=0):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def make_background():
    """Solid ink-950 with a faint accent vignette in the upper third."""
    bg = Image.new("RGB", (W, H), BG_INK)

    # Subtle radial-ish glow: paint a translucent accent ellipse in the top
    # third, then heavy-blur it. The result is a quiet brand-color halo behind
    # the tagline that fades to pure ink before the phone.
    glow = Image.new("RGB", (W, H), BG_INK)
    gd = ImageDraw.Draw(glow)
    gd.ellipse((W // 2 - 700, -400, W // 2 + 700, 600), fill=(20, 60, 36))
    glow = glow.filter(ImageFilter.GaussianBlur(radius=180))

    bg = Image.blend(bg, glow, 0.55)
    return bg


def draw_tagline(canvas):
    """'Track drills.' (accent) + 'Build skills.' (white) — two lines,
    centered, restrained scale. Lives in the upper third above the phone."""
    draw = ImageDraw.Draw(canvas)
    font = load_font(132)

    line1 = "Track drills."
    line2 = "Build skills."

    # Anchor each line by its bbox center
    bbox1 = draw.textbbox((0, 0), line1, font=font)
    bbox2 = draw.textbbox((0, 0), line2, font=font)
    w1, h1 = bbox1[2] - bbox1[0], bbox1[3] - bbox1[1]
    w2, h2 = bbox2[2] - bbox2[0], bbox2[3] - bbox2[1]
    line_gap = 18
    total_h = h1 + h2 + line_gap
    top_y = 220

    draw.text(((W - w1) // 2 - bbox1[0], top_y - bbox1[1]),
              line1, font=font, fill=ACCENT)
    draw.text(((W - w2) // 2 - bbox2[0], top_y + h1 + line_gap - bbox2[1]),
              line2, font=font, fill=TEXT_PRIMARY)


def draw_footer(canvas, index, total):
    """Tiny brand mark + shot index along the bottom edge."""
    draw = ImageDraw.Draw(canvas)
    font_brand = load_font(34)
    font_idx = load_font(28)

    brand = "PROTOCOL"
    idx = f"{index:02d} / {total:02d}"

    # PROTOCOL on left, index on right, inset from edges
    margin_x = 120
    base_y = H - 140

    bb = draw.textbbox((0, 0), brand, font=font_brand)
    draw.text((margin_x - bb[0], base_y - bb[1]), brand,
              font=font_brand, fill=TEXT_MUTED)

    bb2 = draw.textbbox((0, 0), idx, font=font_idx)
    w_idx = bb2[2] - bb2[0]
    draw.text((W - margin_x - w_idx - bb2[0], base_y - bb2[1] + 4),
              idx, font=font_idx, fill=TEXT_MUTED)


def place_phone(canvas, screenshot_path):
    """Render the bezel and inset the screenshot inside it."""
    # Bezel as a rounded rect with a one-pixel highlight stroke
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    rounded_rect(
        od,
        (BEZEL_X, BEZEL_Y, BEZEL_X + BEZEL_W, BEZEL_Y + BEZEL_H),
        radius=BEZEL_RADIUS,
        fill=(18, 18, 18, 255),
        outline=(40, 40, 40, 255),
        width=2,
    )

    # Inset for the screen — black hole inside the bezel
    sx = BEZEL_X + SCREEN_INSET
    sy = BEZEL_Y + SCREEN_INSET
    rounded_rect(
        od,
        (sx, sy, sx + SCREEN_W, sy + SCREEN_H),
        radius=SCREEN_RADIUS,
        fill=(0, 0, 0, 255),
    )
    canvas.alpha_composite(overlay)

    # Place the screenshot, masked to the screen radius
    raw = Image.open(screenshot_path).convert("RGB")
    raw = raw.resize((SCREEN_W, SCREEN_H), Image.LANCZOS)

    mask = Image.new("L", (SCREEN_W, SCREEN_H), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle((0, 0, SCREEN_W, SCREEN_H),
                         radius=SCREEN_RADIUS, fill=255)
    canvas.paste(raw, (sx, sy), mask)


def compose(raw_path, out_path, index, total):
    bg = make_background().convert("RGBA")
    draw_tagline(bg)
    place_phone(bg, raw_path)
    draw_footer(bg, index, total)
    bg.convert("RGB").save(out_path, "PNG", optimize=True)
    print(f"wrote {out_path}")


def main():
    here = Path(__file__).parent
    raw = here / "raw"
    shots = [
        ("01-home-top.png", "01-pick.png"),
        ("02-review.png",   "02-review.png"),
        ("03-progress.png", "03-build.png"),
    ]
    for i, (src, dst) in enumerate(shots, 1):
        compose(raw / src, here / dst, i, len(shots))


if __name__ == "__main__":
    main()
