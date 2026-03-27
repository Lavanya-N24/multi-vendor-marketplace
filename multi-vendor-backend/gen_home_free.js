const fs = require('fs');
const path = require('path');
const https = require('https');
const { PrismaClient } = require('./prisma/generated/prisma');

const prisma = new PrismaClient();
const OUT = path.join(__dirname, '..', 'multi-vendor-frontend', 'public', 'products', 'home');

const ITEMS = [
    { title: "Ceramic Plant Pot Set", file: "home_ceramic_plant_pot.png", prompt: "Minimalist ceramic plant pot set with indoor plants, modern home decor, studio lighting, white background, high quality product photo" },
    { title: "Abstract Canvas Wall Art", file: "home_abstract_canvas.png", prompt: "Modern abstract canvas wall art painting, home decor, studio lighting, white background, high quality product photo" },
    { title: "LED String Fairy Lights", file: "home_fairy_lights.png", prompt: "Warm white LED string fairy lights coiled up, modern home decor, studio lighting, white background, high quality product photo" },
    { title: "Macrame Wall Hanging", file: "home_macrame_wall.png", prompt: "Bohemian macrame wall hanging tapestry, home decor, studio lighting, white background, high quality product photo" },
    { title: "Decorative Throw Pillows", file: "home_throw_pillows.png", prompt: "Set of decorative throw pillows textured velvet, modern home decor, studio lighting, white background, high quality product photo" },
    { title: "Chunky Knit Throw Blanket", file: "home_knit_blanket.png", prompt: "Cozy chunky knit throw blanket folded, home furnishing, studio lighting, white background, high quality product photo" },
    { title: "Velvet Cushion Covers", file: "home_cushion_covers.png", prompt: "Luxury velvet cushion covers set, home furnishing, studio lighting, white background, high quality product photo" },
    { title: "Cotton Bedsheet King", file: "home_bedsheet.png", prompt: "Premium cotton king size bedsheet folded neatly, home furnishing, studio lighting, white background, high quality product photo" },
    { title: "Sheer Curtain Pair", file: "home_sheer_curtain.png", prompt: "Elegant white sheer curtain pair folded, home furnishing, studio lighting, white background, high quality product photo" },
    { title: "Jute Area Rug 5x7", file: "home_jute_rug.png", prompt: "Natural woven jute area rug rolled up, home furnishing, studio lighting, white background, high quality product photo" },
    { title: "Cast Iron Skillet 12inch", file: "home_cast_iron.png", prompt: "Heavy duty cast iron skillet 12 inch pan, kitchenware, studio lighting, white background, high quality product photo" },
    { title: "French Press Coffee Maker", file: "home_french_press.png", prompt: "Glass and stainless steel french press coffee maker, kitchenware, studio lighting, white background, high quality product photo" },
    { title: "Bamboo Cutting Board Set", file: "home_cutting_board.png", prompt: "Premium bamboo wood cutting board set, kitchenware, studio lighting, white background, high quality product photo" },
    { title: "Non-Stick Cookware Set", file: "home_cookware_set.png", prompt: "Modern non-stick pots and pans cookware set, kitchenware, studio lighting, white background, high quality product photo" },
    { title: "Table Lamp Ceramic", file: "home_table_lamp.png", prompt: "Modern ceramic table lamp with fabric shade, lighting decor, studio lighting, white background, high quality product photo" },
    { title: "Floor Lamp Arc", file: "home_floor_lamp.png", prompt: "Contemporary metal arc floor lamp, lighting decor, studio lighting, white background, high quality product photo" },
    { title: "Pendant Light Industrial", file: "home_pendant_light.png", prompt: "Industrial hanging pendant light fixture black metal, lighting decor, studio lighting, white background, high quality product photo" },
    { title: "LED Strip Lights RGB", file: "home_led_strip.png", prompt: "Colorful RGB LED strip lights reel, lighting decor, studio lighting, white background, high quality product photo" }
];

const delay = ms => new Promise(r => setTimeout(r, ms));

function hordeRequest(prompt) {
    const data = JSON.stringify({
        prompt: prompt + ", 4k, ultra detailed, photorealistic",
        params: { width: 512, height: 512, steps: 25 },
        nsfw: false, censor_nsfw: true,
        models: ["Dreamshaper"]
    });
    return new Promise((resolve, reject) => {
        const req = https.request({
            hostname: 'aihorde.net',
            path: '/api/v2/generate/async',
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'apikey': '0000000000' }
        }, res => {
            let r = ''; res.on('data', c => r += c);
            res.on('end', () => { try { resolve(JSON.parse(r)); } catch (e) { reject(e); } });
        });
        req.on('error', reject); req.write(data); req.end();
    });
}

