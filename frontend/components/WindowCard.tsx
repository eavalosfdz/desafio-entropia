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

    return (
        <article
            className={`group relative overflow-hidden rounded-2xl border bg-white shadow-sm ring-1 ring-black/5 transition hover:shadow-md ${highlighted ? "outline-2 outline-blue-500" : ""
                }`}
        >
            <div className="relative aspect-video w-full bg-gray-100">
                <img
                    src={imageUrl(id)}
                    alt={description || "window image"}
                    className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                    loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-90"></div>
                <time className="absolute left-3 top-3 rounded-md bg-black/60 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                    {created.toLocaleString()}
                </time>
            </div>

            <div className="p-3">
                <p className="line-clamp-2 text-[15px] font-medium text-gray-900">
                    {description || "Sin descripción (IA pendiente o fallida)"}
                </p>

                {tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {tags.map(([k, v]) => (
                            <span
                                key={k}
                                className="inline-flex items-center gap-1 rounded-full border bg-gray-50 px-2 py-0.5 text-[11px] text-gray-700"
                                title={k}
                            >
                                <Dot />
                                {v}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </article>
    );
}

function Dot() {
    return <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-700" />;
}
