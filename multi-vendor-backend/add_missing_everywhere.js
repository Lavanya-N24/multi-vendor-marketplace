const fs = require('fs');
const path = require('path');
const https = require('https');
const { PrismaClient } = require('./prisma/generated/prisma');
const prisma = new PrismaClient();

const NEW_PRODUCTS = [
    // Home
    { title: "Scented Soy Wax Candle", cat: "Home", sub: "Candle", gender: "Unisex", price: 15, prompt: "scented soy wax glass jar candle home decor white background 4k high quality" },
    { title: "Pillar Candle Set of 3", cat: "Home", sub: "Candle", gender: "Unisex", price: 22, prompt: "white pillar candle set of 3 home decor lighting white background 4k high quality" },
    { title: "Lavender Aromatherapy Candle", cat: "Home", sub: "Candle", gender: "Unisex", price: 18, prompt: "lavender purple aromatherapy candle glass home decor white background 4k high quality" },
    { title: "Acrylic Makeup Organizer", cat: "Home", sub: "Organizer", gender: "Unisex", price: 35, prompt: "clear acrylic makeup cosmetic drawer organizer home decor white background 4k high quality" },
    { title: "Bamboo Desk Organizer", cat: "Home", sub: "Organizer", gender: "Unisex", price: 20, prompt: "bamboo wood desk office supplies organizer tray home decor white background 4k high quality" },
    { title: "Woven Storage Baskets Cube", cat: "Home", sub: "Organizer", gender: "Unisex", price: 28, prompt: "woven fabric storage baskets organizer box home decor white background 4k high quality" },
    
    // GenZ
    { title: "GenZ Oversized Acid Wash Tee", cat: "Fashion", sub: "T-Shirt", gender: "Unisex", price: 30, prompt: "oversized acid wash streetwear t-shirt trendy genz fashion white background 4k high quality" },
    { title: "GenZ Cyberpunk LED Visor", cat: "Fashion", sub: "Accessories", gender: "Unisex", price: 45, prompt: "trendy luminous led cyberpunk visor sunglasses streetwear genz white background 4k high quality" },
    { title: "GenZ Chunky Platform Boots", cat: "Fashion", sub: "Footwear", gender: "Unisex", price: 80, prompt: "black chunky platform gothic combat boots genz streetwear white background 4k high quality" },
    { title: "GenZ Y2K Rhinestone Hoodie", cat: "Fashion", sub: "Outerwear", gender: "Unisex", price: 55, prompt: "y2k style rhinestone zip up hoodie black streetwear genz white background 4k high quality" },
    
    // Beauty
    { title: "Vitamin C Brightening Face Wash", cat: "Beauty", sub: "Skincare", gender: "Women", price: 18, prompt: "vitamin c brightening face wash cleanser pump bottle beauty skincare product photography white background 4k high quality" },
    { title: "Hydrating Lip Oil Gloss", cat: "Beauty", sub: "Makeup", gender: "Women", price: 14, prompt: "hydrating lip oil gloss clear tube beauty makeup product photography white background 4k high quality" },
    { title: "Exfoliating Body Scrub Mango", cat: "Beauty", sub: "Body Care", gender: "Women", price: 25, prompt: "mango exfoliating body scrub jar beauty bodycare product photography white background 4k high quality" },
    { title: "Volumizing Hair Spray", cat: "Beauty", sub: "Hair Care", gender: "Women", price: 22, prompt: "volumizing hair spray aerosol can beauty haircare product photography white background 4k high quality" },
    
    // Men
    { title: "Men Slim Fit Checkered Shirt", cat: "Fashion", sub: "Shirt", gender: "Men", price: 38, prompt: "men slim fit checkered casual button up shirt product photography white background 4k high quality" },
    { title: "Men Suede Chukka Boots", cat: "Fashion", sub: "Footwear", gender: "Men", price: 75, prompt: "men brown suede chukka desert boots footwear product photography white background 4k high quality" },
    { title: "Men Minimalist Leather Wallet", cat: "Fashion", sub: "Accessories", gender: "Men", price: 30, prompt: "men minimalist black leather bifold wallet product photography white background 4k high quality" },
    { title: "Men Lightweight Windbreaker", cat: "Fashion", sub: "Jacket", gender: "Men", price: 60, prompt: "men lightweight neon green windbreaker jacket outerwear product photography white background 4k high quality" },

    // Women
    { title: "Women Quilted Crossbody Bag", cat: "Fashion", sub: "Accessories", gender: "Women", price: 42, prompt: "women pink quilted leather crossbody shoulder bag product photography white background 4k high quality" },
    { title: "Women Pointed Toe Stilettos", cat: "Fashion", sub: "Footwear", gender: "Women", price: 58, prompt: "women red pointed toe stiletto heels pumps shoes product photography white background 4k high quality" },
    { title: "Women Classic Trench Coat", cat: "Fashion", sub: "Jacket", gender: "Women", price: 95, prompt: "women classic beige trench coat outerwear product photography white background 4k high quality" },
    { title: "Women Chunky Gold Hoop Earrings", cat: "Fashion", sub: "Accessories", gender: "Women", price: 20, prompt: "women chunky thick gold hoop earrings jewelry product photography white background 4k high quality" },
    
    // Kids
    { title: "Kids Wooden Building Blocks", cat: "Toys", sub: "Toys", gender: "Kids", price: 28, prompt: "kids colorful wooden building blocks toy set product photography white background 4k high quality" },
    { title: "Kids Dinosaur Soft Plush", cat: "Toys", sub: "Toys", gender: "Kids", price: 18, prompt: "cute green dinosaur t-rex soft plush stuffed toy product photography white background 4k high quality" },
    { title: "Kids Educational Tablet", cat: "Electronics", sub: "Electronics", gender: "Kids", price: 45, prompt: "kids educational colorful learning tablet toy product photography white background 4k high quality" },
    { title: "Kids Superhero Cape Set", cat: "Fashion", sub: "Accessories", gender: "Kids", price: 15, prompt: "kids red superhero cape and mask set product photography white background 4k high quality" }
];

