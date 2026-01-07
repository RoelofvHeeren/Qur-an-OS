
const { chromium } = require('playwright');
const { Client } = require('pg');
require('dotenv').config({ path: '../.env' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error("FATAL: DATABASE_URL is not defined.");
    process.exit(1);
}

const client = new Client({ connectionString: DATABASE_URL });

const BASE_URL = 'https://www.javedahmadghamidi.com/quran';

async function setupDatabase() {
    await client.connect();
    // (Schema setup omitted for debug speed, assuming exists)
    // Actually, ensure we don't crash on insert if table missing (it exists)
}

async function scrapeSurah(page, surahNumber) {
    const url = `${BASE_URL}?chapter=${surahNumber}&paragraph=1&type=Ghamidi`;
    console.log(`\nNavigating to Surah ${surahNumber}: ${url}`);

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Check paragraphs
    try {
        await page.waitForSelector('div.mt-2.font-normal', { timeout: 10000 });
    } catch (e) {
        console.log("No paragraph found immediately.");
    }

    // Auto scroll
    await autoScroll(page);

    // Debug Paragraphs
    const paragraphsLocator = page.locator('div.mt-2.font-normal');
    const pCount = await paragraphsLocator.count();
    console.log(`DEBUG: Surah ${surahNumber} - Found ${pCount} paragraph containers.`);

    const paragraphsData = [];

    for (let i = 0; i < pCount; i++) {
        const pLoc = paragraphsLocator.nth(i);

        // Debug Text Extraction
        const arabicBlock = pLoc.locator('.cnt-ar').first();
        const arabicTextFull = await arabicBlock.textContent().catch(() => 'ERR');
        const translationTextFull = await pLoc.locator('div[style*="text-align: left"] p, .english-font').first().textContent().catch(() => 'ERR');

        console.log(`DEBUG: Para ${i + 1} Arabic Length: ${arabicTextFull.length}`);
        console.log(`DEBUG: Para ${i + 1} Arabic Snippet: ${arabicTextFull.substring(0, 50)}...`);
        console.log(`DEBUG: Para ${i + 1} Trans Length: ${translationTextFull.length}`);

        const ayahs = parseAyahs(arabicTextFull, translationTextFull);
        console.log(`DEBUG: Para ${i + 1} Parsed Ayahs: ${ayahs.length}`);

        paragraphsData.push({ ayahs: ayahs });
    }

    return { number: surahNumber, paragraphs: paragraphsData };
}

function parseAyahs(arabicFull, transFull) {
    // Escaped regex for safe printing: /[:start_ayah:][\d\u0660-\u0669]+[:end_ayah:]/
    // Real regex:
    const ayahSplitter = /﴿[\d\u0660-\u0669]+﴾/g;
    const markers = arabicFull.match(ayahSplitter) || [];
    console.log(`DEBUG: Markers found: ${markers.length} -> ${markers.slice(0, 3)}...`);

    const parts = arabicFull.split(ayahSplitter);
    let arabicSegments = parts.filter(s => s.trim().length > 0);

    const result = [];
    // Basic mapping logic
    markers.forEach((m, idx) => {
        result.push({ num: idx });
    });
    return result;
}

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 200; // Increase speed
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 50); // Faster tick
        });
    });
}

(async () => {
    try {
        await setupDatabase();
        const browser = await chromium.launch({ headless: true }); // headless
        const context = await browser.newContext();
        const page = await context.newPage();

        // DEBUG: ONLY SURAH 1 (Fatiha) and 2 (Baqarah)
        for (let i = 1; i <= 2; i++) {
            await scrapeSurah(page, i);
        }

        await browser.close();
        await client.end();

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})();
