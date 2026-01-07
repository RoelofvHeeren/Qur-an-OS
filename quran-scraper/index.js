
const { chromium } = require('playwright');
const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '../.env' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error("FATAL: DATABASE_URL is not defined in ../.env or environment variables.");
    process.exit(1);
}

const client = new Client({
    connectionString: DATABASE_URL,
});

const TOTAL_SURAHS = 114;
const BASE_URL = 'https://www.javedahmadghamidi.com/quran';

async function setupDatabase() {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected.');

    const schema = `
    CREATE TABLE IF NOT EXISTS surahs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      number INTEGER UNIQUE NOT NULL,
      name_arabic TEXT,
      name_english TEXT,
      introduction TEXT,
      source_url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS paragraphs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      surah_id UUID REFERENCES surahs(id) ON DELETE CASCADE,
      paragraph_index INTEGER NOT NULL,
      section_title TEXT
    );

    CREATE TABLE IF NOT EXISTS ayahs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        surah_id UUID REFERENCES surahs(id) ON DELETE CASCADE,
        paragraph_id UUID REFERENCES paragraphs(id) ON DELETE SET NULL,
        ayah_number INTEGER NOT NULL,
        arabic_text TEXT NOT NULL,
        translation_text TEXT NOT NULL,
        translator TEXT NOT NULL DEFAULT 'Javed Ahmad Ghamidi',
        UNIQUE(surah_id, ayah_number)
    );

    CREATE TABLE IF NOT EXISTS footnotes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ayah_id UUID REFERENCES ayahs(id) ON DELETE CASCADE,
      content TEXT NOT NULL
    );
  `;

    await client.query(schema);
    console.log('Schema ensured.');
}

