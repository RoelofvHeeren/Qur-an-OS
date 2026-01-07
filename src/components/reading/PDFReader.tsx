"use client";

import React, { useState, useEffect } from "react";
import { BookView } from "@/components/reading/BookView";
import { PDFPageRenderer } from "@/components/reading/PDFPageRenderer";
import { Document, pdfjs } from "react-pdf";

// Ensure worker is set
if (typeof window !== "undefined") {
    // pdfjs.version should be 5.4.296 based on installed package
    const version = pdfjs.version;
    console.log("PDFJS Version:", version);
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
}

export default function PDFReader() {
    const [numPages, setNumPages] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        console.log("PDF Loaded successfully. Pages:", numPages);
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
        <div style={{ flex: 1, width: "100%", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '600px', height: '100%', border: '1px solid red' /* DEBUG BORDER */ }}>
            <div className="absolute top-0 left-0 bg-black/50 text-white p-2 text-xs z-50">
                Debug: Loading: {isLoading ? 'Yes' : 'No'} | Pages: {numPages} | Ver: {pdfjs.version}
            </div>

            {isLoading && <div className="text-gray-500 animate-pulse">Loading Quran PDF...</div>}

            <Document
                file="/quran_english.pdf"
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={null}
                className="pdf-document w-full h-full flex items-center justify-center"
            >
                {numPages > 0 ? (
                    <BookView
                        totalPages={numPages}
                        renderPage={(index) => (
                            <PDFPageRenderer
                                pageNumber={index + 1}
                                width={450}
                            />
                        )}
                    />
                ) : (
                    !isLoading && <div>No pages loaded</div>
                )}
            </Document>
        </div>
    );
}
