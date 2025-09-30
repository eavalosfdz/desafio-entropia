"use client";

import * as React from "react";
import { imageUrl } from "@/lib/api";

type Props = {
    id: string;
    description: string | null;
    ai: Record<string, string> | null;
    createdAt: string;
    highlighted?: boolean;
};

export default function WindowCard({ id, description, ai, createdAt, highlighted }: Props) {
    const created = new Date(createdAt);
    const tags = [
        ["daytime", ai?.daytime],
        ["location", ai?.location],
        ["type", ai?.type],
        ["material", ai?.material],
        ["panes", ai?.panes],
        ["covering", ai?.covering],
        ["open", ai?.openState],
    ].filter(([, v]) => v && v !== "unknown") as [string, string][];

    const [isHighlighting, setIsHighlighting] = React.useState(false);
    const [desc, setDesc] = React.useState(description);

    // Enciende el highlight cuando llega un id a resaltar y apágalo tras 3s
    React.useEffect(() => {
        if (highlighted) {
            setIsHighlighting(true);
            const t = setTimeout(() => setIsHighlighting(false), 3000);
            return () => clearTimeout(t);
        }
    }, [highlighted]);

    // Poll for description if it's null, but stop after 2 minutes
    React.useEffect(() => {
        setDesc(description);
        if (description === null) {
            let elapsed = 0;
            const interval = setInterval(async () => {
                elapsed += 10000;
                if (elapsed >= 120000) {
                    clearInterval(interval);
                    return;
                }
                try {
                    const res = await fetch(`http://localhost:8000/api/windows/${id}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.description) {
                            setDesc(data.description);
                            clearInterval(interval);
                        }
                    }
                } catch (e) {
                    // ignore fetch errors
                }
            }, 10000);
            return () => clearInterval(interval);
        }
    }, [id, description]);

    function buildAlt(ai: Record<string, string> | null | undefined) {
        if (!ai) return "Fotografía de una ventana";
        const bits = [
            ai.daytime && ai.daytime !== "unknown" ? ai.daytime : null,
            ai.location && ai.location !== "unknown" ? ai.location : null,
            ai.type && ai.type !== "unknown" ? ai.type : null,
            ai.material && ai.material !== "unknown" ? ai.material : null,
        ].filter(Boolean);
        return bits.length ? `Ventana ${bits.join(", ")}` : "Fotografía de una ventana";
    }

    return (
        <article className="group relative overflow-hidden rounded-2xl border bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-md" aria-labelledby={`title-${id}`}>
            <figure className="relative aspect-video w-full bg-gray-100">
                <img
                    src={imageUrl(id)}
                    alt={description ? description : buildAlt(ai)}
                    className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                    loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-90"></div>
                {/* <time
                    className="absolute left-3 top-3 rounded-md bg-black/60 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm"
                    dateTime={created.toISOString()}
                >
                    {created.toLocaleString()}
                </time> */}
            </figure>

            <div className="p-3">
                <h3 id={`title-${id}`} className="line-clamp-2 text-[15px] font-medium text-gray-900">
                    {desc || "Description loading..."}
                </h3>

                {tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Características detectadas">
                        {tags.map(([k, v]) => (
                            <span
                                key={k}
                                className="inline-flex items-center gap-1 rounded-full border bg-gray-50 px-2 py-0.5 text-[11px] text-gray-700"
                            >
                                <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-700" />
                                {v}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </article>
    );
}
