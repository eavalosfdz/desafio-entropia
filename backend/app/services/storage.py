import os
import uuid
from typing import Tuple
from fastapi import UploadFile, HTTPException, status

ALLOWED_TYPES = set(os.getenv("ALLOWED_IMAGE_TYPES", "image/jpeg,image/png").split(","))
MAX_MB = int(os.getenv("MAX_IMAGE_MB", "10"))
MAX_BYTES = MAX_MB * 1024 * 1024

IMAGES_DIR = "/data/images"

def ensure_dir():
    os.makedirs(IMAGES_DIR, exist_ok=True)

def validate_upload(file: UploadFile) -> None:
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unsupported content-type {file.content_type}. Allowed: {', '.join(ALLOWED_TYPES)}"
        )

def sniff_extension(content_type: str) -> str:
    if content_type == "image/jpeg":
        return ".jpg"
    if content_type == "image/png":
        return ".png"
    return ""

def save_upload(file: UploadFile) -> Tuple[str, str]:
    """
    Guarda el archivo en /data/images/<uuid>.<ext>, limitando tamaño y devolviendo (uuid_filename, absolute_path).
    """
    ensure_dir()
    ext = sniff_extension(file.content_type)
    if not ext:
        raise HTTPException(status_code=422, detail="Unsupported image type")

    fid = f"{uuid.uuid4()}{ext}"
    abs_path = os.path.join(IMAGES_DIR, fid)

    # Guardar con límite de tamaño
    total = 0
    with open(abs_path, "wb") as f:
        while True:
            chunk = file.file.read(1024 * 1024)
            if not chunk:
                break
            total += len(chunk)
            if total > MAX_BYTES:
                # limpiar archivo parcial
                f.close()
                try:
                    os.remove(abs_path)
                except OSError:
                    pass
                raise HTTPException(status_code=422, detail=f"Image too large (> {MAX_MB} MB)")
            f.write(chunk)

    # resetear el puntero para futuros usos (ej. hashing previo si fuera necesario)
    file.file.seek(0)
    return fid, abs_path
