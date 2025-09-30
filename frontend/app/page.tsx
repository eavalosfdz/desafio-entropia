import TopBar from "@/components/TopBar";
import UploadDialog from "@/components/UploadDialog";
import UploadForm from "@/components/UploadForm";
export const dynamic = "force-dynamic";
export default function HomePage() {
  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight text-center">Subir una ventana</h1>
        </header>
        <section aria-label="Formulario de subida">
          <UploadForm />
        </section>
      </main>
    </>
  );
}
