const PUBLIC = (
    process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"
).replace(/\/$/, "");
const INTERNAL = (process.env.API_BASE_INTERNAL || PUBLIC).replace(/\/$/, "");

// En servidor (SSR) usamos la interna; en cliente usamos la pública.
const isServer = typeof window === "undefined";
export const API_BASE = isServer ? INTERNAL : PUBLIC;

export type WindowOut = {
    id: string;
    sha256: string;
    imagePath: string;
    description: string | null;
    ai: {
        daytime?: string;
        location?: string;
        type?: string;
        material?: string;
        panes?: string;
        covering?: string;
        openState?: string;
    } | null;
    createdAt: string;
};

export type WindowPage = {
    items: WindowOut[];
    meta: { page: number; pageSize: number; total: number };
};

export async function fetchWindows(
    params: Record<string, string | number | undefined>
) {
    const usp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && `${v}`.length > 0)
            usp.set(k, String(v));
    });
    const url = `${API_BASE}/api/windows?${usp.toString()}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
        throw new Error(
            `Failed to fetch windows: ${res.status} ${res.statusText}`
        );
    }
    return (await res.json()) as WindowPage;
}

export function imageUrl(id: string) {
    //
    const base = (
        process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"
    ).replace(/\/$/, "");
    return `${base}/api/windows/${id}/image`;
}
