"use client";

import React, { useState, useEffect } from "react";
import { BookView } from "@/components/reading/BookView";
import { PDFPageRenderer } from "@/components/reading/PDFPageRenderer";
import { Document, pdfjs } from "react-pdf";

// Configure worker inside the component or outside but only on client
// Ideally inside useEffect or just ensure it runs on client.
// Putting it here is fine if this file is only loaded on client.

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFReader() {
    const [numPages, setNumPages] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setIsLoading(false);
    }

    return (
        <div style={{ height: "100%", width: "100%", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {isLoading && <div className="text-gray-500 animate-pulse">Loading Quran...</div>}

            <Document
                file="/quran_english.pdf"
                onLoadSuccess={onDocumentLoadSuccess}
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
