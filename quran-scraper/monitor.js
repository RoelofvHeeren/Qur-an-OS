const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config({ path: '../.env' });

const client = new Client({ connectionString: process.env.DATABASE_URL });

(async () => {
    try {
        await client.connect();

        console.clear();
        console.log("Quran Scraper Progress Monitor");
        console.log("===============================");

        setInterval(async () => {
            const surahs = await client.query('SELECT count(*) FROM surahs');
            const ayahs = await client.query('SELECT count(*) FROM ayahs');
            const recent = await client.query('SELECT translation_text FROM ayahs ORDER BY id DESC LIMIT 1');

            let liveStatus = { status: 'Waiting...' };
            try {
                if (fs.existsSync('status.json')) {
                    const data = fs.readFileSync('status.json', 'utf8');
                    liveStatus = JSON.parse(data);
                }
            } catch (e) { }

            console.clear();
            console.log("Quran Scraper Progress Monitor");
            console.log("===============================");
            console.log(`Surahs Completed: ${surahs.rows[0].count} / 114`);
            console.log(`Ayahs Saved:      ${ayahs.rows[0].count}`);
            console.log("-------------------------------");
            console.log("LIVE STATUS:");
            if (liveStatus.surah) {
                console.log(`Current Surah:    ${liveStatus.surah} (${liveStatus.surahName || ''})`);
                console.log(`Status:           ${liveStatus.status}`);
                if (liveStatus.paragraph) {
                    const pct = Math.round((liveStatus.paragraph / liveStatus.total_paragraphs) * 100);
                    console.log(`Paragraph:        ${liveStatus.paragraph} / ${liveStatus.total_paragraphs} (${pct}%)`);
                    const bar = '[' + '='.repeat(Math.floor(pct / 5)) + ' '.repeat(20 - Math.floor(pct / 5)) + ']';
                    console.log(`Progress:         ${bar}`);
                }
            } else {
                console.log("Waiting for new status...");
            }
            console.log("-------------------------------");
            console.log("Latest Ayah excerpt (from DB):");
            if (recent.rows.length > 0) {
                console.log(recent.rows[0].translation_text.substring(0, 100) + "...");
            }
            console.log("-------------------------------");
            console.log("Press Ctrl+C to exit monitor (Scraper continues in background)");
        }, 1000);

    } catch (e) {
        console.error(e);
    }
})();
