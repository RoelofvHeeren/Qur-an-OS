"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import styles from "./CoursePage.module.css";
import { CheckCircle, Circle, PlayCircle, Lock } from "lucide-react";
import clsx from "clsx";

// Mock Data
const CURRICULUM = [
    {
        id: 1,
        title: "Introduction to Quranic Reflection",
        lessons: 4,
        completed: 4,
        status: "completed",
        modules: [
            { id: 101, title: "The Etiquette of Reading", type: "text" },
            { id: 102, title: "Understanding Revelation", type: "video" },
        ]
    },
    {
        id: 2,
        title: "Deep Dive: Surah Al-Fatiha",
        lessons: 6,
        completed: 2,
        status: "in-progress",
        modules: [
            { id: 201, title: "The 7 Oft-Repeated Verses", type: "text", done: true },
            { id: 202, title: "Names of Allah in Fatiha", type: "text", done: true },
            { id: 203, title: "The Path of Grace", type: "text", done: false },
        ]
    },
    {
        id: 3,
        title: "Stories of the Prophets",
        lessons: 12,
        completed: 0,
        status: "locked",
        modules: []
    }
];

export default function CoursePage() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Course Plan</h1>
                <p className={styles.subtitle}>Structured learning path for spiritual growth.</p>

                <div className={styles.mainProgress}>
                    <div className={styles.progressLabel}>
                        <span>Overall Progress</span>
                        <span>35%</span>
                    </div>
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: "35%" }} />
                    </div>
                </div>
            </header>

            <div className={styles.timeline}>
                {CURRICULUM.map((module, index) => (
                    <div key={module.id} className={styles.moduleWrapper}>
                        <div className={styles.connectorLine} />
                        <div className={styles.statusIcon}>
                            {module.status === "completed" ? (
                                <CheckCircle className={styles.iconCompleted} size={32} />
                            ) : module.status === "locked" ? (
                                <Lock className={styles.iconLocked} size={32} />
                            ) : (
                                <Circle className={styles.iconCurrent} size={32} />
                            )}
                        </div>

                        <Card className={clsx(styles.moduleCard, styles[module.status])}>
                            <div className={styles.moduleHeader}>
                                <div>
                                    <h3 className={styles.moduleTitle}>{module.title}</h3>
                                    <span className={styles.moduleMeta}>
                                        {module.completed}/{module.lessons} Lessons
                                    </span>
                                </div>
                                {module.status === "in-progress" && (
                                    <Button size="sm" icon={<PlayCircle size={16} />}>Continue</Button>
                                )}
                            </div>

                            {/* Lesson List (only if not locked) */}
                            {module.status !== "locked" && (
                                <div className={styles.lessonList}>
                                    {module.modules.map(lesson => (
                                        <div key={lesson.id} className={styles.lessonRow}>
                                            {/* TypeScript safety: check for 'done' if it exists, assume false if not */}
                                            <div className={clsx(styles.lessonCheck, { [styles.done]: (lesson as any).done })} />
                                            <span>{lesson.title}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
}
