const fs = require('fs');
const path = require('path');
const https = require('https');

const OUT_W = path.join(__dirname, '..', 'multi-vendor-frontend', 'public', 'products', 'women');
const OUT_B = path.join(__dirname, '..', 'multi-vendor-frontend', 'public', 'products', 'beauty');

const images = [
    // === EXTRA WOMEN FASHION ===
    // Tops
    { dir: OUT_W, name: 'women_white_tshirt.png', prompt: 'a young indian woman wearing a basic white t-shirt, clean studio white background, half body shot, product photography' },
    { dir: OUT_W, name: 'women_high_neck_top.png', prompt: 'a young indian woman wearing a black high neck top, clean studio white background, half body shot, product photography' },
    { dir: OUT_W, name: 'women_satin_cami.png', prompt: 'a young indian woman wearing a sleek satin camisole top, clean studio white background, half body, product photography' },
    // Jeans
    { dir: OUT_W, name: 'women_ripped_mom_jeans.png', prompt: 'a young indian woman wearing ripped mom jeans and a white tee, clean studio white background, full body, fashion product photography' },
    { dir: OUT_W, name: 'women_bootcut_jeans.png', prompt: 'a young indian woman wearing classic blue bootcut jeans, clean studio white background, full body, fashion product photography' },
    { dir: OUT_W, name: 'women_vintage_jeans.png', prompt: 'a young indian woman wearing vintage faded wash jeans, clean studio white background, full body, fashion product photography' },
    { dir: OUT_W, name: 'women_cropped_jeans.png', prompt: 'a young indian woman wearing light blue cropped jeans, clean studio white background, full body, fashion product photography' },
    { dir: OUT_W, name: 'women_wideleg_jeans.png', prompt: 'a young indian woman wearing black wide leg denim jeans, clean studio white background, full body, fashion product photography' },
    // Footwear
    { dir: OUT_W, name: 'women_white_sneakers.png', prompt: 'a pair of classic white canvas sneakers for women on white background, product photography, ecommerce' },
    { dir: OUT_W, name: 'women_running_shoes.png', prompt: 'a pair of pink and grey lightweight running athletic shoes for women on white background, product photography' },
    { dir: OUT_W, name: 'women_comfort_sandals.png', prompt: 'a pair of brown leather comfort flat sandals for women on white background, product photography, ecommerce' },
    { dir: OUT_W, name: 'women_knee_high_boots.png', prompt: 'a pair of elegant black leather knee high boots for women on white background, product photography' },
    // Dresses
    { dir: OUT_W, name: 'women_summer_dress.png', prompt: 'a young indian woman wearing a breezy summer floral mini dress, white studio background, full body, product photography' },
    { dir: OUT_W, name: 'women_wrap_midi_dress.png', prompt: 'a young indian woman wearing an elegant green wrap midi dress, white studio background, full body, product photography' },
    { dir: OUT_W, name: 'women_slip_dress.png', prompt: 'a young indian woman wearing a black silk slip dress, white studio background, full body, elegant product photography' },
    { dir: OUT_W, name: 'women_boho_dress.png', prompt: 'a young indian woman wearing a bohemian tiered ruffled dress, white studio background, full body, product photography' },
    { dir: OUT_W, name: 'women_velvet_dress.png', prompt: 'a young indian woman wearing a luxurious burgundy velvet party dress, white studio background, full body, product photography' },
    // Ethnic
    { dir: OUT_W, name: 'women_kurta_set.png', prompt: 'a beautiful indian woman wearing a white and blue cotton printed kurta set, white studio background, full body, product photography' },
    { dir: OUT_W, name: 'women_georgette_saree.png', prompt: 'a beautiful indian woman wearing a flowy floral georgette saree, white studio background, full body, product photography' },
    { dir: OUT_W, name: 'women_chikankari.png', prompt: 'a beautiful indian woman wearing a pastel pink chikankari embroidered kurti, white studio background, full body, product photography' },
    { dir: OUT_W, name: 'women_gown.png', prompt: 'a beautiful indian woman wearing an embellished ethnic gown, white studio background, full body, elegant product photography' },
    { dir: OUT_W, name: 'women_palazzo_set.png', prompt: 'a beautiful indian woman wearing a chic printed top and palazzo pants ethnic set, white studio background, full body, product photography' },
    // Jackets
    { dir: OUT_W, name: 'women_cropped_denim.png', prompt: 'a young indian woman wearing a stylish cropped light blue denim jacket, white studio background, half body, product photography' },
    { dir: OUT_W, name: 'women_faux_fur.png', prompt: 'a young indian woman wearing a glamorous white faux fur coat, white studio background, full body, elegant product photography' },
    { dir: OUT_W, name: 'women_windbreaker.png', prompt: 'a young indian woman wearing a pink lightweight sporty windbreaker jacket, white studio background, half body, product photography' },
    { dir: OUT_W, name: 'women_trench_coat.png', prompt: 'a young indian woman wearing a classic beige trench coat over a white top, white studio background, full body, product photography' },
    { dir: OUT_W, name: 'women_moto_jacket.png', prompt: 'a young indian woman wearing a brown suede moto biker jacket, white studio background, half body, product photography' },
    // Accessories
    { dir: OUT_W, name: 'women_hoop_earrings.png', prompt: 'a pair of elegant gold hoop earrings for women on clean white background, jewelry product photography, close up' },
    { dir: OUT_W, name: 'women_leather_belt.png', prompt: 'a stylish brown leather fashion belt for women with gold buckle on white background, product photography' },
    { dir: OUT_W, name: 'women_scrunchies.png', prompt: 'a set of colorful silk hair scrunchies accessories on white background, product photography' },

    // === WOMEN BEAUTY ITEMS ===
    { dir: OUT_B, name: 'vitc_serum.png', prompt: 'a bottle of women vitamin c brightening face serum with dropper, clean white background, beauty product photography' },
    { dir: OUT_B, name: 'hyaluronic_serum.png', prompt: 'a bottle of women hyaluronic acid face serum, elegant packaging, clean white background, beauty product macro shot' },
    { dir: OUT_B, name: 'niacinamide_serum.png', prompt: 'a sleek bottle of niacinamide pore minimizer serum, white background, cosmetic product photography' },
    { dir: OUT_B, name: 'retinol_serum.png', prompt: 'a bottle of women retinol anti-aging serum, violet luxury packaging, clean white background, beauty product photography' },
    { dir: OUT_B, name: 'day_cream.png', prompt: 'a jar of women day cream moisturizer spf 30, white background, cosmetic product photography, luxury' },
    { dir: OUT_B, name: 'night_cream.png', prompt: 'a dark blue jar of women night repair cream moisturizer, clean white background, beauty product macro shot' },
    { dir: OUT_B, name: 'gel_moisturizer.png', prompt: 'a jar of translucent blue aqua gel face moisturizer, clean white background, beauty product photography' },
    { dir: OUT_B, name: 'aloe_moisturizer.png', prompt: 'a green jar of aloe vera face moisturizer cream, white background, organic cosmetic product photography' },
    { dir: OUT_B, name: 'sunscreen_matte.png', prompt: 'a tube of women spf50 matte sunscreen lotion, white background, modern cosmetic product photography' },
    { dir: OUT_B, name: 'sunscreen_tinted.png', prompt: 'a tube of tinted face sunscreen, beige packaging, clean white background, beauty product photography' },
    { dir: OUT_B, name: 'sunscreen_gel.png', prompt: 'a pump bottle of light blue sunscreen gel lotion, clean white background, beauty product photography' },
    { dir: OUT_B, name: 'lipstick_set.png', prompt: 'a set of matte liquid lipsticks in various pink and red shades, isolated on white background, beauty product photography' },
    { dir: OUT_B, name: 'foundation.png', prompt: 'a glass bottle of full coverage liquid face foundation, clean white background, makeup product photography' },
    { dir: OUT_B, name: 'concealer.png', prompt: 'a wand tube of makeup concealer, clean white background, high-end cosmetic product photography' },
    { dir: OUT_B, name: 'mascara.png', prompt: 'a sleek black tube of volumizing eyelash mascara with the wand showing, white background, makeup product photography' },
    { dir: OUT_B, name: 'eyeshadow.png', prompt: 'an 18 shade colorful eyeshadow makeup palette, open, white background, beauty product macro shot' },
    { dir: OUT_B, name: 'blush.png', prompt: 'a powder blush makeup compact duo in pink and peach, open, white background, beauty product photography' },
    { dir: OUT_B, name: 'setting_spray.png', prompt: 'a spray bottle of makeup setting spray, clean white background, cosmetic product photography' },
    { dir: OUT_B, name: 'eyeliner.png', prompt: 'a black liquid waterproof eyeliner pen, isolated on white background, makeup product photography' },
    { dir: OUT_B, name: 'hair_oil.png', prompt: 'a glowing amber bottle of argan oil hair repair treatment, clean white background, beauty product photography' },
    { dir: OUT_B, name: 'keratin_shampoo.png', prompt: 'a premium bottle of women keratin hair shampoo, white background, cosmetic product photography' },
    { dir: OUT_B, name: 'hair_conditioner.png', prompt: 'a bottle of deep moisture hair conditioner, clean white background, hair care product photography' },
    { dir: OUT_B, name: 'hair_mask.png', prompt: 'a large jar of intensive protein hair mask treatment, clean white background, beauty product photography' },
    { dir: OUT_B, name: 'heat_protect.png', prompt: 'a spray bottle of hair heat protectant spray, clean white background, professional salon product photography' },
    { dir: OUT_B, name: 'body_lotion.png', prompt: 'a large pump bottle of shea butter body lotion, clean white background, cosmetic product photography' },
    { dir: OUT_B, name: 'shower_gel.png', prompt: 'a clear bottle of pink rose scented shower gel body wash, white background, beauty product photography' },
    { dir: OUT_B, name: 'body_scrub.png', prompt: 'a jar of exfoliating coffee body scrub, clean white background, organic cosmetic product photography' },
    { dir: OUT_B, name: 'hand_cream.png', prompt: 'a beautiful gift set of three floral hand cream tubes, clean white background, beauty product photography' },
    { dir: OUT_B, name: 'body_oil.png', prompt: 'a glass bottle of coconut glowing body oil with dropper, white background, beauty luxury product photography' },
    { dir: OUT_B, name: 'perfume_floral.png', prompt: 'an elegant glass bottle of womens floral eau de parfum spray, clean white background, luxury fragrance product photography' },
    { dir: OUT_B, name: 'body_mist.png', prompt: 'a spray bottle of vanilla scented body mist for women, clean white background, beauty product photography' },
    { dir: OUT_B, name: 'perfume_gift.png', prompt: 'a luxury gift set of three small womens perfumes in a beautiful box, white background, product photography' },
    { dir: OUT_B, name: 'makeup_brushes.png', prompt: 'a professional 12 piece makeup brush set in a leather pouch, clean white background, beauty accessories product photography' },
    { dir: OUT_B, name: 'jade_roller.png', prompt: 'a green jade facial massage stone roller and gua sha set, isolated on white background, beauty product photography' },
    { dir: OUT_B, name: 'hair_dryer.png', prompt: 'a modern sleek ionic hair dryer tool, black and rose gold, clean white background, tech beauty product photography' },
    { dir: OUT_B, name: 'hair_straightener.png', prompt: 'a professional ceramic flat iron hair straightener, white background, salon tools product photography' },
    { dir: OUT_B, name: 'cleansing_brush.png', prompt: 'a pink silicone electric facial cleansing brush, white background, skincare tech tool product photography' },
    { dir: OUT_B, name: 'beauty_blender.png', prompt: 'a set of pink and beige makeup sponge beauty blenders, clean white background, beauty accessories product photography' }
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

// parallel batch to make it faster
async function processBatch(batch, batchNum, total) {
  const results = await Promise.allSettled(batch.map(async (item, idx) => {
    const globalIdx = batchNum * 3 + idx + 1;
    try {
      const result = await generateOne(item, globalIdx, total);
      return result;
    } catch (e) {
      console.log("[" + globalIdx + "/" + total + "] " + item.name + " -> ERR: " + e.message);
      return "ERR";
    }
  }));
  return results;
}

async function main() {
  console.log("Generating " + images.length + " images via AI Horde (3 at a time)...\n");
  
  for (let i = 0; i < images.length; i += 3) {
    const batch = images.slice(i, i + 3);
    await processBatch(batch, Math.floor(i / 3), images.length);
    if (i + 3 < images.length) await delay(1000);
  }
  
  let ok = 0, fail = 0;
  for (const img of images) {
    const p = path.join(img.dir, img.name);
    if (fs.existsSync(p) && fs.statSync(p).size > 5000) ok++;
    else fail++;
  }
  console.log("\nAll done! OK=" + ok + " FAIL=" + fail);
}

main();
