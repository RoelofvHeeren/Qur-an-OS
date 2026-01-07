"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, MessageCircleQuestion, Library, GraduationCap, BrainCircuit } from "lucide-react";
import clsx from "clsx";
import styles from "./Sidebar.module.css";

const navItems = [
    { name: "Reading", href: "/reading", icon: BookOpen },
    { name: "Ask", href: "/ask", icon: MessageCircleQuestion },
    { name: "Library", href: "/library", icon: Library },
    { name: "Course", href: "/course", icon: GraduationCap },
    { name: "Quizzes", href: "/quizzes", icon: BrainCircuit },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <h1>Quran OS</h1>
                </div>
                <nav className={styles.nav}>
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={clsx(styles.link, { [styles.active]: isActive })}
                            >
                                <item.icon className={styles.icon} size={24} />
                                <span className={styles.label}>{item.name}</span>
                                {isActive && <div className={styles.activeIndicator} />}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Mobile Bottom Nav */}
            <nav className={styles.bottomNav}>
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(styles.bottomLink, { [styles.active]: isActive })}
                        >
                            <item.icon className={styles.bottomIcon} size={24} />
                            <span className={styles.srOnly}>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}
