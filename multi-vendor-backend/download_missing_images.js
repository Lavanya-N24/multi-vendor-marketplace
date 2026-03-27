const gis = require('g-i-s');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const OUT = path.join(__dirname, '..', 'multi-vendor-frontend', 'public', 'products', 'men');

const queries = [
    // Jackets
    { name: 'men_slim_blazer.png', query: 'men black slim fit casual blazer product photography' },
    { name: 'men_puffer_jacket.png', query: 'men winter puffer jacket product photography' },
    { name: 'men_windbreaker.png', query: 'men windbreaker sports jacket product photography' },
    // Shoes
    { name: 'men_derby_shoes.png', query: 'men black leather derby shoes product photography' },
    { name: 'men_brown_loafers.png', query: 'men brown suede loafers casual shoes product photography' },
    { name: 'men_monk_strap.png', query: 'men monk strap leather shoes product photography' },
    // Sunglasses
    { name: 'men_wayfarer.png', query: 'men black wayfarer sunglasses product photography' },
    { name: 'men_sport_sunglasses.png', query: 'men sport wraparound sunglasses product photography' },
    { name: 'men_clubmaster.png', query: 'men half rim clubmaster sunglasses product photography' },
];

function download(url, dest) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(url);
        const protocol = parsed.protocol === "https:" ? https : http;
        const file = fs.createWriteStream(dest);
        const req = protocol.get(url, { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 10000 }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                file.close();
                return download(res.headers.location, dest).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200 || !res.headers["content-type"].startsWith("image/")) {
                file.close();
                if (fs.existsSync(dest)) fs.unlinkSync(dest);
                return reject(new Error("HTTP " + res.statusCode));
            }
            res.pipe(file);
            file.on("finish", () => { file.close(); resolve(); });
        });
        req.on("error", (err) => { file.close(); if (fs.existsSync(dest)) fs.unlinkSync(dest); reject(err); });
        req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
    });
}

function searchImages(query) {
    return new Promise((resolve, reject) => {
        gis(query, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

const delay = ms => new Promise(r => setTimeout(r, ms));

async function main() {
    if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

    for (let i = 0; i < queries.length; i++) {
        const item = queries[i];
        const dest = path.join(OUT, item.name);

        if (fs.existsSync(dest) && fs.statSync(dest).size > 10000) {
            console.log("[" + (i + 1) + "/" + queries.length + "] SKIP: " + item.name);
            continue;
        }

        console.log("[" + (i + 1) + "/" + queries.length + "] Searching: " + item.name);

        try {
            const results = await searchImages(item.query);

            if (results && results.length > 0) {
                let success = false;
                for (let j = 0; j < Math.min(5, results.length); j++) {
                    const url = results[j].url;
                    try {
                        console.log("  -> Trying: " + url.substring(0, 60));
                        await download(url, dest);
                        const size = fs.statSync(dest).size;
                        // Avoid placeholders
                        if (size > 8000) {
                            console.log("  [OK] Saved (" + (size / 1024).toFixed(0) + " KB)");
                            success = true;
                            break;
                        } else {
                            if (fs.existsSync(dest)) fs.unlinkSync(dest);
                        }
                    } catch (e) {
                        // ignore errors, try next
                    }
                }
                if (!success) console.log("  [FAIL] All 5 attempts failed for " + item.name);
            } else {
                console.log("  [FAIL] No results found from Google Images");
            }
            await delay(1000); // 1s delay
        } catch (err) {
            console.log("  [ERROR] Search failed: " + err.message);
        }
    }
    console.log("Done!");
}

main();
