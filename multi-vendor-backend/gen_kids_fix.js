const fs = require('fs');
const path = require('path');
const https = require('https');
const { PrismaClient } = require('./prisma/generated/prisma');

const prisma = new PrismaClient();
const OUT = path.join(__dirname, '..', 'multi-vendor-frontend', 'public', 'products', 'kids');

// All 110 missing images with proper AI generation prompts
const MISSING = [
    // Girls Outerwear (3 missing files)
    { file: "girls_track_jacket.png", prompt: "girls children sports track jacket purple athletic wear studio product photo white background" },
    { file: "girls_shrug_white.png", prompt: "girls children white knit shrug bolero cardigan party layering studio product photo white background" },
    { file: "girls_puffer_lilac.png", prompt: "girls children lilac purple puffer jacket trendy warm winter coat studio product photo white background" },

    // Girls Ethnic (20 missing files)
    { file: "girls_lehenga_pink.png", prompt: "Indian girls pink embroidered lehenga choli festive ethnic kids clothing studio product photo white background" },
    { file: "girls_anarkali_turquoise.png", prompt: "Indian girls turquoise anarkali dress festive ethnic kids clothing studio product photo white background" },
    { file: "girls_salwar_floral.png", prompt: "Indian girls floral salwar kameez suit traditional clothing studio product photo white background" },
    { file: "girls_sharara_purple.png", prompt: "Indian girls purple sharara set dupatta festive ethnic clothing studio product photo white background" },
    { file: "girls_ghagra_mirror.png", prompt: "Indian girls ghagra choli with mirror work festive ethnic clothing studio product photo white background" },
    { file: "girls_pattu_pavadai.png", prompt: "Indian South Indian girls silk pattu pavadai half saree colorful studio product photo white background" },
    { file: "girls_kurti_palazzo.png", prompt: "Indian girls cotton kurti palazzo pants casual ethnic wear studio product photo white background" },
    { file: "girls_chanderi_gold.png", prompt: "Indian girls gold chanderi fabric dress premium festive clothing studio product photo white background" },
    { file: "girls_langa_voni.png", prompt: "Indian girls langa voni half saree colorful South Indian clothing studio product photo white background" },
    { file: "girls_ethnic_frock.png", prompt: "Indian girls embroidered ethnic frock fusion kids clothing studio product photo white background" },
    { file: "girls_anarkali_red.png", prompt: "Indian girls red silk anarkali gown wedding wear kids clothing studio product photo white background" },
    { file: "girls_lehenga_blue.png", prompt: "Indian girls blue designer lehenga with sequins festive wear studio product photo white background" },
    { file: "girls_kurta_set_pink.png", prompt: "Indian girls pink cotton kurta pajama set everyday ethnic wear studio product photo white background" },
    { file: "girls_ghagra_rajasthani.png", prompt: "Indian girls Rajasthani colorful ghagra choli bandhani work festive studio product photo white background" },
    { file: "girls_churidar_set.png", prompt: "Indian girls printed churidar suit dupatta party wear studio product photo white background" },
    { file: "girls_silk_frock.png", prompt: "Indian girls silk traditional frock South Indian temple wear studio product photo white background" },
    { file: "girls_anarkali_green.png", prompt: "Indian girls green floor length anarkali gown festive wear studio product photo white background" },
    { file: "girls_dhavani_set.png", prompt: "Indian girls half saree set davani golden border elegant studio product photo white background" },
    { file: "girls_gown_peach.png", prompt: "Indian girls peach embroidered party gown reception wear studio product photo white background" },
    { file: "girls_sharara_yellow.png", prompt: "Indian girls yellow sharara suit set festive ceremony wear studio product photo white background" },

    // Baby Clothing (20 missing files)
    { file: "baby_romper_pastel.png", prompt: "baby infant cotton romper pastel colors soft newborn clothing studio product photo white background" },
    { file: "baby_onesie_pack.png", prompt: "baby onesie bodysuit pack multicolor newborn essentials studio product photo white background" },
    { file: "baby_bodysuit_white.png", prompt: "baby full sleeve white bodysuit soft cotton infant clothing studio product photo white background" },
    { file: "baby_winter_jacket.png", prompt: "baby pink winter jacket with hood warm infant outerwear studio product photo white background" },
    { file: "baby_sleepsuit.png", prompt: "baby sleepsuit pajama front zipper comfortable sleepwear studio product photo white background" },
    { file: "baby_mitten_bodysuit.png", prompt: "baby bodysuit with fold-over mittens scratch-proof infant studio product photo white background" },
    { file: "baby_organic_top.png", prompt: "baby organic cotton t-shirt natural color eco-friendly clothing studio product photo white background" },
    { file: "baby_fleece_footie.png", prompt: "baby blue fleece footie pajama warm sleepwear infant studio product photo white background" },
    { file: "baby_summer_set.png", prompt: "baby summer outfit set shorts and tee lightweight clothing studio product photo white background" },
    { file: "baby_bear_jumpsuit.png", prompt: "baby jumpsuit cute bear ears hood adorable infant outfit studio product photo white background" },
    { file: "baby_ruffle_romper.png", prompt: "baby girl ruffle romper pink cute frilly infant outfit studio product photo white background" },
    { file: "baby_knitted_sweater.png", prompt: "baby cream knitted sweater cardigan hand-knit style infant studio product photo white background" },
    { file: "baby_dungaree.png", prompt: "baby denim dungaree overall cute infant outfit clothing studio product photo white background" },
    { file: "baby_bunting_bag.png", prompt: "baby bunting bag sleeping bag cozy warm swaddle newborn studio product photo white background" },
    { file: "baby_animal_set.png", prompt: "baby animal print outfit set with bib and hat cute infant studio product photo white background" },
    { file: "baby_tutu_dress.png", prompt: "baby girl tutu dress pink with headband party ready infant studio product photo white background" },
    { file: "baby_footed_pants.png", prompt: "baby footed pants pack soft cotton infant leggings studio product photo white background" },
    { file: "baby_hooded_towel_set.png", prompt: "baby hooded bath towel set with washcloth soft infant studio product photo white background" },
    { file: "baby_snowsuit.png", prompt: "baby one-piece snowsuit winter warm hooded infant outerwear studio product photo white background" },
    { file: "baby_sailor_set.png", prompt: "baby sailor outfit romper with hat nautical cute infant studio product photo white background" },

    // Kids Footwear (20 missing files)
    { file: "kids_velcro_sneakers.png", prompt: "children kids white velcro strap sneakers easy-wear shoes pair studio product photo white background" },
    { file: "kids_school_shoes.png", prompt: "children kids black formal school shoes uniform footwear pair studio product photo white background" },
    { file: "kids_lightup_shoes.png", prompt: "children kids LED light-up sneakers colorful glowing shoes pair studio product photo white background" },
    { file: "kids_sandals_summer.png", prompt: "children kids summer open-toe sandals comfortable outdoor pair studio product photo white background" },
    { file: "kids_running_blue.png", prompt: "children kids blue running athletic sports shoes pair studio product photo white background" },
    { file: "kids_canvas_slipon.png", prompt: "children kids white canvas slip-on casual shoes pair studio product photo white background" },
    { file: "kids_rain_boots.png", prompt: "children kids colorful rubber rain boots waterproof pair studio product photo white background" },
    { file: "kids_formal_leather.png", prompt: "children kids brown leather formal shoes party wear pair studio product photo white background" },
    { file: "kids_hightop_red.png", prompt: "children kids red high-top basketball sneakers sporty pair studio product photo white background" },
    { file: "kids_clogs.png", prompt: "children kids colorful comfort clogs lightweight shoes pair studio product photo white background" },
    { file: "kids_mary_jane.png", prompt: "children girls pink mary jane shoes cute party footwear pair studio product photo white background" },
    { file: "kids_hiking_boots.png", prompt: "children kids hiking boots brown outdoor adventure pair studio product photo white background" },
    { file: "kids_flip_flops.png", prompt: "children kids colorful flip flops beach casual footwear pair studio product photo white background" },
    { file: "kids_ballet_flats.png", prompt: "children girls silver ballet flat shoes elegant pair studio product photo white background" },
    { file: "kids_crocs_style.png", prompt: "children kids colorful clog sandals with charms fun pair studio product photo white background" },
    { file: "kids_sports_cleats.png", prompt: "children kids green sports football cleats athletic pair studio product photo white background" },
    { file: "kids_winter_boots.png", prompt: "children kids warm winter snow boots furry pair studio product photo white background" },
    { file: "kids_loafers.png", prompt: "children boys brown penny loafer shoes smart casual pair studio product photo white background" },
    { file: "kids_glitter_shoes.png", prompt: "children girls glitter sparkle shoes silver party fashion pair studio product photo white background" },
    { file: "kids_water_shoes.png", prompt: "children kids aqua water shoes neoprene swimming beach pair studio product photo white background" },

    // Kids Accessories (20 missing files)
    { file: "kids_backpack.png", prompt: "children kids cartoon character school backpack colorful bag studio product photo white background" },
    { file: "kids_water_bottle.png", prompt: "children kids stainless steel insulated water bottle BPA free studio product photo white background" },
    { file: "kids_sunglasses.png", prompt: "children kids colorful UV protection sunglasses fun shapes studio product photo white background" },
    { file: "kids_digital_watch.png", prompt: "children kids digital sports watch colorful waterproof studio product photo white background" },
    { file: "kids_baseball_cap.png", prompt: "children kids baseball cap adjustable casual sun hat studio product photo white background" },
    { file: "kids_hair_set.png", prompt: "children kids hair accessories set clips bows bands colorful studio product photo white background" },
    { file: "kids_lunch_box.png", prompt: "children kids insulated lunch box bag with compartments studio product photo white background" },
    { file: "kids_beanie_hat.png", prompt: "children kids knitted winter beanie hat pom pom studio product photo white background" },
    { file: "kids_belt.png", prompt: "children kids elastic stretch belt adjustable studio product photo white background" },
    { file: "kids_socks_pack.png", prompt: "children kids fun patterned socks pack cotton studio product photo white background" },
    { file: "kids_umbrella.png", prompt: "children kids colorful character umbrella rain protection studio product photo white background" },
    { file: "kids_scarf_knit.png", prompt: "children kids warm knitted scarf with tassels winter studio product photo white background" },
    { file: "kids_gloves.png", prompt: "children kids winter gloves warm fleece lined studio product photo white background" },
    { file: "kids_wallet.png", prompt: "children kids fun cartoon print wallet compact studio product photo white background" },
    { file: "kids_bucket_hat.png", prompt: "children kids cotton bucket hat colorful summer outdoor studio product photo white background" },
    { file: "kids_bow_tie_set.png", prompt: "children boys bow tie suspenders set formal party studio product photo white background" },
    { file: "kids_headband_set.png", prompt: "children girls headband set flowers bows cute studio product photo white background" },
    { file: "kids_mini_backpack.png", prompt: "children toddler mini backpack animal design small cute studio product photo white background" },
    { file: "kids_jewelry_set.png", prompt: "children girls play jewelry bracelet necklace set colorful beads studio product photo white background" },
    { file: "kids_travel_pillow.png", prompt: "children kids travel neck pillow soft animal shaped studio product photo white background" },

    // Kids Books (5 - need proper local images)
    { file: "kids_fairy_tales.png", prompt: "colorful illustrated fairy tales storybook for children hardcover studio product photo white background", dbTitle: "Fairy Tales Illustrated" },
    { file: "kids_science_book.png", prompt: "science experiments for kids educational book colorful cover studio product photo white background", dbTitle: "Science for Kids" },
    { file: "kids_activity_book.png", prompt: "activity book with puzzles and games for children colorful cover studio product photo white background", dbTitle: "Activity Book Puzzles" },
    { file: "kids_bedtime_stories.png", prompt: "bedtime stories treasury book for children illustrated cover studio product photo white background", dbTitle: "Bedtime Stories Treasury" },
    { file: "kids_world_atlas.png", prompt: "world atlas for kids colorful illustrated geography book cover studio product photo white background", dbTitle: "World Atlas for Kids" },

    // Baby Care Products (22 - need proper local images)
    { file: "baby_mild_soap.png", prompt: "baby mild soap bar gentle natural skincare product studio product photo white background", dbTitle: "Baby Mild Soap Bar" },
    { file: "baby_moisturizing_soap.png", prompt: "baby moisturizing soap bar creamy gentle skincare studio product photo white background", dbTitle: "Baby Moisturizing Soap" },
    { file: "baby_coconut_soap.png", prompt: "baby coconut soap bar natural organic skincare studio product photo white background", dbTitle: "Baby Coconut Soap" },
    { file: "baby_oatmeal_soap.png", prompt: "baby oatmeal soap bar soothing natural skincare studio product photo white background", dbTitle: "Baby Oatmeal Soap" },
    { file: "baby_tearfree_shampoo.png", prompt: "baby tear-free shampoo bottle gentle mild hair care studio product photo white background", dbTitle: "Baby Tear-Free Shampoo Gentle" },
    { file: "baby_coconut_shampoo.png", prompt: "baby shampoo coconut milk bottle hair care gentle studio product photo white background", dbTitle: "Baby Shampoo Coconut Milk" },
    { file: "baby_nourishing_shampoo.png", prompt: "baby nourishing shampoo bottle gentle hair care studio product photo white background", dbTitle: "Baby Nourishing Shampoo" },
    { file: "baby_daily_lotion.png", prompt: "baby daily moisturizing lotion bottle skincare gentle studio product photo white background", dbTitle: "Baby Daily Moisturizing Lotion" },
    { file: "baby_lavender_lotion.png", prompt: "baby calming lavender lotion bottle purple skincare studio product photo white background", dbTitle: "Baby Calming Lavender Lotion" },
    { file: "baby_shea_lotion.png", prompt: "baby shea butter lotion bottle natural skincare studio product photo white background", dbTitle: "Baby Shea Butter Lotion" },
    { file: "baby_talcfree_powder.png", prompt: "baby talc-free natural powder bottle container skincare studio product photo white background", dbTitle: "Baby Talc-Free Natural Powder" },
    { file: "baby_cornstarch_powder.png", prompt: "baby corn starch powder bottle container gentle skincare studio product photo white background", dbTitle: "Baby Corn Starch Powder" },
    { file: "baby_cooling_powder.png", prompt: "baby cooling powder bottle container refresh skincare studio product photo white background", dbTitle: "Baby Cooling Powder" },
    { file: "baby_coconut_oil.png", prompt: "baby massage oil coconut bottle natural skincare studio product photo white background", dbTitle: "Baby Massage Oil Coconut" },
    { file: "baby_sesame_oil.png", prompt: "baby massage oil sesame bottle natural skincare studio product photo white background", dbTitle: "Baby Massage Oil Sesame" },
    { file: "baby_chamomile_oil.png", prompt: "baby soothing oil chamomile bottle natural skincare studio product photo white background", dbTitle: "Baby Soothing Oil Chamomile" },
    { file: "baby_diaper_cream.png", prompt: "baby diaper rash cream tube skincare protection studio product photo white background", dbTitle: "Baby Diaper Rash Cream" },
    { file: "baby_winter_cream.png", prompt: "baby winter cream jar moisturizing protection skincare studio product photo white background", dbTitle: "Baby Winter Cream" },
    { file: "baby_face_cream.png", prompt: "baby nourishing face cream jar gentle skincare studio product photo white background", dbTitle: "Baby Nourishing Face Cream" },
    { file: "baby_headtotoe_wash.png", prompt: "baby head-to-toe wash bottle gentle cleanser skincare studio product photo white background", dbTitle: "Baby Head-to-Toe Wash" },
    { file: "baby_body_wash.png", prompt: "baby gentle body wash bottle mild cleanser skincare studio product photo white background", dbTitle: "Baby Gentle Body Wash" },
    { file: "baby_foam_wash.png", prompt: "baby foam wash sensitive pump bottle gentle cleanser skincare studio product photo white background", dbTitle: "Baby Foam Wash Sensitive" },
];

