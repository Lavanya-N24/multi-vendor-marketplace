const fs = require('fs');
const path = require('path');
const https = require('https');

const OUT = path.join(__dirname, '..', 'multi-vendor-frontend', 'public', 'products', 'men');

const images = [
    { name: 'men_slipper_blue.png', prompt: 'a pair of blue rubber flip flop slippers on white background, product photography, ecommerce, realistic, 4k' },
    { name: 'men_slipper_sport.png', prompt: 'a pair of black and white sporty athletic slide slippers on white background, product photography, realistic' },
    { name: 'men_slipper_pool.png', prompt: 'a pair of waterproof navy blue pool slide slippers on white background, product photography, ecommerce, realistic' },
    { name: 'men_pink_shirt.png', prompt: 'a young indian man wearing a pink formal dress shirt, white studio background, half body, product photography, 4k' },
    { name: 'men_grey_formal_shirt.png', prompt: 'a young indian man wearing a grey slim fit formal shirt, white studio background, half body, product photography, 4k' },
    { name: 'men_track_pants.png', prompt: 'a young man wearing black track pants with white side stripes, white studio background, full body, product photography' },
    { name: 'men_track_jacket.png', prompt: 'a young indian man wearing a navy sports zip up track jacket, white studio background, half body, product photography' },
    { name: 'men_chelsea_boots.png', prompt: 'a pair of black leather chelsea ankle boots on white background, product photography, ecommerce, realistic, 4k' },
    { name: 'men_driving_shoes.png', prompt: 'a pair of brown leather driving moccasin loafer shoes on white background, product photography, ecommerce, realistic' },
    { name: 'men_chunky_sneakers.png', prompt: 'a pair of chunky white dad sneakers shoes on white background, product photography, ecommerce, realistic, 4k' },
    { name: 'men_aqua_perfume.png', prompt: 'an aqua marine blue perfume cologne bottle for men on white background, product photography, luxury, 4k' },
    { name: 'men_fresh_edc.png', prompt: 'a green glass fresh eau de cologne perfume bottle on white background, product photography, premium, realistic' },
    { name: 'men_neckband.png', prompt: 'a black bluetooth neckband earphone headset on white background, tech product photography, realistic, 4k' },
    { name: 'men_retro_headphones.png', prompt: 'retro vintage orange and brown over ear headphones on white background, product photography, realistic' },
    { name: 'men_shield_sunglasses.png', prompt: 'a young man wearing futuristic silver shield visor sunglasses, white background, portrait, product photography' },
    { name: 'men_rectangular_sunglasses.png', prompt: 'a young man wearing black rectangular narrow frame sunglasses, white background, portrait, product photography' },
    { name: 'men_polarized_sunglasses.png', prompt: 'a young man wearing matte black polarized sunglasses, white background, portrait, product photography' },
];

const delay = ms => new Promise(r => setTimeout(r, ms));

async function requestImage(prompt) {
    const data = JSON.stringify({ prompt, params: { width: 512, height: 512, steps: 30 }, nsfw: false, censor_nsfw: true, models: ["Dreamshaper"] });
    return new Promise((resolve, reject) => {
        const req = https.request({ hostname: 'aihorde.net', path: '/api/v2/generate/async', method: 'POST', headers: { 'Content-Type': 'application/json', 'apikey': '0000000000' } }, res => {
            let r = ''; res.on('data', c => r += c); res.on('end', () => { try { resolve(JSON.parse(r)); } catch (e) { reject(e); } });
        }); req.on('error', reject); req.write(data); req.end();
    });
}

function checkStatus(id) {
    return new Promise((resolve, reject) => {
        https.get("https://aihorde.net/api/v2/generate/check/" + id, { headers: { 'apikey': '0000000000' } }, res => {
            let r = ''; res.on('data', c => r += c); res.on('end', () => { try { resolve(JSON.parse(r)); } catch (e) { reject(e); } });
        }).on('error', reject);
    });
}

function getResult(id) {
    return new Promise((resolve, reject) => {
        https.get("https://aihorde.net/api/v2/generate/status/" + id, { headers: { 'apikey': '0000000000' } }, res => {
            let r = ''; res.on('data', c => r += c); res.on('end', () => { try { resolve(JSON.parse(r)); } catch (e) { reject(e); } });
        }).on('error', reject);
    });
}

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (res) => { if (res.statusCode !== 200) { file.close(); return reject(new Error("HTTP " + res.statusCode)); } res.pipe(file); file.on('finish', () => { file.close(); resolve(); }); }).on('error', (err) => { file.close(); reject(err); });
    });
}

async function generateOne(item, idx, total) {
    const dest = path.join(OUT, item.name);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 5000) {
        console.log("[" + idx + "/" + total + "] SKIP: " + item.name);
        return;
    }
    console.log("[" + idx + "/" + total + "] Generating: " + item.name);

    // Retry up to 2 times
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            await delay(2000); // wait between requests
            const reqRes = await requestImage(item.prompt);
            if (!reqRes.id) { console.log("  No job ID, retry..."); await delay(5000); continue; }

            let attempts = 0;
            while (attempts < 40) { await delay(3000); const s = await checkStatus(reqRes.id); if (s.done) break; attempts++; }

            const final = await getResult(reqRes.id);
            if (final.generations && final.generations.length > 0) {
                await downloadFile(final.generations[0].img, dest);
                console.log("  OK!");
                return;
            }
        } catch (e) {
            console.log("  Attempt " + (attempt + 1) + " error: " + e.message);
        }
    }
    console.log("  FAILED after 2 attempts");
}

async function main() {
    if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
    console.log("Retrying " + images.length + " missing images...\n");

    for (let i = 0; i < images.length; i++) {
        await generateOne(images[i], i + 1, images.length);
    }

    let ok = 0;
    for (const img of images) {
        const p = path.join(OUT, img.name);
        if (fs.existsSync(p) && fs.statSync(p).size > 5000) ok++;
    }
    console.log("\nDone! " + ok + "/" + images.length + " OK");
}

main();
