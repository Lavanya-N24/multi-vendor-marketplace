const fs = require('fs');
const path = require('path');
const https = require('https');

const OUT = path.join(__dirname, '..', 'multi-vendor-frontend', 'public', 'products', 'men');

const images = [
    // Shirts (5 unique)
    { name: 'men_white_oxford.png', prompt: 'young indian man wearing white oxford formal shirt, studio white background, ecommerce product photo, Myntra style' },
    { name: 'men_blue_formal.png', prompt: 'young indian man wearing blue slim fit formal shirt, studio white background, ecommerce product photo, Myntra style' },
    { name: 'men_striped_formal.png', prompt: 'young indian man wearing blue white striped formal shirt, studio white background, fashion ecommerce photo' },
    { name: 'men_white_dress.png', prompt: 'young indian man wearing crisp white dress shirt with red tie, studio white background, ecommerce product photo' },
    { name: 'men_black_shirt.png', prompt: 'young indian man wearing black formal button down shirt, studio white background, ecommerce product photo' },
    // Casual/T-Shirts (11 unique)
    { name: 'men_white_polo.png', prompt: 'young indian man wearing white polo collar tshirt, studio white background, casual ecommerce product photo' },
    { name: 'men_black_polo.png', prompt: 'young indian man wearing black polo collar tshirt, studio white background, casual ecommerce product photo' },
    { name: 'men_navy_polo.png', prompt: 'young indian man wearing navy blue polo tshirt, studio white background, ecommerce product photo' },
    { name: 'men_white_crewneck.png', prompt: 'young indian man wearing plain white crew neck tshirt, studio white background, minimal ecommerce product photo' },
    { name: 'men_black_crewneck.png', prompt: 'young indian man wearing plain black round neck tshirt, studio white background, ecommerce product photo' },
    { name: 'men_graphic_white.png', prompt: 'young indian man wearing white oversized graphic print tshirt, studio white background, streetwear fashion photo' },
    { name: 'men_grey_vneck.png', prompt: 'young indian man wearing grey v-neck tshirt, studio white background, casual ecommerce product photo' },
    { name: 'men_maroon_fullsleeve.png', prompt: 'young indian man wearing maroon full sleeves casual shirt, studio white background, ecommerce fashion photo' },
    { name: 'men_beige_linen.png', prompt: 'young indian man wearing beige linen casual beach shirt, studio white background, ecommerce fashion photo' },
    { name: 'men_olive_henley.png', prompt: 'young indian man wearing olive green henley neck tshirt, studio white background, ecommerce product photo' },
    { name: 'men_blue_denim_shirt.png', prompt: 'young indian man wearing blue denim casual shirt, studio white background, ecommerce fashion photo' },
    // Jeans (6 unique)
    { name: 'men_black_jeans.png', prompt: 'young indian man wearing black straight fit jeans with white tshirt, full body, studio white background, ecommerce product photo' },
    { name: 'men_blue_jeans_regular.png', prompt: 'young indian man wearing medium blue regular fit jeans, full body, studio white background, ecommerce product photo' },
    { name: 'men_darkwash_jeans.png', prompt: 'young indian man wearing dark indigo wash denim jeans, full body, studio white background, ecommerce product photo' },
    { name: 'men_grey_slim_jeans.png', prompt: 'young indian man wearing grey slim fit jeans, full body, studio white background, ecommerce product photo' },
    { name: 'men_lightblue_jeans.png', prompt: 'young indian man wearing light blue wide leg jeans, full body, studio white background, ecommerce product photo' },
    { name: 'men_ripped_jeans.png', prompt: 'young indian man wearing ripped distressed blue jeans, full body, studio white background, streetwear fashion photo' },
    // Casual Pants (4 unique)
    { name: 'men_beige_chinos.png', prompt: 'young indian man wearing beige slim fit chinos pants, full body, studio white background, ecommerce product photo' },
    { name: 'men_grey_trousers.png', prompt: 'young indian man wearing grey formal trousers pants, full body, studio white background, ecommerce product photo' },
    { name: 'men_olive_cargo.png', prompt: 'young indian man wearing olive green cargo pants, full body, studio white background, ecommerce fashion photo' },
    { name: 'men_black_joggers.png', prompt: 'young indian man wearing black jogger track pants, full body, studio white background, sporty ecommerce product photo' },
    // Sneakers (5 unique)
    { name: 'men_white_sneakers.png', prompt: 'white lace up casual sneakers shoes pair, clean studio white background, product photography, ecommerce' },
    { name: 'men_black_running.png', prompt: 'black running sports sneakers shoes pair, clean studio white background, product photography, ecommerce' },
    { name: 'men_colorblock_sneakers.png', prompt: 'blue and white colorblock sneakers shoes pair, clean studio white background, product photography, ecommerce' },
    { name: 'men_retro_sneakers.png', prompt: 'retro green white court sneakers shoes pair, clean studio white background, product photography, ecommerce' },
    { name: 'men_grey_lowtop.png', prompt: 'grey low top casual canvas sneakers shoes pair, clean studio white background, product photography, ecommerce' },
    // Watches (4 unique)
    { name: 'men_steel_watch.png', prompt: 'silver stainless steel chronograph wristwatch, clean white background, luxury product photography' },
    { name: 'men_black_chrono.png', prompt: 'black dial chronograph luxury mens wristwatch, clean white background, premium product photography' },
    { name: 'men_leather_watch.png', prompt: 'brown leather strap classic analog wristwatch, clean white background, elegant product photography' },
    { name: 'men_smart_watch.png', prompt: 'black digital smart fitness watch, clean white background, tech product photography' },
    // Headphones (4 unique)
    { name: 'men_anc_headphones.png', prompt: 'black over ear noise cancelling wireless headphones, clean white background, tech product photography' },
    { name: 'men_silver_headphones.png', prompt: 'silver over ear wireless bluetooth headphones, clean white background, tech product photography' },
    { name: 'men_gaming_headset.png', prompt: 'black and red RGB gaming headset with microphone, clean white background, gaming product photography' },
    { name: 'men_studio_headphones.png', prompt: 'professional black studio monitor headphones, clean white background, audio equipment product photography' },
    // Perfume (4 unique)
    { name: 'men_citrus_cologne.png', prompt: 'yellow glass cologne perfume bottle for men, fresh citrus theme, clean white background, luxury product photography' },
    { name: 'men_oud_perfume.png', prompt: 'dark amber oud perfume bottle for men, elegant glass bottle, clean white background, premium product photography' },
    { name: 'men_sport_edt.png', prompt: 'blue sport eau de toilette bottle for men, clean white background, product photography' },
    { name: 'men_night_perfume.png', prompt: 'sleek black night fragrance perfume bottle for men, clean white background, luxury product photography' },
];

