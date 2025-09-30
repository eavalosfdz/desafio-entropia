"use client";

export default function RootError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="text-xl font-semibold">Algo salió mal</h1>
      <p className="mt-2 text-gray-600">{error.message || "Error inesperado."}</p>
      <button onClick={reset} className="mt-6 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900">
        Reintentar
      </button>
    </main>
  );
}
