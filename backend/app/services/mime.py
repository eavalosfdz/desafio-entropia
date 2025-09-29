def guess_image_mime(path: str) -> str:
    p = path.lower()
    if p.endswith(".jpg") or p.endswith(".jpeg"):
        return "image/jpeg"
    if p.endswith(".png"):
        return "image/png"
    # fallback
    return "application/octet-stream"