async function scrapeSurah(page, surahNumber) {
    // Force English language via URL parameter
    const url = `${BASE_URL}?chapter=${surahNumber}&paragraph=1&type=Ghamidi&language=en`;
    console.log(`\nNavigating to Surah ${surahNumber}: ${url}`);

    // Update status
    try {
        fs.writeFileSync('status.json', JSON.stringify({
            surah: surahNumber,
            status: 'Navigating',
            paragraph: 0,
            total_paragraphs: 0,
            timestamp: Date.now()
        }));
    } catch (e) { }

    let attempts = 0;
    while (attempts < 3) {
        try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
            break;
        } catch (e) {
            attempts++;
            console.warn(`Attempt ${attempts} failed to load ${url}: ${e.message}`);
            if (attempts === 3) throw e;
            await page.waitForTimeout(2000);
        }
    }

    try {
        await page.waitForSelector('div.mt-2.font-normal', { timeout: 30000 });
    } catch (e) {
        console.warn('Timeout waiting for paragraph container. Content may be delayed.');
    }

    await autoScroll(page);

    // Metadata - Improved selectors based on subagent findings
    let nameArabic = '';
    let nameEnglish = '';

    try {
        // Try precise selectors first
        const surahTriggers = await page.locator('a.mat-mdc-menu-trigger').all();
        // Look for the one that likely contains the Surah name (checking index 4 as per findings, or content)
        for (const trigger of surahTriggers) {
            const txt = await trigger.textContent();
            if (txt && (txt.includes('Al-') || txt.includes('Surah') || txt.match(/^\d+\./))) {
                const parts = txt.split('-').map(s => s.trim());
                if (parts.length > 1) {
                    nameEnglish = parts[0].replace(/^[0-9]+\.\s*/, '');
                    nameArabic = parts[1];
                } else {
                    nameEnglish = txt;
                }
                break;
            }
        }
    } catch (e) { console.warn("Metadata extraction warning:", e); }

    // Intro
    let introduction = '';
    const introBtn = page.locator('mat-card button').filter({ hasText: /Introduction|تعارف/ }).first();
    if (await introBtn.isVisible().catch(() => false)) {
        await introBtn.click();
        try {
            await page.waitForSelector('div.mat-mdc-dialog-content', { timeout: 5000 });
            introduction = await page.textContent('div.mat-mdc-dialog-content');
            await page.keyboard.press('Escape');
            await page.waitForTimeout(500);
        } catch (e) { console.warn('Intro dialog issue:', e.message); }
    }

    // Wait until text is actually present in the first Arabic block
    try {
        await page.waitForFunction(() => {
            const el = document.querySelector('.cnt-ar');
            return el && el.innerText.length > 10;
        }, { timeout: 10000 });
    } catch (e) { console.warn("Wait for Arabic text timed out, proceeding anyway..."); }

    const paragraphsLocator = page.locator('div.mt-2.font-normal');
    const pCount = await paragraphsLocator.count();
    console.log(`Found ${pCount} paragraphs.`);

    const paragraphsData = [];

    for (let i = 0; i < pCount; i++) {
        if ((i + 1) % 10 === 0 || i === 0) console.log(`  > Processing Paragraph ${i + 1} of ${pCount}...`);

        // Update status Loop
        try {
            fs.writeFileSync('status.json', JSON.stringify({
                surah: surahNumber,
                surahName: nameEnglish,
                status: 'Processing',
                paragraph: i + 1,
                total_paragraphs: pCount,
                timestamp: Date.now()
            }));
        } catch (e) { }

        const pLoc = paragraphsLocator.nth(i);

        // Section Title
        const sectionTitle = await pLoc.locator('p.cnt-ur').first().textContent().catch(() => null);

        // Arabic
        const arabicBlock = pLoc.locator('.cnt-ar').first();
        const arabicTextFull = await arabicBlock.textContent().catch(() => '');

        // Translation - CRITICAL FIX: Ensure we get LTR content which is English
        const translationBlock = pLoc.locator('div[style*="direction: ltr"]').first();
        const translationTextFull = await translationBlock.innerText().catch(() => '');

        if (!translationTextFull) {
            // Last ditch check - maybe the English didn't load?
            // console.warn(`Warning: Empty translation for paragraph ${i+1}`);
        }

        // Footnotes - Optimized
        let footnotes = [];
        const fnBtn = pLoc.locator('button').filter({ hasText: /Footnotes|فوٹ نوٹ/ }).first();

        if (await fnBtn.count() > 0 && await fnBtn.isVisible()) {
            try {
                await fnBtn.scrollIntoViewIfNeeded();
                await fnBtn.click({ timeout: 1000 });
                const dialog = page.locator('div.mat-mdc-dialog-content');
                await dialog.waitFor({ state: 'visible', timeout: 2000 });
                const fnText = await dialog.innerText();
                footnotes = parseFootnotes(fnText);
                await page.keyboard.press('Escape');
                await page.waitForTimeout(100);
            } catch (e) {
                try { await page.keyboard.press('Escape'); } catch (k) { }
            }
        }

        const ayahs = parseAyahs(arabicTextFull, translationTextFull, footnotes);

        if (ayahs.length === 0 && arabicTextFull.length > 10) {
            // Fallback
            ayahs.push({
                num: 0,
                arabic: arabicTextFull.trim(),
                translation: translationTextFull.trim(),
                footnotes: footnotes
            });
        }

        paragraphsData.push({
            index: i + 1,
            section_title: sectionTitle,
            ayahs: ayahs
        });
    }

    return {
        number: surahNumber,
        name_arabic: nameArabic,
        name_english: nameEnglish,
        introduction: introduction,
        source_url: url,
        paragraphs: paragraphsData
    };
}

