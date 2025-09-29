import os
import base64
import httpx
from typing import Any, Dict, Tuple

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://ollama:11434").rstrip("/")
MODEL = os.getenv("OLLAMA_MODEL", "gemma3:4b")

DESC_SYSTEM = (
    "You are a vision assistant. Given an image of a WINDOW, return a single, short human-friendly sentence "
    "describing the window and its scene. Be concise go to the point."
)

JSON_SYSTEM = (
    "You are a vision assistant. Given an image of a WINDOW, respond ONLY with a strict JSON object matching exactly:\n"
    "{\n"
    '  "daytime": "day" | "night" | "unknown",\n'
    '  "location": "indoor" | "outdoor" | "unknown",\n'
    '  "type": "casement" | "sliding" | "bay" | "awning" | "unknown",\n'
    '  "material": "wood" | "aluminum" | "vinyl" | "fiberglass" | "unknown",\n'
    '  "panes": "single" | "double" | "triple" | "unknown",\n'
    '  "covering": "curtain" | "blind" | "none" | "unknown",\n'
    '  "openState": "open" | "closed" | "unknown"\n'
    "}\n"
    'If unsure for any field, use "unknown". Return ONLY valid JSON without extra text.'
)


def encode_image_to_base64(path: str) -> str:
    # Devuelve SOLO base64 crudo (sin data: prefix)
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("ascii")


async def _pull_model_if_needed(client: httpx.AsyncClient) -> None:
    try:
        r = await client.get(f"{OLLAMA_HOST}/api/tags", timeout=30)
        r.raise_for_status()
        tags = r.json() or {}
        if isinstance(tags, dict) and "models" in tags:
            for m in tags["models"]:
                if m.get("name") == MODEL:
                    return
    except Exception:
        pass
    try:
        pr = await client.post(
            f"{OLLAMA_HOST}/api/pull", json={"name": MODEL}, timeout=None
        )
        pr.raise_for_status()
    except Exception as e:
        print("[OLLAMA] Pull failed:", e)


async def _generate(
    client: httpx.AsyncClient, prompt: str, b64: str, *, force_json: bool
) -> str:
    payload = {
        "model": MODEL,
        "prompt": prompt,
        "images": [b64],  # <-- SOLO base64 crudo
        "stream": False,
        "options": {"temperature": 0},
    }
    if force_json:
        payload["format"] = "json"

    r = await client.post(f"{OLLAMA_HOST}/api/generate", json=payload, timeout=180)
    if r.status_code == 404:
        await _pull_model_if_needed(client)
        r = await client.post(f"{OLLAMA_HOST}/api/generate", json=payload, timeout=180)

    if r.status_code == 400 and force_json:
        # Fallback: reintenta SIN format:"json"
        payload.pop("format", None)
        r = await client.post(f"{OLLAMA_HOST}/api/generate", json=payload, timeout=180)

    try:
        r.raise_for_status()
    except httpx.HTTPStatusError as e:
        # Log del cuerpo para depurar
        body = ""
        try:
            body = r.text[:1000]
        except Exception:
            pass
        print(f"[OLLAMA][HTTP {r.status_code}] {body}")
        raise e

    data = r.json()
    return data.get("response", "") if isinstance(data, dict) else ""


async def analyze_window_image(abs_path: str) -> Tuple[str, Dict[str, Any]]:
    """
    Devuelve (description, ai_json). Hace 2 llamadas: descripción y JSON.
    Con fallback si el servidor rechaza format:"json".
    """
    b64 = encode_image_to_base64(abs_path)
    description = ""
    obj: Dict[str, Any] = {}

    async with httpx.AsyncClient() as client:
        await _pull_model_if_needed(client)

        # 1) Descripción
        try:
            desc_text = await _generate(client, DESC_SYSTEM, b64, force_json=False)
            description = (
                (desc_text or "").strip().splitlines()[-1].strip() if desc_text else ""
            )
        except Exception as e:
            print("[AI][description] error:", e)

        # 2) JSON estricto
        try:
            json_text = await _generate(client, JSON_SYSTEM, b64, force_json=True)
            import json as _json

            obj = _json.loads(json_text.strip())
            for k in (
                "daytime",
                "location",
                "type",
                "material",
                "panes",
                "covering",
                "openState",
            ):
                obj.setdefault(k, "unknown")
        except Exception as e:
            print("[AI][json] error:", e)
            obj = {}

    return description, obj
