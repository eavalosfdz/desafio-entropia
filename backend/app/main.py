import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .db import Base, engine
from .api.routes import router as api_router


def create_app() -> FastAPI:
    app = FastAPI(title="Red Social de Ventanas - API")

    origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[o.strip() for o in origins if o.strip()],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Crear tablas si no existen
    Base.metadata.create_all(bind=engine)

    app.include_router(api_router, prefix="/api")
    return app


app = create_app()
