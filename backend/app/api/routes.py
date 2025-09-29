from fastapi import APIRouter, Depends, UploadFile, HTTPException, status
from sqlalchemy.orm import Session
from ..db import get_db
from ..models.window import Window
from ..schemas.window import WindowOut

router = APIRouter()

@router.get("/health")
def health():
    return {"ok": True}

@router.get("/windows", response_model=list[WindowOut])
def list_windows(db: Session = Depends(get_db)):
    # Por ahora lista vacía si no hay migración/seed; luego ordenaremos por created_at desc
    return db.query(Window).order_by(Window.created_at.desc()).all()

@router.post("/windows", status_code=status.HTTP_501_NOT_IMPLEMENTED)
async def upload_window(file: UploadFile):
    # Placeholder: implementaremos hashing + guardado + llamada IA después
    raise HTTPException(status_code=501, detail="Not implemented yet")
