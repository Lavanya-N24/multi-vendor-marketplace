const fs = require('fs');
const path = require('path');
const https = require('https');
const { PrismaClient } = require('./prisma/generated/prisma');

const prisma = new PrismaClient();
const OUT = path.join(__dirname, '..', 'multi-vendor-frontend', 'public', 'products', 'kids');

// All 247 kids product images
const KIDS = [
    // BOYS TOPWEAR
    { name: "boys_graphic_tee_blue.png", p: "boys children blue graphic t-shirt fun cartoon print ecommerce product photo white background" },
    { name: "boys_polo_white.png", p: "boys children white polo shirt collar studio product photo white background" },
    { name: "boys_formal_shirt_lightblue.png", p: "boys children light blue formal button-down shirt flat lay white background" },
    { name: "boys_hoodie_red.png", p: "boys children red hoodie pullover sweatshirt studio product photo white background" },
    { name: "boys_superhero_tee.png", p: "boys children superhero colorful t-shirt fun print white background" },
    { name: "boys_striped_tee_navy.png", p: "boys children navy white striped t-shirt casual wear white background" },
    { name: "boys_fullsleeve_grey.png", p: "boys children grey full sleeve cotton t-shirt white background" },
    { name: "boys_check_shirt.png", p: "boys children checkered flannel casual shirt folded white background" },
    { name: "boys_tank_top.png", p: "boys children bright summer sleeveless tank top white background" },
    { name: "boys_sweater_green.png", p: "boys children green knit pullover sweater cozy winter white background" },
    { name: "boys_zipup_hoodie_black.png", p: "boys children black zip-up hoodie jacket studio photo white background" },
    { name: "boys_muscle_tee.png", p: "boys children sleeveless sporty muscle tee white background" },
    { name: "boys_henley_tee.png", p: "boys children henley neck t-shirt grey button detail white background" },
    { name: "boys_raglan_tee.png", p: "boys children raglan sleeve baseball t-shirt red white sport style white background" },
    { name: "boys_cartoon_tee.png", p: "boys children cartoon dinosaur print t-shirt green fun kids white background" },
    { name: "boys_mandarin_shirt.png", p: "boys children mandarin collar cotton shirt white smart casual white background" },
    { name: "boys_colorblock_tee.png", p: "boys children colorblock panel t-shirt blue yellow trendy kids white background" },
    { name: "boys_turtleneck.png", p: "boys children navy turtleneck long sleeve top winter white background" },
    { name: "boys_printed_shirt_tropical.png", p: "boys children tropical hawaiian printed shirt vacation wear white background" },
    { name: "boys_sports_jersey.png", p: "boys children sports jersey t-shirt number 10 athletic white background" },
    // BOYS BOTTOMWEAR
    { name: "boys_cargo_shorts_khaki.png", p: "boys children khaki cargo shorts pockets white background" },
    { name: "boys_jogger_navy.png", p: "boys children navy jogger pants elastic cuffs casual white background" },
    { name: "boys_cotton_shorts_blue.png", p: "boys children blue cotton shorts summer wear white background" },
    { name: "boys_denim_jeans.png", p: "boys children medium wash denim jeans folded white background" },
    { name: "boys_chino_beige.png", p: "boys children beige chino pants smart casual white background" },
    { name: "boys_track_pants_striped.png", p: "boys children striped track pants sporty athletic white background" },
    { name: "boys_swim_trunks.png", p: "boys children tropical print swim trunks beach swimwear white background" },
    { name: "boys_ripped_jeans.png", p: "boys children dark ripped distressed jeans trendy fashion white background" },
    { name: "boys_formal_trousers.png", p: "boys children black formal trousers party wear white background" },
    { name: "boys_bermuda_olive.png", p: "boys children olive bermuda shorts knee length white background" },
    { name: "boys_elastic_jeans.png", p: "boys children elastic waist comfort pull-on jeans white background" },
    { name: "boys_corduroy_pants.png", p: "boys children brown corduroy pants textured white background" },
    { name: "boys_athletic_shorts.png", p: "boys children black athletic sports shorts quick-dry white background" },
    { name: "boys_camo_pants.png", p: "boys children camouflage cargo pants army style white background" },
    { name: "boys_linen_shorts.png", p: "boys children white linen shorts summer casual white background" },
    { name: "boys_denim_shorts.png", p: "boys children blue denim shorts casual summer white background" },
    { name: "boys_pajama_pants.png", p: "boys children soft flannel pajama pants comfortable sleepwear white background" },
    { name: "boys_drawstring_pants.png", p: "boys children grey drawstring cotton pants relaxed fit white background" },
    { name: "boys_school_trousers.png", p: "boys children grey school uniform trousers formal white background" },
    { name: "boys_sweatpants.png", p: "boys children fleece sweatpants dark grey warm casual white background" },
    // BOYS OUTERWEAR
    { name: "boys_denim_jacket.png", p: "boys children blue denim jacket casual outerwear white background" },
    { name: "boys_puffer_red.png", p: "boys children red puffer winter jacket warm white background" },
    { name: "boys_windbreaker_green.png", p: "boys children green windbreaker lightweight jacket white background" },
    { name: "boys_fleece_grey.png", p: "boys children grey fleece zip jacket soft white background" },
    { name: "boys_bomber_navy.png", p: "boys children navy bomber jacket stylish white background" },
    { name: "boys_raincoat_yellow.png", p: "boys children bright yellow raincoat hood waterproof white background" },
    { name: "boys_winter_parka.png", p: "boys children black winter parka coat fur hood white background" },
    { name: "boys_sherpa_brown.png", p: "boys children brown sherpa fleece pullover cozy white background" },
    { name: "boys_letterman.png", p: "boys children varsity letterman jacket red white school style white background" },
    { name: "boys_puffer_vest.png", p: "boys children orange sleeveless puffer vest white background" },
    { name: "boys_quilted_jacket.png", p: "boys children quilted padded jacket navy warm winter white background" },
    { name: "boys_hoodie_jacket_camo.png", p: "boys children camouflage hoodie jacket zip-up trendy white background" },
    { name: "boys_leather_jacket.png", p: "boys children faux leather biker jacket black cool kids white background" },
    { name: "boys_track_jacket.png", p: "boys children sports track jacket stripes athletic white background" },
    { name: "boys_poncho.png", p: "boys children knitted poncho sweater layering piece white background" },
    { name: "boys_softshell.png", p: "boys children softshell outdoor jacket grey adventure wear white background" },
    { name: "boys_blazer_navy.png", p: "boys children navy blue blazer formal smart dress white background" },
    { name: "boys_rain_jacket_blue.png", p: "boys children blue rain jacket hooded waterproof white background" },
    { name: "boys_fleece_vest.png", p: "boys children fleece vest sleeveless layering white background" },
    { name: "boys_snow_jacket.png", p: "boys children snow ski jacket bright blue winter sports white background" },
    // BOYS ETHNIC
    { name: "boys_kurta_white_gold.png", p: "Indian boys white kurta pajama set gold embroidery festive kids ethnic white background" },
    { name: "boys_sherwani_blue.png", p: "Indian boys royal blue sherwani wedding kids ethnic white background" },
    { name: "boys_dhoti_kurta.png", p: "Indian boys cream dhoti kurta set traditional kids white background" },
    { name: "boys_pathani_olive.png", p: "Indian boys olive pathani suit casual ethnic white background" },
    { name: "boys_nehru_jacket.png", p: "Indian boys maroon Nehru jacket over white kurta formal white background" },
    { name: "boys_silk_kurta_gold.png", p: "Indian boys gold silk kurta premium festive kids white background" },
    { name: "boys_indo_western.png", p: "Indian boys indo-western fusion suit modern ethnic white background" },
    { name: "boys_jodhpuri_navy.png", p: "Indian boys navy jodhpuri bandhgala suit royal kids white background" },
    { name: "boys_waistcoat_set.png", p: "Indian boys festive waistcoat kurta Diwali kids ethnic white background" },
    { name: "boys_embroidered_peach.png", p: "Indian boys peach embroidered kurta thread work white background" },
    { name: "boys_kurta_maroon.png", p: "Indian boys maroon silk kurta zari border festive white background" },
    { name: "boys_angrakha_yellow.png", p: "Indian boys yellow angrakha style kurta traditional white background" },
    { name: "boys_bandi_set.png", p: "Indian boys printed bandi jacket white kurta ethnic white background" },
    { name: "boys_cotton_kurta_blue.png", p: "Indian boys blue cotton casual kurta daily wear white background" },
    { name: "boys_kurta_churidar.png", p: "Indian boys green kurta churidar pants festive white background" },
    { name: "boys_kurta_jacket_combo.png", p: "Indian boys kurta printed nehru jacket combo party wear white background" },
    { name: "boys_mundu_set.png", p: "Indian South Indian boys white mundu dhoti set traditional white background" },
    { name: "boys_achkan_cream.png", p: "Indian boys cream achkan sherwani royal wedding wear white background" },
    { name: "boys_mirror_work_kurta.png", p: "Indian boys kurta mirror work embroidery Rajasthani style white background" },
    { name: "boys_festive_set_red.png", p: "Indian boys red festive kurta pajama celebration wear white background" },
    // GIRLS DRESSES & TOPS
    { name: "girls_floral_frock.png", p: "girls children pink floral frock dress cute party wear white background" },
    { name: "girls_party_dress_red.png", p: "girls children red velvet party dress with bow formal white background" },
    { name: "girls_maxi_dress.png", p: "girls children long floral maxi dress summer kids white background" },
    { name: "girls_kurti_yellow.png", p: "girls children yellow printed kurti casual Indian kids white background" },
    { name: "girls_jumpsuit_denim.png", p: "girls children denim jumpsuit trendy one-piece white background" },
    { name: "girls_peplum_white.png", p: "girls children white peplum top stylish blouse white background" },
    { name: "girls_tutu_lavender.png", p: "girls children lavender tulle tutu princess dress fairy white background" },
    { name: "girls_ruffle_top.png", p: "girls children peach ruffle sleeve top cute casual white background" },
    { name: "girls_offshoulder_striped.png", p: "girls children striped off-shoulder top trendy white background" },
    { name: "girls_sundress_blue.png", p: "girls children blue summer sundress cotton lightweight white background" },
    { name: "girls_ball_gown.png", p: "girls children sparkly embellished ball gown princess party white background" },
    { name: "girls_romper_polkadot.png", p: "girls children polka dot romper playsuit cute outfit white background" },
    { name: "girls_peasant_top.png", p: "girls children bohemian peasant top embroidered boho style white background" },
    { name: "girls_dungaree_dress.png", p: "girls children denim dungaree dress casual trendy white background" },
    { name: "girls_pinafore_plaid.png", p: "girls children plaid pinafore dress school style white background" },
    { name: "girls_crop_top_set.png", p: "girls children crop top skirt matching outfit set white background" },
    { name: "girls_tiered_dress.png", p: "girls children tiered ruffle midi dress pastel cute kids white background" },
    { name: "girls_smocked_dress.png", p: "girls children smocked bodice floral dress elegant girl white background" },
    { name: "girls_tunic_printed.png", p: "girls children printed tunic top with belt casual wear white background" },
    { name: "girls_sequin_dress.png", p: "girls children gold sequin party dress sparkly glamour white background" },
    // GIRLS BOTTOMWEAR
    { name: "girls_dungaree_blue.png", p: "girls children blue denim dungaree overall casual white background" },
    { name: "girls_leggings_black.png", p: "girls children black cotton leggings stretchy white background" },
    { name: "girls_shorts_floral.png", p: "girls children floral shorts top set summer white background" },
    { name: "girls_palazzo_pink.png", p: "girls children pink palazzo wide-leg pants flowy white background" },
    { name: "girls_flared_jeans.png", p: "girls children light blue flared bootcut jeans retro white background" },
    { name: "girls_skirt_rainbow.png", p: "girls children rainbow printed pleated skirt colorful white background" },
    { name: "girls_denim_skirt.png", p: "girls children denim mini skirt casual trendy white background" },
    { name: "girls_track_pants.png", p: "girls children purple track pants sporty white background" },
    { name: "girls_capri_white.png", p: "girls children white capri cropped pants summer white background" },
    { name: "girls_cargo_olive.png", p: "girls children olive cargo pants utility pockets white background" },
    { name: "girls_culottes.png", p: "girls children mustard culottes wide-leg shorts stylish white background" },
    { name: "girls_sequin_leggings.png", p: "girls children gold sequin sparkle leggings party white background" },
    { name: "girls_joggers_pink.png", p: "girls children pink jogger pants drawstring casual white background" },
    { name: "girls_jeggings.png", p: "girls children dark blue jeggings stretchy jeans comfy white background" },
    { name: "girls_tutu_skirt.png", p: "girls children pink tutu skirt tulle layers ballet white background" },
    { name: "girls_paperbag_shorts.png", p: "girls children paperbag waist shorts with belt chic white background" },
    { name: "girls_striped_leggings.png", p: "girls children multicolor striped leggings fun kids wear white background" },
    { name: "girls_corduroy_skirt.png", p: "girls children corduroy A-line mini skirt rust color autumn white background" },
    { name: "girls_highwaist_jeans.png", p: "girls children high waist skinny jeans medium wash trendy white background" },
    { name: "girls_cotton_shorts.png", p: "girls children cotton shorts everyday basics white background" },
    // GIRLS OUTERWEAR
    { name: "girls_cardigan_pink.png", p: "girls children pink knit cardigan sweater cute soft white background" },
    { name: "girls_hoodie_lavender.png", p: "girls children lavender hoodie sweatshirt cozy casual white background" },
    { name: "girls_denim_jacket.png", p: "girls children light wash denim jacket stylish white background" },
    { name: "girls_puffer_rose.png", p: "girls children rose pink puffer winter coat warm white background" },
    { name: "girls_windbreaker_mint.png", p: "girls children mint green windbreaker lightweight rain white background" },
    { name: "girls_trench_beige.png", p: "girls children beige trench coat with belt classic white background" },
    { name: "girls_faux_fur_white.png", p: "girls children white faux fur fluffy jacket princess winter white background" },
    { name: "girls_fleece_coral.png", p: "girls children coral fleece pullover warm layering white background" },
    { name: "girls_parka_navy.png", p: "girls children navy winter parka coat fur hood white background" },
    { name: "girls_bomber_blush.png", p: "girls children blush pink bomber jacket trendy white background" },
    { name: "girls_quilted_vest.png", p: "girls children quilted vest jacket pink layering piece white background" },
    { name: "girls_poncho_knit.png", p: "girls children knitted poncho cape boho style white background" },
    { name: "girls_teddy_coat.png", p: "girls children teddy bear coat cream fluffy white background" },
    { name: "girls_raincoat_polka.png", p: "girls children polka dot raincoat hood waterproof cute white background" },
    { name: "girls_ski_jacket.png", p: "girls children ski snow jacket hot pink winter sports white background" },
    { name: "girls_blazer_check.png", p: "girls children check pattern blazer smart casual white background" },
    { name: "girls_cape_coat.png", p: "girls children wool blend cape coat red elegant winter white background" },
    { name: "girls_track_jacket.png", p: "girls children sports track jacket purple athletic white background" },
    { name: "girls_shrug_white.png", p: "girls children white knit shrug bolero party layering white background" },
    { name: "girls_puffer_lilac.png", p: "girls children lilac puffer jacket trendy warm white background" },
    // GIRLS ETHNIC
    { name: "girls_lehenga_pink.png", p: "Indian girls pink embroidered lehenga choli festive ethnic kids white background" },
    { name: "girls_anarkali_turquoise.png", p: "Indian girls turquoise anarkali dress festive kids ethnic white background" },
    { name: "girls_salwar_floral.png", p: "Indian girls floral salwar kameez suit traditional white background" },
    { name: "girls_sharara_purple.png", p: "Indian girls purple sharara set dupatta festive white background" },
    { name: "girls_ghagra_mirror.png", p: "Indian girls ghagra choli with mirror work festive white background" },
    { name: "girls_pattu_pavadai.png", p: "Indian South Indian girls silk pattu pavadai half saree white background" },
    { name: "girls_kurti_palazzo.png", p: "Indian girls cotton kurti palazzo pants casual ethnic white background" },
    { name: "girls_chanderi_gold.png", p: "Indian girls gold chanderi fabric dress premium festive white background" },
    { name: "girls_langa_voni.png", p: "Indian girls langa voni half saree colorful South Indian white background" },
    { name: "girls_ethnic_frock.png", p: "Indian girls embroidered ethnic frock fusion kids white background" },
    { name: "girls_anarkali_red.png", p: "Indian girls red silk anarkali gown wedding wear kids white background" },
    { name: "girls_lehenga_blue.png", p: "Indian girls blue designer lehenga sequins festive white background" },
    { name: "girls_kurta_set_pink.png", p: "Indian girls pink cotton kurta pajama set everyday ethnic white background" },
    { name: "girls_ghagra_rajasthani.png", p: "Indian girls Rajasthani colorful ghagra choli bandhani work white background" },
    { name: "girls_churidar_set.png", p: "Indian girls printed churidar suit dupatta party wear white background" },
    { name: "girls_silk_frock.png", p: "Indian girls silk traditional frock South Indian temple wear white background" },
    { name: "girls_anarkali_green.png", p: "Indian girls green floor length anarkali festive white background" },
    { name: "girls_dhavani_set.png", p: "Indian girls half saree set davani golden border white background" },
    { name: "girls_gown_peach.png", p: "Indian girls peach embroidered party gown reception white background" },
    { name: "girls_sharara_yellow.png", p: "Indian girls yellow sharara suit set haldi ceremony white background" },
    // BABY CLOTHING
    { name: "baby_romper_pastel.png", p: "baby infant cotton romper pastel colors soft newborn clothing white background" },
    { name: "baby_onesie_pack.png", p: "baby onesie bodysuit pack multicolor newborn essentials white background" },
    { name: "baby_bodysuit_white.png", p: "baby full sleeve bodysuit white soft cotton infant white background" },
    { name: "baby_winter_jacket.png", p: "baby pink winter jacket hood warm infant outerwear white background" },
    { name: "baby_sleepsuit.png", p: "baby sleepsuit pajama front zipper comfortable white background" },
    { name: "baby_mitten_bodysuit.png", p: "baby bodysuit fold-over mittens scratch-proof white background" },
    { name: "baby_organic_top.png", p: "baby organic cotton t-shirt natural color eco-friendly white background" },
    { name: "baby_fleece_footie.png", p: "baby blue fleece footie pajama warm sleepwear white background" },
    { name: "baby_summer_set.png", p: "baby summer outfit set shorts tee lightweight white background" },
    { name: "baby_bear_jumpsuit.png", p: "baby jumpsuit cute bear ears hood adorable infant white background" },
    { name: "baby_ruffle_romper.png", p: "baby girl ruffle romper pink cute frilly outfit white background" },
    { name: "baby_knitted_sweater.png", p: "baby cream knitted sweater cardigan hand-knit style white background" },
    { name: "baby_dungaree.png", p: "baby denim dungaree overall cute infant outfit white background" },
    { name: "baby_bunting_bag.png", p: "baby bunting bag sleeping bag cozy warm swaddle white background" },
    { name: "baby_animal_set.png", p: "baby animal print outfit set with bib hat cute white background" },
    { name: "baby_tutu_dress.png", p: "baby girl tutu dress pink headband party ready white background" },
    { name: "baby_footed_pants.png", p: "baby footed pants pack soft cotton white background" },
    { name: "baby_hooded_towel_set.png", p: "baby hooded bath towel set washcloth soft white background" },
    { name: "baby_snowsuit.png", p: "baby one-piece snowsuit winter warm hooded white background" },
    { name: "baby_sailor_set.png", p: "baby sailor outfit romper hat nautical cute white background" },
    // KIDS FOOTWEAR
    { name: "kids_velcro_sneakers.png", p: "children kids white velcro strap sneakers easy-wear shoes white background" },
    { name: "kids_school_shoes.png", p: "children kids black formal school shoes uniform footwear white background" },
    { name: "kids_lightup_shoes.png", p: "children kids LED light-up sneakers colorful glowing shoes white background" },
    { name: "kids_sandals_summer.png", p: "children kids summer open-toe sandals comfortable outdoor white background" },
    { name: "kids_running_blue.png", p: "children kids blue running athletic shoes sporty white background" },
    { name: "kids_canvas_slipon.png", p: "children kids white canvas slip-on shoes casual white background" },
    { name: "kids_rain_boots.png", p: "children kids colorful rubber rain boots waterproof white background" },
    { name: "kids_formal_leather.png", p: "children kids brown leather formal shoes party wear white background" },
    { name: "kids_hightop_red.png", p: "children kids red high-top basketball sneakers sporty white background" },
    { name: "kids_clogs.png", p: "children kids colorful comfort clogs lightweight white background" },
    { name: "kids_mary_jane.png", p: "children girls pink mary jane shoes cute party footwear white background" },
    { name: "kids_hiking_boots.png", p: "children kids hiking boots brown outdoor adventure white background" },
    { name: "kids_flip_flops.png", p: "children kids colorful flip flops beach casual wear white background" },
    { name: "kids_ballet_flats.png", p: "children girls ballet flat shoes silver elegant white background" },
    { name: "kids_crocs_style.png", p: "children kids colorful clog sandals with charms fun white background" },
    { name: "kids_sports_cleats.png", p: "children kids green sports football cleats athletic white background" },
    { name: "kids_winter_boots.png", p: "children kids warm winter snow boots furry cold weather white background" },
    { name: "kids_loafers.png", p: "children boys brown penny loafer shoes smart casual white background" },
    { name: "kids_glitter_shoes.png", p: "children girls glitter sparkle shoes silver party fashion white background" },
    { name: "kids_water_shoes.png", p: "children kids aqua water shoes neoprene swimming beach white background" },
    // KIDS ACCESSORIES
    { name: "kids_backpack.png", p: "children kids cartoon character school backpack colorful white background" },
    { name: "kids_water_bottle.png", p: "children kids stainless steel water bottle insulated BPA free white background" },
    { name: "kids_sunglasses.png", p: "children kids colorful UV protection sunglasses fun shapes white background" },
    { name: "kids_digital_watch.png", p: "children kids digital sports watch colorful waterproof white background" },
    { name: "kids_baseball_cap.png", p: "children kids baseball cap adjustable casual sun hat white background" },
    { name: "kids_hair_set.png", p: "children kids hair accessories set clips bows bands colorful white background" },
    { name: "kids_lunch_box.png", p: "children kids insulated lunch box bag compartments white background" },
    { name: "kids_beanie_hat.png", p: "children kids knitted winter beanie hat pom pom white background" },
    { name: "kids_belt.png", p: "children kids elastic stretch belt adjustable white background" },
    { name: "kids_socks_pack.png", p: "children kids fun patterned socks pack cotton white background" },
    { name: "kids_umbrella.png", p: "children kids colorful character umbrella rain protection white background" },
    { name: "kids_scarf_knit.png", p: "children kids warm knitted scarf tassels winter white background" },
    { name: "kids_gloves.png", p: "children kids winter gloves warm fleece lined cold weather white background" },
    { name: "kids_wallet.png", p: "children kids fun cartoon print wallet compact white background" },
    { name: "kids_bucket_hat.png", p: "children kids cotton bucket hat colorful summer outdoor white background" },
    { name: "kids_bow_tie_set.png", p: "children boys bow tie suspenders set formal party white background" },
    { name: "kids_headband_set.png", p: "children girls headband set flowers bows cute white background" },
    { name: "kids_mini_backpack.png", p: "children toddler mini backpack animal design small cute white background" },
    { name: "kids_jewelry_set.png", p: "children girls play jewelry bracelet necklace set colorful beads white background" },
    { name: "kids_travel_pillow.png", p: "children kids travel neck pillow soft animal shaped white background" }
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
        https.get(`https://aihorde.net/api/v2/generate/check/${id}`, {
            headers: { 'apikey': '0000000000' }
        }, res => {
            let r = ''; res.on('data', c => r += c);
            res.on('end', () => { try { resolve(JSON.parse(r)); } catch (e) { reject(e); } });
        }).on('error', reject);
    });
}

