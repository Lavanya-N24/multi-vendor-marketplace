const fs = require('fs');
const path = require('path');
const https = require('https');
const { PrismaClient } = require('./prisma/generated/prisma');
const prisma = new PrismaClient();

const NEW_PRODUCTS = [
    // Decor
    { title: "Geometric Metal Wall Art", sub: "Decor", file: "home_metal_art.png", prompt: "minimalist metal geometric wall art sculpture decor studio lighting white background high quality" },
    { title: "Rustic Wooden Floating Shelves", sub: "Decor", file: "home_wood_shelves.png", prompt: "rustic real wood floating wall shelves decor studio lighting white background high quality" },
    { title: "Glass Terrarium with Succulents", sub: "Decor", file: "home_glass_terrarium.png", prompt: "modern glass geometric terrarium with succulents decor studio lighting white background high quality" },
    { title: "Vintage Pattern Accent Rug", sub: "Decor", file: "home_vintage_rug.png", prompt: "vintage distressed accent area rug decor studio lighting white background high quality" },
    { title: "Gold Round Wall Mirror", sub: "Decor", file: "home_gold_mirror.png", prompt: "large round wall mirror with thin gold metal frame decor studio lighting white background high quality" },
    
    // Furnishing
    { title: "Linen Upholstered Armchair", sub: "Furnishing", file: "home_linen_armchair.png", prompt: "modern linen upholstered armchair light gray furnishing studio lighting white background high quality" },
    { title: "Knitted Floor Pouf Ottoman", sub: "Furnishing", file: "home_knit_pouf.png", prompt: "chunky knitted round floor pouf ottoman seating furnishing studio lighting white background high quality" },
    { title: "Woven Wicker Storage Basket", sub: "Furnishing", file: "home_wicker_basket.png", prompt: "large woven wicker rattan storage basket furnishing studio lighting white background high quality" },
    { title: "Silk Blackout Curtains", sub: "Furnishing", file: "home_silk_curtain.png", prompt: "heavy silk blackout curtains panels gray furnishing studio lighting white background high quality" },
    { title: "Tufted Headboard Queen Size", sub: "Furnishing", file: "home_tufted_headboard.png", prompt: "tufted fabric queen size bed headboard beige furnishing studio lighting white background high quality" },
    
    // Kitchen
    { title: "Marble Pastry Board", sub: "Kitchen", file: "home_marble_board.png", prompt: "solid white marble slab pastry rolling board kitchenware studio lighting white background high quality" },
    { title: "Copper Bottom Saucepan Set", sub: "Kitchen", file: "home_copper_saucepan.png", prompt: "copper bottom stainless steel saucepan set kitchenware studio lighting white background high quality" },
    { title: "Olive Wood Serving Bowls", sub: "Kitchen", file: "home_olive_bowls.png", prompt: "handcrafted olive wood rustic serving bowls set kitchenware studio lighting white background high quality" },
    { title: "Electric Gooseneck Kettle", sub: "Kitchen", file: "home_electric_kettle.png", prompt: "matte black electric gooseneck pour over kettle kitchenware studio lighting white background high quality" },
    { title: "Ceramic Knife Block Set", sub: "Kitchen", file: "home_knife_block.png", prompt: "modern ceramic knife set in wooden block kitchenware studio lighting white background high quality" },
    
    // Lighting
    { title: "Edison Bulb Chandelier", sub: "Lighting", file: "home_edison_chand.png", prompt: "vintage style edison bulb multi light chandelier lighting studio lighting white background high quality" },
    { title: "Salt Lamp Crystal", sub: "Lighting", file: "home_salt_lamp.png", prompt: "himalayan glowing pink salt crystal lamp wooden base lighting studio lighting white background high quality" },
    { title: "Swing Arm Desk Lamp", sub: "Lighting", file: "home_desk_lamp.png", prompt: "black metal swing arm architect desk lamp lighting studio lighting white background high quality" },
    { title: "Smart Color Changing Bulb Set", sub: "Lighting", file: "home_smart_bulb.png", prompt: "smart led light bulb set rgb colors lighting studio lighting white background high quality" },
    { title: "Rattan Woven Pendant Shade", sub: "Lighting", file: "home_rattan_shade.png", prompt: "natural rattan woven hanging pendant light shade lighting studio lighting white background high quality" }
];

const OUT = path.join(__dirname, '..', 'multi-vendor-frontend', 'public', 'products', 'home');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

