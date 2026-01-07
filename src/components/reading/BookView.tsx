"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import styles from "./BookView.module.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

interface BookViewProps {
    totalPages: number;
    renderPage: (pageIndex: number) => React.ReactNode;
}

export function BookView({ totalPages, renderPage }: BookViewProps) {
    const [currentPage, setCurrentPage] = useState(0);
    const [isFlipping, setIsFlipping] = useState(false);
    const [direction, setDirection] = useState<"next" | "prev">("next");

    // Drag logic
    const x = useMotionValue(0);
    const dragRotateY = useTransform(x, [0, -300], [0, -180]); // Drag Left (-x) -> Rotate towards -180
    const dragRotateYPrev = useTransform(x, [0, 300], [-180, 0]); // Drag Right (+x) -> Rotate towards 0

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = 100; // px to trigger flip

        if (direction === "next") {
            if (info.offset.x < -threshold) {
                // Successful flip next
                completeFlipNext();
            } else {
                // Reset
                setIsFlipping(false);
            }
        } else {
            // Prev
            if (info.offset.x > threshold) {
                // Successful flip prev
                completeFlipPrev();
            } else {
                setIsFlipping(false);
            }
        }
    };

    const completeFlipNext = () => {
        // We animate manually to completion if needed, but framer requires 'animate' prop.
        // For simplicity with drag, we let the internal state catch up or use animate.
        // simpler to just finish the transition logic:
        setCurrentPage((p) => p + 2);
        setIsFlipping(false);
        x.set(0);
    };

    const completeFlipPrev = () => {
        setCurrentPage((p) => p - 2);
        setIsFlipping(false);
        x.set(0);
    };

    const startFlipNext = () => {
        if (currentPage + 2 >= totalPages || isFlipping) return;
        setDirection("next");
        setIsFlipping(true);
    };

    const startFlipPrev = () => {
        if (currentPage - 2 < 0 || isFlipping) return;
        setDirection("prev");
        setIsFlipping(true);
    };

    // Button handlers (still useful)
    const autoNext = () => {
        if (currentPage + 2 >= totalPages || isFlipping) return;
        setDirection("next");
        setIsFlipping(true);
        // We need a force delay or animation trigger if we don't drag
        // This implementation mixes controlled/drag, which is tricky.
        // For this step, we'll keep the auto-animate logic separate from drag if possible,
        // or just simulate a drag completion.
        setTimeout(() => completeFlipNext(), 600);
    }

    const autoPrev = () => {
        if (currentPage - 2 < 0 || isFlipping) return;
        setDirection("prev");
        setIsFlipping(true);
        setTimeout(() => completeFlipPrev(), 600);
    }

    return (
        <div className={styles.container}>
            <div className={styles.bookStage}>
                <button
                    className={clsx(styles.navBtn, styles.prevBtn)}
                    onClick={autoPrev}
                    disabled={currentPage === 0 || isFlipping}
                >
                    <ChevronLeft size={32} />
                </button>

                <button
                    className={clsx(styles.navBtn, styles.nextBtn)}
                    onClick={autoNext}
                    disabled={currentPage + 2 >= totalPages || isFlipping}
                >
                    <ChevronRight size={32} />
                </button>

                <div className={styles.book}>

                    {/* Static Pages */}
                    <div className={clsx(styles.page, styles.pageLeft)}>
                        <div className={styles.pageContent}>
                            {renderPage(isFlipping && direction === "prev" ? currentPage - 2 : currentPage)}
                            <span className={styles.pageNumber}>{(isFlipping && direction === "prev" ? currentPage - 2 : currentPage) + 1}</span>
                            {/* Drag Handle for Prev */}
                            <div
                                className={styles.dragHandleLeft}
                                onPointerDown={startFlipPrev}
                            />
                        </div>
                    </div>

                    <div className={clsx(styles.page, styles.pageRight)}>
                        <div className={styles.pageContent}>
                            {renderPage(isFlipping && direction === "next" ? currentPage + 3 : currentPage + 1)}
                            <span className={styles.pageNumber}>{(isFlipping && direction === "next" ? currentPage + 3 : currentPage + 1) + 1}</span>
                            {/* Drag Handle for Next */}
                            <div
                                className={styles.dragHandleRight}
                                onPointerDown={startFlipNext}
                            />
                        </div>
                    </div>

                    {/* Animation Layer */}
                    <AnimatePresence>
                        {isFlipping && direction === "next" && (
                            <motion.div
                                className={clsx(styles.page, styles.flippingPage)}
                                style={{
                                    transformOrigin: "left center",
                                    rotateY: dragRotateY, // Bound to drag
                                    zIndex: 20
                                }}
                                initial={{ rotateY: 0 }}
                                animate={{ rotateY: -180 }} // Auto animate target
                                exit={{ rotateY: -180 }}
                                transition={{ duration: 0.6, ease: "easeInOut" }}
                                drag="x"
                                dragConstraints={{ left: -1200, right: 0 }} // Allow dragging left
                                dragElastic={0.1}
                                onDragEnd={handleDragEnd}
                            // If button clicked, we ignore drag props basically
                            >
                                <div className={styles.pageFront}>
                                    <div className={styles.pageContent}>
                                        {renderPage(currentPage + 1)}
                                        <span className={styles.pageNumber}>{currentPage + 2}</span>
                                    </div>
                                </div>

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
                                style={{
                                    transformOrigin: "left center",
                                    rotateY: dragRotateYPrev,
                                    zIndex: 20
                                }}
                                initial={{ rotateY: -180 }}
                                animate={{ rotateY: 0 }}
                                exit={{ rotateY: 0 }}
                                transition={{ duration: 0.6, ease: "easeInOut" }}
                                drag="x"
                                dragConstraints={{ left: 0, right: 1200 }}
                                dragElastic={0.1}
                                onDragEnd={handleDragEnd}
                            >
                                <div className={styles.pageBack}>
                                    <div className={styles.pageContent}>
                                        {renderPage(currentPage)}
                                        <span className={styles.pageNumber}>{currentPage + 1}</span>
                                    </div>
                                </div>

                                <div className={styles.pageFront}>
                                    <div className={styles.pageContent}>
                                        {renderPage(currentPage - 1)}
                                        <span className={styles.pageNumber}>{currentPage}</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className={styles.spine} />
                </div>
            </div>
        </div>
    );
}
