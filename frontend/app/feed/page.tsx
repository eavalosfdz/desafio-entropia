import { fetchWindows } from "@/lib/api";
import WindowCard from "@/components/WindowCard";

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
};

export const dynamic = "force-dynamic";

export default async function FeedPage({
    searchParams,
}: {
    searchParams?: Promise<SearchParams>;
}) {
    const sp = (await searchParams) ?? {};
    const page = Number(sp.page ?? 1);
    const pageSize = Number(sp.pageSize ?? 12);

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
        <main className="mx-auto max-w-6xl px-4 py-6">
            <header className="mb-6 flex items-end justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold">Feed de ventanas</h1>
                    <p className="text-sm text-gray-600">
                        {meta.total} resultados • página {meta.page} de {totalPages}
                    </p>
                </div>

                <form className="flex items-center gap-2" action="/feed" method="get">
                    <input type="hidden" name="page" value="1" />
                    <label className="text-sm text-gray-700">
                        Page size:
                        <select
                            name="pageSize"
                            defaultValue={String(pageSize)}
                            className="ml-2 rounded-md border px-2 py-1 text-sm"
                        >
                            {[6, 12, 24].map((n) => (
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                        </select>
                    </label>
                    <button
                        type="submit"
                        className="rounded-md border bg-gray-50 px-3 py-1 text-sm hover:bg-gray-100"
                    >
                        Aplicar
                    </button>
                </form>
            </header>

            {items.length === 0 ? (
                <div className="rounded-xl border p-10 text-center text-gray-600">
                    No hay elementos. Sube una imagen desde la página principal.
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
                        />
                    ))}
                </div>
            )}

            <nav className="mt-8 flex items-center justify-between">
                <a
                    className={`rounded-md border px-3 py-1 text-sm ${!prevPage ? "pointer-events-none opacity-50" : "hover:bg-gray-50"
                        }`}
                    href={`/feed?page=${prevPage ?? page}&pageSize=${meta.pageSize}`}
                    aria-disabled={!prevPage}
                >
                    ← Anterior
                </a>
                <a
                    className={`rounded-md border px-3 py-1 text-sm ${!nextPage ? "pointer-events-none opacity-50" : "hover:bg-gray-50"
                        }`}
                    href={`/feed?page=${nextPage ?? page}&pageSize=${meta.pageSize}`}
                    aria-disabled={!nextPage}
                >
                    Siguiente →
                </a>
            </nav>
        </main>
    );
}
