import { fetchWindows } from "@/lib/api";
import WindowCard from "@/components/WindowCard";
import TopBar from "@/components/TopBar";
import FlashBanner from "@/components/FlashBanner";
import FilterBarToggle from "@/components/FilterBarToggle";
import UploadDialog from "@/components/UploadDialog";

type SearchParams = {
    page?: string;
    pageSize?: string;
    daytime?: string;
    location?: string;
    type?: string;
    material?: string;
    panes?: string;
    covering?: string;
    openState?: string;
    highlight?: string;
    intent?: string;
};

export const dynamic = "force-dynamic";

export default async function FeedPage({
    searchParams,
}: {
    searchParams?: Promise<SearchParams>;
}) {
    const sp = (await searchParams) ?? {};
    const page = Math.max(1, Number(sp.page ?? 1));
    const pageSize = Math.max(1, Number(sp.pageSize ?? 12));
    const highlight = sp.highlight;

    // Llamada al backend tal cual tu API
    const data = await fetchWindows({
        page,
        pageSize,
        daytime: sp.daytime,
        location: sp.location,
        type: sp.type,
        material: sp.material,
        panes: sp.panes,
        covering: sp.covering,
        openState: sp.openState,
    });

    const { items, meta } = data;
    const totalPages = Math.max(1, Math.ceil(meta.total / meta.pageSize));
    const prevPage = page > 1 ? page - 1 : undefined;
    const nextPage = page < totalPages ? page + 1 : undefined;

    return (
        <>
            <TopBar />
            <main id="main" className="mx-auto max-w-6xl px-4 py-6 flex flex-col gap-6">
                <FlashBanner intent={sp.intent} />

                <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Windows Feed</h1>
                        <p className="text-sm text-gray-600">
                            {meta.total} resultados • página {meta.page} de {totalPages}
                        </p>
                    </div>

                    {/* Selector de page size (opcional) para paginacion */}
                    <form className="flex items-center gap-2" action="/feed" method="get">
                        <input type="hidden" name="page" value="1" />
                        {FILTER_KEYS.map((k) =>
                            sp[k] ? <input key={k} type="hidden" name={k} value={sp[k] as string} /> : null
                        )}
                        <label className="text-sm text-gray-700">
                            Page size:
                            <select
                                name="pageSize"
                                defaultValue={String(pageSize)}
                                className="ml-2 rounded-md border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-black/40"
                            >
                                {[2, 4, 6, 12, 24].map((n) => (
                                    <option key={n} value={n}>
                                        {n}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <button
                            type="submit"
                            className="rounded-md border bg-gray-50 px-3 py-1 text-sm text-black hover:bg-gray-100"
                        >
                            Aplicar
                        </button>
                    </form>
                </header>

                <FilterBarToggle />

                {items.length === 0 ? (
                    <div className="rounded-xl border p-10 text-center text-gray-600">
                        No hay elementos aún.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((w) => (
                            <WindowCard
                                key={w.id}
                                id={w.id}
                                description={w.description}
                                ai={(w.ai || null) as never}
                                createdAt={w.createdAt}
                                highlighted={highlight === w.id}
                            />
                        ))}
                    </div>
                )}

                {/* Paginación preservando filtros */}
                <nav className="mt-2 flex items-center justify-between" aria-label="Paginación">
                    {/* Prev */}
                    {prevPage ? (
                        <a
                            className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
                            href={`/feed?page=${prevPage}&pageSize=${meta.pageSize}${buildFilterQS(sp)}`}
                            rel="prev"
                        >
                            ← Prev
                        </a>
                    ) : (
                        <span className="rounded-md border px-3 py-1 text-sm opacity-50" aria-disabled="true">
                            ← Prev
                        </span>
                    )}

                    {/* Next */}
                    {nextPage ? (
                        <a
                            className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
                            href={`/feed?page=${nextPage}&pageSize=${meta.pageSize}${buildFilterQS(sp)}`}
                            rel="next"
                        >
                            Next →
                        </a>
                    ) : (
                        <span className="rounded-md border px-3 py-1 text-sm opacity-50" aria-disabled="true">
                            Next →
                        </span>
                    )}
                </nav>

                {/* Botón flotante de subida */}
                <div className="z-50 fixed bottom-6 right-6">
                    <UploadDialog />
                </div>
            </main>
        </>
    );
}

const FILTER_KEYS = [
    "daytime",
    "location",
    "type",
    "material",
    "panes",
    "covering",
    "openState",
] as const;

function buildFilterQS(sp: Record<string, string | undefined>) {
    return FILTER_KEYS.map((k) =>
        sp[k] ? `&${k}=${encodeURIComponent(sp[k] as string)}` : ""
    ).join("");
}
