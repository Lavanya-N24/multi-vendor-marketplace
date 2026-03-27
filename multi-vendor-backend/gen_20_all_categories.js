const fs = require('fs');
const path = require('path');
const https = require('https');
const { PrismaClient } = require('./prisma/generated/prisma');
const prisma = new PrismaClient();

const BASE_OUT = path.join(__dirname, '..', 'multi-vendor-frontend', 'public', 'products');
if (!fs.existsSync(BASE_OUT)) fs.mkdirSync(BASE_OUT, { recursive: true });

function formatFilename(title) {
    return title.toLowerCase().replace(/[^a-z0-9]/g, '_') + '.png';
}

const delay = ms => new Promise(r => setTimeout(r, ms));
function hordeRequest(prompt) {
    const data = JSON.stringify({ prompt: prompt + ", beautiful, high resolution photography, clean background", params: { width: 512, height: 512, steps: 25 }, nsfw: false, censor_nsfw: true, models: ["Dreamshaper"] });
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

async function run() {
    console.log("Fetching up to 20 missing items from each category...");
    const productsToFix = [];
    const categories = ['Electronics', 'Sports', 'Books', 'Fashion', 'Beauty', 'Home', 'Toys'];
    
    for (const cat of categories) {
        let items = await prisma.product.findMany({
            where: { category: cat, image: { contains: "placehold" } },
            take: 20
        });
        
        // If the category is Fashion we need to filter further because "Fashion" encompasses Men/Women/GenZ.
        productsToFix.push(...items);
        console.log(`- Fetched ${items.length} missing items for ${cat}`);
    }
    
    console.log(`\nTotal items selected for AI generation: ${productsToFix.length}`);
    console.log("Commencing AI Horde mega-loop! (This will run seamlessly in the background)");
    
    let processed = 0;
    for (const item of productsToFix) {
        processed++;
        const safeCat = (item.category || "unknown").toLowerCase();
        const file = formatFilename(item.title);
        const dir = path.join(BASE_OUT, safeCat);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const dest = path.join(dir, file);
        const relativePath = `/products/${safeCat}/${file}`;

        if (fs.existsSync(dest) && fs.statSync(dest).size > 3000) {
            await prisma.product.update({ where: { id: item.id }, data: { image: relativePath } });
            console.log(`[${processed}/${productsToFix.length}] ⏩ Exists: ${item.title}`);
            continue;
        }

        const promptTemplate = `${item.title} isolated ecommerce product shot clean studio lighting crisp professional details 4k`;
        let id = null;
        for (let tries = 0; tries < 2 && !id; tries++) {
            try { const rd = await hordeRequest(promptTemplate); id = rd.id; } catch(e) {}
            await delay(3000);
        }
        if (!id) { console.log(`[${processed}/${productsToFix.length}] ❌ Failed to request: ${item.title}`); continue; }

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
                    await prisma.product.update({ where: { id: item.id }, data: { image: relativePath } });
                    console.log(`[${processed}/${productsToFix.length}] ✅ Gen OK: ${item.title}`);
                } else console.log(`[${processed}/${productsToFix.length}] ❌ Download failed: ${item.title}`);
            } else console.log(`[${processed}/${productsToFix.length}] ❌ No generation for: ${item.title}`);
        } catch(e) { console.log(`[${processed}/${productsToFix.length}] ❌ Gen error for: ${item.title}`); }
    }
    
    console.log(`\n🎉 Mass multi-category generation fully completed!`);
    await prisma.$disconnect();
}

run().catch(console.error);
