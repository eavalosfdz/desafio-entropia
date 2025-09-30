import { API_BASE } from "@/lib/api";

export type UploadResponse = {
    isDuplicate: boolean;
    window: {
        id: string;
        sha256: string;
        imagePath: string;
        description: string | null;
        ai: unknown | null;
        createdAt: string;
    };
};

export async function uploadWindowImage(file: File): Promise<UploadResponse> {
    const fd = new FormData();
    const type =
        file.type ||
        (file.name.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg");
    fd.append("file", file, file.name);

    const res = await fetch(`${API_BASE}/api/windows`, {
        method: "POST",
        body: fd,
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(
            `Upload failed: ${res.status} ${res.statusText} ${text}`
        );
    }
    return (await res.json()) as UploadResponse;
}
