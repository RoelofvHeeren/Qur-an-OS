import React from "react";
import styles from "./VersePage.module.css";

interface Verse {
    id: number;
    surah: number;
    verse: number;
    arabic: string;
    translation: string;
}

export function VersePage({ verses }: { verses: Verse[] }) {
    if (!verses || verses.length === 0) {
        return (
            <div className={styles.emptyPage}>
                <span>End of Chapter</span>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            {verses.map((v) => (
                <div key={v.id} className={styles.verseItem}>
                    <div className={styles.arabic}>{v.arabic}</div>
                    <div className={styles.translation}>
                        <span className={styles.marker}>{v.verse}</span> {v.translation}
                    </div>
                </div>
            ))}
        </div>
    );
}
