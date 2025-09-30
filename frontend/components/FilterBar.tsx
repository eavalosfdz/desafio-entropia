"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

const OPTIONS = {
  daytime: ["", "day", "night", "unknown"],
  location: ["", "indoor", "outdoor", "unknown"],
  type: ["", "casement", "sliding", "bay", "awning", "unknown"],
  material: ["", "wood", "aluminum", "vinyl", "fiberglass", "unknown"],
  panes: ["", "single", "double", "triple", "unknown"],
  covering: ["", "none", "curtain", "blind", "unknown"],
  openState: ["", "open", "closed", "unknown"],
};

export default function FilterBar() {
  const sp = useSearchParams();
  const pageSize = sp.get("pageSize") ?? "12";
  const current = {
    daytime: sp.get("daytime") ?? "",
    location: sp.get("location") ?? "",
    type: sp.get("type") ?? "",
    material: sp.get("material") ?? "",
    panes: sp.get("panes") ?? "",
    covering: sp.get("covering") ?? "",
    openState: sp.get("openState") ?? "",
  };

  return (
    <form id="filters" action="/feed" method="get" className="rounded-xl border bg-white p-3 shadow-sm" aria-labelledby="filters-legend">
      <input type="hidden" name="page" value="1" />
      <input type="hidden" name="pageSize" value={pageSize} />

      <fieldset>
        <legend id="filters-legend" className="sr-only">Filtros del feed</legend>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 text-black">
          <Select name="daytime" label="Daytime" value={current.daytime} options={OPTIONS.daytime} />
          <Select name="location" label="Location" value={current.location} options={OPTIONS.location} />
          <Select name="type" label="Type" value={current.type} options={OPTIONS.type} />
          <Select name="material" label="Material" value={current.material} options={OPTIONS.material} />
          <Select name="panes" label="Panes" value={current.panes} options={OPTIONS.panes} />
          <Select name="covering" label="Covering" value={current.covering} options={OPTIONS.covering} />
          <Select name="openState" label="Open state" value={current.openState} options={OPTIONS.openState} />
        </div>
      </fieldset>

      <div className="mt-3 flex items-center justify-end gap-2 border-t pt-3">
        <a
          href={`/feed?page=1&pageSize=${pageSize}`}
          className="rounded-md border text-black px-3 py-2 text-sm hover:bg-gray-50"
        >
          Limpiar
        </a>
        <button
          type="submit"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
          aria-label="Aplicar filtros al feed"
        >
          Aplicar filtros
        </button>
      </div>
    </form>
  );
}

function Select({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value: string;
  options: string[];
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-gray-700">{label}</span>
      <select
        className="rounded-md border px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/40"
        name={name}
        defaultValue={value}
      >
        {options.map((opt) => (
          <option key={opt || "any"} value={opt}>
            {opt === "" ? "Any" : opt}
          </option>
        ))}
      </select>
    </label>
  );
}
