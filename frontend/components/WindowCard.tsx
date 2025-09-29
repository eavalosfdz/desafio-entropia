"use client";

import * as React from "react";
import { imageUrl } from "@/lib/api";

type Props = {
    id: string;
    description: string | null;
    ai: Record<string, string> | null;
    createdAt: string;
};

export default function WindowCard({ id, description, ai, createdAt }: Props) {
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
        <div className="rounded-2xl border p-3 shadow-sm hover:shadow-md transition">
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-gray-100">
                {/* evitar next/image por CORS inicial; usamos img simple */}
                <img
                    src={imageUrl(id)}
                    alt={description || "window image"}
                    className="h-full w-full object-cover"
                    loading="lazy"
                />
            </div>

            <div className="mt-3">
                <p className="text-sm text-gray-500">
                    {created.toLocaleString()}
                </p>
                <p className="mt-1 text-base font-medium">
                    {description || "Sin descripción (IA pendiente o fallida)"}
                </p>

                {tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {tags.map(([k, v]) => (
                            <span
                                key={k}
                                className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-gray-700"
                                title={k}
                            >
                                {v}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
