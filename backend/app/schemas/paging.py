from typing import List
from pydantic import BaseModel
from .window import WindowOut

class PageMeta(BaseModel):
    page: int
    pageSize: int
    total: int

class WindowPage(BaseModel):
    items: List[WindowOut]
    meta: PageMeta
