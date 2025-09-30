# Red Social de Ventanas

Este repositorio implementa un desafío técnico donde se construye una aplicación tipo **red social de ventanas**.  
Los usuarios pueden subir fotos de ventanas, ver un feed ordenado por fecha y aplicar filtros por características detectadas con IA.

## 🚀 Tecnologías principales

-   **Frontend**: Next.js 14 (App Router, Server Actions, TailwindCSS).
-   **Backend**: FastAPI + SQLAlchemy + Pydantic.
-   **Base de datos**: PostgreSQL.
-   **IA**: Ollama (modelo `gemma3:4b`) para generar descripciones y metadatos.
-   **Infraestructura**: Docker Compose (multi-servicio).

---

## 📦 Pasos para correr el proyecto

### 1. Clonar el repositorio

git clone https://github.com/<tu-usuario>/red-social-ventanas.git
cd red-social-ventanas
docker compose up --build

Esto levanta 4 servicios:

db → Postgres (con volumen persistente)

ollama → motor de IA (descarga el modelo la primera vez)

api → backend FastAPI en http://localhost:8000

frontend → Next.js en http://localhost:3000

🔐 Hashing para duplicados

Para detectar imágenes duplicadas se usa SHA-256 (sha256_stream).

SHA-256 genera un hash único de 64 caracteres hexadecimales.

Si dos imágenes tienen el mismo contenido binario, su hash será idéntico.

Esto es suficiente para detectar duplicados exactos (bit a bit).

No detecta similitudes visuales ni imágenes editadas: está diseñado solo para evitar subir el mismo archivo dos veces.

🕑 Tiempo invertido

Configuración inicial de repo + Docker Compose: ~2h

Backend (FastAPI, hashing, upload, DB, Ollama): ~2h

Frontend (Next.js, Server Actions, filtros, diseño): ~2h

Total aproximado: 6 horas
