import hashlib
from typing import BinaryIO


def sha256_stream(fileobj: BinaryIO, chunk_size: int = 1024 * 1024) -> str:
    # Calcula SHA-256 leyendo en chunks para consumo RAM.
    h = hashlib.sha256()
    fileobj.seek(0)
    while True:
        chunk = fileobj.read(chunk_size)
        if not chunk:
            break
        h.update(chunk)
    fileobj.seek(0)
    return h.hexdigest()
