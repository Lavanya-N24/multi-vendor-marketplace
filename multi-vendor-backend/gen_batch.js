const fs = require('fs');
const path = require('path');
const https = require('https');

const OUT = path.join(__dirname, '..', 'multi-vendor-frontend', 'public', 'products', 'men');

const images = [
    // ── Slippers (10) ──
    { name: 'men_slipper_black.png', prompt: 'a pair of black rubber slide slippers on white background, product photography, ecommerce, realistic, 4k' },
    { name: 'men_slipper_brown.png', prompt: 'a pair of brown leather casual slippers on white background, product photography, ecommerce, realistic' },
    { name: 'men_slipper_blue.png', prompt: 'a pair of blue flip flop slippers on white background, product photography, ecommerce, realistic' },
    { name: 'men_slipper_green.png', prompt: 'a pair of olive green casual slide slippers on white background, product photography, realistic' },
    { name: 'men_slipper_sport.png', prompt: 'a pair of sporty athletic slide slippers black and white on white background, product photography, realistic' },
    { name: 'men_slipper_leather.png', prompt: 'a pair of tan leather strap sandals on white background, product photography, ecommerce, realistic' },
    { name: 'men_slipper_comfort.png', prompt: 'a pair of grey comfort cushioned house slippers on white background, product photography, realistic' },
    { name: 'men_slipper_pool.png', prompt: 'a pair of waterproof pool slide slippers navy blue on white background, product photography, ecommerce' },
    { name: 'men_slipper_house.png', prompt: 'a pair of cozy plush brown indoor house slippers on white background, product photography, realistic' },
    { name: 'men_slipper_ethnic.png', prompt: 'a pair of traditional indian kolhapuri leather chappal sandals on white background, product photography' },

    // ── Extra Shirts (4) ──
    { name: 'men_pink_shirt.png', prompt: 'a young indian man wearing pink formal dress shirt, white studio background, product photography, realistic, 4k' },
    { name: 'men_check_shirt.png', prompt: 'a young indian man wearing blue and white checkered formal shirt, white studio background, product photography, realistic' },
    { name: 'men_sky_blue_shirt.png', prompt: 'a young indian man wearing sky blue cotton formal shirt, white studio background, product photography, realistic' },
    { name: 'men_grey_formal_shirt.png', prompt: 'a young indian man wearing grey slim fit formal shirt, white studio background, product photography, realistic' },

    // ── Extra Casual Pants (5) ──
    { name: 'men_khaki_pants.png', prompt: 'a young man wearing khaki casual cotton pants, white studio background, full body, product photography, realistic' },
    { name: 'men_navy_chinos.png', prompt: 'a young man wearing navy blue chinos pants, white studio background, full body, product photography, realistic' },
    { name: 'men_track_pants.png', prompt: 'a young man wearing black track pants with white stripes, white studio background, full body, product photography' },
    { name: 'men_linen_pants.png', prompt: 'a young man wearing white linen casual pants, white studio background, full body, product photography, realistic' },
    { name: 'men_corduroy_pants.png', prompt: 'a young man wearing brown corduroy pants, white studio background, full body, product photography, realistic' },

    // ── Extra Jackets (3) ──
    { name: 'men_suede_jacket.png', prompt: 'a young indian man wearing brown suede casual jacket, white studio background, half body, product photography, realistic' },
    { name: 'men_track_jacket.png', prompt: 'a young indian man wearing sports zip-up track jacket, white studio background, half body, product photography' },
    { name: 'men_quilted_jacket.png', prompt: 'a young indian man wearing quilted padded vest jacket, white studio background, half body, product photography' },

    // ── Extra Shoes (6) ──
    { name: 'men_brogue_shoes.png', prompt: 'a pair of tan brogue wingtip dress shoes on white background, product photography, ecommerce, realistic, 4k' },
    { name: 'men_chelsea_boots.png', prompt: 'a pair of black leather chelsea boots on white background, product photography, ecommerce, realistic' },
    { name: 'men_canvas_shoes.png', prompt: 'a pair of white canvas casual lace up shoes on white background, product photography, ecommerce' },
    { name: 'men_driving_shoes.png', prompt: 'a pair of brown leather driving moccasin shoes on white background, product photography, realistic' },
    { name: 'men_ankle_boots.png', prompt: 'a pair of brown leather ankle boots on white background, product photography, ecommerce, realistic' },
    { name: 'men_sandals_outdoor.png', prompt: 'a pair of rugged outdoor trekking sport sandals on white background, product photography, realistic' },

    // ── Extra Sneakers (3) ──
    { name: 'men_chunky_sneakers.png', prompt: 'a pair of chunky platform dad sneakers white and beige on white background, product photography, realistic' },
    { name: 'men_knit_sneakers.png', prompt: 'a pair of lightweight knit mesh running sneakers on white background, product photography, ecommerce' },
    { name: 'men_slip_on_sneakers.png', prompt: 'a pair of grey slip on casual sneakers on white background, product photography, ecommerce, realistic' },

    // ── Extra Watches (6) ──
    { name: 'men_gold_dial_watch.png', prompt: 'a luxury gold dial chronograph watch for men on white background, product photography, ecommerce, realistic' },
    { name: 'men_sports_watch.png', prompt: 'a rugged black digital sports watch for men on white background, product photography, realistic' },
    { name: 'men_diver_watch.png', prompt: 'a blue bezel diver watch stainless steel for men on white background, product photography, realistic' },
    { name: 'men_minimalist_watch.png', prompt: 'a minimalist thin silver watch with leather strap on white background, product photography, elegant' },
    { name: 'men_skeleton_watch.png', prompt: 'a skeleton transparent dial mechanical watch on white background, product photography, luxury' },
    { name: 'men_rose_gold_watch.png', prompt: 'a rose gold elegant dress watch for men on white background, product photography, premium' },

    // ── Extra Headphones (5) ──
    { name: 'men_earbuds_tws.png', prompt: 'true wireless earbuds in open charging case on white background, tech product photography, realistic, modern' },
    { name: 'men_neckband.png', prompt: 'bluetooth neckband earphone headset on white background, tech product photography, realistic' },
    { name: 'men_bone_conduction.png', prompt: 'bone conduction open ear headphones on white background, tech product photography, modern' },
    { name: 'men_retro_headphones.png', prompt: 'retro vintage orange and brown over ear headphones on white background, product photography' },
    { name: 'men_sport_earbuds.png', prompt: 'sport waterproof earbuds with ear hooks on white background, product photography, realistic' },

    // ── Extra Sunglasses (5) ──
    { name: 'men_shield_sunglasses.png', prompt: 'a young man wearing futuristic shield visor sunglasses, white background, product photography, portrait' },
    { name: 'men_rectangular_sunglasses.png', prompt: 'a young man wearing black rectangular frame sunglasses, white background, product photography, portrait' },
    { name: 'men_blue_mirror_sunglasses.png', prompt: 'a young man wearing blue mirror lens aviator sunglasses, white background, product photography, portrait' },
    { name: 'men_wooden_sunglasses.png', prompt: 'a young man wearing wooden bamboo frame sunglasses, white background, product photography, portrait' },
    { name: 'men_polarized_sunglasses.png', prompt: 'a young man wearing matte black polarized sunglasses, white background, product photography, portrait' },

    // ── Extra Perfume (6) ──
    { name: 'men_aqua_perfume.png', prompt: 'an aqua blue perfume bottle for men on white background, product photography, luxury, reflective surface' },
    { name: 'men_woody_perfume.png', prompt: 'a dark brown woody musk perfume bottle for men on white background, product photography, luxury' },
    { name: 'men_leather_perfume.png', prompt: 'an elegant dark red leather scent perfume bottle on white background, product photography, luxury' },
    { name: 'men_fresh_edc.png', prompt: 'a green glass fresh eau de cologne bottle on white background, product photography, premium' },
    { name: 'men_amber_perfume.png', prompt: 'an amber oriental perfume bottle with gold cap on white background, product photography, luxury' },
    { name: 'men_vetiver_perfume.png', prompt: 'a dark green vetiver perfume bottle for men on white background, product photography, premium' },
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

async function generateOne(item) {
    const dest = path.join(OUT, item.name);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 5000) return "SKIP";

    const reqRes = await requestImage(item.prompt);
    if (!reqRes.id) throw new Error("No job ID: " + JSON.stringify(reqRes));
    const id = reqRes.id;

    let attempts = 0;
    while (attempts < 40) {
        await delay(3000);
        const s = await checkStatus(id);
        if (s.done) break;
        attempts++;
    }

    const final = await getResult(id);
    if (final.generations && final.generations.length > 0) {
        await downloadFile(final.generations[0].img, dest);
        return "OK";
    }
    return "FAIL";
}

// Process 3 at a time for speed
async function processBatch(batch, batchNum, total) {
    const results = await Promise.allSettled(batch.map(async (item, idx) => {
        const globalIdx = batchNum * 3 + idx + 1;
        try {
            const result = await generateOne(item);
            console.log("[" + globalIdx + "/" + total + "] " + item.name + " -> " + result);
            return result;
        } catch (e) {
            console.log("[" + globalIdx + "/" + total + "] " + item.name + " -> ERR: " + e.message);
            return "ERR";
        }
    }));
    return results;
}

async function main() {
    if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
    console.log("Generating " + images.length + " images via AI Horde (3 at a time)...\n");

    for (let i = 0; i < images.length; i += 3) {
        const batch = images.slice(i, i + 3);
        await processBatch(batch, Math.floor(i / 3), images.length);
        if (i + 3 < images.length) await delay(1000);
    }

    // Count results
    let ok = 0, fail = 0;
    for (const img of images) {
        const p = path.join(OUT, img.name);
        if (fs.existsSync(p) && fs.statSync(p).size > 5000) ok++;
        else fail++;
    }
    console.log("\nAll done! OK=" + ok + " FAIL=" + fail);
}

main();
