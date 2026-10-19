"""Atlas Arena branding: create installable icons from the approved navy/gold world artwork.
The full-resolution ChatGPT original is kept separately; this repository source is
a web-optimised AVIF rendition. Native assets are exported to PNG without masks.
"""
from pathlib import Path
from PIL import Image, ImageFilter

source = Path("public/atlas-arena-icon.avif")
assert source.exists(), "Approved Atlas Arena icon source missing"
with Image.open(source) as im:
    im.load()  # Decode completely; fail if corrupt, rather than committing damaged assets
    assert im.width == im.height and im.width >= 128, f"Invalid icon size: {im.size}"
    icon = im.convert("RGB")

def png(destination, size):
    out = icon.resize((size, size), Image.Resampling.LANCZOS)
    if size > icon.width:
        out = out.filter(ImageFilter.UnsharpMask(radius=1.1, percent=70, threshold=3))
    target = Path(destination)
    target.parent.mkdir(parents=True, exist_ok=True)
    out.save(target, format="PNG", optimize=True)
    with Image.open(target) as test:
        test.verify()
    print(target, size, "OK")

png("resources/icon.png", 1024)
png("public/icon-1024.png", 1024)
png("public/icon-512.png", 512)
png("public/icon-192.png", 192)
png("public/apple-touch-icon.png", 180)
png("public/favicon.png", 64)