function hordeCheck(id) {
    return new Promise((resolve, reject) => {
        https.get('https://aihorde.net/api/v2/generate/check/' + id, { headers: { 'apikey': '0000000000' } }, res => {
            let r = ''; res.on('data', c => r += c);
            res.on('end', () => { try { resolve(JSON.parse(r)); } catch (e) { reject(e); } });
        }).on('error', reject);
    });
}

function hordeResult(id) {
    return new Promise((resolve, reject) => {
        https.get('https://aihorde.net/api/v2/generate/status/' + id, { headers: { 'apikey': '0000000000' } }, res => {
            let r = ''; res.on('data', c => r += c);
            res.on('end', () => { try { resolve(JSON.parse(r)); } catch (e) { reject(e); } });
        }).on('error', reject);
    });
}

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                file.close();
                if (fs.existsSync(dest)) fs.unlinkSync(dest);
                const f2 = fs.createWriteStream(dest);
                https.get(res.headers.location, r2 => { r2.pipe(f2); f2.on('finish', () => { f2.close(); resolve(); }); }).on('error', reject);
                return;
            }
            if (res.statusCode !== 200) { file.close(); return reject(new Error("HTTP " + res.statusCode)); }
            res.pipe(file);
            file.on('finish', () => { file.close(); resolve(); });
        }).on('error', (err) => { file.close(); reject(err); });
    });
}

async function updateDb(item) {
    const newPath = '/products/home/' + item.file;
    const finalUrl = newPath;
    
    // update specific item in db based on title
    const product = await prisma.product.findFirst({
        where: { title: item.title, OR: [{ gender: 'Home' }, { category: 'Home' }] }
    });
    if (product) {
        await prisma.product.update({ where: { id: product.id }, data: { image: finalUrl } });
        return true;
    }
    return false;
}

async function generateOne(item) {
    const dest = path.join(OUT, item.file);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 3000) {
        await updateDb(item);
        return "SKIP";
    }

    let reqRes;
    for (let retry = 0; retry < 3; retry++) {
        try {
            reqRes = await hordeRequest(item.prompt);
            if (reqRes.id) break;
        } catch (e) { }
        await delay(5000);
    }
    if (!reqRes || !reqRes.id) return "FAIL_REQ";

    const id = reqRes.id;
    let attempts = 0;
    while (attempts < 60) {
        await delay(5000);
        try {
            const s = await hordeCheck(id);
            if (s.done) break;
        } catch (e) { }
        attempts++;
    }

    try {
        const final = await hordeResult(id);
        if (final.generations && final.generations.length > 0) {
            await downloadFile(final.generations[0].img, dest);
            if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
                await updateDb(item);
                return "OK";
            }
        }
    } catch (e) { }
    return "FAIL";
}

async function main() {
    if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

    console.log('\n🛋️ Home Image Generator - AI Horde FREE');
    console.log('Total items: ' + ITEMS.length + '\n');

    let ok = 0, fail = 0;
    const BATCH = 3;

    // Apply temporary placeholders immediately for all items just in case
    for (const item of ITEMS) {
        const dest = path.join(OUT, item.file);
        if (!fs.existsSync(dest) || fs.statSync(dest).size < 3000) {
            const product = await prisma.product.findFirst({
                where: { title: item.title, OR: [{ gender: 'Home' }, { category: 'Home' }] }
            });
            if (product && (!product.image || product.image.includes('pollinations') || product.image.includes('Generating'))) {
                const tempUrl = `https://placehold.co/400x500/f3f4f6/a3a8b4?text=${encodeURIComponent(item.title)}`;
                await prisma.product.update({ where: { id: product.id }, data: { image: tempUrl } });
            }
        }
    }
    console.log("Applied temporary nice placeholders.");

    for (let i = 0; i < ITEMS.length; i += BATCH) {
        const batch = ITEMS.slice(i, i + BATCH);
        const results = await Promise.allSettled(batch.map(async (item, idx) => {
            const globalIdx = i + idx + 1;
            const result = await generateOne(item);
            const icon = result === "OK" ? "✅" : result === "SKIP" ? "⏭️" : "❌";
            console.log('[' + globalIdx + '/' + ITEMS.length + '] ' + icon + ' ' + item.file + ' -> ' + result);
            return result;
        }));

        results.forEach(r => {
            if (r.status === 'fulfilled' && (r.value === "OK" || r.value === "SKIP")) ok++;
            else fail++;
        });

        if (i + BATCH < ITEMS.length) await delay(3000);
    }

    console.log('\n========================================');
    console.log('✅ Done! Generated: ' + ok + ' | Failed: ' + fail);
    console.log('========================================\n');

    await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); });
