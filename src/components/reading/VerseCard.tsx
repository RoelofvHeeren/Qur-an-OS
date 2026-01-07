import React from "react";
import styles from "./VerseCard.module.css";
import clsx from "clsx";

interface VerseCardProps {
    surah: number;
    verse: number;
    arabic: string;
    translation: string;
    isActive?: boolean;
    onSelect?: () => void;
}

export function VerseCard({
    surah,
    verse,
    arabic,
    translation,
    isActive,
    onSelect,
}: VerseCardProps) {
    return (
        <div
            className={clsx(styles.card, { [styles.active]: isActive })}
            onClick={onSelect}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    onSelect?.();
                }
            }}
        >
            <div className={styles.header}>
                <span className={styles.verseNumber}>
                    {surah}:{verse}
                </span>
            </div>
            <div className={styles.arabic}>{arabic}</div>
            <div className={styles.translation}>{translation}</div>
        </div>
    );
}
