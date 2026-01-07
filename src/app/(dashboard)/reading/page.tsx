"use client";

import React from "react";
import dynamic from "next/dynamic";

// Dynamically import the PDF Reader with SSR disabled
// This prevents 'DOMMatrix is not defined' errors during build
const PDFReader = dynamic(() => import("@/components/reading/PDFReader"), {
    ssr: false,
    loading: () => <div className="flex h-full items-center justify-center">Loading PDF Viewer...</div>
});

export default function ReadingPage() {
    return (
        <div style={{ height: "100%", overflow: "hidden" }}>
            <PDFReader />
        </div>
    );
}
