const fs = require('fs');
const path = require('path');
const https = require('https');

const OUT_W = path.join(__dirname, '..', 'multi-vendor-frontend', 'public', 'products', 'women');
const OUT_B = path.join(__dirname, '..', 'multi-vendor-frontend', 'public', 'products', 'beauty');

const images = [
    // === EXTRA BAGS (8) ===
    { dir: OUT_W, name: 'women_hobo_bag.png', prompt: 'a stylish brown leather hobo bag for women on white background, product photography' },
    { dir: OUT_W, name: 'women_clutch_bag.png', prompt: 'an elegant silver evening clutch purse for women on white background, product photography' },
    { dir: OUT_W, name: 'women_backpack_purse.png', prompt: 'a chic black leather mini backpack purse for women on white background, product photography' },
    { dir: OUT_W, name: 'women_satchel_bag.png', prompt: 'a tan leather satchel handbag for women on white background, luxury product photography' },
    { dir: OUT_W, name: 'women_straw_bag.png', prompt: 'a woven straw summer beach bag for women on clean white background, product photography' },
    { dir: OUT_W, name: 'women_bucket_bag.png', prompt: 'a stylish bucket bag with drawstring for women on white background, fashion product photography' },
    { dir: OUT_W, name: 'women_quilted_bag.png', prompt: 'a luxury quilted black chain shoulder bag for women on white background, jewelry product photography' },
    { dir: OUT_W, name: 'women_messenger_bag.png', prompt: 'a leather messenger crossbody bag for women on white background, product photography' },

    // === EXTRA SUNGLASSES (9) ===
    { dir: OUT_W, name: 'women_aviator_sunglasses.png', prompt: 'womens rose gold aviator sunglasses on white background, fashion product photography' },
    { dir: OUT_W, name: 'women_oversized_sunglasses.png', prompt: 'large oversized black square sunglasses for women on white background, glamour product photography' },
    { dir: OUT_W, name: 'women_round_sunglasses.png', prompt: 'retro round metal frame sunglasses for women on white background, product photography' },
    { dir: OUT_W, name: 'women_wayfarer_sunglasses.png', prompt: 'classic tortoise shell wayfarer sunglasses for women on white background, product photography' },
    { dir: OUT_W, name: 'women_heart_sunglasses.png', prompt: 'pink heart shaped sunglasses for women on clean white background, product photography' },
    { dir: OUT_W, name: 'women_shield_sunglasses.png', prompt: 'futuristic shield visor sunglasses for women on white background, fashion product photography' },
    { dir: OUT_W, name: 'women_clubmaster_sunglasses.png', prompt: 'half frame clubmaster sunglasses for women on white background, product photography' },
    { dir: OUT_W, name: 'women_rimless_sunglasses.png', prompt: 'elegant rimless tinted sunglasses for women on white background, luxury product photography' },
    { dir: OUT_W, name: 'women_polygon_sunglasses.png', prompt: 'geometric polygon hexagon sunglasses for women on white background, product photography' },

    // === EXTRA SERUMS (6) ===
    { dir: OUT_B, name: 'serum_salicylic.png', prompt: 'a bottle of salicylic acid face serum, clean white background, beauty product photography' },
    { dir: OUT_B, name: 'serum_peptides.png', prompt: 'a luxury bottle of multi-peptide anti-aging serum, clean white background, skincare product photography' },
    { dir: OUT_B, name: 'serum_glow.png', prompt: 'a glowing bottle of radiant face glow serum with dropper, white background, cosmetic product photography' },
    { dir: OUT_B, name: 'serum_snail_mucin.png', prompt: 'a pump bottle of snail mucin essence serum, clean white background, skincare product photography' },
    { dir: OUT_B, name: 'serum_eye.png', prompt: 'a small bottle of caffeine eye serum with roller, clean white background, beauty product macro shot' },
    { dir: OUT_B, name: 'serum_collagen.png', prompt: 'a luxurious gold bottle of collagen boosting serum, white background, anti-aging skincare product photography' },

    // === EXTRA LIPSTICKS (9) ===
    { dir: OUT_B, name: 'lipstick_red.png', prompt: 'a classic ruby red matte lipstick bullet, open, isolated on white background, makeup product photography' },
    { dir: OUT_B, name: 'lipstick_nude.png', prompt: 'a natural creamy nude pink lipstick bullet, open, clean white background, beauty product photography' },
    { dir: OUT_B, name: 'lipstick_gloss.png', prompt: 'a tube of shiny lip gloss with applicator wand showing, white background, makeup product photography' },
    { dir: OUT_B, name: 'lipstick_stain.png', prompt: 'a sleek bottle of cherry red lip tint stain, white background, cosmetic product photography' },
    { dir: OUT_B, name: 'lipstick_plum.png', prompt: 'a dark plum vampy burgundy lipstick bullet, open, isolated on white background, makeup product photography' },
    { dir: OUT_B, name: 'lipstick_crayon.png', prompt: 'a thick lip crayon pencil in coral pink, clean white background, makeup product photography' },
    { dir: OUT_B, name: 'lipstick_balm.png', prompt: 'a tinted moisturizing lip balm stick, clean white background, beauty product photography' },
    { dir: OUT_B, name: 'lipstick_palette.png', prompt: 'a professional lip color palette with multiple shades, open, white background, makeup product photography' },
    { dir: OUT_B, name: 'lipstick_liquid_nude.png', prompt: 'a tube of nude velvet liquid lipstick with wand, clean white background, cosmetic product photography' },
];

