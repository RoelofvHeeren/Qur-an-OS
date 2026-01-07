"use client";

import React, { useMemo } from "react";
import { BookView } from "@/components/reading/BookView";
import { VersePage } from "@/components/reading/VersePage";
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
const VERSES_PER_PAGE = 7;

export default function ReadingPage() {
    // Transform Quran Data into Pages
    const pages = useMemo(() => {
        const allPages: PageData[] = [];

        (quranData as Surah[]).forEach((surah) => {
            const totalVerses = surah.verses.length;

            // If Surah has no verses (sanity check), skip or just show intro
            if (totalVerses === 0) {
                allPages.push({
                    verses: [],
                    surahInfo: {
                        name: surah.name,
                        arabicName: surah.arabicName,
                        number: surah.number,
                        intro: surah.intro
                    }
                });
                return;
            }

            for (let i = 0; i < totalVerses; i += VERSES_PER_PAGE) {
                const chunk = surah.verses.slice(i, i + VERSES_PER_PAGE);

                // For the first page of a Surah, include Info
                if (i === 0) {
                    allPages.push({
                        verses: chunk,
                        surahInfo: {
                            name: surah.name,
                            arabicName: surah.arabicName,
                            number: surah.number,
                            intro: surah.intro
                        }
                    });
                } else {
                    allPages.push({
                        verses: chunk
                    });
                }
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
                    return (
                        <div className="w-full h-full p-8 overflow-y-auto">
                            {page.surahInfo && (
                                <div className="mb-6 text-center border-b pb-4 border-gray-200">
                                    <h2 className="text-3xl font-serif text-primary mb-1">
                                        {page.surahInfo.number}. {page.surahInfo.name}
                                    </h2>
                                    <h3 className="text-xl font-arabic text-primary-soft mb-4">
                                        {page.surahInfo.arabicName}
                                    </h3>
                                    {page.surahInfo.intro && (
                                        <p className="text-sm text-gray-500 italic leading-relaxed text-justify">
                                            {page.surahInfo.intro}
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="space-y-4">
                                {page.verses.map((v) => (
                                    <div key={v.id} className="text-lg leading-relaxed">
                                        <span className="text-xs text-primary font-bold mr-2 border rounded-full w-6 h-6 inline-flex items-center justify-center">
                                            {v.verse}
                                        </span>
                                        {v.text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                }}
            />
        </div>
    );
}
