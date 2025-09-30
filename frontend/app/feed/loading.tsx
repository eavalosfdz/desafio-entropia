export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-4 h-6 w-40 animate-pulse rounded bg-gray-200" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-video animate-pulse rounded-2xl bg-gray-200" />
        ))}
      </div>
    </main>
  );
}