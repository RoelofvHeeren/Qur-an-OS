"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import styles from "./LibraryPage.module.css";
import { Bookmark, PenTool, Search } from "lucide-react";
import clsx from "clsx";

// Mock Data
const MOCK_BOOKMARKS = [
    { id: 1, surah: 2, verse: 255, title: "Ayatul Kursi", date: "2 mins ago" },
    { id: 2, surah: 18, verse: 10, title: "Cave Sleepers Prayer", date: "2 days ago" },
];

const MOCK_NOTES = [
    { id: 1, title: "Reflection on Patience", snippet: "Sabr is not just waiting, it is attitude...", date: "Yesterday" },
    { id: 2, title: "Quranic Daily Habit", snippet: "Plan to read 10 verses after Fajr.", date: "Last Week" },
];

type Tab = "bookmarks" | "notes";

export default function LibraryPage() {
    const [activeTab, setActiveTab] = useState<Tab>("bookmarks");

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Library</h1>
                <p className={styles.subtitle}>Your personal collection of verses and reflections.</p>
            </header>

            <div className={styles.controls}>
                <div className={styles.tabs}>
                    <button
                        className={clsx(styles.tab, { [styles.activeTab]: activeTab === "bookmarks" })}
                        onClick={() => setActiveTab("bookmarks")}
                    >
                        <Bookmark size={18} />
                        Bookmarks
                    </button>
                    <button
                        className={clsx(styles.tab, { [styles.activeTab]: activeTab === "notes" })}
                        onClick={() => setActiveTab("notes")}
                    >
                        <PenTool size={18} />
                        Notes
                    </button>
                </div>
                <div className={styles.searchWrapper}>
                    <Search size={18} className={styles.searchIcon} />
                    <input type="text" placeholder="Search..." className={styles.searchInput} />
                </div>
            </div>

            <div className={styles.grid}>
                {activeTab === "bookmarks" ? (
                    MOCK_BOOKMARKS.map((item) => (
                        <Card key={item.id} className={styles.itemCard}>
                            <div className={styles.cardHeader}>
                                <span className={styles.tag}>Surah {item.surah}:{item.verse}</span>
                                <span className={styles.date}>{item.date}</span>
                            </div>
                            <h3 className={styles.cardTitle}>{item.title}</h3>
                        </Card>
                    ))
                ) : (
                    MOCK_NOTES.map((item) => (
                        <Card key={item.id} className={styles.itemCard}>
                            <div className={styles.cardHeader}>
                                <span className={styles.tag}>Note</span>
                                <span className={styles.date}>{item.date}</span>
                            </div>
                            <h3 className={styles.cardTitle}>{item.title}</h3>
                            <p className={styles.cardSnippet}>{item.snippet}</p>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
