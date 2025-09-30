"use server";
import { redirect } from "next/navigation";

export type UploadState = { error?: string };

export async function uploadWindowAction(
    _prevState: UploadState,
    formData: FormData
) {
    const file = formData.get("file");
    if (!(file instanceof File))
        return { error: "Debes seleccionar una imagen." };
    const size = file.size ?? 0;
    const type = file.type || "";
    if (!/^image\/(jpeg|png)$/.test(type))
        return { error: "Formato no soportado. Usa JPG o PNG." };
    if (size > 10 * 1024 * 1024) return { error: "La imagen excede 10MB." };
    const INTERNAL = (
        process.env.API_BASE_INTERNAL ||
        process.env.NEXT_PUBLIC_API_BASE ||
        "http://api:8000"
    ).replace(/\/$/, "");
    const fd = new FormData();
    fd.append("file", file, file.name);
    const res = await fetch(`${INTERNAL}/api/windows`, {
        method: "POST",
        body: fd,
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        return {
            error: `Fallo la subida: ${res.status} ${res.statusText} ${text}`,
        };
    }
    const json = await res.json();
    const intent = json.isDuplicate ? "duplicate" : "created";
    redirect(
        `/feed?page=1&pageSize=12&intent=${intent}&highlight=${json.window.id}`
    );
}
