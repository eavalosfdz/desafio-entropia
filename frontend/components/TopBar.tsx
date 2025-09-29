"use client";

import Link from "next/link";
import * as React from "react";

export default function TopBar() {
    return (
        <header className="sticky top-0 z-40 w-full border-b border-[var(--card-border)] bg-[var(--card-bg)]/90 backdrop-blur shadow-sm">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                <Link href="/" className="inline-flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[var(--accent)] flex items-center justify-center shadow-md">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="5" width="14" height="10" rx="3" fill="white" />
                            <rect x="6" y="8" width="8" height="4" rx="1.5" fill="var(--accent)" />
                        </svg>
                    </div>
                    <span className="text-lg font-bold tracking-tight text-[var(--accent)] select-none">Windowgram</span>
                </Link>
            </div>
        </header>
    );
}