const BASE_OUT = path.join(__dirname, '..', 'multi-vendor-frontend', 'public', 'products');
if (!fs.existsSync(BASE_OUT)) fs.mkdirSync(BASE_OUT, { recursive: true });

function formatFilename(title) {
    return title.toLowerCase().replace(/[^a-z0-9]/g, '_') + '.png';
}

async function insertIntoDb() {
    console.log("Adding " + NEW_PRODUCTS.length + " new products across all categories...");
    const vendor = await prisma.user.findFirst({where:{isVendor:true}});
    
    for (const item of NEW_PRODUCTS) {
        const file = formatFilename(item.title);
        const relativePath = `/products/${item.cat.toLowerCase()}/${file}`;
        
        // ensure dir
        const dir = path.join(BASE_OUT, item.cat.toLowerCase());
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        // upsert logic
        const ex = await prisma.product.findFirst({ where: { title: item.title } });
        if (!ex) {
            await prisma.product.create({
                data: {
                    title: item.title,
                    description: item.title + " - Premium Quality 100% Guaranteed.",
                    price: item.price,
                    stock: 50,
                    size: "One Size",
                    gender: item.gender,
                    category: item.cat,
                    subcategory: item.sub,
                    vendorId: vendor.id,
                    image: `https://placehold.co/400x500/f3f4f6/a3a8b4?text=${encodeURIComponent(item.title)}`
                }
            });
        }
    }
    console.log("Database updated seamlessly!");
}

// ──────── AI Horde ────────
const delay = ms => new Promise(r => setTimeout(r, ms));
function hordeRequest(prompt) {
    const data = JSON.stringify({ prompt: prompt + ", highly detailed, studio photography", params: { width: 512, height: 512, steps: 25 }, nsfw: false, censor_nsfw: true, models: ["Dreamshaper"] });
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
    const file = formatFilename(item.title);
    const relativePath = `/products/${item.cat.toLowerCase()}/${file}`;
    const product = await prisma.product.findFirst({ where: { title: item.title } });
    if (product) {
        await prisma.product.update({ where: { id: product.id }, data: { image: relativePath } });
    }
}

async function generatorLoop() {
    console.log("Starting generation loop for across-the-board update...");
    for (const item of NEW_PRODUCTS) {
        const file = formatFilename(item.title);
        const dest = path.join(BASE_OUT, item.cat.toLowerCase(), file);
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
    console.log("All broad products fully generated!");
}

async function run() {
    await insertIntoDb();
    generatorLoop().then(() => prisma.$disconnect()).catch(async e => { console.error(e); await prisma.$disconnect(); });
}
run();
