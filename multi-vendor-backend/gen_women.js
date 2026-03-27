const fs = require('fs');
const path = require('path');
const https = require('https');

const OUT = path.join(__dirname, '..', 'multi-vendor-frontend', 'public', 'products', 'women');

const images = [
    // Footwear remaining
    { name: 'women_kitten_heels.png', prompt: 'elegant pointed toe kitten heel pumps in dusty pink for women on white background, product photography, ecommerce, 4k' },
    // Dresses (5)
    { name: 'women_bodycon_dress.png', prompt: 'a young indian woman wearing a black bodycon cocktail dress, white studio background, full body, product photography, elegant, 4k' },
    { name: 'women_maxi_dress.png', prompt: 'a young indian woman wearing a floral a-line maxi dress, white studio background, full body, product photography, elegant' },
    { name: 'women_jumpsuit.png', prompt: 'a young indian woman wearing a floral printed jumpsuit, white studio background, full body, product photography, fashion' },
    { name: 'women_shirt_dress.png', prompt: 'a young indian woman wearing a blue button up shirt dress, white studio background, full body, product photography, casual' },
    { name: 'women_prom_dress.png', prompt: 'a young indian woman wearing a red evening prom gown dress, white studio background, full body, product photography, elegant, 4k' },
    // Ethnic Wear (5)
    { name: 'women_silk_saree.png', prompt: 'a beautiful indian woman wearing a red and gold banarasi silk saree, white studio background, full body, traditional, product photography, 4k' },
    { name: 'women_anarkali.png', prompt: 'a beautiful indian woman wearing a maroon anarkali kurta suit set, white studio background, full body, traditional, product photography' },
    { name: 'women_lehenga.png', prompt: 'a beautiful indian woman wearing a bridal red and gold lehenga choli, white studio background, full body, bridal, product photography, 4k' },
    { name: 'women_salwar.png', prompt: 'a beautiful indian woman wearing an embroidered blue salwar kameez suit, white studio background, full body, traditional, product photography' },
    { name: 'women_sharara.png', prompt: 'a beautiful indian woman wearing a green sharara set with dupatta, white studio background, full body, traditional, product photography' },
    // Jackets (5)
    { name: 'women_leather_jacket.png', prompt: 'a young indian woman wearing a black leather biker jacket, white studio background, half body, product photography, fashion, 4k' },
    { name: 'women_denim_jacket.png', prompt: 'a young indian woman wearing a blue denim jacket, white studio background, half body, product photography, casual, fashion' },
    { name: 'women_winter_coat.png', prompt: 'a young indian woman wearing a long beige winter wool coat, white studio background, full body, product photography, elegant' },
    { name: 'women_blazer.png', prompt: 'a young indian woman wearing a formal black blazer over white shirt, white studio background, half body, product photography, office wear' },
    { name: 'women_puffer_jacket.png', prompt: 'a young indian woman wearing a pink puffer winter jacket, white studio background, half body, product photography, fashion' },
    // Accessories (7)
    { name: 'women_pearl_earrings.png', prompt: 'elegant pearl stud earrings for women on white background, jewelry product photography, close up, luxury, 4k' },
    { name: 'women_gold_necklace.png', prompt: 'a gold statement necklace for women on white background, jewelry product photography, luxury, elegant, 4k' },
    { name: 'women_crossbody_bag.png', prompt: 'a brown leather crossbody handbag for women on white background, product photography, fashion, 4k' },
    { name: 'women_tote_bag.png', prompt: 'a canvas tote bag for women in beige and brown on white background, product photography, fashion' },
    { name: 'women_cateye_sunglasses.png', prompt: 'a young indian woman wearing cat eye sunglasses, white background, portrait, fashion product photography' },
    { name: 'women_rosegold_watch.png', prompt: 'an elegant rose gold womens wrist watch on white background, product photography, luxury, 4k' },
    { name: 'women_silk_scarf.png', prompt: 'a colorful printed silk scarf for women on white background, product photography, fashion, elegant' },
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
        return "SKIP";
    }
    console.log("[" + idx + "/" + total + "] " + item.name);

    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            await delay(2000);
            const reqRes = await requestImage(item.prompt);
            if (!reqRes.id) { console.log("  No ID, retry..."); await delay(5000); continue; }

            let tries = 0;
            while (tries < 40) { await delay(3000); const s = await checkStatus(reqRes.id); if (s.done) break; tries++; }

            const final = await getResult(reqRes.id);
            if (final.generations && final.generations.length > 0) {
                await downloadFile(final.generations[0].img, dest);
                console.log("  OK!");
                return "OK";
            }
        } catch (e) { console.log("  ERR: " + e.message); }
    }
    console.log("  FAILED");
    return "FAIL";
}

async function main() {
    if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
    console.log("Generating " + images.length + " Women's images via AI Horde...\n");

    for (let i = 0; i < images.length; i++) {
        await generateOne(images[i], i + 1, images.length);
    }

    let ok = 0;
    for (const img of images) { if (fs.existsSync(path.join(OUT, img.name)) && fs.statSync(path.join(OUT, img.name)).size > 5000) ok++; }
    console.log("\nDone! " + ok + "/" + images.length + " OK");
}

main();
