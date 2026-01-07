"use client";

import React, { useState } from "react";
import { BookView } from "@/components/reading/BookView";
import { PDFPageRenderer } from "@/components/reading/PDFPageRenderer";
import { Document, pdfjs } from "react-pdf";

// Configure PDF worker
// Using CDN for simplicity and reliability in Next.js without deep config changes
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function ReadingPage() {
    const [numPages, setNumPages] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setIsLoading(false);
    }

    return (
        <div style={{ height: "100%", overflow: "hidden", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            {isLoading && <div>Loading Quran...</div>}

            <Document
                file="/quran_english.pdf"
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<div>Loading Document...</div>}
                className="pdf-document"
            >
                {numPages > 0 && (
                    <BookView
                        totalPages={numPages}
                        renderPage={(index) => (
                            <PDFPageRenderer
                                pageNumber={index + 1}
                                width={450} // Match this to BookView page width
                            />
                        )}
                    />
                )}
            </Document>
        </div>
    );
}