function hordeResult(id) {
    return new Promise((resolve, reject) => {
        https.get(`https://aihorde.net/api/v2/generate/status/${id}`, {
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
        const doGet = (u) => {
            https.get(u, (res) => {
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    file.close(); if (fs.existsSync(dest)) fs.unlinkSync(dest);
                    const f2 = fs.createWriteStream(dest);
                    https.get(res.headers.location, r2 => { r2.pipe(f2); f2.on('finish', () => { f2.close(); resolve(); }); }).on('error', reject);
                    return;
                }
                if (res.statusCode !== 200) { file.close(); return reject(new Error("HTTP " + res.statusCode)); }
                res.pipe(file); file.on('finish', () => { file.close(); resolve(); });
            }).on('error', (err) => { file.close(); reject(err); });
        };
        doGet(url);
    });
}

async function updateDbImagePath(imageName) {
    const newPath = `/products/kids/${imageName}`;
    const product = await prisma.product.findFirst({
        where: {
            gender: "Kids",
            title: { contains: imageName.replace(".png", "").replace(/[-_]/g, " ").replace("boys ", "Boys ").replace("girls ", "Girls ").replace("baby ", "Baby ") }
        }
    });
    if (product) {
        await prisma.product.update({ where: { id: product.id }, data: { image: newPath } });
        return true;
    }
    const products = await prisma.product.findMany({ where: { gender: "Kids" } });
    for (let p of products) {
        const words = imageName.split(".")[0].split("_");
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
    const dest = path.join(OUT, item.name);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 5000) {
        await updateDbImagePath(item.name);
        return "SKIP";
    }

    let reqRes;
    for (let retry = 0; retry < 3; retry++) {
        try {
            reqRes = await hordeRequest(item.p);
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
            if (attempts % 15 === 0 && attempts > 0) process.stdout.write(`(wait ${s.wait_time || '?'}s) `);
        } catch (e) { /* retry check */ }
        attempts++;
    }

    try {
        const final = await hordeResult(id);
        if (final.generations && final.generations.length > 0) {
            await downloadFile(final.generations[0].img, dest);
            if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
                await updateDbImagePath(item.name);
                return "OK";
            }
        }
    } catch (e) { /* fail */ }
    return "FAIL";
}

