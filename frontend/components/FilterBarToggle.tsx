"use client";

import React, { useState } from "react";
import FilterBar from "./FilterBar";

export default function FilterBarToggle() {
    const [show, setShow] = useState(false);

    return (
        <div className="mb-2">
            <button
                type="button"
                aria-expanded={show}
                aria-controls="filters-panel"
                className="mb-2 rounded-md text-black border px-3 py-1 text-sm bg-gray-50 hover:bg-gray-100"
                onClick={() => setShow((v) => !v)}
            >
                Filtros <span >ᐯ</span>
            </button>
            {show && <div id="filters-panel"><FilterBar /></div>}
        </div>
    );
}
