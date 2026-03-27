const { image_search } = require('duckduckgo-images-api');
const fs = require('fs');
const path = require('path');
const https = require('https');

const OUT = path.join(__dirname, '..', 'multi-vendor-frontend', 'public', 'products', 'men');

const queries = [
    // Shirts (5 unique)
    { name: 'men_white_oxford.png', query: 'Myntra young man wearing white oxford formal shirt product photo' },
    { name: 'men_blue_formal.png', query: 'Amazon young man wearing blue slim fit formal shirt product photo' },
    { name: 'men_striped_formal.png', query: 'Myntra young man wearing striped formal shirt product photo' },
    { name: 'men_white_dress.png', query: 'Amazon young man wearing white dress shirt with tie product photo' },
    { name: 'men_black_shirt.png', query: 'Myntra young man wearing black formal shirt product photo' },
    // Casual/T-Shirts (11 unique)
    { name: 'men_white_polo.png', query: 'Myntra young man wearing white polo collar tshirt product photo' },
    { name: 'men_black_polo.png', query: 'Amazon young man wearing black polo collar tshirt product photo' },
    { name: 'men_navy_polo.png', query: 'Myntra young man wearing navy blue polo tshirt product photo' },
    { name: 'men_white_crewneck.png', query: 'Amazon young man wearing plain white crew neck tshirt product photo' },
    { name: 'men_black_crewneck.png', query: 'Myntra young man wearing plain black round neck tshirt product photo' },
    { name: 'men_graphic_white.png', query: 'Amazon young man wearing white oversized graphic print tshirt streetwear product photo' },
    { name: 'men_grey_vneck.png', query: 'Myntra young man wearing grey v-neck tshirt product photo' },
    { name: 'men_maroon_fullsleeve.png', query: 'Amazon young man wearing maroon full sleeves casual shirt product photo' },
    { name: 'men_beige_linen.png', query: 'Myntra young man wearing beige linen casual beach shirt product photo' },
    { name: 'men_olive_henley.png', query: 'Amazon young man wearing olive green henley neck tshirt product photo' },
    { name: 'men_blue_denim_shirt.png', query: 'Myntra young man wearing blue denim casual shirt product photo' },
    // Jeans (6 unique)
    { name: 'men_black_jeans.png', query: 'Myntra young man wearing black straight fit jeans full body product photo' },
    { name: 'men_blue_jeans_regular.png', query: 'Amazon young man wearing blue regular fit jeans full body product photo' },
    { name: 'men_darkwash_jeans.png', query: 'Myntra young man wearing dark indigo wash denim jeans full body product photo' },
    { name: 'men_grey_slim_jeans.png', query: 'Amazon young man wearing grey slim fit jeans full body product photo' },
    { name: 'men_lightblue_jeans.png', query: 'Myntra young man wearing light blue wide leg jeans full body product photo' },
    { name: 'men_ripped_jeans.png', query: 'Amazon young man wearing ripped distressed blue jeans full body product photo' },
    // Casual Pants (4 unique)
    { name: 'men_beige_chinos.png', query: 'Myntra young man wearing beige slim fit chinos pants full body product photo' },
    { name: 'men_grey_trousers.png', query: 'Amazon young man wearing grey formal trousers pants full body product photo' },
    { name: 'men_olive_cargo.png', query: 'Myntra young man wearing olive green cargo pants full body product photo' },
    { name: 'men_black_joggers.png', query: 'Amazon young man wearing black jogger track pants full body product photo' },
    // Sneakers (5 unique)
    { name: 'men_white_sneakers.png', query: 'Myntra white lace up casual sneakers shoes side view product photo' },
    { name: 'men_black_running.png', query: 'Amazon black running sports sneakers shoes pair product photo' },
    { name: 'men_colorblock_sneakers.png', query: 'Myntra blue and white colorblock sneakers shoes pair product photo' },
    { name: 'men_retro_sneakers.png', query: 'Amazon retro green white court sneakers shoes pair product photo' },
    { name: 'men_grey_lowtop.png', query: 'Myntra grey low top casual canvas sneakers shoes pair product photo' },
    // Watches (4 unique)
    { name: 'men_steel_watch.png', query: 'Myntra silver stainless steel chronograph wristwatch luxury product photo' },
    { name: 'men_black_chrono.png', query: 'Amazon black dial chronograph luxury mens wristwatch product photo' },
    { name: 'men_leather_watch.png', query: 'Myntra brown leather strap classic analog wristwatch product photo' },
    { name: 'men_smart_watch.png', query: 'Amazon black digital smart fitness watch product photo' },
    // Headphones (4 unique)
    { name: 'men_anc_headphones.png', query: 'Myntra black over ear noise cancelling wireless headphones tech product photo' },
    { name: 'men_silver_headphones.png', query: 'Amazon silver over ear wireless bluetooth headphones tech product photo' },
    { name: 'men_gaming_headset.png', query: 'Myntra black and red gaming headset with microphone product photo' },
    { name: 'men_studio_headphones.png', query: 'Amazon professional black studio monitor headphones product photo' },
    // Perfume (4 unique)
    { name: 'men_citrus_cologne.png', query: 'Myntra yellow glass cologne perfume bottle for men luxury product photo' },
    { name: 'men_oud_perfume.png', query: 'Amazon dark amber oud perfume bottle for men premium product photo' },
    { name: 'men_sport_edt.png', query: 'Myntra blue sport eau de toilette bottle for men product photo' },
    { name: 'men_night_perfume.png', query: 'Amazon sleek black night fragrance perfume bottle for men luxury product photo' },
];

function download(url, dest) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(url);
        const protocol = parsed.protocol === 'https:' ? https : require('http');
        const file = fs.createWriteStream(dest);
        const req = protocol.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 15000 }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                file.close();
                return download(res.headers.location, dest).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                file.close();
                return reject(new Error(`HTTP ${res.statusCode}`));
            }
            res.pipe(file);
            file.on('finish', () => { file.close(); resolve(); });
        });
        req.on('error', (err) => { file.close(); reject(err); });
        req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    });
}

const delay = ms => new Promise(r => setTimeout(r, ms));

async function main() {
    if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

    for (let i = 0; i < queries.length; i++) {
        const item = queries[i];
        const dest = path.join(OUT, item.name);

        if (fs.existsSync(dest) && fs.statSync(dest).size > 10000) {
            console.log(`[${i + 1}/${queries.length}] SKIP: ${item.name}`);
            continue;
        }

        console.log(`[${i + 1}/${queries.length}] Searching: ${item.name}...`);

        try {
            // Get DuckDuckGo images
            const results = await image_search({ query: item.query, moderate: true });

            if (results && results.length > 0) {
                let success = false;
                // Try top 3 images if first fails
                for (let j = 0; j < Math.min(3, results.length); j++) {
                    try {
                        console.log(`  -> Downloading ${results[j].image.slice(0, 50)}...`);
                        await download(results[j].image, dest);
                        const size = fs.statSync(dest).size;
                        if (size > 10000) {
                            console.log(`  ✅ Saved (${(size / 1024).toFixed(0)} KB)`);
                            success = true;
                            break;
                        }
                    } catch (e) {
                        console.log(`  ❌ Sub-fail: ${e.message}`);
                    }
                }
                if (!success) console.log(`  ❌ All Top 3 URLs failed for ${item.name}`);
            } else {
                console.log(`  ❌ No results found`);
            }
            await delay(1000); // 1 sec delay to avoid DDG limits
        } catch (err) {
            console.log(`  ❌ Search failed: ${err.message}`);
        }
    }
    console.log('\nAll done!');
}

main();
