#!/usr/bin/env python3
"""Generate WIP Wheel art, LED banner, and the scene composite."""
# Audience-facing convention: identity quaternion for planes and TextShape.
# The room stands at low Z looking toward +Z. Y=180 mirrors every texture and glyph.

from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
IMAGES = ROOT / "assets" / "Images"
THUMBS = ROOT / "images"
COMPOSITE = ROOT / "assets" / "scene" / "main.composite"
LOGO_SRC = Path("/Users/rizzle/Projects/rizzle/src/assets/wip-logo.webp")
BANNER_ART = IMAGES / "banner-art.png"
WHEEL_X = 7.5

PRIZES = [
    ("50 $WIP", "#FF4DA6"),
    ("SHOUTOUT", "#7C5CFF"),
    ("100 $WIP", "#3DDCFF"),
    ("FREE SPIN", "#FFD166"),
    ("250 $WIP", "#FF6B6B"),
    ("NFT DROP", "#7CFFB2"),
    ("JACKPOT", "#FF9F1C"),
    ("TRY AGAIN", "#3A2460"),
]


def font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for path in (
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/Library/Fonts/Arial Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
    ):
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def hex_rgb(value: str) -> tuple[int, int, int]:
    v = value.lstrip("#")
    return int(v[0:2], 16), int(v[2:4], 16), int(v[4:6], 16)


def q_identity() -> dict:
    return {"x": 0, "y": 0, "z": 0, "w": 1}


def q_y180() -> dict:
    return {"x": 0, "y": 1, "z": 0, "w": 0}


def q_x90() -> dict:
    return {"x": 0.70710678, "y": 0, "z": 0, "w": 0.70710678}


def vec(x: float, y: float, z: float) -> dict:
    return {"x": x, "y": y, "z": z}


def color(hex_value: str, a: float = 1.0) -> dict:
    r, g, b = hex_rgb(hex_value)
    return {"r": r / 255, "g": g / 255, "b": b / 255, "a": a}


def tex_ref(src: str) -> dict:
    return {
        "tex": {
            "$case": "texture",
            "texture": {"src": src, "wrapMode": 0, "filterMode": 1},
        }
    }


NAME_SCHEMA = {
    "type": "object",
    "properties": {"value": {"type": "string", "serializationType": "utf8-string"}},
    "serializationType": "map",
}


def generate_wheel(path: Path, size: int = 1024) -> None:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    cx = cy = size / 2
    radius = size / 2 - 12
    bbox = [cx - radius, cy - radius, cx + radius, cy + radius]
    n = len(PRIZES)
    slice_deg = 360 / n
    start0 = -90
    label_font = font(36)

    for i, (label, hex_color) in enumerate(PRIZES):
        a0 = start0 + i * slice_deg
        a1 = a0 + slice_deg
        draw.pieslice(bbox, a0, a1, fill=hex_rgb(hex_color) + (255,))
        rad = math.radians(a0)
        draw.line(
            [
                cx + math.cos(rad) * (radius * 0.2),
                cy + math.sin(rad) * (radius * 0.2),
                cx + math.cos(rad) * radius,
                cy + math.sin(rad) * radius,
            ],
            fill=(255, 255, 255, 210),
            width=5,
        )

        mid = a0 + slice_deg / 2
        fill = (28, 12, 48, 255) if hex_color in ("#FFD166", "#7CFFB2") else (255, 255, 255, 255)
        parts = label.split(" ") if len(label) > 8 else [label]
        dist = radius * 0.58
        mx = cx + math.cos(math.radians(mid)) * dist
        my = cy + math.sin(math.radians(mid)) * dist
        total_h = 0
        measured = []
        for part in parts:
            bb = draw.textbbox((0, 0), part, font=label_font)
            measured.append((part, bb))
            total_h += (bb[3] - bb[1]) + 4
        y = my - total_h / 2
        for part, bb in measured:
            w = bb[2] - bb[0]
            h = bb[3] - bb[1]
            draw.text((mx - w / 2, y), part, font=label_font, fill=fill)
            y += h + 4

    draw = ImageDraw.Draw(img)
    draw.ellipse(bbox, outline=(255, 255, 255, 245), width=20)
    draw.ellipse(
        [cx - radius + 20, cy - radius + 20, cx + radius - 20, cy + radius - 20],
        outline=(255, 209, 102, 230),
        width=7,
    )
    hub_r = radius * 0.17
    draw.ellipse(
        [cx - hub_r, cy - hub_r, cx + hub_r, cy + hub_r],
        fill=(18, 10, 32, 255),
        outline=(255, 77, 166, 255),
        width=10,
    )
    hub_font = font(30)
    bb = draw.textbbox((0, 0), "WIP", font=hub_font)
    draw.text(
        (cx - (bb[2] - bb[0]) / 2, cy - (bb[3] - bb[1]) / 2 - 4),
        "WIP",
        font=hub_font,
        fill=(255, 255, 255, 255),
    )
    img.save(path, "PNG")
    print("wrote", path)


