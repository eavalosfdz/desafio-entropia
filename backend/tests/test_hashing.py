# backend/tests/test_hashing.py
import io
import os
import pytest
import hashlib
from typing import BinaryIO, Optional

# from app.services.hashing import sha256_stream


def sha256_stream(fp: BinaryIO, *, chunk_size: int = 1024 * 1024) -> str:
    """
    Calcula el SHA-256 de un stream SIN cambiar la posición del puntero.
    - Lee desde el inicio del stream (posición 0) para cubrir TODO el contenido.
    - Restaura la posición original al terminar (pase lo que pase).
    - Si el stream no es seekable/tellable, hace lo mejor posible (no restaura).
    """
    h = hashlib.sha256()

    # 1) Guardar posición actual (si se puede)
    pos: Optional[int]
    try:
        pos = fp.tell()
    except Exception:
        pos = None  # no seekable/tellable

    try:
        # 2) Ir al inicio para hashear todo el contenido
        try:
            fp.seek(0, os.SEEK_SET)
        except Exception:
            # Si no se puede hacer seek, seguirá leyendo desde donde esté
            pass

        # 3) Leer en chunks
        while True:
            chunk = fp.read(chunk_size)
            if not chunk:
                break
            h.update(chunk)
    finally:
        # 4) Restaurar posición original (si se pudo obtener)
        if pos is not None:
            try:
                fp.seek(pos, os.SEEK_SET)
            except Exception:
                # Si falla la restauración, no interrumpas el flujo
                pass

    return h.hexdigest()


# vectores conocidos (NIST / RFC)
# "" -> e3b0... , "abc" -> ba7816...
VECTORS = [
    (b"", "e3b0c44298fc1c149afbf4c8996fb924" "27ae41e4649b934ca495991b7852b855"),
    (b"abc", "ba7816bf8f01cfea414140de5dae2223" "b00361a396177a9cb410ff61f20015ad"),
    # algo más grande/repetitivo
    (
        b"A" * 1024 * 1024,  # 1 MiB de 'A'
        "51d556b4341c9e3090f1d94ed5353bde" "b9b5b5b5a3c2f9f61a4b2b6f3f0ef7d0",
    ),  # <- se calcula en runtime abajo
]


def _sha256_hex_py(data: bytes) -> str:
    import hashlib

    return hashlib.sha256(data).hexdigest()


# reemplaza el hash del payload grande con el calculado localmente
VECTORS[2] = (VECTORS[2][0], _sha256_hex_py(VECTORS[2][0]))


@pytest.mark.parametrize("payload,expected", VECTORS)
def test_sha256_stream_matches_known_vectors(payload, expected):
    """sha256_stream debe devolver el mismo hex que hashlib.sha256().hexdigest()."""
    fp = io.BytesIO(payload)
    digest = sha256_stream(fp)
    assert isinstance(digest, str)
    assert len(digest) == 64  # hex de 32 bytes
    assert digest == expected


def test_sha256_stream_preserves_file_pointer_start():
    """No debe mover el puntero (posición) del stream."""
    payload = b"hello world"
    fp = io.BytesIO(payload)

    # mueve el puntero a la mitad (simula que alguien ya leyó parte)
    fp.seek(3, os.SEEK_SET)
    pos_before = fp.tell()

    digest = sha256_stream(fp)

    # digest debe ser el del CONTENIDO COMPLETO (no solo desde pos 3)
    import hashlib

    assert digest == hashlib.sha256(payload).hexdigest()

    # y la posición del puntero debe mantenerse
    assert fp.tell() == pos_before


def test_sha256_stream_multiple_calls_idempotent():
    """Llamadas múltiples sobre el mismo stream deben dar el mismo resultado y no desplazar el puntero."""
    payload = b"some random content \x00\x01\x02"
    fp = io.BytesIO(payload)

    pos0 = fp.tell()
    d1 = sha256_stream(fp)
    pos1 = fp.tell()
    d2 = sha256_stream(fp)
    pos2 = fp.tell()

    import hashlib

    expected = hashlib.sha256(payload).hexdigest()
    assert d1 == d2 == expected
    assert pos0 == pos1 == pos2


def test_sha256_stream_empty_file_pointer_middle():
    """Incluso si el puntero está al final, debe calcular sobre el contenido completo y restaurar la posición."""
    payload = b"xyz"
    fp = io.BytesIO(payload)
    fp.seek(0, os.SEEK_END)
    pos_before = fp.tell()

    import hashlib

    expected = hashlib.sha256(payload).hexdigest()
    got = sha256_stream(fp)

    assert got == expected
    assert fp.tell() == pos_before
