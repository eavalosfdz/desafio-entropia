from typing import Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field


class WindowOut(BaseModel):
    id: str
    sha256: str
    imagePath: str = Field(..., alias="image_path")
    description: Optional[str] = None
    ai: Optional[Any] = Field(None, alias="ai_json")
    createdAt: datetime = Field(..., alias="created_at")

    class Config:
        from_attributes = True
        populate_by_name = True


class WindowCreateResponse(BaseModel):
    isDuplicate: bool
    window: WindowOut
