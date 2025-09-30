"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function FlashBanner({
    intent,
    hideAfterMs = 3500,
}: {
    intent?: string;
    hideAfterMs?: number;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const sp = useSearchParams();

    const [visible, setVisible] = React.useState<boolean>(!!intent);
    const [fading, setFading] = React.useState<boolean>(false);

    React.useEffect(() => {
        if (!intent) return;
        setVisible(true);
        setFading(false);

        // inicia fade a los (hideAfterMs - 300) ms, y oculta a los hideAfterMs
        const fadeT = setTimeout(() => setFading(true), Math.max(0, hideAfterMs - 300));
        const hideT = setTimeout(() => setVisible(false), hideAfterMs);

        // limpia los params de la URL (intent y highlight) para no re-triggerear
        const cleanT = setTimeout(() => {
            const next = new URLSearchParams(sp.toString());
            next.delete("intent");
            router.replace(`${pathname}?${next.toString()}`, { scroll: false });
        }, hideAfterMs + 50);

        return () => {
            clearTimeout(fadeT);
            clearTimeout(hideT);
            clearTimeout(cleanT);
        };
    }, [intent, hideAfterMs, pathname, router, sp]);

    if (!visible || !intent) return null;

    const isDuplicate = intent === "duplicate";
    const isCreated = intent === "created";

    const classBase =
        "mb-4 rounded-md border p-3 text-sm transition-opacity duration-300";
    const classes =
        (isDuplicate
            ? "border-yellow-300 bg-yellow-50 text-yellow-800"
            : isCreated
                ? "border-green-300 bg-green-50 text-green-800"
                : "border-gray-300 bg-gray-50 text-gray-800") +
        " " +
        classBase +
        (fading ? " opacity-0" : " opacity-100");

    return (
        <div role="alert" aria-live="polite" className={classes}>
            {isDuplicate && "La imagen ya existe en la aplicación."}
            {isCreated && "Imagen subida con éxito 🎉"}
            {!isDuplicate && !isCreated && "Operación realizada."}
        </div>
    );
}