function download(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const req = https.get(url, { timeout: 60000 }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                file.close();
                fs.unlinkSync(dest);
                return download(res.headers.location, dest).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                file.close();
                if (fs.existsSync(dest)) fs.unlinkSync(dest);
                return reject(new Error(`HTTP ${res.statusCode}`));
            }
            res.pipe(file);
            file.on('finish', () => { file.close(); resolve(); });
        });
        req.on('error', (err) => { file.close(); if (fs.existsSync(dest)) fs.unlinkSync(dest); reject(err); });
        req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    });
}

const delay = ms => new Promise(r => setTimeout(r, ms));

async function main() {
    if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

    for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const dest = path.join(OUT, img.name);

        if (fs.existsSync(dest) && fs.statSync(dest).size > 10000) {
            console.log(`[${i + 1}/${images.length}] SKIP (exists): ${img.name}`);
            continue;
        }

        let success = false;
        let attempts = 0;

        while (!success && attempts < 5) {
            attempts++;
            const seed = 100 + i + attempts; // vary seed on retry
            let url = `https://image.pollinations.ai/prompt/${encodeURIComponent(img.prompt)}?width=400&height=500&nologo=true&seed=${seed}`;

            // alternate domain to avoid rate limits
            if (attempts % 2 === 0) {
                url = `https://pollinations.ai/p/${encodeURIComponent(img.prompt)}?width=400&height=500&nologo=true&seed=${seed}`;
            }

            console.log(`[${i + 1}/${images.length}] Downloading: ${img.name} (Attempt ${attempts})...`);

            try {
                await download(url, dest);
                const size = fs.statSync(dest).size;

                // If it downloaded a very small file (e.g. text/html error page), reject it
                if (size < 5000) {
                    throw new Error("File too small, possibly an error page");
                }

                console.log(`  ✅ Saved (${(size / 1024).toFixed(0)} KB)`);
                success = true;
                // Wait to avoid rate limits
                await delay(3000);
            } catch (err) {
                console.log(`  ❌ Failed: ${err.message}`);
                // Backoff longer on 429
                if (err.message.includes('429')) {
                    console.log(`  ⏳ Waiting 15 seconds due to rate limit...`);
                    await delay(15000);
                } else {
                    await delay(5000);
                }
            }
        }
    }
    console.log('\nDone!');
}

main();