const delay = ms => new Promise(r => setTimeout(r, ms));

async function requestImage(prompt) {
  const data = JSON.stringify({ prompt, params: { width: 512, height: 512, steps: 30 }, nsfw: false, censor_nsfw: true, models: ["Dreamshaper"] });
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname: 'aihorde.net', path: '/api/v2/generate/async', method: 'POST', headers: { 'Content-Type': 'application/json', 'apikey': '0000000000' } }, res => {
      let r = ''; res.on('data', c => r += c); res.on('end', () => { try { resolve(JSON.parse(r)); } catch(e) { reject(e); } });
    }); req.on('error', reject); req.write(data); req.end();
  });
}

function checkStatus(id) {
  return new Promise((resolve, reject) => {
    https.get("https://aihorde.net/api/v2/generate/check/" + id, { headers: { 'apikey': '0000000000' } }, res => {
      let r = ''; res.on('data', c => r += c); res.on('end', () => { try { resolve(JSON.parse(r)); } catch(e) { reject(e); } });
    }).on('error', reject);
  });
}

function getResult(id) {
  return new Promise((resolve, reject) => {
    https.get("https://aihorde.net/api/v2/generate/status/" + id, { headers: { 'apikey': '0000000000' } }, res => {
      let r = ''; res.on('data', c => r += c); res.on('end', () => { try { resolve(JSON.parse(r)); } catch(e) { reject(e); } });
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
  if (!fs.existsSync(item.dir)) fs.mkdirSync(item.dir, { recursive: true });
  const dest = path.join(item.dir, item.name);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 5000) {
    console.log("[" + idx + "/" + total + "] SKIP: " + item.name);
    return;
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
        return;
      }
    } catch (e) { console.log("  ERR: " + e.message); }
  }
  console.log("  FAILED");
}

async function processBatch(batch, batchNum, total) {
  await Promise.allSettled(batch.map((item, idx) => generateOne(item, batchNum * 3 + idx + 1, total)));
}

async function main() {
  console.log("Generating " + images.length + " remaining images via AI Horde...\n");
  for (let i = 0; i < images.length; i += 3) {
    await processBatch(images.slice(i, i + 3), Math.floor(i / 3), images.length);
    if (i + 3 < images.length) await delay(1000);
  }
}

main();
