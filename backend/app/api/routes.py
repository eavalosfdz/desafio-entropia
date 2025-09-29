from typing import List, Optional

from fastapi import APIRouter, Depends, UploadFile, HTTPException, status, Response, Query
from fastapi.responses import FileResponse
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from ..db import get_db
from ..models.window import Window
from ..schemas.window import WindowOut, WindowCreateResponse
from ..schemas.paging import WindowPage, PageMeta
from ..services.hashing import sha256_stream
from ..services.storage import validate_upload, save_upload
from ..services.ai import analyze_window_image
from ..services.mime import guess_image_mime

router = APIRouter()

@router.get("/health")
def health():
    return {"ok": True}

# ------------------------------
# Feed con paginación + filtros
# ------------------------------
@router.get("/windows", response_model=WindowPage)
def list_windows(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    # Filtros exactos (opcionales) sobre ai_json
    daytime: Optional[str] = None,
    location: Optional[str] = None,
    type: Optional[str] = Query(None, alias="type"),
    material: Optional[str] = None,
    panes: Optional[str] = None,
    covering: Optional[str] = None,
    openState: Optional[str] = None,
):
    q = select(Window)

    # Filtros sobre JSONB (Postgres). Ej: Window.ai_json['daytime'].as_string() == 'day'
    def jf(key: str, val: Optional[str]):
        nonlocal q
        if val is not None:
            q = q.where(Window.ai_json[key].as_string() == val)

    jf("daytime", daytime)
    jf("location", location)
    jf("type", type)
    jf("material", material)
    jf("panes", panes)
    jf("covering", covering)
    jf("openState", openState)

    # Total para paginar
    total = db.execute(
        select(func.count()).select_from(q.subquery())
    ).scalar_one()

    # Orden nuevo -> antiguo
    q = q.order_by(Window.created_at.desc())

    # Paginación
    offset = (page - 1) * pageSize
    items = db.execute(q.offset(offset).limit(pageSize)).scalars().all()

    return WindowPage(
        items=items,
        meta=PageMeta(page=page, pageSize=pageSize, total=total),
    )

# ------------------------------
# Detalle por ID
# ------------------------------
@router.get("/windows/{id}", response_model=WindowOut)
def get_window(id: str, db: Session = Depends(get_db)):
    row = db.get(Window, id)
    if not row:
        raise HTTPException(status_code=404, detail="Not found")
    return row

# ------------------------------
# Servir imagen binaria
# ------------------------------
@router.get("/windows/{id}/image")
def get_window_image(id: str, db: Session = Depends(get_db)):
    row = db.get(Window, id)
    if not row:
        raise HTTPException(status_code=404, detail="Not found")

    mime = guess_image_mime(row.image_path)
    try:
        return FileResponse(row.image_path, media_type=mime)
    except FileNotFoundError:
        raise HTTPException(status_code=410, detail="Image file missing")  # Gone

# ------------------------------
# Subir imagen (hash + duplicados + IA)
# ------------------------------
@router.post("/windows", response_model=WindowCreateResponse, status_code=status.HTTP_201_CREATED)
async def upload_window(file: UploadFile, response: Response, db: Session = Depends(get_db)):
    # 1) Validación de tipo y tamaño
    validate_upload(file)

    # 2) Hash de los bytes crudos
    digest = sha256_stream(file.file)

    # 3) ¿Duplicado?
    existing: Window | None = db.execute(
        select(Window).where(Window.sha256 == digest)
    ).scalar_one_or_none()

    if existing:
        response.status_code = status.HTTP_200_OK
        return WindowCreateResponse(isDuplicate=True, window=existing)

    # 4) Guardar archivo en disco
    fname, abs_path = save_upload(file)

    # 5) Crear row base
    win = Window(
        sha256=digest,
        image_path=f"/data/images/{fname}",
    )
    db.add(win)
    db.commit()
    db.refresh(win)

    # 6) Llamar IA (no rompas creación si falla)
    try:
        description, obj = await analyze_window_image(abs_path)
        win.description = (description or None)
        win.ai_json = obj if isinstance(obj, dict) else None
        db.add(win)
        db.commit()
        db.refresh(win)
    except Exception as e:
        import traceback
        print("[AI ERROR]", e)
        traceback.print_exc()

    return WindowCreateResponse(isDuplicate=False, window=win)
