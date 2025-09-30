from typing import List, Optional

from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    HTTPException,
    status,
    Response,
    Query,
    BackgroundTasks,
)
from fastapi.responses import FileResponse
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from ..db import get_db, SessionLocal
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


# GET para todas las ventanas existentes
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

    total = db.execute(select(func.count()).select_from(q.subquery())).scalar_one()

    q = q.order_by(Window.created_at.desc())

    # Paginación
    offset = (page - 1) * pageSize
    items = db.execute(q.offset(offset).limit(pageSize)).scalars().all()

    return WindowPage(
        items=items,
        meta=PageMeta(page=page, pageSize=pageSize, total=total),
    )


# Detalle por ID
@router.get("/windows/{id}", response_model=WindowOut)
def get_window(id: str, db: Session = Depends(get_db)):
    row = db.get(Window, id)
    if not row:
        raise HTTPException(status_code=404, detail="Not found")
    return row


# GET de imagen especifica
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


# POST nueva imagen
@router.post(
    "/windows", response_model=WindowCreateResponse, status_code=status.HTTP_201_CREATED
)
async def upload_window(
    file: UploadFile,
    response: Response,
    db: Session = Depends(get_db),
    background: BackgroundTasks = None,
):
    # 1) valida tipo/tamaño
    validate_upload(file)

    # 2) hash
    digest = sha256_stream(file.file)

    # 3) checar duplicado
    existing: Window | None = db.execute(
        select(Window).where(Window.sha256 == digest)
    ).scalar_one_or_none()
    if existing:
        response.status_code = status.HTTP_200_OK
        return WindowCreateResponse(isDuplicate=True, window=existing)

    # 4) guarda archivo
    fname, abs_path = save_upload(file)

    # 5) crea registro en base de datos
    win = Window(sha256=digest, image_path=f"/data/images/{fname}")
    db.add(win)
    db.commit()
    db.refresh(win)

    # 6) generar datos de IA
    async def _analyze_and_update(window_id: str, abs_path: str):
        _db = SessionLocal()
        try:
            desc, obj = await analyze_window_image(abs_path)
            w = _db.get(Window, window_id)
            if w:
                w.description = desc or None
                w.ai_json = obj if isinstance(obj, dict) else None
                _db.add(w)
                _db.commit()
        except Exception as e:
            import traceback

            print("[AI ERROR]", e)
            traceback.print_exc()
        finally:
            _db.close()

    if background is not None:
        background.add_task(_analyze_and_update, win.id, abs_path)
    else:
        await _analyze_and_update(win.id, abs_path)

    return WindowCreateResponse(isDuplicate=False, window=win)


# mostrar si la imagen es duplicada
@router.get("/windows/{id}/duplicates", response_model=WindowPage)
def get_window_duplicates(
    id: str,
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
):
    # 1) Cargar la ventana base
    base = db.get(Window, id)
    if not base:
        raise HTTPException(status_code=404, detail="Not found")

    # 2) Query por mismo sha256, excluyendo el propio id
    q = select(Window).where(
        Window.sha256 == base.sha256,
        Window.id != base.id,
    )

    # 3) Total para paginación
    total = db.execute(select(func.count()).select_from(q.subquery())).scalar_one()

    # 4) Orden (nuevo -> antiguo) + paginación
    q = q.order_by(Window.created_at.desc())
    offset = (page - 1) * pageSize
    items = db.execute(q.offset(offset).limit(pageSize)).scalars().all()

    return WindowPage(
        items=items,
        meta=PageMeta(page=page, pageSize=pageSize, total=total),
    )
