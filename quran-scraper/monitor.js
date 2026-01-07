const { Client } = require('pg');
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

            console.clear();
            console.log("Quran Scraper Progress Monitor");
            console.log("===============================");
            console.log(`Surahs Completed: ${surahs.rows[0].count} / 114`);
            console.log(`Ayahs Saved:      ${ayahs.rows[0].count}`);
            console.log("-------------------------------");
            if (recent.rows.length > 0) {
                console.log("Latest Ayah excerpt:");
                console.log(recent.rows[0].translation_text.substring(0, 100) + "...");
            }
            console.log("-------------------------------");
            console.log("Press Ctrl+C to exit monitor (Scraper continues in background)");
        }, 2000);

    } catch (e) {
        console.error(e);
    }
})();
