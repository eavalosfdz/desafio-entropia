"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { uploadWindowImage } from "@/lib/upload";

export default function UploadDialog() {
    const router = useRouter();
    const sp = useSearchParams();

    const [open, setOpen] = React.useState(false);
    const [file, setFile] = React.useState<File | null>(null);
    const [error, setError] = React.useState<string | null>(null);
    const [busy, setBusy] = React.useState(false);
    const [preview, setPreview] = React.useState<string | null>(null);
    const dropRef = React.useRef<HTMLLabelElement>(null);

    React.useEffect(() => {
        function onEsc(e: KeyboardEvent) {
            if (e.key === "Escape") close();
        }
        if (open) window.addEventListener("keydown", onEsc);
        return () => window.removeEventListener("keydown", onEsc);
    }, [open]);

    function close() {
        setOpen(false);
        setFile(null);
        setError(null);
        setPreview(null);
    }

    function onFile(f?: File | null) {
        if (!f) return;
        if (!/^image\/(jpeg|png)$/.test(f.type || "")) {
            setError("Formato no soportado. Usa JPG o PNG.");
            return;
        }
        if (f.size > 10 * 1024 * 1024) {
            setError("La imagen excede 10MB (10MB máx).");
            return;
        }
        setError(null);
        setFile(f);
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(f);
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!file) return setError("Selecciona una imagen primero.");
        try {
            setBusy(true);
            const resp = await uploadWindowImage(file);
            const page = sp.get("page") ?? "1";
            const pageSize = sp.get("pageSize") ?? "12";
            const intent = resp.isDuplicate ? "duplicate" : "created";
            close();
            router.push(`/feed?page=${page}&pageSize=${pageSize}&intent=${intent}&highlight=${resp.window.id}`);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Fallo la subida.");
            }
        } finally {
            setBusy(false);
        }
    }

    function onDrop(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        const f = e.dataTransfer.files?.[0];
        onFile(f);
    }

    return (
        <>
            {/* Floating add button */}
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-6 right-6 rounded-full bg-black px-5 py-3 text-white shadow-lg ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black"
                aria-label="Add window"
            >
                + Añadir
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    role="dialog"
                    aria-modal="true"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) close();
                    }}
                >
                    <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
                        <div className="flex items-center justify-between border-b px-5 py-3">
                            <h2 className="text-base font-semibold">Subir imagen</h2>
                            <button
                                onClick={close}
                                className="rounded-md px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black/40"
                                aria-label="Cerrar"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={onSubmit} className="space-y-4 px-5 py-5">
                            <label
                                ref={dropRef}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    dropRef.current?.classList.add("ring-2", "ring-black");
                                }}
                                onDragLeave={() => dropRef.current?.classList.remove("ring-2", "ring-black")}
                                onDrop={(e) => {
                                    dropRef.current?.classList.remove("ring-2", "ring-black");
                                    onDrop(e);
                                }}
                                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed bg-gray-50 px-4 py-10 text-center hover:bg-gray-100"
                            >
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="max-h-56 w-full rounded-lg object-contain shadow-sm"
                                    />
                                ) : (
                                    <>
                                        <div className="mb-2 text-4xl">🪟</div>
                                        <p className="text-sm text-gray-700">
                                            Arrastra una imagen aquí o <span className="font-medium underline">haz click para seleccionar</span>
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500">JPG o PNG · Máx 10MB</p>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png"
                                    className="sr-only"
                                    onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                                />
                            </label>

                            {file && (
                                <div className="rounded-lg border bg-white px-3 py-2 text-sm text-gray-700">
                                    <p className="truncate"><span className="font-medium">Archivo:</span> {file.name}</p>
                                    <p><span className="font-medium">Tamaño:</span> {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                    <p><span className="font-medium">Tipo:</span> {file.type || "desconocido"}</p>
                                </div>
                            )}

                            {error && (
                                <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            <div className="flex items-center justify-end gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={close}
                                    className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black/40"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={busy || !file}
                                    className={`rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-black/40 ${busy || !file ? "bg-gray-400" : "bg-black hover:bg-gray-900"
                                        }`}
                                >
                                    {busy ? "Subiendo…" : "Subir imagen"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