def generate_ring(path: Path, size: int = 1024) -> None:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    cx = cy = size / 2
    outer = size / 2 - 2
    inner = outer - 42
    mask = Image.new("L", (size, size), 0)
    md = ImageDraw.Draw(mask)
    md.ellipse([cx - outer, cy - outer, cx + outer, cy + outer], fill=255)
    md.ellipse([cx - inner, cy - inner, cx + inner, cy + inner], fill=0)
    gold = Image.new("RGBA", (size, size), (255, 209, 102, 255))
    pink = Image.new("RGBA", (size, size), (255, 77, 166, 255))
    ring = Image.composite(gold, Image.new("RGBA", (size, size), (0, 0, 0, 0)), mask)
    inner_mask = Image.new("L", (size, size), 0)
    imd = ImageDraw.Draw(inner_mask)
    imd.ellipse([cx - outer + 10, cy - outer + 10, cx + outer - 10, cy + outer - 10], fill=255)
    imd.ellipse([cx - inner - 6, cy - inner - 6, cx + inner + 6, cy + inner + 6], fill=0)
    accent = Image.composite(pink, Image.new("RGBA", (size, size), (0, 0, 0, 0)), inner_mask)
    img = Image.alpha_composite(ring, accent)
    img.save(path, "PNG")
    print("wrote", path)


