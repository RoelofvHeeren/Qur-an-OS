"use client";

import React, { useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import styles from "./AskPage.module.css";
import clsx from "clsx";

interface Message {
    role: "user" | "ai";
    content: string;
}

export default function AskPage() {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
        setIsLoading(true);

        try {
            const res = await fetch("/api/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage }),
            });

            const data = await res.json();

            if (data.response) {
                setMessages((prev) => [...prev, { role: "ai", content: data.response }]);
            } else {
                throw new Error(data.error || "Failed to get response");
            }
        } catch (error) {
            console.error("Ask Error:", error);
            setMessages((prev) => [
                ...prev,
                { role: "ai", content: "I apologize, but I am unable to connect at the moment coversation services." },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleWrapper}>
                    <Sparkles className={styles.icon} size={24} />
                    <h1>Ask</h1>
                </div>
                <p className={styles.subtitle}>
                    Explore the Qur'an with specific questions or topics.
                </p>
            </header>

            <div className={styles.chatArea}>
                {messages.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>Ask about a concept, verse, or historical context.</p>
                        <div className={styles.suggestions}>
                            {["Patience (Sabr)", "Justice in usage", "Story of Musa (AS)"].map((s) => (
                                <button
                                    key={s}
                                    className={styles.suggestionChip}
                                    onClick={() => setInput(s)}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className={styles.messages}>
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={clsx(styles.message, m.role === "user" ? styles.user : styles.ai)}
                            >
                                <div className={styles.messageContent}>
                                    {/* Simple markdown rendering could go here, for now just text */}
                                    {m.content.split('\n').map((line, idx) => (
                                        <p key={idx}>{line}</p>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className={clsx(styles.message, styles.ai)}>
                                <div className={styles.typingIndicator}>Thinking...</div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <form className={styles.inputArea} onSubmit={handleSubmit}>
                <div className={styles.inputWrapper}>
                    <input
                        type="text"
                        className={styles.input}
                        placeholder="Ask a question..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        disabled={!input.trim() || isLoading}
                        className={styles.sendButton}
                        icon={<Send size={16} />}
                    >
                        Ask
                    </Button>
                </div>
            </form>
        </div>
    );
}
