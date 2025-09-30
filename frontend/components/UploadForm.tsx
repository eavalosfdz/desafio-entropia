"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import type { UploadState } from "@/app/actions";
import { uploadWindowAction } from "@/app/actions";

export default function UploadForm() {
  const [state, formAction] = React.useActionState<UploadState, FormData>(uploadWindowAction, {});
  const [fileName, setFileName] = React.useState<string>("");

  const hasError = Boolean(state?.error);
  const errorId = hasError ? "file-error" : undefined;

  return (
    <form
      aria-labelledby="upload-title"
      action={formAction}
      className="mx-auto w-full max-w-xl space-y-4"
    >
      <h2 id="upload-title" className="sr-only">Subir imagen de ventana</h2>

      <div>
        <label htmlFor="file" className="block text-sm font-medium text-gray-700">
          Imagen (JPG o PNG, máx 10MB) <span className="sr-only">(requerido)</span>
        </label>
        <input
          id="file"
          name="file"
          type="file"
          accept="image/jpeg,image/png"
          required
          aria-required="true"
          aria-invalid={hasError || undefined}
          aria-describedby={["form-help", errorId].filter(Boolean).join(" ") || undefined}
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
          className="mt-2 block w-full cursor-pointer rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/40"
        />
        <p id="form-help" className="mt-1 text-xs text-gray-500">
          Selecciona una imagen para subirla al feed.
        </p>
        {fileName && (
          <p className="mt-1 truncate text-xs text-gray-600">
            Archivo: <span className="font-medium">{fileName}</span>
          </p>
        )}
      </div>

      {hasError && (
        <div
          id="file-error"
          role="alert"
          aria-live="assertive"
          className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {state!.error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <SubmitButton />
        <a href="/feed" className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50">
          Ver feed
        </a>
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-md px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-black/40 ${pending ? "bg-gray-400" : "bg-black hover:bg-gray-900"
        }`}
      aria-busy={pending}
    >
      {pending ? "Subiendo…" : "Subir imagen"}
    </button>
  );
}
