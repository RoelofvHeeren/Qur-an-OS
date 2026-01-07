"use client";

import React from "react";
import { Page } from "react-pdf";
import styles from "./BookView.module.css";
// import "react-pdf/dist/Page/AnnotationLayer.css"; // Optional: if links needed
// import "react-pdf/dist/Page/TextLayer.css"; // Optional: if text selection needed

interface PDFPageRendererProps {
    pageNumber: number;
    width?: number;
    height?: number;
}

export const PDFPageRenderer: React.FC<PDFPageRendererProps> = ({ pageNumber, width }) => {
    // We render the page. We might need 'width' to responsively scale it.
    // The BookView has a fixed or relative size.
    // For now, let's assume a fixed width close to the book page width (e.g., 400-500px).
    // Or we can let it auto-scale if we pass 'width'.

    return (
        <div className={styles.pdfPageContainer}>
            <Page
                pageNumber={pageNumber}
                width={width || 450} // Default approximate width
                renderTextLayer={false} // Disable text layer for performance initially
                renderAnnotationLayer={false}
                className={styles.reactPdfPage}
            />
        </div>
    );
};
