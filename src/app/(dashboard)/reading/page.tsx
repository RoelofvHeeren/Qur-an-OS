"use client";

import React, { useMemo } from "react";
import { BookView } from "@/components/reading/BookView";
import quranData from "@/data/quran_english.json";

// Types
type Verse = {
    id: string;
    surah: number;
    verse: number;
    text: string;
    translation: string;
};

type Surah = {
    number: number;
    name: string;
    arabicName: string;
    intro: string;
    verses: Verse[];
};

type PageData = {
    verses: Verse[];
    surahInfo?: {
        name: string;
        arabicName: string;
        number: number;
        intro: string;
    };
};

// Configuration
const MAX_CHARS_PER_PAGE = 1100; // Tweaked to prevent overflow

export default function ReadingPage() {
    // Transform Quran Data into Pages
    const pages = useMemo(() => {
        const allPages: PageData[] = [];

        (quranData as Surah[]).forEach((surah) => {
            const totalVerses = surah.verses.length;
            let currentVerseIndex = 0;

            // Handle Introduction
            // If Introduction is very long, it might take a whole page or multiple pages
            // For now, we assume intro fits on one page, possibly with few verses.

            let firstPage = true;

            while (currentVerseIndex < totalVerses || firstPage) {
                let currentWeight = 0;
                let pageVerses: Verse[] = [];
                let surahInfo = undefined;

                if (firstPage) {
                    surahInfo = {
                        name: surah.name,
                        arabicName: surah.arabicName,
                        number: surah.number,
                        intro: surah.intro
                    };
                    currentWeight += (surah.intro ? surah.intro.length : 0) + 300; // Header overhead
                    firstPage = false;

                    // If Intro is massive, we might not fit any verses.
                    // But if it's empty surah (sanity), break.
                    if (totalVerses === 0) {
                        allPages.push({ verses: [], surahInfo });
                        break;
                    }
                }

                // Add verses until full
                while (currentVerseIndex < totalVerses) {
                    const verse = surah.verses[currentVerseIndex];
                    const verseWeight = verse.text.length + 80; // Increased weight per verse for more padding

                    if (currentWeight + verseWeight > MAX_CHARS_PER_PAGE && pageVerses.length > 0) {
                        // Page full
                        break;
                    }

                    pageVerses.push(verse);
                    currentWeight += verseWeight;
                    currentVerseIndex++;
                }

                allPages.push({
                    verses: pageVerses,
                    surahInfo: surahInfo
                });
            }
        });

        return allPages;
    }, []);

    return (
        <div className="w-full h-full text-black">
            <BookView
                totalPages={pages.length}
                renderPage={(index) => {
                    const page = pages[index];
                    // Even/Odd page logic for styling (margins). 
                    // BookView puts margins: Left Page (Right Margin), Right Page (Left Margin) mainly visually.
                    // We just center content.

                    // Calculate if we need vertical scroll just in case (as safety)
                    return (
                        <div className="w-full h-full px-12 py-12 flex flex-col items-center overflow-hidden">
                            <div className="w-full max-w-xl h-full flex flex-col">
                                {page.surahInfo && (
                                    <div className="mb-8 text-center border-b border-gray-100 pb-6 shrink-0">
                                        <div className="flex items-center justify-center gap-3 mb-2">
                                            <span className="text-xs font-bold tracking-widest text-primary/60 uppercase">Surah {page.surahInfo.number}</span>
                                        </div>
                                        <h2 className="text-4xl font-serif text-primary mb-2">
                                            {page.surahInfo.name}
                                        </h2>
                                        <h3 className="text-xl font-arabic text-primary-soft mb-4 dir-rtl">
                                            {page.surahInfo.arabicName}
                                        </h3>
                                        {page.surahInfo.intro && (
                                            <p className="text-sm text-gray-500 italic leading-relaxed text-justify px-4">
                                                {page.surahInfo.intro}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-6 flex-1 overflow-y-auto pr-2 scrollbar-thin">
                                    {page.verses.map((v) => (
                                        <div key={v.id} className="relative pl-10 group">
                                            <span className="absolute left-0 top-1 w-8 h-8 flex items-center justify-center border border-primary/20 bg-primary/5 text-primary text-xs font-serif rounded-full group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                                {v.verse}
                                            </span>
                                            <p className="text-lg leading-loose text-gray-800 font-reading">
                                                {v.text}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                }}
            />
        </div>
    );
}
