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
const MAX_CHARS_PER_PAGE = 1000; // Increased for wider layout

export default function ReadingPage() {
    console.log("[QuranOS] BookView Upgrade v4 (Wide) Loaded");
    // Transform Quran Data into Pages
    const pages = useMemo(() => {
        const allPages: PageData[] = [];

        (quranData as Surah[]).forEach((surah) => {
            const totalVerses = surah.verses.length;
            let currentVerseIndex = 0;
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
                    // Increase header weight impact
                    currentWeight += (surah.intro ? surah.intro.length : 0) + 400;
                    firstPage = false;

                    if (totalVerses === 0) {
                        allPages.push({ verses: [], surahInfo });
                        break;
                    }
                }

                while (currentVerseIndex < totalVerses) {
                    const verse = surah.verses[currentVerseIndex];
                    const verseWeight = verse.text.length + 100; // High padding weight

                    if (currentWeight + verseWeight > MAX_CHARS_PER_PAGE && pageVerses.length > 0) {
                        break;
                    }

                    pageVerses.push(verse);
                    currentWeight += verseWeight;
                    currentVerseIndex++;
                }

                allPages.push({ verses: pageVerses, surahInfo: surahInfo });
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
                    if (!page) return <div className="w-full h-full bg-[#FFFDF9]" />;

                    return (
                        <div className="w-full h-full px-16 py-20 flex flex-col items-center overflow-hidden">
                            <div className="w-full max-w-3xl h-full flex flex-col">
                                {page.surahInfo && (
                                    <div className="mb-12 text-center border-b-2 border-gray-100 pb-8 shrink-0">
                                        <div className="flex items-center justify-center gap-3 mb-4">
                                            <span className="text-xs font-bold tracking-[0.2em] text-gray-600 uppercase bg-gray-100 px-3 py-1.5 rounded-full">Surah {page.surahInfo.number}</span>
                                        </div>
                                        <h2 className="text-5xl font-serif text-primary mb-3">
                                            {page.surahInfo.name}
                                        </h2>
                                        <h3 className="text-2xl font-arabic text-primary-soft mb-6 dir-rtl opacity-80">
                                            {page.surahInfo.arabicName}
                                        </h3>
                                        {page.surahInfo.intro && (
                                            <p className="text-base text-gray-500 italic leading-loose text-justify px-4 font-serif">
                                                {page.surahInfo.intro}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="flex-1 overflow-y-auto pr-4 scrollbar-thin">
                                    {page.verses.map((v) => (
                                        <div key={v.id} className="relative mb-10 pl-14 group">
                                            <span className="absolute left-0 top-1 w-10 h-10 flex items-center justify-center border-2 border-primary/10 bg-white text-primary text-sm font-serif rounded-full shadow-sm group-hover:border-primary/50 group-hover:text-primary-dark transition-all duration-300">
                                                {v.verse}
                                            </span>
                                            <p className="text-xl leading-[2.2] text-gray-800 font-reading tracking-wide">
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