const delay = ms => new Promise(r => setTimeout(r, ms));

// ──────── AI Horde (free, anonymous) ────────
function hordeRequest(prompt) {
    const data = JSON.stringify({
        prompt,
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
        https.get('https://aihorde.net/api/v2/generate/check/' + id, {
            headers: { 'apikey': '0000000000' }
        }, res => {
            let r = ''; res.on('data', c => r += c);
            res.on('end', () => { try { resolve(JSON.parse(r)); } catch (e) { reject(e); } });
        }).on('error', reject);
    });
}

function hordeResult(id) {
    return new Promise((resolve, reject) => {
        https.get('https://aihorde.net/api/v2/generate/status/' + id, {
            headers: { 'apikey': '0000000000' }
        }, res => {
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
                https.get(res.headers.location, r2 => {
                    r2.pipe(f2);
                    f2.on('finish', () => { f2.close(); resolve(); });
                }).on('error', reject);
                return;
            }
            if (res.statusCode !== 200) { file.close(); return reject(new Error("HTTP " + res.statusCode)); }
            res.pipe(file);
            file.on('finish', () => { file.close(); resolve(); });
        }).on('error', (err) => { file.close(); reject(err); });
    });
}

async function updateDb(item) {
    const newPath = '/products/kids/' + item.file;

    if (item.dbTitle) {
        // For items with specific DB title (books, baby care)
        const product = await prisma.product.findFirst({
            where: { gender: "Kids", title: item.dbTitle }
        });
        if (product) {
            await prisma.product.update({ where: { id: product.id }, data: { image: newPath } });
            return true;
        }
    }

    // Try matching by original expected path
    const origPath = '/products/kids/' + item.file;
    const product = await prisma.product.findFirst({
        where: { gender: "Kids", image: origPath }
    });
    if (product) {
        await prisma.product.update({ where: { id: product.id }, data: { image: newPath } });
        return true;
    }

    // Fuzzy match by title
    const words = item.file.split(".")[0].split("_").filter(w => w.length > 2);
    const products = await prisma.product.findMany({ where: { gender: "Kids" } });
    for (const p of products) {
        let matches = 0;
        words.forEach(w => { if (p.title.toLowerCase().includes(w.toLowerCase())) matches++; });
        if (matches >= 2) {
            await prisma.product.update({ where: { id: p.id }, data: { image: newPath } });
            return true;
        }
    }
    return false;
}

