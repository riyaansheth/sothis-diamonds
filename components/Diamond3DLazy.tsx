"use client";

import dynamic from "next/dynamic";

/** Loads three.js only in the browser, after the page itself. */
export const Diamond3DLazy = dynamic(() => import("./Diamond3D"), { ssr: false });
export const Bracelet3DLazy = dynamic(() => import("./Bracelet3D"), { ssr: false });
