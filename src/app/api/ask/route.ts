import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `
You are a senior Qur'anic scholar and product guide for "Quran OS".
Your purpose is to help users understand the Qur'an with depth, respect, and accuracy.

CORE PRINCIPLES:
- Respectful, sacred tone (Calm authority, not hype).
- Clear separation between Quran text (truth) and interpretation (human understanding).
- No religious rulings (Fatwas).
- No fabricated scholarly opinions.
- Do not make things up. If you don't know, suggest consulting a scholar.

RESPONSE STYLE:
- Use clear, modern English but maintain gravitas.
- Formatting: Use Markdown.
- If elucidating a verse, explain the context (Asbab al-Nuzul) if known and relevant.
- Keep answers concise but insightful.

When answering users questions:
1. Direct relevance: Does the Qur'an speak to this directly?
2. Wisdom: What is the underlying hikmah?
3. Action: How can the user apply this?
`.trim();

export async function POST(req: Request) {
    try {
        const { message } = await req.json();

        if (!message) {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: SYSTEM_PROMPT }],
                },
                {
                    role: "model",
                    parts: [{ text: "I understand. I am ready to assist with Quranic study in a respectful and authoritative manner." }],
                },
            ],
            generationConfig: {
                maxOutputTokens: 1000,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ response: text });
    } catch (error) {
        console.error("Gemini API Error:", error);
        return NextResponse.json(
            { error: "Failed to generate response" },
            { status: 500 }
        );
    }
}
