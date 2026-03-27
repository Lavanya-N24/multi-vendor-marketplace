/**
 * gen_kids.js — Download Kids product images from Banana AI (Pollinations Flux)
 * and save them to public/products/kids/ so they load instantly.
 *
 * Usage:  node gen_kids.js
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const OUT = path.join(__dirname, "..", "multi-vendor-frontend", "public", "products", "kids");
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

// All kids products: { filename, prompt }
const KIDS = [
    // ══════════════════════════════════════
    // ══  BOYS TOPWEAR (20 items)         ══
    // ══════════════════════════════════════
    { f: "boys_graphic_tee_blue.png", p: "boys children blue graphic t-shirt with fun cartoon print, neatly folded, ecommerce product photo, white background, studio lighting" },
    { f: "boys_polo_white.png", p: "boys children white polo shirt with collar, studio product photo, ecommerce, white background" },
    { f: "boys_formal_shirt_lightblue.png", p: "boys children light blue formal button-down shirt, flat lay, ecommerce product photo, white background" },
    { f: "boys_hoodie_red.png", p: "boys children red hoodie pullover sweatshirt, studio product photo, ecommerce, white background" },
    { f: "boys_superhero_tee.png", p: "boys children superhero captain themed colorful t-shirt, fun print, ecommerce product photo, white background" },
    { f: "boys_striped_tee_navy.png", p: "boys children navy and white striped t-shirt, casual wear, ecommerce product photo, white background" },
    { f: "boys_fullsleeve_grey.png", p: "boys children grey full sleeve cotton t-shirt, ecommerce product photo, white background" },
    { f: "boys_check_shirt.png", p: "boys children checkered flannel casual shirt, folded, ecommerce product photo, white background" },
    { f: "boys_tank_top.png", p: "boys children bright summer sleeveless tank top, ecommerce product photo, white background" },
    { f: "boys_sweater_green.png", p: "boys children green knit pullover sweater, cozy winter, ecommerce product photo, white background" },
    { f: "boys_zipup_hoodie_black.png", p: "boys children black zip-up hoodie jacket, studio product photo, ecommerce, white background" },
    { f: "boys_muscle_tee.png", p: "boys children sleeveless sporty muscle tee, ecommerce product photo, white background" },
    { f: "boys_henley_tee.png", p: "boys children henley neck t-shirt grey, button detail, ecommerce product photo, white background" },
    { f: "boys_raglan_tee.png", p: "boys children raglan sleeve baseball t-shirt red and white, sport style, ecommerce, white background" },
    { f: "boys_cartoon_tee.png", p: "boys children cartoon dinosaur print t-shirt green, fun kids clothing, ecommerce, white background" },
    { f: "boys_mandarin_shirt.png", p: "boys children mandarin collar cotton shirt white, smart casual, ecommerce, white background" },
    { f: "boys_colorblock_tee.png", p: "boys children colorblock panel t-shirt blue yellow, trendy kids, ecommerce, white background" },
    { f: "boys_turtleneck.png", p: "boys children navy turtleneck long sleeve top, winter wear, ecommerce, white background" },
    { f: "boys_printed_shirt_tropical.png", p: "boys children tropical printed hawaiian shirt, vacation wear, ecommerce, white background" },
    { f: "boys_sports_jersey.png", p: "boys children sports jersey t-shirt number 10, athletic kids, ecommerce, white background" },

    // ══════════════════════════════════════
    // ══  BOYS BOTTOMWEAR (20 items)      ══
    // ══════════════════════════════════════
    { f: "boys_cargo_shorts_khaki.png", p: "boys children khaki cargo shorts with pockets, ecommerce product photo, white background" },
    { f: "boys_jogger_navy.png", p: "boys children navy jogger pants with elastic cuffs, casual, ecommerce, white background" },
    { f: "boys_cotton_shorts_blue.png", p: "boys children blue cotton shorts, summer wear, ecommerce product photo, white background" },
    { f: "boys_denim_jeans.png", p: "boys children medium wash denim jeans, folded, ecommerce product photo, white background" },
    { f: "boys_chino_beige.png", p: "boys children beige chino pants, smart casual, ecommerce product photo, white background" },
    { f: "boys_track_pants_striped.png", p: "boys children striped track pants, sporty athletic, ecommerce, white background" },
    { f: "boys_swim_trunks.png", p: "boys children tropical print swim trunks, beach swimwear, ecommerce, white background" },
    { f: "boys_ripped_jeans.png", p: "boys children dark ripped distressed jeans, trendy fashion, ecommerce, white background" },
    { f: "boys_formal_trousers.png", p: "boys children black formal trousers, party wear, ecommerce product photo, white background" },
    { f: "boys_bermuda_olive.png", p: "boys children olive bermuda shorts, knee length, ecommerce product photo, white background" },
    { f: "boys_elastic_jeans.png", p: "boys children elastic waist comfort jeans pull-on, ecommerce, white background" },
    { f: "boys_corduroy_pants.png", p: "boys children brown corduroy pants, textured, ecommerce product photo, white background" },
    { f: "boys_athletic_shorts.png", p: "boys children black athletic sports shorts, quick-dry, ecommerce, white background" },
    { f: "boys_camo_pants.png", p: "boys children camouflage print cargo pants, army style, ecommerce, white background" },
    { f: "boys_linen_shorts.png", p: "boys children white linen shorts, summer casual, ecommerce product photo, white background" },
    { f: "boys_denim_shorts.png", p: "boys children blue denim shorts, casual summer, ecommerce, white background" },
    { f: "boys_pajama_pants.png", p: "boys children soft flannel pajama pants, comfortable sleepwear, ecommerce, white background" },
    { f: "boys_drawstring_pants.png", p: "boys children grey drawstring cotton pants, relaxed fit, ecommerce, white background" },
    { f: "boys_school_trousers.png", p: "boys children grey school uniform trousers, formal, ecommerce, white background" },
    { f: "boys_sweatpants.png", p: "boys children fleece sweatpants dark grey, warm casual, ecommerce, white background" },

    // ══════════════════════════════════════
    // ══  BOYS OUTERWEAR (20 items)       ══
    // ══════════════════════════════════════
    { f: "boys_denim_jacket.png", p: "boys children blue denim jacket, casual outerwear, ecommerce product photo, white background" },
    { f: "boys_puffer_red.png", p: "boys children red puffer winter jacket, warm, ecommerce product photo, white background" },
    { f: "boys_windbreaker_green.png", p: "boys children green windbreaker lightweight jacket, ecommerce, white background" },
    { f: "boys_fleece_grey.png", p: "boys children grey fleece zip jacket, soft, ecommerce product photo, white background" },
    { f: "boys_bomber_navy.png", p: "boys children navy bomber jacket, stylish, ecommerce product photo, white background" },
    { f: "boys_raincoat_yellow.png", p: "boys children bright yellow raincoat with hood, waterproof, ecommerce, white background" },
    { f: "boys_winter_parka.png", p: "boys children black winter parka coat with fur hood, ecommerce, white background" },
    { f: "boys_sherpa_brown.png", p: "boys children brown sherpa fleece pullover, cozy, ecommerce, white background" },
    { f: "boys_letterman.png", p: "boys children varsity letterman jacket red white, school style, ecommerce, white background" },
    { f: "boys_puffer_vest.png", p: "boys children orange sleeveless puffer vest, ecommerce product photo, white background" },
    { f: "boys_quilted_jacket.png", p: "boys children quilted padded jacket navy, warm winter, ecommerce, white background" },
    { f: "boys_hoodie_jacket_camo.png", p: "boys children camouflage hoodie jacket zip-up, trendy, ecommerce, white background" },
    { f: "boys_leather_jacket.png", p: "boys children faux leather biker jacket black, cool kids, ecommerce, white background" },
    { f: "boys_track_jacket.png", p: "boys children sports track jacket with stripes, athletic, ecommerce, white background" },
    { f: "boys_poncho.png", p: "boys children knitted poncho sweater, layering piece, ecommerce, white background" },
    { f: "boys_softshell.png", p: "boys children softshell outdoor jacket grey, adventure wear, ecommerce, white background" },
    { f: "boys_blazer_navy.png", p: "boys children navy blue blazer formal, smart dress, ecommerce, white background" },
    { f: "boys_rain_jacket_blue.png", p: "boys children blue rain jacket hooded, waterproof, ecommerce, white background" },
    { f: "boys_fleece_vest.png", p: "boys children fleece vest sleeveless jacket, layering, ecommerce, white background" },
    { f: "boys_snow_jacket.png", p: "boys children snow ski jacket bright blue, winter sports, ecommerce, white background" },

    // ══════════════════════════════════════
    // ══  BOYS ETHNIC (20 items)          ══
    // ══════════════════════════════════════
    { f: "boys_kurta_white_gold.png", p: "Indian boys white kurta pajama set gold embroidery, festive kids ethnic wear, ecommerce, white background" },
    { f: "boys_sherwani_blue.png", p: "Indian boys royal blue sherwani set, wedding kids ethnic wear, ecommerce, white background" },
    { f: "boys_dhoti_kurta.png", p: "Indian boys cream dhoti kurta set, traditional kids wear, ecommerce, white background" },
    { f: "boys_pathani_olive.png", p: "Indian boys olive pathani suit, casual ethnic, ecommerce, white background" },
    { f: "boys_nehru_jacket.png", p: "Indian boys maroon Nehru jacket over white kurta, formal, ecommerce, white background" },
    { f: "boys_silk_kurta_gold.png", p: "Indian boys gold silk kurta, premium festive kids, ecommerce, white background" },
    { f: "boys_indo_western.png", p: "Indian boys indo-western fusion suit, modern ethnic, ecommerce, white background" },
    { f: "boys_jodhpuri_navy.png", p: "Indian boys navy jodhpuri bandhgala suit, royal kids, ecommerce, white background" },
    { f: "boys_waistcoat_set.png", p: "Indian boys festive waistcoat over kurta, Diwali kids ethnic, ecommerce, white background" },
    { f: "boys_embroidered_peach.png", p: "Indian boys peach embroidered kurta, thread work, ecommerce, white background" },
    { f: "boys_kurta_maroon.png", p: "Indian boys maroon silk kurta with zari border, festive, ecommerce, white background" },
    { f: "boys_angrakha_yellow.png", p: "Indian boys yellow angrakha style kurta, traditional, ecommerce, white background" },
    { f: "boys_bandi_set.png", p: "Indian boys printed bandi jacket over white kurta, ethnic, ecommerce, white background" },
    { f: "boys_cotton_kurta_blue.png", p: "Indian boys blue cotton casual kurta, daily wear, ecommerce, white background" },
    { f: "boys_kurta_churidar.png", p: "Indian boys green kurta with churidar pants, festive, ecommerce, white background" },
    { f: "boys_kurta_jacket_combo.png", p: "Indian boys kurta with printed nehru jacket combo set, party wear, ecommerce, white background" },
    { f: "boys_mundu_set.png", p: "Indian South Indian boys white mundu dhoti set, traditional, ecommerce, white background" },
    { f: "boys_achkan_cream.png", p: "Indian boys cream achkan sherwani, royal wedding wear, ecommerce, white background" },
    { f: "boys_mirror_work_kurta.png", p: "Indian boys kurta with mirror work embroidery, Rajasthani style, ecommerce, white background" },
    { f: "boys_festive_set_red.png", p: "Indian boys red festive kurta pajama combo with dupatta, celebration wear, ecommerce, white background" },

    // ══════════════════════════════════════
    // ══  GIRLS DRESSES & TOPS (20 items) ══
    // ══════════════════════════════════════
    { f: "girls_floral_frock.png", p: "girls children pink floral frock dress, cute party wear, ecommerce product photo, white background" },
    { f: "girls_party_dress_red.png", p: "girls children red velvet party dress with bow, formal, ecommerce, white background" },
    { f: "girls_maxi_dress.png", p: "girls children long floral maxi dress, summer kids, ecommerce, white background" },
    { f: "girls_kurti_yellow.png", p: "girls children yellow printed kurti, casual Indian kids, ecommerce, white background" },
    { f: "girls_jumpsuit_denim.png", p: "girls children denim jumpsuit, trendy one-piece, ecommerce, white background" },
    { f: "girls_peplum_white.png", p: "girls children white peplum top, stylish blouse, ecommerce, white background" },
    { f: "girls_tutu_lavender.png", p: "girls children lavender tulle tutu princess dress, fairy, ecommerce, white background" },
    { f: "girls_ruffle_top.png", p: "girls children peach ruffle sleeve top, cute casual, ecommerce, white background" },
    { f: "girls_offshoulder_striped.png", p: "girls children striped off-shoulder top, trendy, ecommerce, white background" },
    { f: "girls_sundress_blue.png", p: "girls children blue summer sundress, cotton lightweight, ecommerce, white background" },
    { f: "girls_ball_gown.png", p: "girls children sparkly embellished ball gown, princess party, ecommerce, white background" },
    { f: "girls_romper_polkadot.png", p: "girls children polka dot romper playsuit, cute outfit, ecommerce, white background" },
    { f: "girls_peasant_top.png", p: "girls children bohemian peasant top embroidered, boho style, ecommerce, white background" },
    { f: "girls_dungaree_dress.png", p: "girls children denim dungaree dress, casual trendy, ecommerce, white background" },
    { f: "girls_pinafore_plaid.png", p: "girls children plaid pinafore dress, school style, ecommerce, white background" },
    { f: "girls_crop_top_set.png", p: "girls children crop top and skirt set, matching outfit, ecommerce, white background" },
    { f: "girls_tiered_dress.png", p: "girls children tiered ruffle midi dress pastel, cute kids, ecommerce, white background" },
    { f: "girls_smocked_dress.png", p: "girls children smocked bodice floral dress, elegant girl, ecommerce, white background" },
    { f: "girls_tunic_printed.png", p: "girls children printed tunic top with belt, casual wear, ecommerce, white background" },
    { f: "girls_sequin_dress.png", p: "girls children gold sequin party dress, sparkly glamour, ecommerce, white background" },

    // ══════════════════════════════════════
    // ══  GIRLS BOTTOMWEAR (20 items)     ══
    // ══════════════════════════════════════
    { f: "girls_dungaree_blue.png", p: "girls children blue denim dungaree overall, casual, ecommerce, white background" },
    { f: "girls_leggings_black.png", p: "girls children black cotton leggings, stretchy, ecommerce, white background" },
    { f: "girls_shorts_floral.png", p: "girls children floral shorts and top set, summer, ecommerce, white background" },
    { f: "girls_palazzo_pink.png", p: "girls children pink palazzo wide-leg pants, flowy, ecommerce, white background" },
    { f: "girls_flared_jeans.png", p: "girls children light blue flared bootcut jeans, retro, ecommerce, white background" },
    { f: "girls_skirt_rainbow.png", p: "girls children rainbow printed pleated skirt, colorful, ecommerce, white background" },
    { f: "girls_denim_skirt.png", p: "girls children denim mini skirt, casual trendy, ecommerce, white background" },
    { f: "girls_track_pants.png", p: "girls children purple track pants, sporty, ecommerce, white background" },
    { f: "girls_capri_white.png", p: "girls children white capri cropped pants, summer, ecommerce, white background" },
    { f: "girls_cargo_olive.png", p: "girls children olive cargo pants, utility pockets, ecommerce, white background" },
    { f: "girls_culottes.png", p: "girls children mustard culottes wide-leg shorts, stylish, ecommerce, white background" },
    { f: "girls_sequin_leggings.png", p: "girls children gold sequin sparkle leggings, party, ecommerce, white background" },
    { f: "girls_joggers_pink.png", p: "girls children pink jogger pants with drawstring, casual, ecommerce, white background" },
    { f: "girls_jeggings.png", p: "girls children dark blue jeggings stretchy jeans, comfy, ecommerce, white background" },
    { f: "girls_tutu_skirt.png", p: "girls children pink tutu skirt with layers of tulle, ballet, ecommerce, white background" },
    { f: "girls_paperbag_shorts.png", p: "girls children paperbag waist shorts with belt, chic, ecommerce, white background" },
    { f: "girls_striped_leggings.png", p: "girls children multicolor striped leggings, fun kids wear, ecommerce, white background" },
    { f: "girls_corduroy_skirt.png", p: "girls children corduroy A-line mini skirt rust color, autumn, ecommerce, white background" },
    { f: "girls_highwaist_jeans.png", p: "girls children high waist skinny jeans medium wash, trendy, ecommerce, white background" },
    { f: "girls_cotton_shorts.png", p: "girls children cotton shorts pack of 3, everyday basics, ecommerce, white background" },

    // ══════════════════════════════════════
    // ══  GIRLS OUTERWEAR (20 items)      ══
    // ══════════════════════════════════════
    { f: "girls_cardigan_pink.png", p: "girls children pink knit cardigan sweater, cute soft, ecommerce, white background" },
    { f: "girls_hoodie_lavender.png", p: "girls children lavender hoodie sweatshirt, cozy casual, ecommerce, white background" },
    { f: "girls_denim_jacket.png", p: "girls children light wash denim jacket, stylish, ecommerce, white background" },
    { f: "girls_puffer_rose.png", p: "girls children rose pink puffer winter coat, warm, ecommerce, white background" },
    { f: "girls_windbreaker_mint.png", p: "girls children mint green windbreaker, lightweight rain, ecommerce, white background" },
    { f: "girls_trench_beige.png", p: "girls children beige trench coat with belt, classic, ecommerce, white background" },
    { f: "girls_faux_fur_white.png", p: "girls children white faux fur fluffy jacket, princess winter, ecommerce, white background" },
    { f: "girls_fleece_coral.png", p: "girls children coral fleece pullover, warm layering, ecommerce, white background" },
    { f: "girls_parka_navy.png", p: "girls children navy winter parka coat, fur hood, ecommerce, white background" },
    { f: "girls_bomber_blush.png", p: "girls children blush pink bomber jacket, trendy, ecommerce, white background" },
    { f: "girls_quilted_vest.png", p: "girls children quilted vest jacket pink, layering piece, ecommerce, white background" },
    { f: "girls_poncho_knit.png", p: "girls children knitted poncho cape, boho style, ecommerce, white background" },
    { f: "girls_teddy_coat.png", p: "girls children teddy bear coat cream, fluffy, ecommerce, white background" },
    { f: "girls_raincoat_polka.png", p: "girls children polka dot raincoat with hood, waterproof cute, ecommerce, white background" },
    { f: "girls_ski_jacket.png", p: "girls children ski snow jacket hot pink, winter sports, ecommerce, white background" },
    { f: "girls_blazer_check.png", p: "girls children check pattern blazer, smart casual, ecommerce, white background" },
    { f: "girls_cape_coat.png", p: "girls children wool blend cape coat red, elegant winter, ecommerce, white background" },
    { f: "girls_track_jacket.png", p: "girls children sports track jacket purple, athletic, ecommerce, white background" },
    { f: "girls_shrug_white.png", p: "girls children white knit shrug bolero, party layering, ecommerce, white background" },
    { f: "girls_puffer_lilac.png", p: "girls children lilac puffer jacket, trendy warm, ecommerce, white background" },

    // ══════════════════════════════════════
    // ══  GIRLS ETHNIC (20 items)         ══
    // ══════════════════════════════════════
    { f: "girls_lehenga_pink.png", p: "Indian girls pink embroidered lehenga choli set, festive ethnic kids, ecommerce, white background" },
    { f: "girls_anarkali_turquoise.png", p: "Indian girls turquoise anarkali dress, festive kids ethnic, ecommerce, white background" },
    { f: "girls_salwar_floral.png", p: "Indian girls floral salwar kameez suit, traditional, ecommerce, white background" },
    { f: "girls_sharara_purple.png", p: "Indian girls purple sharara set with dupatta, festive, ecommerce, white background" },
    { f: "girls_ghagra_mirror.png", p: "Indian girls ghagra choli with mirror work, festive, ecommerce, white background" },
    { f: "girls_pattu_pavadai.png", p: "Indian South Indian girls silk pattu pavadai half saree, ecommerce, white background" },
    { f: "girls_kurti_palazzo.png", p: "Indian girls cotton kurti with palazzo pants, casual ethnic, ecommerce, white background" },
    { f: "girls_chanderi_gold.png", p: "Indian girls gold chanderi fabric dress, premium festive, ecommerce, white background" },
    { f: "girls_langa_voni.png", p: "Indian girls langa voni half saree colorful, South Indian, ecommerce, white background" },
    { f: "girls_ethnic_frock.png", p: "Indian girls embroidered ethnic frock, fusion kids, ecommerce, white background" },
    { f: "girls_anarkali_red.png", p: "Indian girls red silk anarkali gown, wedding wear kids, ecommerce, white background" },
    { f: "girls_lehenga_blue.png", p: "Indian girls blue designer lehenga with sequins, festive, ecommerce, white background" },
    { f: "girls_kurta_set_pink.png", p: "Indian girls pink cotton kurta pajama set, everyday ethnic, ecommerce, white background" },
    { f: "girls_ghagra_rajasthani.png", p: "Indian girls Rajasthani colorful ghagra choli, bandhani work, ecommerce, white background" },
    { f: "girls_churidar_set.png", p: "Indian girls printed churidar suit set with dupatta, party wear, ecommerce, white background" },
    { f: "girls_silk_frock.png", p: "Indian girls silk traditional frock, South Indian temple wear, ecommerce, white background" },
    { f: "girls_anarkali_green.png", p: "Indian girls green floor length anarkali, Eid festive, ecommerce, white background" },
    { f: "girls_dhavani_set.png", p: "Indian girls half saree set davani, golden border, ecommerce, white background" },
    { f: "girls_gown_peach.png", p: "Indian girls peach embroidered party gown, reception, ecommerce, white background" },
    { f: "girls_sharara_yellow.png", p: "Indian girls yellow sharara suit set, haldi ceremony, ecommerce, white background" },

    // ══════════════════════════════════════
    // ══  BABY CLOTHING (20 items)        ══
    // ══════════════════════════════════════
    { f: "baby_romper_pastel.png", p: "baby infant cotton romper pastel colors, soft newborn clothing, ecommerce, white background" },
    { f: "baby_onesie_pack.png", p: "baby onesie bodysuit pack of 5, multicolor, newborn essentials, ecommerce, white background" },
    { f: "baby_bodysuit_white.png", p: "baby full sleeve bodysuit white, soft cotton infant, ecommerce, white background" },
    { f: "baby_winter_jacket.png", p: "baby pink winter jacket with hood, warm infant outerwear, ecommerce, white background" },
    { f: "baby_sleepsuit.png", p: "baby sleepsuit pajama with front zipper, comfortable, ecommerce, white background" },
    { f: "baby_mitten_bodysuit.png", p: "baby bodysuit with fold-over mittens, scratch-proof, ecommerce, white background" },
    { f: "baby_organic_top.png", p: "baby organic cotton t-shirt natural color, eco-friendly, ecommerce, white background" },
    { f: "baby_fleece_footie.png", p: "baby blue fleece footie pajama, warm sleepwear, ecommerce, white background" },
    { f: "baby_summer_set.png", p: "baby summer outfit set shorts and tee, lightweight, ecommerce, white background" },
    { f: "baby_bear_jumpsuit.png", p: "baby jumpsuit with cute bear ears hood, adorable infant, ecommerce, white background" },
    { f: "baby_ruffle_romper.png", p: "baby girl ruffle romper pink, cute frilly outfit, ecommerce, white background" },
    { f: "baby_knitted_sweater.png", p: "baby cream knitted sweater cardigan, hand-knit style, ecommerce, white background" },
    { f: "baby_dungaree.png", p: "baby denim dungaree overall, cute infant outfit, ecommerce, white background" },
    { f: "baby_bunting_bag.png", p: "baby bunting bag sleeping bag, cozy warm swaddle, ecommerce, white background" },
    { f: "baby_animal_set.png", p: "baby animal print outfit set with bib and hat, cute, ecommerce, white background" },
    { f: "baby_tutu_dress.png", p: "baby girl tutu dress pink with headband, party ready, ecommerce, white background" },
    { f: "baby_footed_pants.png", p: "baby footed pants pack of 3, soft cotton, ecommerce, white background" },
    { f: "baby_hooded_towel_set.png", p: "baby hooded bath towel set with washcloth, soft, ecommerce, white background" },
    { f: "baby_snowsuit.png", p: "baby one-piece snowsuit winter, warm hooded, ecommerce, white background" },
    { f: "baby_sailor_set.png", p: "baby sailor outfit romper with hat, nautical cute, ecommerce, white background" },

    // ══════════════════════════════════════
    // ══  KIDS FOOTWEAR (20 items)        ══
    // ══════════════════════════════════════
    { f: "kids_velcro_sneakers.png", p: "children kids white velcro strap sneakers, easy-wear shoes, ecommerce, white background" },
    { f: "kids_school_shoes.png", p: "children kids black formal school shoes, uniform footwear, ecommerce, white background" },
    { f: "kids_lightup_shoes.png", p: "children kids LED light-up sneakers colorful, glowing shoes, ecommerce, white background" },
    { f: "kids_sandals_summer.png", p: "children kids summer open-toe sandals, comfortable outdoor, ecommerce, white background" },
    { f: "kids_running_blue.png", p: "children kids blue running athletic shoes, sporty, ecommerce, white background" },
    { f: "kids_canvas_slipon.png", p: "children kids white canvas slip-on shoes, casual, ecommerce, white background" },
    { f: "kids_rain_boots.png", p: "children kids colorful rubber rain boots, waterproof, ecommerce, white background" },
    { f: "kids_formal_leather.png", p: "children kids brown leather formal shoes, party wear, ecommerce, white background" },
    { f: "kids_hightop_red.png", p: "children kids red high-top basketball sneakers, sporty, ecommerce, white background" },
    { f: "kids_clogs.png", p: "children kids colorful comfort clogs, lightweight, ecommerce, white background" },
    { f: "kids_mary_jane.png", p: "children girls pink mary jane shoes, cute party footwear, ecommerce, white background" },
    { f: "kids_hiking_boots.png", p: "children kids hiking boots brown, outdoor adventure, ecommerce, white background" },
    { f: "kids_flip_flops.png", p: "children kids colorful flip flops, beach casual wear, ecommerce, white background" },
    { f: "kids_ballet_flats.png", p: "children girls ballet flat shoes silver, elegant, ecommerce, white background" },
    { f: "kids_crocs_style.png", p: "children kids colorful clog sandals with charms, fun, ecommerce, white background" },
    { f: "kids_sports_cleats.png", p: "children kids green sports football cleats, athletic, ecommerce, white background" },
    { f: "kids_winter_boots.png", p: "children kids warm winter snow boots furry, cold weather, ecommerce, white background" },
    { f: "kids_loafers.png", p: "children boys brown penny loafer shoes, smart casual, ecommerce, white background" },
    { f: "kids_glitter_shoes.png", p: "children girls glitter sparkle shoes silver, party fashion, ecommerce, white background" },
    { f: "kids_water_shoes.png", p: "children kids aqua water shoes neoprene, swimming beach, ecommerce, white background" },

    // ══════════════════════════════════════
    // ══  KIDS ACCESSORIES (20 items)     ══
    // ══════════════════════════════════════
    { f: "kids_backpack.png", p: "children kids cartoon character school backpack, colorful, ecommerce, white background" },
    { f: "kids_water_bottle.png", p: "children kids stainless steel water bottle, insulated BPA free, ecommerce, white background" },
    { f: "kids_sunglasses.png", p: "children kids colorful UV protection sunglasses, fun shapes, ecommerce, white background" },
    { f: "kids_digital_watch.png", p: "children kids digital sports watch, colorful waterproof, ecommerce, white background" },
    { f: "kids_baseball_cap.png", p: "children kids baseball cap adjustable, casual sun hat, ecommerce, white background" },
    { f: "kids_hair_set.png", p: "children kids hair accessories set clips bows bands, colorful, ecommerce, white background" },
    { f: "kids_lunch_box.png", p: "children kids insulated lunch box bag compartments, ecommerce, white background" },
    { f: "kids_beanie_hat.png", p: "children kids knitted winter beanie hat with pom pom, ecommerce, white background" },
    { f: "kids_belt.png", p: "children kids elastic stretch belt adjustable, ecommerce, white background" },
    { f: "kids_socks_pack.png", p: "children kids fun patterned socks pack of 6 cotton, ecommerce, white background" },
    { f: "kids_umbrella.png", p: "children kids colorful character umbrella, rain protection, ecommerce, white background" },
    { f: "kids_scarf_knit.png", p: "children kids warm knitted scarf with tassels, winter, ecommerce, white background" },
    { f: "kids_gloves.png", p: "children kids winter gloves warm fleece lined, cold weather, ecommerce, white background" },
    { f: "kids_wallet.png", p: "children kids fun cartoon print wallet, compact, ecommerce, white background" },
    { f: "kids_bucket_hat.png", p: "children kids cotton bucket hat colorful, summer outdoor, ecommerce, white background" },
    { f: "kids_bow_tie_set.png", p: "children boys bow tie and suspenders set, formal party, ecommerce, white background" },
    { f: "kids_headband_set.png", p: "children girls headband set with flowers and bows, cute, ecommerce, white background" },
    { f: "kids_mini_backpack.png", p: "children toddler mini backpack animal design, small cute, ecommerce, white background" },
    { f: "kids_jewelry_set.png", p: "children girls play jewelry bracelet necklace set, colorful beads, ecommerce, white background" },
    { f: "kids_travel_pillow.png", p: "children kids travel neck pillow, soft animal shaped, ecommerce, white background" },
];

// Download one image with retry
function downloadImage(filename, prompt, retries = 3) {
    return new Promise((resolve) => {
        const outPath = path.join(OUT, filename);
        if (fs.existsSync(outPath) && fs.statSync(outPath).size > 5000) {
            console.log(`  ⏩ SKIP (exists): ${filename}`);
            return resolve(true);
        }

        let seed = 0;
        for (let i = 0; i < prompt.length; i++) seed += prompt.charCodeAt(i);
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=flux&nologo=true&seed=${seed}&width=512&height=512`;

        const attempt = (retryNum) => {
            const proto = url.startsWith("https") ? https : http;
            const req = proto.get(url, { timeout: 60000 }, (res) => {
                // Handle redirects
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    const redirectProto = res.headers.location.startsWith("https") ? https : http;
                    redirectProto.get(res.headers.location, { timeout: 60000 }, (res2) => {
                        const chunks = [];
                        res2.on("data", (c) => chunks.push(c));
                        res2.on("end", () => {
                            const buf = Buffer.concat(chunks);
                            if (buf.length > 2000) {
                                fs.writeFileSync(outPath, buf);
                                console.log(`  ✅ ${filename} (${(buf.length / 1024).toFixed(0)}KB)`);
                                resolve(true);
                            } else if (retryNum < retries) {
                                console.log(`  ⚠️ Too small, retry ${retryNum + 1}: ${filename}`);
                                setTimeout(() => attempt(retryNum + 1), 2000);
                            } else {
                                console.log(`  ❌ FAILED: ${filename}`);
                                resolve(false);
                            }
                        });
                    }).on("error", () => {
                        if (retryNum < retries) setTimeout(() => attempt(retryNum + 1), 3000);
                        else { console.log(`  ❌ FAILED: ${filename}`); resolve(false); }
                    });
                    return;
                }

                const chunks = [];
                res.on("data", (c) => chunks.push(c));
                res.on("end", () => {
                    const buf = Buffer.concat(chunks);
                    if (buf.length > 2000) {
                        fs.writeFileSync(outPath, buf);
                        console.log(`  ✅ ${filename} (${(buf.length / 1024).toFixed(0)}KB)`);
                        resolve(true);
                    } else if (retryNum < retries) {
                        console.log(`  ⚠️ Too small, retry ${retryNum + 1}: ${filename}`);
                        setTimeout(() => attempt(retryNum + 1), 2000);
                    } else {
                        console.log(`  ❌ FAILED: ${filename}`);
                        resolve(false);
                    }
                });
            });
            req.on("error", () => {
                if (retryNum < retries) setTimeout(() => attempt(retryNum + 1), 3000);
                else { console.log(`  ❌ FAILED: ${filename}`); resolve(false); }
            });
            req.on("timeout", () => {
                req.destroy();
                if (retryNum < retries) setTimeout(() => attempt(retryNum + 1), 3000);
                else { console.log(`  ❌ TIMEOUT: ${filename}`); resolve(false); }
            });
        };
        attempt(0);
    });
}

// Download in batches of 3 (Pollinations rate limit friendly)
async function main() {
    console.log(`\n🍌 Banana AI (Pollinations Flux) — Kids Image Generator`);
    console.log(`📦 Total images to generate: ${KIDS.length}`);
    console.log(`📂 Output: ${OUT}\n`);

    let done = 0, failed = 0;
    const BATCH = 3;

    for (let i = 0; i < KIDS.length; i += BATCH) {
        const batch = KIDS.slice(i, i + BATCH);
        console.log(`\n── Batch ${Math.floor(i / BATCH) + 1}/${Math.ceil(KIDS.length / BATCH)} ──`);
        const results = await Promise.all(batch.map((item) => downloadImage(item.f, item.p)));
        done += results.filter(Boolean).length;
        failed += results.filter((r) => !r).length;

        // Small delay between batches to be respectful
        if (i + BATCH < KIDS.length) await new Promise((r) => setTimeout(r, 1500));
    }

    console.log(`\n══════════════════════════════`);
    console.log(`✅ Done: ${done}/${KIDS.length}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`══════════════════════════════\n`);
}

main();
