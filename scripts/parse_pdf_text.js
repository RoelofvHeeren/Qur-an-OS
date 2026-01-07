const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '../public/quran_knowledge_base.json');
const outputPath = path.join(__dirname, '../src/data/quran_english.json');

function cleanText(text) {
    return text.replace(/\s*--\s+\d+\s+of\s+\d+\s+--\s*/g, ' ') // Remove page markers loosely
        .replace(/\*\*\*/g, '') // Remove *** separators
        .replace(/\[\d+\]/g, '') // Remove footnotes like [3]
        .replace(/\n/g, ' ') // Join lines
        .replace(/\s+/g, ' ') // Normalize spaces
        .trim();
}

function parse() {
    console.log("Reading raw text...");
    const rawData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    let fullText = rawData.fullText;

    // Remove TOC content (start from 2nd occurrence of Surah 1)
    const startMarker = "1. Looking for Start";
    // We know from inspection that the text starts around "1. The Opening" appearing a 2nd time.
    let soupStartIndex = fullText.indexOf("1. The Opening");
    if (soupStartIndex !== -1) {
        soupStartIndex = fullText.indexOf("1. The Opening", soupStartIndex + 1);
    }

    if (soupStartIndex === -1) {
        console.error("Could not find start of Quran text.");
        return;
    }

    // Slice from start
    fullText = fullText.substring(soupStartIndex);

    // Regex to find Surah Headers: 
    // Newline, Number, dot, Space, Name, Newline, (Arabic Name)
    // Example: \n2. The Cow\n(Al-Baqarah)
    const surahHeaderRegex = /\n(\d+)\. ([^\n]+)\n\(([^)]+)\)/g;

    // We can't simple split because we need the headers.
    // We will find all matches and their indices.
    const matches = [];
    let match;
    // Add "1. The Opening" manually as the regex expects \n before it, but we sliced right at it (or close).
    // Actually, let's prepend \n to fullText to make regex work or adjust regex.
    fullText = "\n" + fullText;

    while ((match = surahHeaderRegex.exec(fullText)) !== null) {
        matches.push({
            number: parseInt(match[1]),
            name: match[2].trim(),
            arabicName: match[3].trim(),
            index: match.index,
            fullMatch: match[0]
        });
    }

    console.log(`Found ${matches.length} Surahs.`);

    const surahs = [];
    const seenSurahs = new Set();
    // End marker for the whole quran to avoid parsing index
    // The Clear Quran usually ends with "THEMATIC INDEX" or similar.
    // We can also just ignore matches that appear after we have found 114 Surahs?

    // Sort matches by index to be sure? Regex loop does that.

    for (let i = 0; i < matches.length; i++) {
        const current = matches[i];

        if (seenSurahs.has(current.number)) {
            console.log(`Skipping duplicate Surah ${current.number} (Found at index ${current.index})`);
            continue;
        }
        seenSurahs.add(current.number);

        const next = matches[i + 1];

        const startParams = current.index + current.fullMatch.length;
        // If S114, stop at "THEMATIC INDEX" or just take a reasonable chunk or look for specific end.
        let endParams = next ? next.index : fullText.length;

        if (current.number === 114) {
            // Look for probable end of S114
            const s114EndMarker = "from the jinn and humans"; // Common translation
            const s114EndMaker2 = "from the jinn and human"; // Variant

            // Search in the remaining text
            const remaining = fullText.substring(startParams);
            let cutoff = remaining.toLowerCase().indexOf("jinn and human");
            if (cutoff !== -1) {
                // Add some buffer for the period/quote
                cutoff += 30;
                endParams = startParams + cutoff;
            }
        }

        let content = fullText.substring(startParams, endParams);

        // Clean page markers from content immediately
        content = content.replace(/\n\n-- \d+ of \d+ --\n\n/g, ' ');

        // Split Intro and Verses
        // Usually verses start with "1. " OR "In the Name of Allah"
        // But headers like "Qualities of..." exist.
        // For S1: Starts with "This Meccan... Prayer for... 1. In the Name..."
        // For S2: Starts with "This Medinian... ... Jewish attitudes... In the Name of Allah... Qualities... 1. Alif..."

        // Strategy: Look for "1. ". verify it follows a newline or space?
        // Actually, just find the first "1. ". Everything before it is intro + Bismillah (if any).
        // Exception: S1 V1 is Bismillah. S2 V1 is Alif Lam Mim. Bismillah is before S2 V1.

        // Regex with word boundary might fail if preceded by weird chars.
        // Try strict "1." followed by ANY whitespace (space or newline)
        const v1IndexRegex = /(?:^|\s)1\.\s/;
        const v1Match = content.match(v1IndexRegex);

        if (v1Match) {
            // Index of the match start
            // We want to skip "1." and the whitespace?
            // Actually, we want to split right at the start of "1." so that the verse loop finds it.
            // So we split BEFORE "1."
            const idx = v1Match.index + (v1Match[0].match(/^\s/) ? 1 : 0); // Skip leading whitespace if matched
            intro = content.substring(0, idx).trim();
            versesBlock = content.substring(idx);
        } else {
            // For S9 (Tawbah), there is no "1. ", it just starts? 
            // Actually S9 usually starts with verse 1 without Bismillah, but still "1. "
            // If not found, check if S9.
            if (current.number === 9) {
                // S9 might just start.
                intro = "This is a declaration of dissociation..."; // Approx intro
                versesBlock = content;
            } else {
                console.warn(`No verses found for Surah ${current.number}`);
                intro = content;
            }
        }

        // Parse Verses
        // Split by "\d+." followed by whitespace
        const verseRegex = /(\d+)\.\s/g;
        const verseMatches = [];
        let vMatch;
        while ((vMatch = verseRegex.exec(versesBlock)) !== null) {
            // Safety: Verse number should be sequential or close? 
            // Discard "54." if we are expecting "7."?
            // For now just capture all.
            verseMatches.push({
                num: parseInt(vMatch[1]),
                index: vMatch.index,
                fullMatch: vMatch[0]
            });
        }

        const verses = [];
        for (let j = 0; j < verseMatches.length; j++) {
            const vCur = verseMatches[j];

            // Check sequence. If vCur.num > j + 5 (allow some gap but not 50), might be garbage?
            // S114 only has 6 verses. If we see verse 54, it's garbage.
            if (current.number === 114 && vCur.num > 6) continue;

            const vNext = verseMatches[j + 1];

            // Text starts after the match
            const vStart = vCur.index + vCur.fullMatch.length;
            const end = vNext ? vNext.index : versesBlock.length;

            let vText = versesBlock.substring(vStart, end);
            vText = cleanText(vText);

            verses.push({
                id: `${current.number}:${vCur.num}`,
                surah: current.number,
                verse: vCur.num,
                text: vText,
                translation: vText
            });
        }

        surahs.push({
            number: current.number,
            name: current.name,
            arabicName: current.arabicName,
            intro: cleanText(intro),
            verses: verses
        });
    }

    // Create output directory if not exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(outputPath, JSON.stringify(surahs, null, 2));
    console.log(`Saved structured Quran to ${outputPath}`);
}

parse();