async function generateOne(item) {
    const dest = path.join(OUT, item.file);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 3000) {
        return "SKIP";
    }

    let reqRes;
    for (let retry = 0; retry < 3; retry++) {
        try {
            reqRes = await hordeRequest(item.prompt);
            if (reqRes.id) break;
        } catch (e) { /* retry */ }
        await delay(5000);
    }
    if (!reqRes || !reqRes.id) return "FAIL_REQ";

    const id = reqRes.id;
    let attempts = 0;
    while (attempts < 90) {
        await delay(4000);
        try {
            const s = await hordeCheck(id);
            if (s.done) break;
        } catch (e) { /* retry */ }
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
    } catch (e) { /* fail */ }
    return "FAIL";
}

async function main() {
    if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

    // Filter to truly missing items
    const toGenerate = MISSING.filter(item => {
        const dest = path.join(OUT, item.file);
        return !fs.existsSync(dest) || fs.statSync(dest).size < 3000;
    });

    console.log('\n🎨 Kids Image Generator - Fix Missing Images (AI Horde FREE)');
    console.log('Total items: ' + MISSING.length + ' | Already exist: ' + (MISSING.length - toGenerate.length) + ' | To generate: ' + toGenerate.length + '\n');

    if (toGenerate.length === 0) {
        console.log('✅ All images already exist!');
        // Just update DB paths for all
        for (const item of MISSING) {
            await updateDb(item);
        }
        await prisma.$disconnect();
        return;
    }

    let ok = 0, fail = 0;
    const BATCH = 5;

    for (let i = 0; i < toGenerate.length; i += BATCH) {
        const batch = toGenerate.slice(i, i + BATCH);
        const results = await Promise.allSettled(batch.map(async (item, idx) => {
            const globalIdx = i + idx + 1;
            const result = await generateOne(item);
            const icon = result === "OK" ? "✅" : result === "SKIP" ? "⏭️" : "❌";
            console.log('[' + globalIdx + '/' + toGenerate.length + '] ' + icon + ' ' + item.file + ' -> ' + result);
            return result;
        }));

        results.forEach(r => {
            if (r.status === 'fulfilled' && r.value === "OK") ok++;
            else if (r.status === 'fulfilled' && r.value === "SKIP") ok++;
            else fail++;
        });

        if (i + BATCH < toGenerate.length) await delay(2000);
    }

    console.log('\n========================================');
    console.log('✅ Done! Generated: ' + ok + ' | Failed: ' + fail);
    console.log('========================================\n');

    await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); });
