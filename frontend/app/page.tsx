import { fetchWindows } from "@/lib/api";
import WindowCard from "@/components/WindowCard";
import UploadDialog from "@/components/UploadDialog";
// import FilterBar from "@/components/FilterBar";
import TopBar from "@/components/TopBar";
import FilterBarToggle from "@/components/FilterBarToggle";

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
};

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const page = Number(sp.page ?? 1);
  const pageSize = Number(sp.pageSize ?? 12);
  const highlight = sp.highlight;

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
      <main className="mx-auto max-w-4xl px-4 py-12 min-h-[80vh] flex flex-col items-center bg-[var(--background)]">
        <section className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--accent)] mb-2 drop-shadow-sm">
            Bienvenido a Windowgram
          </h1>
          <p className="text-lg text-[var(--foreground)]/80 mb-6 max-w-2xl mx-auto">
            Comparte y explora ventanas de todo el mundo. Sube tus fotos, filtra por
            características y descubre nuevas perspectivas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <UploadDialog />
            <div className="flex items-center justify-center">
              <FilterBarToggle />
            </div>
          </div>
        </section>

        <section className="w-full">
          {items.length === 0 ? (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-10 text-center text-[var(--foreground)]/60 shadow-sm">
              No hay elementos con los filtros actuales. Sube una imagen con “Añadir”.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
        </section>
      </main>
    </>
  );
}

function buildFilterQS(sp: Record<string, string | undefined>) {
  const keys = ["daytime", "location", "type", "material", "panes", "covering", "openState"];
  return keys.map((k) => (sp[k] ? `&${k}=${encodeURIComponent(sp[k] as string)}` : "")).join("");
}
