/**
 * gen_kids2.js — Download Kids product images using loremflickr (free, no auth)
 * Saves to multi-vendor-frontend/public/products/kids/
 * Run:  node gen_kids2.js
 */

const fs = require("fs");
const path = require("path");
const https = require("https");

const OUT = path.join(__dirname, "..", "multi-vendor-frontend", "public", "products", "kids");
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

// Map each filename to a loremflickr keyword + lock seed
// loremflickr.com/512/512/{keywords}?lock={seed} returns consistent real images
const KIDS = [
    // BOYS TOPWEAR (20)
    { f: "boys_graphic_tee_blue.png",      kw: "boys,tshirt,kids",         seed: 1 },
    { f: "boys_polo_white.png",            kw: "polo,shirt,boy,white",     seed: 2 },
    { f: "boys_formal_shirt_lightblue.png",kw: "shirt,formal,boy,blue",    seed: 3 },
    { f: "boys_hoodie_red.png",            kw: "hoodie,boys,red,kids",      seed: 4 },
    { f: "boys_superhero_tee.png",         kw: "superhero,kids,tshirt",    seed: 5 },
    { f: "boys_striped_tee_navy.png",      kw: "striped,tshirt,boys,navy", seed: 6 },
    { f: "boys_fullsleeve_grey.png",       kw: "longsleeve,shirt,boys",    seed: 7 },
    { f: "boys_check_shirt.png",           kw: "checkered,shirt,boys",     seed: 8 },
    { f: "boys_tank_top.png",              kw: "tank,top,boys,summer",     seed: 9 },
    { f: "boys_sweater_green.png",         kw: "sweater,green,boys,kids",  seed: 10 },
    { f: "boys_zipup_hoodie_black.png",    kw: "hoodie,black,zipper,boys", seed: 11 },
    { f: "boys_muscle_tee.png",            kw: "sports,shirt,boys,kids",   seed: 12 },
    { f: "boys_henley_tee.png",            kw: "shirt,grey,boys,casual",   seed: 13 },
    { f: "boys_raglan_tee.png",            kw: "baseball,tshirt,boys",     seed: 14 },
    { f: "boys_cartoon_tee.png",           kw: "dinosaur,tshirt,kids",     seed: 15 },
    { f: "boys_mandarin_shirt.png",        kw: "collar,shirt,boys,white",  seed: 16 },
    { f: "boys_colorblock_tee.png",        kw: "colorful,tshirt,boys",     seed: 17 },
    { f: "boys_turtleneck.png",            kw: "turtleneck,boys,navy",     seed: 18 },
    { f: "boys_printed_shirt_tropical.png",kw: "tropical,shirt,boys",      seed: 19 },
    { f: "boys_sports_jersey.png",         kw: "jersey,sports,boys",       seed: 20 },
    // BOYS BOTTOMWEAR (20)
    { f: "boys_cargo_shorts_khaki.png",    kw: "cargo,shorts,boys,khaki",  seed: 21 },
    { f: "boys_jogger_navy.png",           kw: "jogger,pants,boys,navy",   seed: 22 },
    { f: "boys_cotton_shorts_blue.png",    kw: "shorts,blue,boys,cotton",  seed: 23 },
    { f: "boys_denim_jeans.png",           kw: "jeans,denim,boys,kids",    seed: 24 },
    { f: "boys_chino_beige.png",           kw: "chino,pants,boys,beige",   seed: 25 },
    { f: "boys_track_pants_striped.png",   kw: "track,pants,boys,sport",   seed: 26 },
    { f: "boys_swim_trunks.png",           kw: "swim,trunks,boys,beach",   seed: 27 },
    { f: "boys_ripped_jeans.png",          kw: "ripped,jeans,boys,denim",  seed: 28 },
    { f: "boys_formal_trousers.png",       kw: "trousers,formal,boys,black",seed: 29 },
    { f: "boys_bermuda_olive.png",         kw: "bermuda,shorts,boys,olive", seed: 30 },
    { f: "boys_elastic_jeans.png",         kw: "jeans,boys,elastic,kids",  seed: 31 },
    { f: "boys_corduroy_pants.png",        kw: "corduroy,pants,boys",      seed: 32 },
    { f: "boys_athletic_shorts.png",       kw: "athletic,shorts,boys,sport",seed: 33 },
    { f: "boys_camo_pants.png",            kw: "camouflage,pants,boys",    seed: 34 },
    { f: "boys_linen_shorts.png",          kw: "linen,shorts,boys,white",  seed: 35 },
    { f: "boys_denim_shorts.png",          kw: "denim,shorts,boys,casual", seed: 36 },
    { f: "boys_pajama_pants.png",          kw: "pajama,pants,kids,soft",   seed: 37 },
    { f: "boys_drawstring_pants.png",      kw: "pants,boys,grey,casual",   seed: 38 },
    { f: "boys_school_trousers.png",       kw: "school,trousers,boys,grey",seed: 39 },
    { f: "boys_sweatpants.png",            kw: "sweatpants,boys,grey,kids",seed: 40 },
    // BOYS OUTERWEAR (20)
    { f: "boys_denim_jacket.png",          kw: "denim,jacket,boys,blue",   seed: 41 },
    { f: "boys_puffer_red.png",            kw: "puffer,jacket,boys,red",   seed: 42 },
    { f: "boys_windbreaker_green.png",     kw: "windbreaker,boys,green",   seed: 43 },
    { f: "boys_fleece_grey.png",           kw: "fleece,jacket,boys,grey",  seed: 44 },
    { f: "boys_bomber_navy.png",           kw: "bomber,jacket,boys,navy",  seed: 45 },
    { f: "boys_raincoat_yellow.png",       kw: "raincoat,boys,yellow",     seed: 46 },
    { f: "boys_winter_parka.png",          kw: "parka,coat,boys,winter",   seed: 47 },
    { f: "boys_sherpa_brown.png",          kw: "sherpa,fleece,boys,brown", seed: 48 },
    { f: "boys_letterman.png",             kw: "letterman,jacket,varsity,boys",seed: 49 },
    { f: "boys_puffer_vest.png",           kw: "vest,puffer,boys,orange",  seed: 50 },
    { f: "boys_quilted_jacket.png",        kw: "quilted,jacket,boys,navy", seed: 51 },
    { f: "boys_hoodie_jacket_camo.png",    kw: "hoodie,jacket,camo,boys",  seed: 52 },
    { f: "boys_leather_jacket.png",        kw: "leather,jacket,boys,black",seed: 53 },
    { f: "boys_track_jacket.png",          kw: "track,jacket,boys,sport",  seed: 54 },
    { f: "boys_poncho.png",                kw: "poncho,knit,boys,kids",    seed: 55 },
    { f: "boys_softshell.png",             kw: "jacket,outdoor,boys,grey", seed: 56 },
    { f: "boys_blazer_navy.png",           kw: "blazer,boys,navy,formal",  seed: 57 },
    { f: "boys_rain_jacket_blue.png",      kw: "raincoat,boys,blue,hood",  seed: 58 },
    { f: "boys_fleece_vest.png",           kw: "vest,fleece,boys,layering",seed: 59 },
    { f: "boys_snow_jacket.png",           kw: "ski,jacket,boys,winter",   seed: 60 },
    // BOYS ETHNIC (20)
    { f: "boys_kurta_white_gold.png",      kw: "kurta,indian,boys,white",  seed: 61 },
    { f: "boys_sherwani_blue.png",         kw: "sherwani,boys,indian,blue",seed: 62 },
    { f: "boys_dhoti_kurta.png",           kw: "kurta,dhoti,indian,boys",  seed: 63 },
    { f: "boys_pathani_olive.png",         kw: "pathani,suit,boys,indian", seed: 64 },
    { f: "boys_nehru_jacket.png",          kw: "nehru,jacket,boys,india",  seed: 65 },
    { f: "boys_silk_kurta_gold.png",       kw: "silk,kurta,boys,gold",     seed: 66 },
    { f: "boys_indo_western.png",          kw: "indo,western,boys,suit",   seed: 67 },
    { f: "boys_jodhpuri_navy.png",         kw: "jodhpuri,suit,boys,navy",  seed: 68 },
    { f: "boys_waistcoat_set.png",         kw: "waistcoat,kurta,boys",     seed: 69 },
    { f: "boys_embroidered_peach.png",     kw: "kurta,embroidered,boys",   seed: 70 },
    { f: "boys_kurta_maroon.png",          kw: "kurta,maroon,boys,indian", seed: 71 },
    { f: "boys_angrakha_yellow.png",       kw: "kurta,yellow,boys,ethnic", seed: 72 },
    { f: "boys_bandi_set.png",             kw: "bandi,jacket,kurta,boys",  seed: 73 },
    { f: "boys_cotton_kurta_blue.png",     kw: "kurta,blue,boys,cotton",   seed: 74 },
    { f: "boys_kurta_churidar.png",        kw: "kurta,churidar,boys,green",seed: 75 },
    { f: "boys_kurta_jacket_combo.png",    kw: "kurta,jacket,boys,party",  seed: 76 },
    { f: "boys_mundu_set.png",             kw: "dhoti,boys,white,indian",  seed: 77 },
    { f: "boys_achkan_cream.png",          kw: "achkan,sherwani,boys",     seed: 78 },
    { f: "boys_mirror_work_kurta.png",     kw: "kurta,mirror,boys,ethnic", seed: 79 },
    { f: "boys_festive_set_red.png",       kw: "kurta,red,boys,festive",   seed: 80 },
    // GIRLS DRESSES & TOPS (20)
    { f: "girls_floral_frock.png",         kw: "frock,pink,girls,kids",    seed: 81 },
    { f: "girls_party_dress_red.png",      kw: "party,dress,girls,red",    seed: 82 },
    { f: "girls_maxi_dress.png",           kw: "maxi,dress,girls,floral",  seed: 83 },
    { f: "girls_kurti_yellow.png",         kw: "kurti,girls,yellow,kids",  seed: 84 },
    { f: "girls_jumpsuit_denim.png",       kw: "jumpsuit,girls,denim",     seed: 85 },
    { f: "girls_peplum_white.png",         kw: "peplum,top,girls,white",   seed: 86 },
    { f: "girls_tutu_lavender.png",        kw: "tutu,dress,girls,purple",  seed: 87 },
    { f: "girls_ruffle_top.png",           kw: "ruffle,top,girls,peach",   seed: 88 },
    { f: "girls_offshoulder_striped.png",  kw: "offshoulder,top,girls",    seed: 89 },
    { f: "girls_sundress_blue.png",        kw: "sundress,girls,blue",      seed: 90 },
    { f: "girls_ball_gown.png",            kw: "gown,girls,princess",      seed: 91 },
    { f: "girls_romper_polkadot.png",      kw: "romper,girls,polkadot",    seed: 92 },
    { f: "girls_peasant_top.png",          kw: "boho,top,girls,embroidered",seed: 93 },
    { f: "girls_dungaree_dress.png",       kw: "dungaree,dress,girls",     seed: 94 },
    { f: "girls_pinafore_plaid.png",       kw: "pinafore,dress,girls,plaid",seed: 95 },
    { f: "girls_crop_top_set.png",         kw: "crop,top,skirt,girls",     seed: 96 },
    { f: "girls_tiered_dress.png",         kw: "tiered,dress,girls,ruffle",seed: 97 },
    { f: "girls_smocked_dress.png",        kw: "smocked,dress,girls,floral",seed: 98 },
    { f: "girls_tunic_printed.png",        kw: "tunic,top,girls,printed",  seed: 99 },
    { f: "girls_sequin_dress.png",         kw: "sequin,dress,girls,gold",  seed: 100 },
    // GIRLS BOTTOMWEAR (20)
    { f: "girls_dungaree_blue.png",        kw: "dungaree,girls,blue,denim",seed: 101 },
    { f: "girls_leggings_black.png",       kw: "leggings,girls,black",     seed: 102 },
    { f: "girls_shorts_floral.png",        kw: "shorts,girls,floral",      seed: 103 },
    { f: "girls_palazzo_pink.png",         kw: "palazzo,pants,girls,pink", seed: 104 },
    { f: "girls_flared_jeans.png",         kw: "flared,jeans,girls",       seed: 105 },
    { f: "girls_skirt_rainbow.png",        kw: "skirt,girls,rainbow",      seed: 106 },
    { f: "girls_denim_skirt.png",          kw: "denim,skirt,girls",        seed: 107 },
    { f: "girls_track_pants.png",          kw: "track,pants,girls,purple", seed: 108 },
    { f: "girls_capri_white.png",          kw: "capri,pants,girls,white",  seed: 109 },
    { f: "girls_cargo_olive.png",          kw: "cargo,pants,girls,olive",  seed: 110 },
    { f: "girls_culottes.png",             kw: "culottes,girls,mustard",   seed: 111 },
    { f: "girls_sequin_leggings.png",      kw: "sequin,leggings,girls,gold",seed: 112 },
    { f: "girls_joggers_pink.png",         kw: "jogger,girls,pink,pants",  seed: 113 },
    { f: "girls_jeggings.png",             kw: "jeggings,girls,blue",      seed: 114 },
    { f: "girls_tutu_skirt.png",           kw: "tutu,skirt,girls,pink",    seed: 115 },
    { f: "girls_paperbag_shorts.png",      kw: "paperbag,shorts,girls",    seed: 116 },
    { f: "girls_striped_leggings.png",     kw: "striped,leggings,girls",   seed: 117 },
    { f: "girls_corduroy_skirt.png",       kw: "corduroy,skirt,girls,rust",seed: 118 },
    { f: "girls_highwaist_jeans.png",      kw: "highwaist,jeans,girls",    seed: 119 },
    { f: "girls_cotton_shorts.png",        kw: "shorts,girls,cotton",      seed: 120 },
    // GIRLS OUTERWEAR (20)
    { f: "girls_cardigan_pink.png",        kw: "cardigan,girls,pink,knit", seed: 121 },
    { f: "girls_hoodie_lavender.png",      kw: "hoodie,girls,lavender",    seed: 122 },
    { f: "girls_denim_jacket.png",         kw: "denim,jacket,girls",       seed: 123 },
    { f: "girls_puffer_rose.png",          kw: "puffer,coat,girls,pink",   seed: 124 },
    { f: "girls_windbreaker_mint.png",     kw: "windbreaker,girls,mint",   seed: 125 },
    { f: "girls_trench_beige.png",         kw: "trench,coat,girls,beige",  seed: 126 },
    { f: "girls_faux_fur_white.png",       kw: "fur,jacket,girls,white",   seed: 127 },
    { f: "girls_fleece_coral.png",         kw: "fleece,girls,coral,top",   seed: 128 },
    { f: "girls_parka_navy.png",           kw: "parka,coat,girls,navy",    seed: 129 },
    { f: "girls_bomber_blush.png",         kw: "bomber,jacket,girls,blush",seed: 130 },
    { f: "girls_quilted_vest.png",         kw: "quilted,vest,girls,pink",  seed: 131 },
    { f: "girls_poncho_knit.png",          kw: "poncho,knit,girls",        seed: 132 },
    { f: "girls_teddy_coat.png",           kw: "teddy,coat,girls,cream",   seed: 133 },
    { f: "girls_raincoat_polka.png",       kw: "raincoat,girls,polka",     seed: 134 },
    { f: "girls_ski_jacket.png",           kw: "ski,jacket,girls,pink",    seed: 135 },
    { f: "girls_blazer_check.png",         kw: "blazer,girls,check",       seed: 136 },
    { f: "girls_cape_coat.png",            kw: "cape,coat,girls,red",      seed: 137 },
    { f: "girls_track_jacket.png",         kw: "track,jacket,girls,purple",seed: 138 },
    { f: "girls_shrug_white.png",          kw: "shrug,girls,white,knit",   seed: 139 },
    { f: "girls_puffer_lilac.png",         kw: "puffer,jacket,girls,lilac",seed: 140 },
    // GIRLS ETHNIC (20)
    { f: "girls_lehenga_pink.png",         kw: "lehenga,choli,girls,pink", seed: 141 },
    { f: "girls_anarkali_turquoise.png",   kw: "anarkali,girls,turquoise", seed: 142 },
    { f: "girls_salwar_floral.png",        kw: "salwar,kameez,girls",      seed: 143 },
    { f: "girls_sharara_purple.png",       kw: "sharara,girls,purple",     seed: 144 },
    { f: "girls_ghagra_mirror.png",        kw: "ghagra,choli,girls",       seed: 145 },
    { f: "girls_pattu_pavadai.png",        kw: "silk,pavadai,girls,south", seed: 146 },
    { f: "girls_kurti_palazzo.png",        kw: "kurti,palazzo,girls",      seed: 147 },
    { f: "girls_chanderi_gold.png",        kw: "chanderi,dress,girls,gold",seed: 148 },
    { f: "girls_langa_voni.png",           kw: "half,saree,girls,south",   seed: 149 },
    { f: "girls_ethnic_frock.png",         kw: "ethnic,frock,girls,india", seed: 150 },
    { f: "girls_anarkali_red.png",         kw: "anarkali,girls,red,silk",  seed: 151 },
    { f: "girls_lehenga_blue.png",         kw: "lehenga,girls,blue",       seed: 152 },
    { f: "girls_kurta_set_pink.png",       kw: "kurta,girls,pink,set",     seed: 153 },
    { f: "girls_ghagra_rajasthani.png",    kw: "ghagra,rajasthani,girls",  seed: 154 },
    { f: "girls_churidar_set.png",         kw: "churidar,girls,suit",      seed: 155 },
    { f: "girls_silk_frock.png",           kw: "silk,frock,girls,temple",  seed: 156 },
    { f: "girls_anarkali_green.png",       kw: "anarkali,green,girls",     seed: 157 },
    { f: "girls_dhavani_set.png",          kw: "half,saree,girls,golden",  seed: 158 },
    { f: "girls_gown_peach.png",           kw: "gown,girls,peach,party",   seed: 159 },
    { f: "girls_sharara_yellow.png",       kw: "sharara,girls,yellow",     seed: 160 },
    // BABY CLOTHING (20)
    { f: "baby_romper_pastel.png",         kw: "baby,romper,pastel,cute",  seed: 161 },
    { f: "baby_onesie_pack.png",           kw: "baby,onesie,bodysuit",     seed: 162 },
    { f: "baby_bodysuit_white.png",        kw: "baby,bodysuit,white",      seed: 163 },
    { f: "baby_winter_jacket.png",         kw: "baby,jacket,pink,winter",  seed: 164 },
    { f: "baby_sleepsuit.png",             kw: "baby,sleepsuit,pajama",    seed: 165 },
    { f: "baby_mitten_bodysuit.png",       kw: "baby,bodysuit,mittens",    seed: 166 },
    { f: "baby_organic_top.png",           kw: "baby,organic,cotton,top",  seed: 167 },
    { f: "baby_fleece_footie.png",         kw: "baby,footie,pajama,blue",  seed: 168 },
    { f: "baby_summer_set.png",            kw: "baby,summer,outfit,set",   seed: 169 },
    { f: "baby_bear_jumpsuit.png",         kw: "baby,bear,jumpsuit,hood",  seed: 170 },
    { f: "baby_ruffle_romper.png",         kw: "baby,ruffle,romper,pink",  seed: 171 },
    { f: "baby_knitted_sweater.png",       kw: "baby,knit,sweater,cream",  seed: 172 },
    { f: "baby_dungaree.png",              kw: "baby,dungaree,denim",      seed: 173 },
    { f: "baby_bunting_bag.png",           kw: "baby,bunting,sleeping,bag",seed: 174 },
    { f: "baby_animal_set.png",            kw: "baby,animal,print,outfit", seed: 175 },
    { f: "baby_tutu_dress.png",            kw: "baby,girl,tutu,dress,pink",seed: 176 },
    { f: "baby_footed_pants.png",          kw: "baby,pants,footed,soft",   seed: 177 },
    { f: "baby_hooded_towel_set.png",      kw: "baby,hooded,towel,bath",   seed: 178 },
    { f: "baby_snowsuit.png",              kw: "baby,snowsuit,winter,hood",seed: 179 },
    { f: "baby_sailor_set.png",            kw: "baby,sailor,romper,nautical",seed: 180 },
    // KIDS FOOTWEAR (20)
    { f: "kids_velcro_sneakers.png",       kw: "kids,sneakers,white,velcro",seed: 181 },
    { f: "kids_school_shoes.png",          kw: "kids,school,shoes,black",  seed: 182 },
    { f: "kids_lightup_shoes.png",         kw: "kids,light,up,shoes",      seed: 183 },
    { f: "kids_sandals_summer.png",        kw: "kids,sandals,summer",      seed: 184 },
    { f: "kids_running_blue.png",          kw: "kids,running,shoes,blue",  seed: 185 },
    { f: "kids_canvas_slipon.png",         kw: "kids,canvas,slipon,shoes", seed: 186 },
    { f: "kids_rain_boots.png",            kw: "kids,rain,boots,colorful", seed: 187 },
    { f: "kids_formal_leather.png",        kw: "kids,leather,shoes,brown", seed: 188 },
    { f: "kids_hightop_red.png",           kw: "kids,high,top,sneakers,red",seed: 189 },
    { f: "kids_clogs.png",                 kw: "kids,clogs,colorful",      seed: 190 },
    { f: "kids_mary_jane.png",             kw: "girls,mary,jane,shoes,pink",seed: 191 },
    { f: "kids_hiking_boots.png",          kw: "kids,hiking,boots,brown",  seed: 192 },
    { f: "kids_flip_flops.png",            kw: "kids,flip,flops,colorful", seed: 193 },
    { f: "kids_ballet_flats.png",          kw: "girls,ballet,flats,silver",seed: 194 },
    { f: "kids_crocs_style.png",           kw: "kids,clog,sandals,charms", seed: 195 },
    { f: "kids_sports_cleats.png",         kw: "kids,football,cleats",     seed: 196 },
    { f: "kids_winter_boots.png",          kw: "kids,winter,snow,boots",   seed: 197 },
    { f: "kids_loafers.png",               kw: "boys,loafers,shoes,brown", seed: 198 },
    { f: "kids_glitter_shoes.png",         kw: "girls,glitter,shoes,sparkle",seed: 199 },
    { f: "kids_water_shoes.png",           kw: "kids,water,shoes,aqua",    seed: 200 },
    // KIDS ACCESSORIES (20)
    { f: "kids_backpack.png",              kw: "kids,backpack,colorful,cartoon",seed: 201 },
    { f: "kids_water_bottle.png",          kw: "kids,water,bottle,steel",  seed: 202 },
    { f: "kids_sunglasses.png",            kw: "kids,sunglasses,colorful", seed: 203 },
    { f: "kids_digital_watch.png",         kw: "kids,digital,watch,sport", seed: 204 },
    { f: "kids_baseball_cap.png",          kw: "kids,baseball,cap,hat",    seed: 205 },
    { f: "kids_hair_set.png",              kw: "girls,hair,accessories,clips",seed: 206 },
    { f: "kids_lunch_box.png",             kw: "kids,lunch,box,insulated", seed: 207 },
    { f: "kids_beanie_hat.png",            kw: "kids,beanie,hat,winter",   seed: 208 },
    { f: "kids_belt.png",                  kw: "kids,belt,elastic,stretch",seed: 209 },
    { f: "kids_socks_pack.png",            kw: "kids,socks,pack,colorful", seed: 210 },
    { f: "kids_umbrella.png",              kw: "kids,umbrella,colorful",   seed: 211 },
    { f: "kids_scarf_knit.png",            kw: "kids,scarf,knit,winter",   seed: 212 },
    { f: "kids_gloves.png",                kw: "kids,gloves,winter,warm",  seed: 213 },
    { f: "kids_wallet.png",                kw: "kids,wallet,cartoon,fun",  seed: 214 },
    { f: "kids_bucket_hat.png",            kw: "kids,bucket,hat,summer",   seed: 215 },
    { f: "kids_bow_tie_set.png",           kw: "boys,bow,tie,suspenders",  seed: 216 },
    { f: "kids_headband_set.png",          kw: "girls,headband,flowers,bows",seed: 217 },
    { f: "kids_mini_backpack.png",         kw: "toddler,backpack,animal,cute",seed: 218 },
    { f: "kids_jewelry_set.png",           kw: "girls,jewelry,bracelet,beads",seed: 219 },
    { f: "kids_travel_pillow.png",         kw: "kids,travel,pillow,neck",  seed: 220 },
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function downloadUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { timeout: 30000 }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                // follow redirect
                return downloadUrl(res.headers.location).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                res.resume();
                return reject(new Error(`HTTP ${res.statusCode}`));
            }
            const chunks = [];
            res.on("data", c => chunks.push(c));
            res.on("end", () => resolve(Buffer.concat(chunks)));
            res.on("error", reject);
        }).on("error", reject).on("timeout", function() { this.destroy(); reject(new Error("timeout")); });
    });
}