// Process in batches of 5 (AI Horde allows concurrent anonymous requests)
async function main() {
    if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

    // Filter to only missing images
    const missing = KIDS.filter(k => {
        const dest = path.join(OUT, k.name);
        return !fs.existsSync(dest) || fs.statSync(dest).size < 5000;
    });

    // Update DB for existing images first
    const existing = KIDS.filter(k => {
        const dest = path.join(OUT, k.name);
        return fs.existsSync(dest) && fs.statSync(dest).size >= 5000;
    });
    for (const k of existing) {
        await updateDbImagePath(k.name);
    }

    console.log(`\n🎨 Kids Image Generator (AI Horde - FREE)`);
    console.log(`Total: ${KIDS.length} | Existing: ${existing.length} | Missing: ${missing.length}\n`);

    if (missing.length === 0) {
        console.log("✅ All images already exist!");
        await prisma.$disconnect();
        return;
    }

    let ok = 0, fail = 0;
    const BATCH_SIZE = 5;

    for (let i = 0; i < missing.length; i += BATCH_SIZE) {
        const batch = missing.slice(i, i + BATCH_SIZE);
        const results = await Promise.allSettled(batch.map(async (item, idx) => {
            const globalIdx = i + idx + 1;
            const result = await generateOne(item);
            const icon = result === "OK" ? "✅" : result === "SKIP" ? "⏭️" : "❌";
            console.log(`[${globalIdx}/${missing.length}] ${icon} ${item.name} -> ${result}`);
            return result;
        }));

        results.forEach(r => {
            if (r.status === 'fulfilled') {
                if (r.value === "OK") ok++;
                else fail++;
            } else fail++;
        });

        // Brief pause between batches
        if (i + BATCH_SIZE < missing.length) await delay(2000);
    }

    const totalExist = fs.readdirSync(OUT).filter(f => {
        const s = fs.statSync(path.join(OUT, f));
        return s.size > 5000;
    }).length;

    console.log(`\n========================================`);
    console.log(`✅ Done! Generated: ${ok} | Failed: ${fail}`);
    console.log(`Total valid images in folder: ${totalExist}/${KIDS.length}`);
    console.log(`========================================\n`);

    await prisma.$disconnect();
}

main().catch(async (e) => { console.error(e); await prisma.$disconnect(); });
