"use client";

import React, { useState } from "react";
import { BookView } from "@/components/reading/BookView";
import { PDFPageRenderer } from "@/components/reading/PDFPageRenderer";
import { Document, pdfjs } from "react-pdf";

// Ensure worker is set
if (typeof window !== "undefined") {
    // pdfjs.version is sometimes undefined in certain build contexts, checking it safely
    const version = pdfjs.version || "3.11.174";
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
}

export default function PDFReader() {
    const [numPages, setNumPages] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setIsLoading(false);
    }

    function onDocumentLoadError(err: Error) {
        console.error("PDF Load Error:", err);
        setError(err);
        setIsLoading(false);
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-red-500 p-4">
                <p>Failed to load Quran PDF.</p>
                <p className="text-sm mt-2 text-gray-400">{error.message}</p>
                <p className="text-xs mt-1 text-gray-500">Worker Source: {pdfjs.GlobalWorkerOptions.workerSrc}</p>
            </div>
        );
    }

    return (
        <div style={{ flex: 1, width: "100%", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '600px', height: '100%' }}>
            {isLoading && <div className="text-gray-500 animate-pulse">Loading Quran PDF...</div>}

            <Document
                file="/quran_english.pdf"
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={null}
                className="pdf-document"
            >
                {numPages > 0 && (
                    <BookView
                        totalPages={numPages}
                        renderPage={(index) => (
                            <PDFPageRenderer
                                pageNumber={index + 1}
                                width={450}
                            />
                        )}
                    />
                )}
            </Document>
        </div>
    );
}
