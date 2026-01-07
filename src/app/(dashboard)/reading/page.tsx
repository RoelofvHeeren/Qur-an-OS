"use client";

import React from "react";
import { BookView } from "@/components/reading/BookView";
import { VersePage } from "@/components/reading/VersePage";

// Mock Data split into "Pages"
// In a real app, we'd calculate this dynamically based on verse length/surah structure.
const MOCK_PAGES = [
    // Page 1 (Surah Fatiha)
    [
        { id: 1, surah: 1, verse: 1, arabic: "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ", translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful." },
        { id: 2, surah: 1, verse: 2, arabic: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ", translation: "[All] praise is [due] to Allah, Lord of the worlds -" },
        { id: 3, surah: 1, verse: 3, arabic: "ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ", translation: "The Entirely Merciful, the Especially Merciful," },
    ],
    // Page 2 (Fatiha cont.)
    [
        { id: 4, surah: 1, verse: 4, arabic: "مَـٰلِكِ يَوْمِ ٱلدِّينِ", translation: "Sovereign of the Day of Recompense." },
        { id: 5, surah: 1, verse: 5, arabic: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", translation: "It is You we worship and You we ask for help." },
    ],
    // Page 3 (Baqarah start)
    [
        { id: 6, surah: 2, verse: 1, arabic: "الم", translation: "Alif, Lam, Meem." },
        { id: 7, surah: 2, verse: 2, arabic: "ذَٰلِكَ ٱلْكِتَـٰبُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًۭى لِّلْمُتَّقِينَ", translation: "This is the Book about which there is no doubt, a guidance for those conscious of Allah -" },
    ],
    // Page 4
    [
        { id: 8, surah: 2, verse: 3, arabic: "ٱلَّذِينَ يُؤْمِنُونَ بِٱلْغَيْبِ وَيُقِيمُونَ ٱلصَّلَوٰةَ وَمِمَّا رَزَقْنَـٰهُمْ يُنفِقُونَ", translation: "Who believe in the unseen, establish prayer, and spend out of what We have provided for them," },
    ]
];

export default function ReadingPage() {
    return (
        <div style={{ height: "100%", overflow: "hidden" }}>
            <BookView
                totalPages={MOCK_PAGES.length}
                renderPage={(index) => <VersePage verses={MOCK_PAGES[index]} />}
            />
        </div>
    );
}
