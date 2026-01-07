"use client";

import React, { useState } from "react";
import styles from "./ReadingView.module.css";
import { VerseCard } from "./VerseCard";
import { Button } from "@/components/ui/Button";

// Mock Data
const MOCK_VERSES = [
    {
        id: 1,
        surah: 1,
        verse: 1,
        arabic: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
        translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
    },
    {
        id: 2,
        surah: 1,
        verse: 2,
        arabic: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ",
        translation: "[All] praise is [due] to Allah, Lord of the worlds -",
    },
    {
        id: 3,
        surah: 1,
        verse: 3,
        arabic: "ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ",
        translation: "The Entirely Merciful, the Especially Merciful,",
    },
];

export function ReadingView() {
    const [activeVerseId, setActiveVerseId] = useState<number | null>(null);

    return (
        <div className={styles.container}>
            {/* List Panel */}
            <div className={styles.listPanel}>
                <div className={styles.header}>
                    <h2>Surah Al-Fatiha</h2>
                    <span className={styles.subtitle}>The Opener</span>
                </div>
                <div className={styles.verses}>
                    {MOCK_VERSES.map((v) => (
                        <VerseCard
                            key={v.id}
                            surah={v.surah}
                            verse={v.verse}
                            arabic={v.arabic}
                            translation={v.translation}
                            isActive={activeVerseId === v.id}
                            onSelect={() => setActiveVerseId(v.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Detail/Context Panel */}
            <div className={styles.contextPanel}>
                {activeVerseId ? (
                    <div className={styles.contextContent}>
                        <h3>Reflections & Notes</h3>
                        <p className={styles.placeholder}>
                            Select a verse to view tafsir, add notes, or reflect.
                        </p>
                        <div className={styles.actions}>
                            <Button variant="secondary" size="sm">Add Note</Button>
                            <Button variant="ghost" size="sm">View Tafsir</Button>
                        </div>
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <p>Select a verse to see details.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