function parseAyahs(arabicFull, transFull, footnotesAll) {
    const ayahSplitter = /﴿[\d\u0660-\u0669\u06F0-\u06F9]+﴾/g;
    const markers = arabicFull.match(ayahSplitter) || [];
    const parts = arabicFull.split(ayahSplitter);
    let arabicSegments = parts.filter(s => s.trim().length > 0);

    const getNum = (m) => {
        const inner = m.replace(/[﴿﴾]/g, '');
        const map = {
            '۰': 0, '１': 1, '２': 2, '３': 3, '４': 4, '５': 5, '６': 6, '７': 7, '۸': 8, '۹': 9,
            '۰': 0, '۱': 1, '۲': 2, '۳': 3, '۴': 4, '۵': 5, '۶': 6, '۷': 7, '۸': 8, '۹': 9
        };
        return parseInt(inner.split('').map(c => map[c] !== undefined ? map[c] : c).join(''));
    };

    const result = [];

    for (let i = 0; i < Math.min(markers.length, arabicSegments.length); i++) {
        const marker = markers[i];
        const num = getNum(marker);
        const txt = arabicSegments[i] || "";

        result.push({
            num: num,
            arabic: txt.trim(),
            translation: transFull.trim(),
            footnotes: footnotesAll
        });
    }

    return result;
}

function parseFootnotes(rawText) {
    const matches = rawText.split(/\d+\./).filter(s => s.trim().length > 0);
    return matches.map((c, i) => ({
        index: i + 1,
        content: c.trim()
    }));
}

async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let lastHeight = document.body.scrollHeight;
            let noChangeCount = 0;
            const timer = setInterval(() => {
                window.scrollTo(0, document.body.scrollHeight);
                const newHeight = document.body.scrollHeight;

                if (newHeight === lastHeight) {
                    noChangeCount++;
                    if (noChangeCount > 30) {
                        clearInterval(timer);
                        resolve();
                    }
                } else {
                    noChangeCount = 0;
                    lastHeight = newHeight;
                }
            }, 100);
        });
    });
}

(async () => {
    try {
        await setupDatabase();
        const browser = await chromium.launch({ headless: true });
        const context = await browser.newContext();
        const page = await context.newPage();

        for (let i = 1; i <= TOTAL_SURAHS; i++) {
            console.log(`Processing Surah ${i}...`);
            try {
                const surahData = await scrapeSurah(page, i);

                await client.query('BEGIN');

                // Delete existing to support idempotency/re-runs
                await client.query('DELETE FROM surahs WHERE number = $1', [surahData.number]);

                const surahRes = await client.query(
                    `INSERT INTO surahs (number, name_arabic, name_english, introduction, source_url)
                   VALUES ($1, $2, $3, $4, $5) RETURNING id`,
                    [surahData.number, surahData.name_arabic, surahData.name_english, surahData.introduction, surahData.source_url]
                );
                const surahId = surahRes.rows[0].id;

                let ayahCount = 0;

                for (const p of surahData.paragraphs) {
                    const paraRes = await client.query(
                        `INSERT INTO paragraphs (surah_id, paragraph_index, section_title)
                       VALUES ($1, $2, $3) RETURNING id`,
                        [surahId, p.index, p.section_title]
                    );
                    const paraId = paraRes.rows[0].id;

                    for (const ayah of p.ayahs) {
                        const ayahRes = await client.query(
                            `INSERT INTO ayahs (surah_id, paragraph_id, ayah_number, arabic_text, translation_text)
                           VALUES ($1, $2, $3, $4, $5) RETURNING id`,
                            [surahId, paraId, ayah.num || (ayahCount + 1), ayah.arabic, ayah.translation]
                        );
                        const ayahId = ayahRes.rows[0].id;
                        ayahCount++;

                        if (ayah.footnotes && ayah.footnotes.length > 0) {
                            for (const fn of ayah.footnotes) {
                                await client.query(
                                    `INSERT INTO footnotes (ayah_id, content) VALUES ($1, $2)`,
                                    [ayahId, fn.content]
                                );
                            }
                        }
                    }
                }

                await client.query('COMMIT');
                console.log(`✓ Surah ${i} Saved. ${ayahCount} Ayahs.`);

            } catch (e) {
                await client.query('ROLLBACK');
                console.error(`✗ Failed Surah ${i}:`, e);
            }
        }

        await browser.close();
        await client.end();

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
})();