async function downloadImage(f, kw, seed) {
    const outPath = path.join(OUT, f);
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 5000) {
        process.stdout.write(`  ⏩ `);
        return true;
    }

    const url = `https://loremflickr.com/512/512/${kw}?lock=${seed}`;
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const buf = await downloadUrl(url);
            if (buf.length > 5000) {
                fs.writeFileSync(outPath, buf);
                process.stdout.write(`  ✅ `);
                return true;
            }
            throw new Error(`Too small: ${buf.length}`);
        } catch(e) {
            if (attempt < 3) await sleep(2000);
        }
    }
    process.stdout.write(`  ❌ `);
    return false;
}

async function main() {
    console.log(`\n🍌 Kids Image Generator (loremflickr.com)`);
    console.log(`📦 Total: ${KIDS.length} images`);
    console.log(`📂 Output: ${OUT}\n`);

    let done = 0, failed = 0;
    const BATCH = 5;

    for (let i = 0; i < KIDS.length; i += BATCH) {
        const batch = KIDS.slice(i, i + BATCH);
        const n = Math.floor(i / BATCH) + 1;
        const total = Math.ceil(KIDS.length / BATCH);
        process.stdout.write(`Batch ${n}/${total} [${i+1}-${Math.min(i+BATCH,KIDS.length)}]: `);
        const results = await Promise.all(batch.map(item => downloadImage(item.f, item.kw, item.seed)));
        done += results.filter(Boolean).length;
        failed += results.filter(r => !r).length;
        console.log(`\n  (Downloaded: ${done}, Failed: ${failed})`);
        if (i + BATCH < KIDS.length) await sleep(500);
    }

    console.log(`\n══════════════════════════════`);
    console.log(`✅ Downloaded: ${done}/${KIDS.length}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`══════════════════════════════\n`);
}

main().catch(console.error);
