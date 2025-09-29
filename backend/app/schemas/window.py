from typing import Any, Optional
from pydantic import BaseModel, Field

class WindowOut(BaseModel):
    id: str
    sha256: str
    imagePath: str = Field(..., alias="image_path")
    description: Optional[str] = None
    ai: Optional[Any] = Field(None, alias="ai_json")
    createdAt: str = Field(..., alias="created_at")

    class Config:
        from_attributes = True
        populate_by_name = True
