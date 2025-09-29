import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, JSON, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.types import JSON as SAJSON
from ..db import Base

# Compatibilidad JSON: JSON (Postgres) / SAJSON (SQLite)
JSONType = JSON if hasattr(JSON, 'impl') else SAJSON

class Window(Base):
    __tablename__ = "windows"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    sha256 = Column(String, nullable=False, index=True)
    image_path = Column(String, nullable=False)
    description = Column(String, nullable=True)
    ai_json = Column(JSONType, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint('sha256', name='uq_windows_sha256'),
    )