def convert_logo(src: Path, dest: Path) -> None:
    im = Image.open(src).convert("RGBA")
    canvas = Image.new("RGBA", (512, 512), (0, 0, 0, 0))
    im.thumbnail((500, 500), Image.Resampling.LANCZOS)
    canvas.paste(im, ((512 - im.width) // 2, (512 - im.height) // 2), im)
    canvas.save(dest, "PNG")
    print("wrote", dest)


def generate_banner(path: Path, logo_src: Path, art_src: Path) -> None:
    """Wide 4:1 marquee. No chip strip, circular logo, no rectangular crop."""
    w, h = 2048, 512
    canvas = Image.new("RGB", (w, h), (8, 4, 18))
    draw = ImageDraw.Draw(canvas)
    for y in range(h):
        t = y / h
        draw.line(
            [(0, y), (w, y)],
            fill=(int(10 + 14 * t), int(5 + 5 * t), int(20 + 28 * t)),
        )

    logo = None
    if art_src.exists():
        art = Image.open(art_src).convert("RGBA")
        crop_w = 500
        left = 16
        top = max(0, (art.height - crop_w) // 2)
        logo = art.crop((left, top, left + crop_w, top + crop_w)).resize(
            (420, 420), Image.Resampling.LANCZOS
        )
    elif logo_src.exists():
        logo = Image.open(logo_src).convert("RGBA").resize((420, 420), Image.Resampling.LANCZOS)

    if logo is not None:
        mask = Image.new("L", logo.size, 0)
        ImageDraw.Draw(mask).ellipse((4, 4, logo.size[0] - 5, logo.size[1] - 5), fill=255)
        alpha = logo.split()[-1]
        logo.putalpha(ImageChops.multiply(alpha, mask))
        canvas.paste(logo, (48, (h - logo.height) // 2), logo)

    draw = ImageDraw.Draw(canvas)
    tx = 520
    draw.text((tx, 88), "THE WIP WHEEL", font=font(92), fill=(255, 77, 166))
    draw.rectangle([tx, 198, tx + 620, 204], fill=(255, 209, 102))
    draw.text((tx, 220), "Thursdays 12 PM PT", font=font(44), fill=(255, 209, 102))
    draw.text((tx, 286), "thewipmeetup.com", font=font(34), fill=(232, 215, 255))
    draw.rectangle([10, 10, w - 11, h - 11], outline=(255, 77, 166), width=6)

    canvas.save(path, "PNG")
    print("wrote", path)


def generate_board(path: Path) -> None:
    w, h = 2048, 512
    img = Image.new("RGB", (w, h), (16, 8, 32))
    draw = ImageDraw.Draw(img)
    draw.rectangle([0, 0, w, 90], fill=(42, 18, 72))
    draw.rectangle([0, h - 18, w, h], fill=(255, 77, 166))
    kicker = font(42)
    puzzle = font(72)
    t = "THIS WEEK'S PUZZLE"
    bb = draw.textbbox((0, 0), t, font=kicker)
    draw.text(((w - (bb[2] - bb[0])) / 2, 22), t, font=kicker, fill=(255, 77, 166))
    t = "WIP  =  WORK IN PROGRESS"
    bb = draw.textbbox((0, 0), t, font=puzzle)
    draw.text(((w - (bb[2] - bb[0])) / 2, 160), t, font=puzzle, fill=(255, 255, 255))
    t = "LAST SPIN"
    bb = draw.textbbox((0, 0), t, font=kicker)
    draw.text(((w - (bb[2] - bb[0])) / 2, 340), t, font=kicker, fill=(255, 209, 102))
    img.save(path, "PNG")
    print("wrote", path)


def generate_thumbnail(path: Path) -> None:
    w, h = 1920, 1080
    img = Image.new("RGB", (w, h), (11, 6, 20))
    banner = IMAGES / "banner.png"
    if banner.exists():
        src = Image.open(banner).convert("RGB").resize((w, h), Image.Resampling.LANCZOS)
        img.paste(src, (0, 0))
    else:
        draw = ImageDraw.Draw(img)
        title = font(92)
        t = "THE WIP WHEEL"
        bb = draw.textbbox((0, 0), t, font=title)
        draw.text(((w - (bb[2] - bb[0])) / 2, 460), t, font=title, fill=(255, 77, 166))
    img.save(path, "PNG")
    print("wrote", path)


def build_composite() -> dict:
    E = {
        "Floor": 512,
        "Stage": 513,
        "Backdrop": 514,
        "WingLeft": 515,
        "WingRight": 516,
        "Banner": 517,
        "Ticker": 518,
        "WheelRoot": 520,
        "WheelDisc": 521,
        "WheelHub": 522,
        "Pointer": 523,
        "SpinButton": 524,
        "SpinLabel": 525,
        "ResultText": 528,
        "HostPad": 529,
        "HostLabel": 530,
        "Seat1": 531,
        "Seat1Label": 532,
        "Seat2": 533,
        "Seat2Label": 534,
        "Seat3": 535,
        "Seat3Label": 536,
        "StageLight": 538,
        "WheelStand": 539,
        "CrowdText": 542,
        "BenchL": 543,
        "BenchC": 544,
        "BenchR": 545,
        "WheelFrame": 546,
        "WheelHit": 547,
        "NeonFront": 548,
        "NeonLeft": 549,
        "NeonRight": 550,
        "SpinGlow": 551,
        "PointerCap": 552,
        "BenchBackL": 553,
        "BenchBackC": 554,
        "BenchBackR": 555,
        "Bezel": 556,
        "FillLight": 557,
        "AccentLight": 558,
        "PodiumBase": 559,
        "StandBase": 560,
        "AudienceRiserL": 561,
        "AudienceRiserR": 562,
        "BenchRow2L": 563,
        "BenchRow2R": 564,
        "BenchBack2L": 565,
        "BenchBack2R": 566,
        "AudienceNeonL": 567,
        "AudienceNeonR": 568,
        "AudienceLabel": 569,
    }

    transforms = {}
    names = {}
    meshes = {}
    colliders = {}
    materials = {}
    texts = {}
    lights = {}

    def add_box(
        name,
        eid,
        pos,
        scale,
        hex_color,
        parent=0,
        collider=True,
        metallic=0.08,
        roughness=0.72,
        rot=None,
        emissive=None,
        emissive_intensity=0.6,
    ):
        transforms[str(eid)] = {
            "json": {
                "position": vec(*pos),
                "scale": vec(*scale),
                "rotation": rot or q_identity(),
                "parent": parent,
            }
        }
        names[str(eid)] = {"json": {"value": name}}
        meshes[str(eid)] = {"json": {"mesh": {"$case": "box", "box": {"uvs": []}}}}
        pbr = {
            "albedoColor": color(hex_color),
            "metallic": metallic,
            "roughness": roughness,
            "emissiveColor": {"r": 0, "g": 0, "b": 0},
        }
        if emissive:
            pbr["emissiveColor"] = color(emissive)
            pbr["emissiveIntensity"] = emissive_intensity
        materials[str(eid)] = {"json": {"material": {"$case": "pbr", "pbr": pbr}}}
        if collider:
            colliders[str(eid)] = {
                "json": {"collisionMask": 3, "mesh": {"$case": "box", "box": {"uvs": []}}}
            }

    def add_cylinder(name, eid, pos, scale, hex_color, parent=0, rot=None, emissive=None, collider=False):
        transforms[str(eid)] = {
            "json": {
                "position": vec(*pos),
                "scale": vec(*scale),
                "rotation": rot or q_identity(),
                "parent": parent,
            }
        }
        names[str(eid)] = {"json": {"value": name}}
        meshes[str(eid)] = {
            "json": {"mesh": {"$case": "cylinder", "cylinder": {"radiusTop": 1, "radiusBottom": 1}}}
        }
        pbr = {
            "albedoColor": color(hex_color),
            "metallic": 0.15,
            "roughness": 0.55,
            "emissiveColor": {"r": 0, "g": 0, "b": 0},
        }
        if emissive:
            pbr["emissiveColor"] = color(emissive)
            pbr["emissiveIntensity"] = 0.7
        materials[str(eid)] = {"json": {"material": {"$case": "pbr", "pbr": pbr}}}
        if collider:
            colliders[str(eid)] = {
                "json": {
                    "collisionMask": 3,
                    "mesh": {"$case": "cylinder", "cylinder": {"radiusTop": 1, "radiusBottom": 1}},
                }
            }

    def add_hit_cylinder(name, eid, pos, scale, parent=0, rot=None):
        transforms[str(eid)] = {
            "json": {
                "position": vec(*pos),
                "scale": vec(*scale),
                "rotation": rot or q_identity(),
                "parent": parent,
            }
        }
        names[str(eid)] = {"json": {"value": name}}
        colliders[str(eid)] = {
            "json": {
                "collisionMask": 1,
                "mesh": {"$case": "cylinder", "cylinder": {"radiusTop": 1, "radiusBottom": 1}},
            }
        }

    def add_plane(
        name,
        eid,
        pos,
        scale,
        texture,
        parent=0,
        rot=None,
        alpha=False,
        unlit=False,
        emissive=False,
        collider=False,
    ):
        transforms[str(eid)] = {
            "json": {
                "position": vec(*pos),
                "scale": vec(*scale),
                "rotation": rot or q_identity(),
                "parent": parent,
            }
        }
        names[str(eid)] = {"json": {"value": name}}
        meshes[str(eid)] = {"json": {"mesh": {"$case": "plane", "plane": {"uvs": []}}}}
        texture_union = tex_ref(texture)
        # Always PBR. Unlit in composites rendered the wheel black and mirrored the banner.
        pbr = {
            "albedoColor": {"r": 1, "g": 1, "b": 1, "a": 1},
            "metallic": 0,
            "roughness": 1,
            "texture": texture_union,
            "emissiveTexture": texture_union,
            "emissiveColor": {"r": 1, "g": 1, "b": 1},
            "emissiveIntensity": 0.6 if emissive else 0.35,
            "transparencyMode": 1 if alpha else 0,
            "alphaTest": 0.5 if alpha else 1,
            "castShadows": False,
        }
        materials[str(eid)] = {"json": {"material": {"$case": "pbr", "pbr": pbr}}}
        if collider:
            colliders[str(eid)] = {
                "json": {"collisionMask": 1, "mesh": {"$case": "plane", "plane": {"uvs": []}}}
            }

    def add_text(name, eid, pos, text, size, hex_color, parent=0, rot=None):
        transforms[str(eid)] = {
            "json": {
                "position": vec(*pos),
                "scale": vec(1, 1, 1),
                "rotation": rot or q_identity(),
                "parent": parent,
            }
        }
        names[str(eid)] = {"json": {"value": name}}
        texts[str(eid)] = {
            "json": {
                "text": text,
                "fontSize": size,
                "textColor": color(hex_color),
                "outlineWidth": 0.2,
                "outlineColor": {"r": 0.05, "g": 0.02, "b": 0.08},
            }
        }

    def add_sphere(name, eid, pos, scale, hex_color, parent=0, emissive=None):
        transforms[str(eid)] = {
            "json": {
                "position": vec(*pos),
                "scale": vec(*scale),
                "rotation": q_identity(),
                "parent": parent,
            }
        }
        names[str(eid)] = {"json": {"value": name}}
        meshes[str(eid)] = {"json": {"mesh": {"$case": "sphere", "sphere": {}}}}
        pbr = {
            "albedoColor": color(hex_color),
            "metallic": 0.55,
            "roughness": 0.28,
            "emissiveColor": color(emissive or "#FF4DA6", 0.45),
            "emissiveIntensity": 0.8,
        }
        materials[str(eid)] = {"json": {"material": {"$case": "pbr", "pbr": pbr}}}

    # Open studio floor — let the DCL sky show at the sides.
    add_box("Floor", E["Floor"], (16, 0.02, 16), (32, 0.04, 32), "#0C0716", collider=True)
    add_box("Stage", E["Stage"], (16, 0.1, 20.4), (16.5, 0.14, 14.5), "#1A0B2E", collider=True)
    add_box(
        "NeonFront",
        E["NeonFront"],
        (16, 0.2, 13.2),
        (16.5, 0.06, 0.12),
        "#FF4DA6",
        collider=False,
        emissive="#FF4DA6",
        emissive_intensity=1.4,
    )
    add_box(
        "NeonLeft",
        E["NeonLeft"],
        (7.8, 0.2, 20.4),
        (0.12, 0.06, 14.5),
        "#7C5CFF",
        collider=False,
        emissive="#7C5CFF",
        emissive_intensity=1.1,
    )
    add_box(
        "NeonRight",
        E["NeonRight"],
        (24.2, 0.2, 20.4),
        (0.12, 0.06, 14.5),
        "#7C5CFF",
        collider=False,
        emissive="#7C5CFF",
        emissive_intensity=1.1,
    )

    add_box("Backdrop", E["Backdrop"], (16, 4.8, 31.55), (26, 9.6, 0.28), "#070412", collider=True)
    add_box(
        "Bezel",
        E["Bezel"],
        (16, 10.5, 31.38),
        (22.6, 5.9, 0.08),
        "#FF4DA6",
        collider=False,
        emissive="#FF4DA6",
        emissive_intensity=0.7,
    )
    add_box("WingLeft", E["WingLeft"], (3.2, 4.8, 30.6), (6.2, 9.4, 0.35), "#12081F", collider=True)
    add_box("WingRight", E["WingRight"], (28.8, 4.8, 30.6), (6.2, 9.4, 0.35), "#12081F", collider=True)

    # Header marquee — above the wheel so it is readable at spawn.
    add_plane(
        "Banner",
        E["Banner"],
        (16, 10.5, 31.18),
        (22, 5.5, 1),
        "assets/Images/banner.png",
        rot=q_identity(),
        emissive=True,
    )
    add_box(
        "Ticker",
        E["Ticker"],
        (19.2, 3.4, 31.18),
        (12, 0.9, 0.08),
        "#160A28",
        collider=False,
        emissive="#2A1248",
        emissive_intensity=0.35,
    )

    add_text("ResultText", E["ResultText"], (19.2, 3.4, 30.92), "Spin, then call a letter", 1.05, "#7CFFB2")
    add_text("CrowdText", E["CrowdText"], (26.2, 8.55, 30.92), "In the room: 1", 0.9, "#E8D7FF")

    add_box("WheelStand", E["WheelStand"], (WHEEL_X, 1.35, 23.85), (0.5, 2.5, 0.5), "#2A1248", collider=True, metallic=0.35)
    add_cylinder(
        "StandBase",
        E["StandBase"],
        (WHEEL_X, 0.2, 23.85),
        (1.45, 0.18, 1.45),
        "#1A0B2E",
        emissive="#FF4DA6",
        collider=True,
    )

    transforms[str(E["WheelRoot"])] = {
        "json": {
            "position": vec(WHEEL_X, 3.2, 23.5),
            "scale": vec(1, 1, 1),
            "rotation": q_identity(),
            "parent": 0,
        }
    }
    names[str(E["WheelRoot"])] = {"json": {"value": "WheelRoot"}}

    add_plane(
        "WheelDisc",
        E["WheelDisc"],
        (0, 0, 0),
        (4.0, 4.0, 1),
        "assets/Images/wheel-face.png",
        parent=E["WheelRoot"],
        rot=q_identity(),
        alpha=True,
        emissive=True,
        collider=False,
    )
    add_hit_cylinder(
        "WheelHit",
        E["WheelHit"],
        (0, 0, 0),
        (2.0, 0.1, 2.0),
        parent=E["WheelRoot"],
        rot=q_x90(),
    )
    add_sphere("WheelHub", E["WheelHub"], (0, 0, 0.05), (0.48, 0.48, 0.22), "#1A0B2E", parent=E["WheelRoot"], emissive="#FF4DA6")

    add_plane(
        "WheelFrame",
        E["WheelFrame"],
        (WHEEL_X, 3.2, 23.38),
        (4.22, 4.22, 1),
        "assets/Images/wheel-ring.png",
        rot=q_identity(),
        alpha=True,
        emissive=True,
    )

    add_box(
        "Pointer",
        E["Pointer"],
        (WHEEL_X, 5.38, 23.28),
        (0.2, 0.52, 0.14),
        "#FFD166",
        metallic=0.35,
        emissive="#FFD166",
        emissive_intensity=1.1,
    )
    add_box(
        "PointerCap",
        E["PointerCap"],
        (WHEEL_X, 5.08, 23.28),
        (0.34, 0.16, 0.16),
        "#FF4DA6",
        metallic=0.25,
        emissive="#FF4DA6",
        emissive_intensity=1.0,
    )

    add_cylinder(
        "SpinGlow",
        E["SpinGlow"],
        (WHEEL_X, 0.16, 18.55),
        (2.3, 0.05, 2.3),
        "#FF4DA6",
        emissive="#FF4DA6",
        collider=False,
    )
    add_cylinder(
        "PodiumBase",
        E["PodiumBase"],
        (WHEEL_X, 0.28, 18.55),
        (1.7, 0.22, 1.7),
        "#2A1248",
        collider=True,
    )
    add_box(
        "SpinButton",
        E["SpinButton"],
        (WHEEL_X, 0.85, 18.55),
        (1.55, 1.15, 1.55),
        "#FF4DA6",
        metallic=0.05,
        roughness=0.35,
        emissive="#FF4DA6",
        emissive_intensity=0.85,
    )
    add_text("SpinLabel", E["SpinLabel"], (WHEEL_X, 1.62, 18.55), "SPIN", 1.6, "#FFFFFF")

    add_box("HostPad", E["HostPad"], (8.2, 0.18, 19.5), (2.3, 0.18, 2.3), "#7C5CFF", emissive="#7C5CFF", emissive_intensity=0.55)
    add_text("HostLabel", E["HostLabel"], (8.2, 1.15, 19.5), "HOST", 1.05, "#FFFFFF")

    add_box("Seat1", E["Seat1"], (12.1, 0.2, 15.5), (2.45, 0.22, 2.45), "#FF4DA6", emissive="#FF4DA6", emissive_intensity=0.5)
    add_text("Seat1Label", E["Seat1Label"], (12.1, 1.15, 15.5), "GUEST SPIN", 1.0, "#FFD166")

    add_box("Seat2", E["Seat2"], (16, 0.14, 15.5), (2.15, 0.14, 2.15), "#3A2460")
    add_text("Seat2Label", E["Seat2Label"], (16, 1.05, 15.5), "SEAT 2", 0.9, "#C8B8E0")

    add_box("Seat3", E["Seat3"], (19.9, 0.14, 15.5), (2.15, 0.14, 2.15), "#3A2460")
    add_text("Seat3Label", E["Seat3Label"], (19.9, 1.05, 15.5), "SEAT 3", 0.9, "#C8B8E0")

    add_box("AudienceRiserL", E["AudienceRiserL"], (9.6, 0.08, 7.6), (5.2, 0.12, 5.8), "#1A0B2E", collider=True)
    add_box("AudienceRiserR", E["AudienceRiserR"], (22.4, 0.08, 7.6), (5.2, 0.12, 5.8), "#1A0B2E", collider=True)
    add_box(
        "AudienceNeonL",
        E["AudienceNeonL"],
        (9.6, 0.16, 4.75),
        (5.2, 0.05, 0.1),
        "#FF4DA6",
        collider=False,
        emissive="#FF4DA6",
        emissive_intensity=1.1,
    )
    add_box(
        "AudienceNeonR",
        E["AudienceNeonR"],
        (22.4, 0.16, 4.75),
        (5.2, 0.05, 0.1),
        "#FF4DA6",
        collider=False,
        emissive="#FF4DA6",
        emissive_intensity=1.1,
    )
    add_box("BenchL", E["BenchL"], (9.6, 0.38, 9.1), (4.4, 0.4, 1.05), "#221038", collider=True)
    add_box("BenchR", E["BenchR"], (22.4, 0.38, 9.1), (4.4, 0.4, 1.05), "#221038", collider=True)
    add_box("BenchBackL", E["BenchBackL"], (9.6, 0.82, 9.52), (4.4, 0.52, 0.16), "#2A1248", collider=True)
    add_box("BenchBackR", E["BenchBackR"], (22.4, 0.82, 9.52), (4.4, 0.52, 0.16), "#2A1248", collider=True)
    add_box("BenchRow2L", E["BenchRow2L"], (9.6, 0.38, 6.4), (4.4, 0.4, 1.05), "#221038", collider=True)
    add_box("BenchRow2R", E["BenchRow2R"], (22.4, 0.38, 6.4), (4.4, 0.4, 1.05), "#221038", collider=True)
    add_box("BenchBack2L", E["BenchBack2L"], (9.6, 0.82, 6.82), (4.4, 0.52, 0.16), "#2A1248", collider=True)
    add_box("BenchBack2R", E["BenchBack2R"], (22.4, 0.82, 6.82), (4.4, 0.52, 0.16), "#2A1248", collider=True)
    add_text("AudienceLabel", E["AudienceLabel"], (16, 0.95, 4.6), "STUDIO AUDIENCE", 0.95, "#FFD166")

    transforms[str(E["StageLight"])] = {
        "json": {
            "position": vec(16, 9.8, 21.5),
            "scale": vec(1, 1, 1),
            "rotation": q_identity(),
            "parent": 0,
        }
    }
    names[str(E["StageLight"])] = {"json": {"value": "StageLight"}}
    lights[str(E["StageLight"])] = {
        "json": {
            "active": True,
            "color": {"r": 1, "g": 0.88, "b": 1},
            "intensity": 9000,
            "range": 26,
            "shadow": False,
            "type": {"$case": "point", "point": {}},
        }
    }
    transforms[str(E["FillLight"])] = {
        "json": {
            "position": vec(10, 6.5, 16),
            "scale": vec(1, 1, 1),
            "rotation": q_identity(),
            "parent": 0,
        }
    }
    names[str(E["FillLight"])] = {"json": {"value": "FillLight"}}
    lights[str(E["FillLight"])] = {
        "json": {
            "active": True,
            "color": {"r": 1, "g": 0.45, "b": 0.75},
            "intensity": 3500,
            "range": 18,
            "shadow": False,
            "type": {"$case": "point", "point": {}},
        }
    }
    transforms[str(E["AccentLight"])] = {
        "json": {
            "position": vec(22, 6.5, 16),
            "scale": vec(1, 1, 1),
            "rotation": q_identity(),
            "parent": 0,
        }
    }
    names[str(E["AccentLight"])] = {"json": {"value": "AccentLight"}}
    lights[str(E["AccentLight"])] = {
        "json": {
            "active": True,
            "color": {"r": 1, "g": 0.82, "b": 0.35},
            "intensity": 2800,
            "range": 16,
            "shadow": False,
            "type": {"$case": "point", "point": {}},
        }
    }

    components = [
        {"name": "core::Transform", "data": transforms},
        {"name": "core::MeshRenderer", "data": meshes},
        {"name": "core::MeshCollider", "data": colliders},
        {"name": "core::Material", "data": materials},
        {"name": "core::TextShape", "data": texts},
        {"name": "core::LightSource", "data": lights},
        {"name": "core-schema::Name", "jsonSchema": NAME_SCHEMA, "data": names},
    ]
    return {"version": 1, "components": components}


def main() -> None:
    IMAGES.mkdir(parents=True, exist_ok=True)
    THUMBS.mkdir(parents=True, exist_ok=True)
    generate_wheel(IMAGES / "wheel-face.png")
    generate_ring(IMAGES / "wheel-ring.png")
    if LOGO_SRC.exists():
        convert_logo(LOGO_SRC, IMAGES / "wip-logo.png")
    else:
        print("WARNING: WIP logo not found at", LOGO_SRC)
    generate_banner(IMAGES / "banner.png", LOGO_SRC, BANNER_ART)
    generate_board(IMAGES / "show-board.png")
    generate_thumbnail(THUMBS / "scene-thumbnail.png")
    COMPOSITE.write_text(json.dumps(build_composite(), indent=2) + "\n")
    print("wrote", COMPOSITE)


if __name__ == "__main__":
    main()
