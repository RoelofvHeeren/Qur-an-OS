"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./BookView.module.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

// Logic:
// We view 2 pages at a time (Left vs Right).
// Current Page Index refers to the LEFT page index (always even number or 0).
// Page Turning:
// - Next: Right page flips OVER to become the new Left page.
// - Prev: Left page flips BACK to become the new Right page.

interface BookViewProps {
    totalPages: number;
    renderPage: (pageIndex: number) => React.ReactNode;
}

export function BookView({ totalPages, renderPage }: BookViewProps) {
    // Index of the LEFT page. 0 means cover or first page.
    // We'll treat 0 as "Page 1" (Left) and 1 as "Page 2" (Right) for simplicity in array logic.
    const [currentPage, setCurrentPage] = useState(0);
    const [isFlipping, setIsFlipping] = useState(false);
    const [direction, setDirection] = useState<"next" | "prev">("next");

    const goNext = () => {
        if (currentPage + 2 >= totalPages || isFlipping) return;
        setDirection("next");
        setIsFlipping(true);
        setTimeout(() => {
            setCurrentPage((p) => p + 2);
            setIsFlipping(false);
        }, 600); // 600ms match animation duration
    };

    const goPrev = () => {
        if (currentPage - 2 < 0 || isFlipping) return;
        setDirection("prev");
        setIsFlipping(true);
        setTimeout(() => {
            setCurrentPage((p) => p - 2);
            setIsFlipping(false);
        }, 600);
    };

    return (
        <div className={styles.container}>
            <div className={styles.bookStage}>
                {/* Navigation Controls */}
                <button
                    className={clsx(styles.navBtn, styles.prevBtn)}
                    onClick={goPrev}
                    disabled={currentPage === 0 || isFlipping}
                >
                    <ChevronLeft size={32} />
                </button>

                <button
                    className={clsx(styles.navBtn, styles.nextBtn)}
                    onClick={goNext}
                    disabled={currentPage + 2 >= totalPages || isFlipping}
                >
                    <ChevronRight size={32} />
                </button>

                {/* The Book */}
                <div className={styles.book}>

                    {/* Left Page (Static Base) */}
                    <div className={clsx(styles.page, styles.pageLeft)}>
                        <div className={styles.pageContent}>
                            {renderPage(currentPage)}
                            <span className={styles.pageNumber}>{currentPage + 1}</span>
                        </div>
                    </div>

                    {/* Right Page (Static Base for next view when flipping) */}
                    <div className={clsx(styles.page, styles.pageRight)}>
                        <div className={styles.pageContent}>
                            {renderPage(currentPage + 1)}
                            <span className={styles.pageNumber}>{currentPage + 2}</span>
                        </div>
                    </div>

                    {/* Animation Layer */}
                    <AnimatePresence>
                        {isFlipping && direction === "next" && (
                            <motion.div
                                className={clsx(styles.page, styles.flippingPage)}
                                initial={{ rotateY: 0, zIndex: 10 }}
                                animate={{ rotateY: -180 }}
                                transition={{ duration: 0.6, ease: "easeInOut" }}
                                style={{ transformOrigin: "left center" }} // Hinge on the spine
                            >
                                {/* Front of flipping page (Current Right Page) */}
                                <div className={styles.pageFront}>
                                    <div className={styles.pageContent}>
                                        {renderPage(currentPage + 1)}
                                        <span className={styles.pageNumber}>{currentPage + 2}</span>
                                    </div>
                                </div>

                                {/* Back of flipping page (Next Left Page) */}
                                <div className={styles.pageBack}>
                                    <div className={styles.pageContent}>
                                        {renderPage(currentPage + 2)}
                                        <span className={styles.pageNumber}>{currentPage + 3}</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {isFlipping && direction === "prev" && (
                            <motion.div
                                className={clsx(styles.page, styles.flippingPage)}
                                initial={{ rotateY: -180, zIndex: 10 }}
                                animate={{ rotateY: 0 }}
                                transition={{ duration: 0.6, ease: "easeInOut" }}
                                style={{ transformOrigin: "left center" }} // Hinge on the spine
                            >
                                {/* Back of flipping page (Prev Right Page) => becomes current right */}
                                <div className={styles.pageBack}>
                                    <div className={styles.pageContent}>
                                        {renderPage(currentPage + 1)}
                                        <span className={styles.pageNumber}>{currentPage + 2}</span>
                                    </div>
                                </div>

                                {/* Front of flipping page (Prev Left Page) => becomes current left */}
                                <div className={styles.pageFront}>
                                    <div className={styles.pageContent}>
                                        {renderPage(currentPage)}
                                        <span className={styles.pageNumber}>{currentPage + 1}</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Central Spine Shadow */}
                    <div className={styles.spine} />
                </div>
            </div>
        </div>
    );
}