async function insertIntoDb() {
    console.log("Adding 20 new products to database...");
    for (const item of NEW_PRODUCTS) {
        // check if exists
        const ex = await prisma.product.findFirst({ where: { title: item.title, category: 'Home' } });
        if (!ex) {
            await prisma.product.create({
                data: {
                    title: item.title,
                    description: "High quality beautiful " + item.title + " for your lovely home setup.",
                    price: Math.floor(Math.random() * 5000) + 1500,
                    stock: Math.floor(Math.random() * 50) + 10,
                    size: "One Size",
                    gender: "Unisex",
                    category: "Home",
                    subcategory: item.sub,
                    vendorId: (await prisma.user.findFirst({where:{isVendor:true}})).id,
                    image: `https://placehold.co/400x500/f3f4f6/a3a8b4?text=${encodeURIComponent(item.title)}`
                }
            });
        }
    }
    console.log("Database updated! The products are now visible on the frontend.");
}

// ──────── AI Horde ────────
const delay = ms => new Promise(r => setTimeout(r, ms));
function hordeRequest(prompt) {
    const data = JSON.stringify({ prompt: prompt + ", 4k, clean, detailed", params: { width: 512, height: 512, steps: 25 }, nsfw: false, censor_nsfw: true, models: ["Dreamshaper"] });
    return new Promise((resolve, reject) => {
        const req = https.request({ hostname: 'aihorde.net', path: '/api/v2/generate/async', method: 'POST', headers: { 'Content-Type': 'application/json', 'apikey': '0000000000' } }, res => {
            let r = ''; res.on('data', c => r += c); res.on('end', () => { try { resolve(JSON.parse(r)); } catch (e) { reject(e); } });
        });
        req.on('error', reject); req.write(data); req.end();
    });
}
function hordeCheck(id) {
    return new Promise((resolve, reject) => { https.get('https://aihorde.net/api/v2/generate/check/' + id, { headers: { 'apikey': '0000000000' } }, res => { let r = ''; res.on('data', c => r += c); res.on('end', () => { try { resolve(JSON.parse(r)); } catch (e) { reject(e); } }); }).on('error', reject); });
}
function hordeResult(id) {
    return new Promise((resolve, reject) => { https.get('https://aihorde.net/api/v2/generate/status/' + id, { headers: { 'apikey': '0000000000' } }, res => { let r = ''; res.on('data', c => r += c); res.on('end', () => { try { resolve(JSON.parse(r)); } catch (e) { reject(e); } }); }).on('error', reject); });
}
function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                file.close(); if (fs.existsSync(dest)) fs.unlinkSync(dest);
                const f2 = fs.createWriteStream(dest); https.get(res.headers.location, r2 => { r2.pipe(f2); f2.on('finish', () => { f2.close(); resolve(); }); }).on('error', reject); return;
            }
            if (res.statusCode !== 200) { file.close(); return reject(new Error("HTTP " + res.statusCode)); }
            res.pipe(file); file.on('finish', () => { file.close(); resolve(); });
        }).on('error', (err) => { file.close(); reject(err); });
    });
}

async function updateDbPath(item) {
    const product = await prisma.product.findFirst({ where: { title: item.title, category: 'Home' } });
    if (product) {
        await prisma.product.update({ where: { id: product.id }, data: { image: '/products/home/' + item.file } });
    }
}

async function generatorLoop() {
    console.log("Starting generation loop for 20 new items...");
    for (const item of NEW_PRODUCTS) {
        const dest = path.join(OUT, item.file);
        if (fs.existsSync(dest) && fs.statSync(dest).size > 3000) {
            await updateDbPath(item);
            console.log("⏩ Exists: " + item.title);
            continue;
        }

        let id = null;
        for (let tries = 0; tries < 3 && !id; tries++) {
            try { const rd = await hordeRequest(item.prompt); id = rd.id; } catch(e) {}
            await delay(3000);
        }
        if (!id) { console.log("❌ Failed to request: " + item.title); continue; }

        let done = false;
        for (let a = 0; a < 60 && !done; a++) {
            await delay(5000);
            try { const s = await hordeCheck(id); done = s.done; } catch(e){}
        }

        try {
            const final = await hordeResult(id);
            if (final.generations?.length) {
                await downloadFile(final.generations[0].img, dest);
                if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
                    await updateDbPath(item);
                    console.log("✅ Gen OK: " + item.title);
                } else console.log("❌ Download failed: " + item.title);
            } else console.log("❌ No generation for: " + item.title);
        } catch(e) { console.log("❌ Gen error for: " + item.title); }
    }
    console.log("All 20 new products fully generated!");
}

async function run() {
    await insertIntoDb();
    generatorLoop().then(() => prisma.$disconnect()).catch(async e => { console.error(e); await prisma.$disconnect(); });
}
run();
