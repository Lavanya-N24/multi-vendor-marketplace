const { PrismaClient } = require("./prisma/generated/prisma");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();
const rp = (min, max) => +(min + Math.random() * (max - min)).toFixed(2);
const rs = () => Math.floor(Math.random() * 300) + 20;
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const pickSizes = (a, n) => [...a].sort(() => 0.5 - Math.random()).slice(0, n).join(",");

const CLOTHING = ["XS", "S", "M", "L", "XL", "XXL"];
const SHOES = ["6", "7", "8", "9", "10", "11", "12"];
const KIDS_AGE = ["2-3Y", "3-4Y", "4-5Y", "5-6Y", "6-7Y", "7-8Y", "8-9Y", "9-10Y"];
const KIDS_SHOE = ["1", "2", "3", "4", "5", "6", "7"];

// We use an AI image generator to guarantee perfectly relevant realistic product photos.
// This ensures Men clothing stays in Men, Women in Women, etc.
const getImgForProduct = (title, subcategory, gender) => {
    let focus = "";
    if (gender === "Men" || gender === "Boys") focus = "male";
    if (gender === "Women" || gender === "Girls") focus = "female";
    if (gender === "Kids" || title.includes("Baby")) focus = "child";

    const t = title.toLowerCase();
    const sub = subcategory.toLowerCase();

    // Default: clean studio product photo
    let type = "high quality ecommerce product photo on plain white background, studio lighting, no people, no text";

    // Beauty / makeup
    if (sub.includes("beauty") || sub.includes("makeup") || sub.includes("serum") || sub.includes("moisturizer")) {
        type = "beauty cosmetic product macro shot on pastel background, bottle and packaging centered, no people";
    }
    // Fashion clothing (jeans, jackets, dresses etc.)
    else if (t.includes("jeans") || t.includes("jacket") || t.includes("dress") || sub.includes("topwear") || sub.includes("bottomwear")) {
        type = "fashion clothing on invisible mannequin or neatly folded, studio shot on white background";
    }
    // Footwear / sneakers
    else if (t.includes("sneaker") || t.includes("shoe") || t.includes("boots") || sub.includes("footwear")) {
        type = "pair of shoes product shot on white background, angled view, studio lighting";
    }
    // Sunglasses
    else if (t.includes("sunglasses") || sub.includes("sunglasses")) {
        type = "sunglasses product photo on white background, close up, studio lighting, no face, no food";
    }
    // Watches
    else if (t.includes("watch")) {
        type = "wrist watch close up product photo on white background, studio light, no hand, no person";
    }
    // Headphones / earbuds
    else if (t.includes("headphone") || t.includes("earbuds") || t.includes("headset")) {
        type = "headphones product photo on white background, studio lighting, no person";
    }

    const prompt = title + " " + focus + " " + type;
    let seed = 0;
    for (let i = 0; i < title.length; i++) seed += title.charCodeAt(i);
    // Banana AI (Pollinations Flux) - High Quality instant generation
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=flux&nologo=true&seed=${seed}`;
};

async function main() {
    console.log("ðŸŒ± Seeding database...\n");
    await prisma.review.deleteMany();
    await prisma.order.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();
    const hash = await bcrypt.hash("password123", 10);

    const vendorData = [
        ["TechZone Store", "techzone@demo.com"], ["Fashion Hub", "fashionhub@demo.com"],
        ["HomeStyle Co", "homestyle@demo.com"], ["SportsPeak", "sportspeak@demo.com"],
        ["BookWorm Press", "bookworm@demo.com"], ["GlowUp Beauty", "glowup@demo.com"],
        ["Gadget World", "gadgetworld@demo.com"], ["Urban Wear", "urbanwear@demo.com"],
        ["Kitchen Pro", "kitchenpro@demo.com"], ["FitLife Gear", "fitlife@demo.com"],
        ["Luxe Fashion", "luxe@demo.com"], ["Kids World", "kidsworld@demo.com"],
    ];
    const v = {};
    for (const [name, email] of vendorData) {
        v[name] = (await prisma.user.create({ data: { name, email, password: hash, isVendor: true } })).id;
    }
    const buyers = [];
    for (const [name, email] of [["Priya Sharma", "priya@demo.com"], ["Rahul Kumar", "rahul@demo.com"], ["Ananya Singh", "ananya@demo.com"], ["Arjun Patel", "arjun@demo.com"], ["Neha Gupta", "neha@demo.com"]]) {
        buyers.push(await prisma.user.create({ data: { name, email, password: hash, isVendor: false } }));
    }

    const products = [];
    const mv = [v["Fashion Hub"], v["Urban Wear"], v["Luxe Fashion"]];
    const wv = [v["Fashion Hub"], v["Luxe Fashion"], v["Urban Wear"]];
    const kv = [v["Kids World"], v["Fashion Hub"]];

    // ===== MEN ===== (Local AI-generated product images)
    const MI = "/products/men/";
    const menItems = [
        // Shirts (5 unique)
        { title: "Men Classic Oxford Shirt White", sub: "Shirt", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 55, image: MI + "men_white_oxford.png" },
        { title: "Men Slim Fit Blue Formal Shirt", sub: "Shirt", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 45, image: MI + "men_blue_formal.png" },
        { title: "Men Striped Formal Shirt", sub: "Shirt", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 50, image: MI + "men_striped_formal.png" },
        { title: "Men White Dress Shirt", sub: "Shirt", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 42, image: MI + "men_white_dress.png" },
        { title: "Men Black Formal Shirt", sub: "Shirt", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 48, image: MI + "men_black_shirt.png" },
        // Casual/T-Shirts (11 unique)
        { title: "Men Polo T-Shirt White", sub: "Casual Shirt", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 30, image: MI + "men_white_polo.png" },
        { title: "Men Polo T-Shirt Black", sub: "Casual Shirt", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 30, image: MI + "men_black_polo.png" },
        { title: "Men Polo T-Shirt Navy Blue", sub: "Casual Shirt", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 30, image: MI + "men_navy_polo.png" },
        { title: "Men Crew Neck T-Shirt White", sub: "Casual Shirt", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 22, image: MI + "men_white_crewneck.png" },
        { title: "Men Crew Neck T-Shirt Black", sub: "Casual Shirt", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 22, image: MI + "men_black_crewneck.png" },
        { title: "Men Oversized Graphic Tee", sub: "Casual Shirt", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 28, image: MI + "men_graphic_white.png" },
        { title: "Men V-Neck T-Shirt Solid", sub: "Casual Shirt", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 22, image: MI + "men_grey_vneck.png" },
        { title: "Men Full Sleeve Casual Shirt", sub: "Casual Shirt", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 45, image: MI + "men_maroon_fullsleeve.png" },
        { title: "Men Linen Beach Shirt", sub: "Casual Shirt", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 40, image: MI + "men_beige_linen.png" },
        { title: "Men Henley Neck T-Shirt", sub: "Casual Shirt", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 28, image: MI + "men_olive_henley.png" },
        { title: "Men Denim Shirt", sub: "Casual Shirt", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 55, image: MI + "men_blue_denim_shirt.png" },
        // Jeans (6 unique)
        { title: "Men Straight Fit Jeans Black", sub: "Jeans", cat: "Fashion", sz: () => pickSizes(CLOTHING, 5), price: 60, image: MI + "men_black_jeans.png" },
        { title: "Men Regular Fit Jeans Blue", sub: "Jeans", cat: "Fashion", sz: () => pickSizes(CLOTHING, 5), price: 65, image: MI + "men_blue_jeans_regular.png" },
        { title: "Men Dark Wash Denim Jeans", sub: "Jeans", cat: "Fashion", sz: () => pickSizes(CLOTHING, 5), price: 55, image: MI + "men_darkwash_jeans.png" },
        { title: "Men Slim Fit Jeans Grey", sub: "Jeans", cat: "Fashion", sz: () => pickSizes(CLOTHING, 5), price: 58, image: MI + "men_grey_slim_jeans.png" },
        { title: "Men Wide Leg Jeans Light Blue", sub: "Jeans", cat: "Fashion", sz: () => pickSizes(CLOTHING, 5), price: 70, image: MI + "men_lightblue_jeans.png" },
        { title: "Men Ripped Jeans Fashion", sub: "Jeans", cat: "Fashion", sz: () => pickSizes(CLOTHING, 5), price: 45, image: MI + "men_ripped_jeans.png" },
        // Casual Pants (4 unique)
        { title: "Men Slim Fit Chinos Beige", sub: "Casual Pants", cat: "Fashion", sz: () => pickSizes(CLOTHING, 5), price: 45, image: MI + "men_beige_chinos.png" },
        { title: "Men Formal Trousers Grey", sub: "Casual Pants", cat: "Fashion", sz: () => pickSizes(CLOTHING, 5), price: 55, image: MI + "men_grey_trousers.png" },
        { title: "Men Cargo Pants Olive", sub: "Casual Pants", cat: "Fashion", sz: () => pickSizes(CLOTHING, 5), price: 49, image: MI + "men_olive_cargo.png" },
        { title: "Men Jogger Pants Black", sub: "Casual Pants", cat: "Fashion", sz: () => pickSizes(CLOTHING, 5), price: 35, image: MI + "men_black_joggers.png" },
        // Jackets (6 unique)
        { title: "Men Leather Biker Jacket", sub: "Jacket", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 150, image: MI + "men_leather_jacket.png" },
        { title: "Men Denim Jacket Blue", sub: "Jacket", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 80, image: MI + "men_denim_jacket.png" },
        { title: "Men Blazer Slim Black", sub: "Jacket", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 120, image: MI + "men_black_blazer.png" },
        { title: "Men Puffer Winter Jacket", sub: "Jacket", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 90, image: MI + "men_puffer_winter.png" },
        { title: "Men Bomber Jacket Navy", sub: "Jacket", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 85, image: MI + "men_bomber_jacket.png" },
        { title: "Men Windbreaker Jacket", sub: "Jacket", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 60, image: MI + "men_windbreaker_grey.png" },
        // Shoes (4 unique)
        { title: "Men Formal Oxford Shoes Brown", sub: "Shoe", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 110, image: MI + "men_formal_shoes.png" },
        { title: "Men Leather Derby Shoes", sub: "Shoe", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 90, image: MI + "men_leather_derby.png" },
        { title: "Men Brown Loafers", sub: "Shoe", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 85, image: MI + "men_brown_loafer.png" },
        { title: "Men Monk Strap Shoes", sub: "Shoe", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 95, image: MI + "men_monk_shoes.png" },
        // Sneakers (5 unique)
        { title: "Men White Lace-Up Sneakers", sub: "Sneakers", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 50, image: MI + "men_white_sneakers.png" },
        { title: "Men Black Running Sneakers", sub: "Sneakers", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 65, image: MI + "men_black_running.png" },
        { title: "Men Colourblock Sneakers", sub: "Sneakers", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 75, image: MI + "men_colorblock_sneakers.png" },
        { title: "Men Retro Court Sneakers", sub: "Sneakers", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 80, image: MI + "men_retro_sneakers.png" },
        { title: "Men Low-Top Casual Sneakers", sub: "Sneakers", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 55, image: MI + "men_grey_lowtop.png" },
        // Sunglasses (4 unique)
        { title: "Men Aviator Sunglasses", sub: "Sunglasses", cat: "Fashion", sz: () => "One Size", price: 45, image: MI + "men_sunglasses.png" },
        { title: "Men Wayfarer Sunglasses", sub: "Sunglasses", cat: "Fashion", sz: () => "One Size", price: 55, image: MI + "men_wayfarer.png" },
        { title: "Men Sport Wraparound Sunglasses", sub: "Sunglasses", cat: "Fashion", sz: () => "One Size", price: 60, image: MI + "men_sport_sunglasses.png" },
        { title: "Men Clubmaster Sunglasses", sub: "Sunglasses", cat: "Fashion", sz: () => "One Size", price: 50, image: MI + "men_clubmaster.png" },
        // Watches (4 unique)
        { title: "Men Stainless Steel Watch", sub: "Watch", cat: "Fashion", sz: () => "One Size", price: 120, image: MI + "men_watch.png" },
        { title: "Men Chronograph Watch", sub: "Watch", cat: "Fashion", sz: () => "One Size", price: 150, image: MI + "men_black_chrono.png" },
        { title: "Men Leather Strap Watch", sub: "Watch", cat: "Fashion", sz: () => "One Size", price: 95, image: MI + "men_leather_watch.png" },
        { title: "Men Digital Smart Watch", sub: "Watch", cat: "Fashion", sz: () => "One Size", price: 70, image: MI + "men_smart_watch.png" },
        // Headphones (4 unique)
        { title: "Men Noise Cancelling Headphones", sub: "Headphones", cat: "Fashion", sz: () => "One Size", price: 199, image: MI + "men_headphones.png" },
        { title: "Men Wireless Over-Ear Headphones", sub: "Headphones", cat: "Fashion", sz: () => "One Size", price: 140, image: MI + "men_silver_headphones.png" },
        { title: "Men Gaming Headset", sub: "Headphones", cat: "Fashion", sz: () => "One Size", price: 90, image: MI + "men_gaming_headset.png" },
        { title: "Men Studio Monitor Headphones", sub: "Headphones", cat: "Fashion", sz: () => "One Size", price: 160, image: MI + "men_studio_headphones.png" },
        // Perfume (4 unique)
        { title: "Men Cologne Fresh Citrus", sub: "Perfume", cat: "Fashion", sz: () => "One Size", price: 75, image: MI + "men_perfume.png" },
        { title: "Men Perfume Oud Intense", sub: "Perfume", cat: "Fashion", sz: () => "One Size", price: 95, image: MI + "men_oud_perfume.png" },
        { title: "Men Eau de Toilette Sport", sub: "Perfume", cat: "Fashion", sz: () => "One Size", price: 65, image: MI + "men_cologne_blue.png" },
        { title: "Men Night Fragrance Black", sub: "Perfume", cat: "Fashion", sz: () => "One Size", price: 85, image: MI + "men_night_perfume.png" },
        // â”€â”€ NEW: Formal Shirt & Pant â”€â”€
        { title: "Men Formal Shirt & Trouser Set", sub: "Shirt", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 95, image: MI + "men_formal_set.png" },
        { title: "Men Navy Formal Trousers", sub: "Casual Pants", cat: "Fashion", sz: () => pickSizes(CLOTHING, 5), price: 58, image: MI + "men_formal_pants_navy.png" },
        // â”€â”€ NEW: Extra Sneakers â”€â”€
        { title: "Men Red Athletic Sneakers", sub: "Sneakers", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 70, image: MI + "men_red_sneakers.png" },
        { title: "Men High-Top Basketball Sneakers", sub: "Sneakers", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 90, image: MI + "men_hightop_sneakers.png" },
        // â”€â”€ NEW: Extra Sunglasses â”€â”€
        { title: "Men Round Metal Sunglasses", sub: "Sunglasses", cat: "Fashion", sz: () => "One Size", price: 48, image: MI + "men_round_sunglasses.png" },
        // â”€â”€ NEW: Extra Jeans â”€â”€
        { title: "Men Blue Slim Fit Jeans", sub: "Jeans", cat: "Fashion", sz: () => pickSizes(CLOTHING, 5), price: 62, image: MI + "men_blue_jeans_slim.png" },
        { title: "Men Torn Distressed Jeans", sub: "Jeans", cat: "Fashion", sz: () => pickSizes(CLOTHING, 5), price: 48, image: MI + "men_torn_jeans.png" },
        // â”€â”€ NEW: Extra Headphones â”€â”€
        { title: "Men Premium Over-Ear Headphones", sub: "Headphones", cat: "Fashion", sz: () => "One Size", price: 175, image: MI + "men_overear_headphones.png" },
        // â”€â”€ NEW: Extra Jacket â”€â”€
        { title: "Men Black Denim Trucker Jacket", sub: "Jacket", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 95, image: MI + "men_black_denim_jacket.png" },

        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        // â•â•  BATCH 2: All categories â†’ 10+ each â•â•
        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

        // â”€â”€ Slippers (10 new) â”€â”€
        { title: "Men Black Slide Slippers", sub: "Slipper", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 15, image: MI + "men_slipper_black.png" },
        { title: "Men Brown Leather Slippers", sub: "Slipper", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 25, image: MI + "men_slipper_brown.png" },
        { title: "Men Blue Flip Flop Slippers", sub: "Slipper", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 12, image: MI + "men_slipper_blue.png" },
        { title: "Men Green Casual Slippers", sub: "Slipper", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 18, image: MI + "men_slipper_green.png" },
        { title: "Men Sport Slide Slippers", sub: "Slipper", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 30, image: MI + "men_slipper_sport.png" },
        { title: "Men Leather Strap Sandals", sub: "Slipper", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 35, image: MI + "men_slipper_leather.png" },
        { title: "Men Comfort Ortho Slippers", sub: "Slipper", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 28, image: MI + "men_slipper_comfort.png" },
        { title: "Men Pool Slide Slippers", sub: "Slipper", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 20, image: MI + "men_slipper_pool.png" },
        { title: "Men Indoor House Slippers", sub: "Slipper", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 15, image: MI + "men_slipper_house.png" },
        { title: "Men Ethnic Kolhapuri Chappal", sub: "Slipper", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 40, image: MI + "men_slipper_ethnic.png" },

        // â”€â”€ Extra Shirts (4) â†’ total 10 â”€â”€
        { title: "Men Pink Formal Shirt", sub: "Shirt", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 48, image: MI + "men_pink_shirt.png" },
        { title: "Men Check Pattern Shirt", sub: "Shirt", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 52, image: MI + "men_check_shirt.png" },
        { title: "Men Sky Blue Cotton Shirt", sub: "Shirt", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 45, image: MI + "men_sky_blue_shirt.png" },
        { title: "Men Grey Slim Formal Shirt", sub: "Shirt", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 50, image: MI + "men_grey_formal_shirt.png" },

        // â”€â”€ Extra Casual Pants (5) â†’ total 10 â”€â”€
        { title: "Men Khaki Cotton Pants", sub: "Casual Pants", cat: "Fashion", sz: () => pickSizes(CLOTHING, 5), price: 42, image: MI + "men_khaki_pants.png" },
        { title: "Men Navy Blue Chinos", sub: "Casual Pants", cat: "Fashion", sz: () => pickSizes(CLOTHING, 5), price: 48, image: MI + "men_navy_chinos.png" },
        { title: "Men Track Pants Striped", sub: "Casual Pants", cat: "Fashion", sz: () => pickSizes(CLOTHING, 5), price: 32, image: MI + "men_track_pants.png" },
        { title: "Men White Linen Pants", sub: "Casual Pants", cat: "Fashion", sz: () => pickSizes(CLOTHING, 5), price: 55, image: MI + "men_linen_pants.png" },
        { title: "Men Brown Corduroy Pants", sub: "Casual Pants", cat: "Fashion", sz: () => pickSizes(CLOTHING, 5), price: 52, image: MI + "men_corduroy_pants.png" },

        // â”€â”€ Extra Jackets (3) â†’ total 10 â”€â”€
        { title: "Men Brown Suede Jacket", sub: "Jacket", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 110, image: MI + "men_suede_jacket.png" },
        { title: "Men Sports Track Jacket", sub: "Jacket", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 55, image: MI + "men_track_jacket.png" },
        { title: "Men Quilted Padded Vest", sub: "Jacket", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 65, image: MI + "men_quilted_jacket.png" },

        // â”€â”€ Extra Shoes (6) â†’ total 10 â”€â”€
        { title: "Men Tan Brogue Shoes", sub: "Shoe", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 105, image: MI + "men_brogue_shoes.png" },
        { title: "Men Black Chelsea Boots", sub: "Shoe", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 120, image: MI + "men_chelsea_boots.png" },
        { title: "Men White Canvas Shoes", sub: "Shoe", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 45, image: MI + "men_canvas_shoes.png" },
        { title: "Men Driving Moccasins", sub: "Shoe", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 75, image: MI + "men_driving_shoes.png" },
        { title: "Men Brown Ankle Boots", sub: "Shoe", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 115, image: MI + "men_ankle_boots.png" },
        { title: "Men Outdoor Trekking Sandals", sub: "Shoe", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 55, image: MI + "men_sandals_outdoor.png" },

        // â”€â”€ Extra Sneakers (3) â†’ total 10 â”€â”€
        { title: "Men Chunky Dad Sneakers", sub: "Sneakers", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 85, image: MI + "men_chunky_sneakers.png" },
        { title: "Men Knit Running Sneakers", sub: "Sneakers", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 60, image: MI + "men_knit_sneakers.png" },
        { title: "Men Slip-On Casual Sneakers", sub: "Sneakers", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 45, image: MI + "men_slip_on_sneakers.png" },

        // â”€â”€ Extra Watches (6) â†’ total 10 â”€â”€
        { title: "Men Gold Dial Watch", sub: "Watch", cat: "Fashion", sz: () => "One Size", price: 180, image: MI + "men_gold_dial_watch.png" },
        { title: "Men Sports Digital Watch", sub: "Watch", cat: "Fashion", sz: () => "One Size", price: 55, image: getImgForProduct("Men Sports Digital Watch", "Watch", "Men") },
        { title: "Men Diver Watch Blue", sub: "Watch", cat: "Fashion", sz: () => "One Size", price: 200, image: MI + "men_diver_watch.png" },
        { title: "Men Minimalist Watch", sub: "Watch", cat: "Fashion", sz: () => "One Size", price: 85, image: MI + "men_minimalist_watch.png" },
        { title: "Men Skeleton Transparent Watch", sub: "Watch", cat: "Fashion", sz: () => "One Size", price: 250, image: getImgForProduct("Men Skeleton Transparent Watch", "Watch", "Men") },
        { title: "Men Rose Gold Watch", sub: "Watch", cat: "Fashion", sz: () => "One Size", price: 160, image: MI + "men_rose_gold_watch.png" },

        // â”€â”€ Extra Headphones (5) â†’ total 10 â”€â”€
        { title: "Men True Wireless Earbuds", sub: "Headphones", cat: "Fashion", sz: () => "One Size", price: 80, image: MI + "men_earbuds_tws.png" },
        { title: "Men Bluetooth Neckband", sub: "Headphones", cat: "Fashion", sz: () => "One Size", price: 45, image: MI + "men_neckband.png" },
        { title: "Men Bone Conduction Headphones", sub: "Headphones", cat: "Fashion", sz: () => "One Size", price: 120, image: MI + "men_bone_conduction.png" },
        { title: "Men Retro Vintage Headphones", sub: "Headphones", cat: "Fashion", sz: () => "One Size", price: 65, image: MI + "men_retro_headphones.png" },
        { title: "Men Sport Waterproof Earbuds", sub: "Headphones", cat: "Fashion", sz: () => "One Size", price: 55, image: MI + "men_sport_earbuds.png" },

        // â”€â”€ Extra Sunglasses (5) â†’ total 10 â”€â”€
        { title: "Men Shield Visor Sunglasses", sub: "Sunglasses", cat: "Fashion", sz: () => "One Size", price: 65, image: MI + "men_shield_sunglasses.png" },
        { title: "Men Rectangular Sunglasses", sub: "Sunglasses", cat: "Fashion", sz: () => "One Size", price: 42, image: MI + "men_rectangular_sunglasses.png" },
        { title: "Men Blue Mirror Sunglasses", sub: "Sunglasses", cat: "Fashion", sz: () => "One Size", price: 55, image: getImgForProduct("Men Blue Mirror Sunglasses", "Sunglasses", "Men") },
        { title: "Men Wooden Frame Sunglasses", sub: "Sunglasses", cat: "Fashion", sz: () => "One Size", price: 75, image: MI + "men_wooden_sunglasses.png" },
        { title: "Men Polarized Driving Sunglasses", sub: "Sunglasses", cat: "Fashion", sz: () => "One Size", price: 58, image: MI + "men_polarized_sunglasses.png" },

        // â”€â”€ Extra Perfume (6) â†’ total 10 â”€â”€
        { title: "Men Aqua Marine Perfume", sub: "Perfume", cat: "Fashion", sz: () => "One Size", price: 70, image: MI + "men_aqua_perfume.png" },
        { title: "Men Woody Musk Perfume", sub: "Perfume", cat: "Fashion", sz: () => "One Size", price: 88, image: MI + "men_woody_perfume.png" },
        { title: "Men Leather Scent Perfume", sub: "Perfume", cat: "Fashion", sz: () => "One Size", price: 110, image: MI + "men_leather_perfume.png" },
        { title: "Men Fresh Eau de Cologne", sub: "Perfume", cat: "Fashion", sz: () => "One Size", price: 55, image: MI + "men_fresh_edc.png" },
        { title: "Men Amber Oriental Perfume", sub: "Perfume", cat: "Fashion", sz: () => "One Size", price: 95, image: MI + "men_amber_perfume.png" },
        { title: "Men Vetiver Premium Perfume", sub: "Perfume", cat: "Fashion", sz: () => "One Size", price: 105, image: MI + "men_vetiver_perfume.png" },
    ];
    for (const p of menItems) {
        products.push({ title: p.title, description: `${p.title} - Premium quality menswear.`, price: p.price, image: p.image, category: p.cat, subcategory: p.sub, gender: "Men", size: p.sz(), stock: rs(), vendorId: pick(mv) });
    }
    console.log(`  ðŸ‘” Men: ${products.filter(p => p.gender === "Men").length}`);

    const WI = "/products/women/";
    const womenItemsList = [
        // Tops / Blouses (7 unique)
        { title: "Women Peplum Blouse Floral", sub: "Topwear", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 45, image: WI + "women_peplum_blouse.png" },
        { title: "Women Silk Satin Blouse", sub: "Topwear", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 55, image: WI + "women_silk_blouse.png" },
        { title: "Women Off-Shoulder Top", sub: "Topwear", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 35, image: WI + "women_offshoulder_top.png" },
        { title: "Women Crop Top Ribbed", sub: "Topwear", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 25, image: WI + "women_crop_top.png" },
        { title: "Women Wrap Top", sub: "Topwear", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 40, image: WI + "women_wrap_top.png" },
        { title: "Women Turtleneck Sweater", sub: "Topwear", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 50, image: WI + "women_turtleneck.png" },
        { title: "Women Printed Tunic", sub: "Topwear", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 35, image: WI + "women_tunic.png" },

        // Jeans (5 unique)
        { title: "Women Straight Fit Jeans", sub: "Jeans", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 65, image: WI + "women_straight_jeans.png" },
        { title: "Women Flared Jeans", sub: "Jeans", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 75, image: WI + "women_flared_jeans.png" },
        { title: "Women High Waist Jeans", sub: "Jeans", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 55, image: WI + "women_highwaist_jeans.png" },
        { title: "Women Skinny Denim Jeans", sub: "Jeans", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 60, image: WI + "women_skinny_jeans.png" },
        { title: "Women Mom Jeans", sub: "Jeans", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 70, image: WI + "women_mom_jeans.png" },

        // Footwear (6 unique)
        { title: "Women Strappy Heels Gold", sub: "Footwear", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 85, image: WI + "women_strappy_heels.png" },
        { title: "Women Ballet Flat Shoes", sub: "Footwear", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 45, image: WI + "women_ballet_flats.png" },
        { title: "Women Ankle Boots Suede", sub: "Footwear", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 110, image: WI + "women_ankle_boots.png" },
        { title: "Women Platform Sneakers", sub: "Footwear", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 75, image: WI + "women_platform_sneakers.png" },
        { title: "Women Block Heel Sandals", sub: "Footwear", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 60, image: WI + "women_block_heels.png" },
        { title: "Women Kitten Heels", sub: "Footwear", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 80, image: WI + "women_kitten_heels.png" },

        // Dresses (5 unique)
        { title: "Women Bodycon Dress Black", sub: "Dress", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 80, image: WI + "women_bodycon_dress.png" },
        { title: "Women A-Line Maxi Dress", sub: "Dress", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 95, image: WI + "women_maxi_dress.png" },
        { title: "Women Jumpsuit Floral", sub: "Dress", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 70, image: WI + "women_jumpsuit.png" },
        { title: "Women Shirt Dress", sub: "Dress", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 60, image: WI + "women_shirt_dress.png" },
        { title: "Women Evening Prom Dress", sub: "Dress", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 149, image: WI + "women_prom_dress.png" },

        // Ethnic Wear (5 unique)
        { title: "Women Silk Saree Banarasi", sub: "Ethnic Wear", cat: "Fashion", sz: () => pickSizes(CLOTHING, 5), price: 150, image: WI + "women_silk_saree.png" },
        { title: "Women Anarkali Suit Set", sub: "Ethnic Wear", cat: "Fashion", sz: () => pickSizes(CLOTHING, 5), price: 120, image: WI + "women_anarkali.png" },
        { title: "Women Lehenga Choli Bridal", sub: "Ethnic Wear", cat: "Fashion", sz: () => pickSizes(CLOTHING, 5), price: 299, image: WI + "women_lehenga.png" },
        { title: "Women Embroidered Salwar Kameez", sub: "Ethnic Wear", cat: "Fashion", sz: () => pickSizes(CLOTHING, 5), price: 89, image: WI + "women_salwar.png" },
        { title: "Women Sharara Set", sub: "Ethnic Wear", cat: "Fashion", sz: () => pickSizes(CLOTHING, 5), price: 110, image: WI + "women_sharara.png" },

        // Jackets (5 unique)
        { title: "Women Leather Jacket", sub: "Jacket", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 140, image: WI + "women_leather_jacket.png" },
        { title: "Women Denim Jacket", sub: "Jacket", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 85, image: WI + "women_denim_jacket.png" },
        { title: "Women Long Winter Coat", sub: "Jacket", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 160, image: WI + "women_winter_coat.png" },
        { title: "Women Formal Blazer", sub: "Jacket", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 110, image: WI + "women_blazer.png" },
        { title: "Women Puffer Jacket", sub: "Jacket", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 120, image: WI + "women_puffer_jacket.png" },

        // Accessories (7 unique)
        { title: "Women Pearl Stud Earrings", sub: "Accessories", cat: "Fashion", sz: () => "One Size", price: 25, image: WI + "women_pearl_earrings.png" },
        { title: "Women Statement Necklace Gold", sub: "Accessories", cat: "Fashion", sz: () => "One Size", price: 45, image: WI + "women_gold_necklace.png" },
        { title: "Women Crossbody Bag Leather", sub: "Accessories", cat: "Fashion", sz: () => "One Size", price: 95, image: WI + "women_crossbody_bag.png" },
        { title: "Women Tote Bag Canvas", sub: "Accessories", cat: "Fashion", sz: () => "One Size", price: 35, image: WI + "women_tote_bag.png" },
        { title: "Women Sunglasses Cat-Eye", sub: "Accessories", cat: "Fashion", sz: () => "One Size", price: 55, image: WI + "women_cateye_sunglasses.png" },
        { title: "Women Rose Gold Watch", sub: "Accessories", cat: "Fashion", sz: () => "One Size", price: 89, image: WI + "women_rosegold_watch.png" },
        { title: "Women Silk Scarf", sub: "Accessories", cat: "Fashion", sz: () => "One Size", price: 30, image: WI + "women_silk_scarf.png" },

        // --- EXTRA WOMEN ITEMS to have >10 per category and >30 clothing ---
        // Tops (10)
        { title: "Women Basic White T-Shirt", sub: "Topwear", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 18, image: WI + "women_white_tshirt.png" },
        { title: "Women High Neck Top", sub: "Topwear", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 25, image: WI + "women_high_neck_top.png" },
        { title: "Women Satin Cami Top", sub: "Topwear", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 22, image: WI + "women_satin_cami.png" },
        // Jeans (10)
        { title: "Women Ripped Mom Jeans", sub: "Jeans", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 65, image: WI + "women_ripped_mom_jeans.png" },
        { title: "Women Bootcut Jeans", sub: "Jeans", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 70, image: WI + "women_bootcut_jeans.png" },
        { title: "Women Vintage Wash Jeans", sub: "Jeans", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 68, image: WI + "women_vintage_jeans.png" },
        { title: "Women Cropped Jeans", sub: "Jeans", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 60, image: WI + "women_cropped_jeans.png" },
        { title: "Women Wide Leg Jeans", sub: "Jeans", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 75, image: WI + "women_wideleg_jeans.png" },
        // Footwear (10)
        { title: "Women White Canvas Sneakers", sub: "Footwear", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 45, image: WI + "women_white_sneakers.png" },
        { title: "Women Running Shoes", sub: "Footwear", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 65, image: WI + "women_running_shoes.png" },
        { title: "Women Comfort Sandals", sub: "Footwear", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 40, image: WI + "women_comfort_sandals.png" },
        { title: "Women Knee High Boots", sub: "Footwear", cat: "Fashion", sz: () => pickSizes(SHOES, 4), price: 125, image: WI + "women_knee_high_boots.png" },
        // Dresses (10)
        { title: "Women Summer Floral Dress", sub: "Dress", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 55, image: WI + "women_summer_dress.png" },
        { title: "Women Wrap Midi Dress", sub: "Dress", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 75, image: WI + "women_wrap_midi_dress.png" },
        { title: "Women Black Slip Dress", sub: "Dress", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 65, image: WI + "women_slip_dress.png" },
        { title: "Women Boho Tiered Dress", sub: "Dress", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 85, image: WI + "women_boho_dress.png" },
        { title: "Women Velvet Party Dress", sub: "Dress", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 95, image: WI + "women_velvet_dress.png" },
        // Ethnic (10)
        { title: "Women Cotton Kurta Set", sub: "Ethnic Wear", cat: "Fashion", sz: () => pickSizes(CLOTHING, 5), price: 65, image: WI + "women_kurta_set.png" },
        { title: "Women Georgette Saree", sub: "Ethnic Wear", cat: "Fashion", sz: () => pickSizes(CLOTHING, 5), price: 140, image: WI + "women_georgette_saree.png" },
        { title: "Women Chikankari Kurti", sub: "Ethnic Wear", cat: "Fashion", sz: () => pickSizes(CLOTHING, 5), price: 75, image: WI + "women_chikankari.png" },
        { title: "Women Embroidered Gown", sub: "Ethnic Wear", cat: "Fashion", sz: () => pickSizes(CLOTHING, 5), price: 199, image: WI + "women_gown.png" },
        { title: "Women Palazzos Set", sub: "Ethnic Wear", cat: "Fashion", sz: () => pickSizes(CLOTHING, 5), price: 85, image: WI + "women_palazzo_set.png" },
        // Jackets (10)
        { title: "Women Cropped Denim Jacket", sub: "Jacket", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 75, image: WI + "women_cropped_denim.png" },
        { title: "Women Faux Fur Coat", sub: "Jacket", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 180, image: WI + "women_faux_fur.png" },
        { title: "Women Lightweight Windbreaker", sub: "Jacket", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 65, image: WI + "women_windbreaker.png" },
        { title: "Women Trench Coat Beige", sub: "Jacket", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 145, image: WI + "women_trench_coat.png" },
        { title: "Women Suede Moto Jacket", sub: "Jacket", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 155, image: WI + "women_moto_jacket.png" },
        // Accessories (10)
        { title: "Women Hoop Earrings Gold", sub: "Accessories", cat: "Fashion", sz: () => "One Size", price: 20, image: WI + "women_hoop_earrings.png" },
        { title: "Women Leather Belt", sub: "Accessories", cat: "Fashion", sz: () => "One Size", price: 35, image: WI + "women_leather_belt.png" },
        { title: "Women Hair Scrunchies Set", sub: "Accessories", cat: "Fashion", sz: () => "One Size", price: 15, image: WI + "women_scrunchies.png" },

        // Extra Bags (8) to reach 10
        { title: "Women Hobo Bag Leather", sub: "Accessories", cat: "Fashion", sz: () => "One Size", price: 65, image: WI + "women_hobo_bag.png" },
        { title: "Women Evening Clutch Bag", sub: "Accessories", cat: "Fashion", sz: () => "One Size", price: 45, image: WI + "women_clutch_bag.png" },
        { title: "Women Mini Backpack Purse", sub: "Accessories", cat: "Fashion", sz: () => "One Size", price: 55, image: WI + "women_backpack_purse.png" },
        { title: "Women Leather Satchel Bag", sub: "Accessories", cat: "Fashion", sz: () => "One Size", price: 85, image: WI + "women_satchel_bag.png" },
        { title: "Women Summer Straw Bag", sub: "Accessories", cat: "Fashion", sz: () => "One Size", price: 35, image: WI + "women_straw_bag.png" },
        { title: "Women Drawstring Bucket Bag", sub: "Accessories", cat: "Fashion", sz: () => "One Size", price: 75, image: WI + "women_bucket_bag.png" },
        { title: "Women Quilted Chain Bag", sub: "Accessories", cat: "Fashion", sz: () => "One Size", price: 115, image: WI + "women_quilted_bag.png" },
        { title: "Women Messenger Crossbody Bag", sub: "Accessories", cat: "Fashion", sz: () => "One Size", price: 95, image: WI + "women_messenger_bag.png" },

        // Extra Sunglasses (9) to reach 10
        { title: "Women Rose Gold Aviator Sunglasses", sub: "Accessories", cat: "Fashion", sz: () => "One Size", price: 65, image: WI + "women_aviator_sunglasses.png" },
        { title: "Women Oversized Square Sunglasses", sub: "Accessories", cat: "Fashion", sz: () => "One Size", price: 85, image: WI + "women_oversized_sunglasses.png" },
        { title: "Women Retro Round Sunglasses", sub: "Accessories", cat: "Fashion", sz: () => "One Size", price: 45, image: WI + "women_round_sunglasses.png" },
        { title: "Women Classic Wayfarer Sunglasses", sub: "Accessories", cat: "Fashion", sz: () => "One Size", price: 55, image: WI + "women_wayfarer_sunglasses.png" },
        { title: "Women Pink Heart Sunglasses", sub: "Accessories", cat: "Fashion", sz: () => "One Size", price: 35, image: WI + "women_heart_sunglasses.png" },
        { title: "Women Shield Visor Sunglasses", sub: "Accessories", cat: "Fashion", sz: () => "One Size", price: 75, image: WI + "women_shield_sunglasses.png" },
        { title: "Women Clubmaster Sunglasses", sub: "Accessories", cat: "Fashion", sz: () => "One Size", price: 60, image: WI + "women_clubmaster_sunglasses.png" },
        { title: "Women Rimless Tinted Sunglasses", sub: "Accessories", cat: "Fashion", sz: () => "One Size", price: 95, image: WI + "women_rimless_sunglasses.png" },
        { title: "Women Geometric Polygon Sunglasses", sub: "Accessories", cat: "Fashion", sz: () => "One Size", price: 80, image: WI + "women_polygon_sunglasses.png" },

        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        // â•â•  NEW: More Women's Clothing Items   â•â•
        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

        // â”€â”€ Extra Topwear (5 new) â”€â”€
        { title: "Women Striped Button-Down Shirt", sub: "Topwear", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 42, image: WI + "women_striped_shirt.png" },
        { title: "Women Pink Oversized Hoodie", sub: "Topwear", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 48, image: WI + "women_pink_hoodie.png" },
        { title: "Women Chunky Knit Cardigan", sub: "Topwear", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 55, image: getImgForProduct("Women Chunky Knit Cardigan", "Topwear", "Women") },
        { title: "Women Henley Neck Top", sub: "Topwear", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 28, image: getImgForProduct("Women Henley Neck Top", "Topwear", "Women") },
        { title: "Women Oversized Graphic Tee", sub: "Topwear", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 25, image: getImgForProduct("Women Oversized Graphic Tee", "Topwear", "Women") },

        // â”€â”€ Skirts (5 new â€” new subcategory!) â”€â”€
        { title: "Women Floral Print Midi Skirt", sub: "Skirt", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 45, image: WI + "women_floral_skirt.png" },
        { title: "Women Black Pleated Midi Skirt", sub: "Skirt", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 40, image: getImgForProduct("Women Black Pleated Midi Skirt", "Skirt", "Women") },
        { title: "Women Denim Mini Skirt", sub: "Skirt", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 35, image: getImgForProduct("Women Denim Mini Skirt", "Skirt", "Women") },
        { title: "Women Wrap Around Skirt", sub: "Skirt", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 50, image: getImgForProduct("Women Wrap Around Skirt", "Skirt", "Women") },
        { title: "Women Pencil Skirt Black", sub: "Skirt", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 38, image: getImgForProduct("Women Pencil Skirt Black", "Skirt", "Women") },

        // â”€â”€ Trousers / Pants (5 new â€” new subcategory!) â”€â”€
        { title: "Women Navy Palazzo Pants", sub: "Trousers", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 42, image: WI + "women_palazzo_pants.png" },
        { title: "Women Cargo Pants Olive", sub: "Trousers", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 55, image: getImgForProduct("Women Cargo Pants Olive", "Trousers", "Women") },
        { title: "Women Cigarette Pants Black", sub: "Trousers", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 48, image: getImgForProduct("Women Cigarette Pants Black", "Trousers", "Women") },
        { title: "Women Culottes Beige", sub: "Trousers", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 38, image: getImgForProduct("Women Culottes Beige", "Trousers", "Women") },
        { title: "Women Paper Bag Waist Pants", sub: "Trousers", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 45, image: getImgForProduct("Women Paper Bag Waist Pants", "Trousers", "Women") },

        // â”€â”€ Co-ord Sets (3 new â€” new subcategory!) â”€â”€
        { title: "Women Beige Co-ord Set", sub: "Co-ord Set", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 65, image: WI + "women_coord_set.png" },
        { title: "Women Printed Co-ord Set", sub: "Co-ord Set", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 55, image: getImgForProduct("Women Printed Co-ord Set", "Co-ord Set", "Women") },
        { title: "Women Ribbed Knit Co-ord Set", sub: "Co-ord Set", cat: "Fashion", sz: () => pickSizes(CLOTHING, 4), price: 60, image: getImgForProduct("Women Ribbed Knit Co-ord Set", "Co-ord Set", "Women") },

        // â”€â”€ Extra Dresses (2 new) â”€â”€
        { title: "Women Olive Linen Shirt Dress", sub: "Dress", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 70, image: WI + "women_linen_dress.png" },
        { title: "Women Black Ruched Mini Dress", sub: "Dress", cat: "Fashion", sz: () => pickSizes(CLOTHING, 3), price: 68, image: WI + "women_ruched_dress.png" },
    ];

    for (const p of womenItemsList) {
        products.push({ title: p.title, description: `${p.title} - Elegant women's fashion.`, price: p.price, image: p.image, category: p.cat, subcategory: p.sub, gender: "Women", size: p.sz(), stock: rs(), vendorId: pick(wv) });
    }
    console.log(`  ðŸ‘— Women: ${products.filter(p => p.gender === "Women").length}`);

    // ===== KIDS ===== (Local Banana AI generated images in /products/kids/)
    const KI = "/products/kids/";
    const kidsItemsList = [
        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        // â•â•  BOYS TOPWEAR (20 items)         â•â•
        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        { title: "Boys Graphic T-Shirt Blue", sub: "Boys Topwear", sz: () => pickSizes(KIDS_AGE, 6), price: 12, image: KI + "boys_graphic_tee_blue.png" },
        { title: "Boys Polo Shirt White", sub: "Boys Topwear", sz: () => pickSizes(KIDS_AGE, 6), price: 15, image: KI + "boys_polo_white.png" },
        { title: "Boys Formal Shirt Light Blue", sub: "Boys Topwear", sz: () => pickSizes(KIDS_AGE, 6), price: 18, image: KI + "boys_formal_shirt_lightblue.png" },
        { title: "Boys Hoodie Pullover Red", sub: "Boys Topwear", sz: () => pickSizes(KIDS_AGE, 6), price: 22, image: KI + "boys_hoodie_red.png" },
        { title: "Boys Superhero T-Shirt", sub: "Boys Topwear", sz: () => pickSizes(KIDS_AGE, 6), price: 14, image: KI + "boys_superhero_tee.png" },
        { title: "Boys Striped T-Shirt Navy", sub: "Boys Topwear", sz: () => pickSizes(KIDS_AGE, 6), price: 11, image: KI + "boys_striped_tee_navy.png" },
        { title: "Boys Full Sleeve T-Shirt Grey", sub: "Boys Topwear", sz: () => pickSizes(KIDS_AGE, 6), price: 16, image: KI + "boys_fullsleeve_grey.png" },
        { title: "Boys Casual Check Shirt", sub: "Boys Topwear", sz: () => pickSizes(KIDS_AGE, 6), price: 20, image: KI + "boys_check_shirt.png" },
        { title: "Boys Tank Top Summer", sub: "Boys Topwear", sz: () => pickSizes(KIDS_AGE, 6), price: 8, image: KI + "boys_tank_top.png" },
        { title: "Boys Pullover Sweater Green", sub: "Boys Topwear", sz: () => pickSizes(KIDS_AGE, 6), price: 25, image: KI + "boys_sweater_green.png" },
        { title: "Boys Zip-Up Hoodie Black", sub: "Boys Topwear", sz: () => pickSizes(KIDS_AGE, 6), price: 28, image: KI + "boys_zipup_hoodie_black.png" },
        { title: "Boys Sleeveless Muscle Tee", sub: "Boys Topwear", sz: () => pickSizes(KIDS_AGE, 6), price: 10, image: KI + "boys_muscle_tee.png" },
        { title: "Boys Henley Neck T-Shirt", sub: "Boys Topwear", sz: () => pickSizes(KIDS_AGE, 6), price: 13, image: KI + "boys_henley_tee.png" },
        { title: "Boys Raglan Baseball T-Shirt", sub: "Boys Topwear", sz: () => pickSizes(KIDS_AGE, 6), price: 14, image: KI + "boys_raglan_tee.png" },
        { title: "Boys Cartoon Dino T-Shirt", sub: "Boys Topwear", sz: () => pickSizes(KIDS_AGE, 6), price: 12, image: KI + "boys_cartoon_tee.png" },
        { title: "Boys Mandarin Collar Shirt", sub: "Boys Topwear", sz: () => pickSizes(KIDS_AGE, 6), price: 20, image: KI + "boys_mandarin_shirt.png" },
        { title: "Boys Colorblock T-Shirt", sub: "Boys Topwear", sz: () => pickSizes(KIDS_AGE, 6), price: 15, image: KI + "boys_colorblock_tee.png" },
        { title: "Boys Turtleneck Top Navy", sub: "Boys Topwear", sz: () => pickSizes(KIDS_AGE, 6), price: 18, image: KI + "boys_turtleneck.png" },
        { title: "Boys Tropical Printed Shirt", sub: "Boys Topwear", sz: () => pickSizes(KIDS_AGE, 6), price: 16, image: KI + "boys_printed_shirt_tropical.png" },
        { title: "Boys Sports Jersey No. 10", sub: "Boys Topwear", sz: () => pickSizes(KIDS_AGE, 6), price: 20, image: KI + "boys_sports_jersey.png" },

        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        // â•â•  BOYS BOTTOMWEAR (20 items)      â•â•
        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        { title: "Boys Cargo Shorts Khaki", sub: "Boys Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 15, image: KI + "boys_cargo_shorts_khaki.png" },
        { title: "Boys Jogger Pants Navy", sub: "Boys Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 18, image: KI + "boys_jogger_navy.png" },
        { title: "Boys Cotton Shorts Blue", sub: "Boys Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 12, image: KI + "boys_cotton_shorts_blue.png" },
        { title: "Boys Denim Jeans Medium Wash", sub: "Boys Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 25, image: KI + "boys_denim_jeans.png" },
        { title: "Boys Chino Pants Beige", sub: "Boys Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 20, image: KI + "boys_chino_beige.png" },
        { title: "Boys Track Pants Striped", sub: "Boys Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 16, image: KI + "boys_track_pants_striped.png" },
        { title: "Boys Swim Trunks Tropical", sub: "Boys Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 14, image: KI + "boys_swim_trunks.png" },
        { title: "Boys Ripped Jeans Dark", sub: "Boys Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 22, image: KI + "boys_ripped_jeans.png" },
        { title: "Boys Formal Trousers Black", sub: "Boys Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 24, image: KI + "boys_formal_trousers.png" },
        { title: "Boys Bermuda Shorts Olive", sub: "Boys Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 13, image: KI + "boys_bermuda_olive.png" },
        { title: "Boys Elastic Waist Jeans", sub: "Boys Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 20, image: KI + "boys_elastic_jeans.png" },
        { title: "Boys Corduroy Pants Brown", sub: "Boys Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 22, image: KI + "boys_corduroy_pants.png" },
        { title: "Boys Athletic Shorts Black", sub: "Boys Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 14, image: KI + "boys_athletic_shorts.png" },
        { title: "Boys Camo Cargo Pants", sub: "Boys Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 24, image: KI + "boys_camo_pants.png" },
        { title: "Boys Linen Shorts White", sub: "Boys Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 16, image: KI + "boys_linen_shorts.png" },
        { title: "Boys Denim Shorts Blue", sub: "Boys Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 18, image: KI + "boys_denim_shorts.png" },
        { title: "Boys Pajama Pants Flannel", sub: "Boys Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 15, image: KI + "boys_pajama_pants.png" },
        { title: "Boys Drawstring Pants Grey", sub: "Boys Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 18, image: KI + "boys_drawstring_pants.png" },
        { title: "Boys School Trousers Grey", sub: "Boys Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 20, image: KI + "boys_school_trousers.png" },
        { title: "Boys Fleece Sweatpants", sub: "Boys Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 22, image: KI + "boys_sweatpants.png" },

        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        // â•â•  BOYS OUTERWEAR (20 items)       â•â•
        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        { title: "Boys Denim Jacket Blue", sub: "Boys Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 30, image: KI + "boys_denim_jacket.png" },
        { title: "Boys Puffer Jacket Red", sub: "Boys Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 40, image: KI + "boys_puffer_red.png" },
        { title: "Boys Windbreaker Green", sub: "Boys Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 28, image: KI + "boys_windbreaker_green.png" },
        { title: "Boys Fleece Jacket Grey", sub: "Boys Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 25, image: KI + "boys_fleece_grey.png" },
        { title: "Boys Bomber Jacket Navy", sub: "Boys Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 35, image: KI + "boys_bomber_navy.png" },
        { title: "Boys Raincoat Yellow", sub: "Boys Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 22, image: KI + "boys_raincoat_yellow.png" },
        { title: "Boys Winter Parka Black", sub: "Boys Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 50, image: KI + "boys_winter_parka.png" },
        { title: "Boys Sherpa Pullover Brown", sub: "Boys Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 32, image: KI + "boys_sherpa_brown.png" },
        { title: "Boys Letterman Jacket", sub: "Boys Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 38, image: KI + "boys_letterman.png" },
        { title: "Boys Puffer Vest Orange", sub: "Boys Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 26, image: KI + "boys_puffer_vest.png" },
        { title: "Boys Quilted Jacket Navy", sub: "Boys Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 35, image: KI + "boys_quilted_jacket.png" },
        { title: "Boys Camo Hoodie Jacket", sub: "Boys Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 30, image: KI + "boys_hoodie_jacket_camo.png" },
        { title: "Boys Faux Leather Jacket", sub: "Boys Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 42, image: KI + "boys_leather_jacket.png" },
        { title: "Boys Sports Track Jacket", sub: "Boys Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 28, image: KI + "boys_track_jacket.png" },
        { title: "Boys Knitted Poncho", sub: "Boys Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 25, image: KI + "boys_poncho.png" },
        { title: "Boys Softshell Outdoor Jacket", sub: "Boys Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 38, image: KI + "boys_softshell.png" },
        { title: "Boys Navy Blazer Formal", sub: "Boys Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 45, image: KI + "boys_blazer_navy.png" },
        { title: "Boys Blue Rain Jacket", sub: "Boys Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 28, image: KI + "boys_rain_jacket_blue.png" },
        { title: "Boys Fleece Vest", sub: "Boys Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 22, image: KI + "boys_fleece_vest.png" },
        { title: "Boys Snow Ski Jacket", sub: "Boys Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 55, image: KI + "boys_snow_jacket.png" },

        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        // â•â•  BOYS ETHNIC (20 items)          â•â•
        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        { title: "Boys Kurta Pajama White Gold", sub: "Boys Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 25, image: KI + "boys_kurta_white_gold.png" },
        { title: "Boys Sherwani Set Royal Blue", sub: "Boys Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 45, image: KI + "boys_sherwani_blue.png" },
        { title: "Boys Dhoti Kurta Set Cream", sub: "Boys Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 30, image: KI + "boys_dhoti_kurta.png" },
        { title: "Boys Pathani Suit Olive", sub: "Boys Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 28, image: KI + "boys_pathani_olive.png" },
        { title: "Boys Nehru Jacket Set Maroon", sub: "Boys Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 35, image: KI + "boys_nehru_jacket.png" },
        { title: "Boys Silk Kurta Gold", sub: "Boys Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 40, image: KI + "boys_silk_kurta_gold.png" },
        { title: "Boys Indo-Western Suit", sub: "Boys Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 48, image: KI + "boys_indo_western.png" },
        { title: "Boys Jodhpuri Suit Navy", sub: "Boys Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 50, image: KI + "boys_jodhpuri_navy.png" },
        { title: "Boys Festive Waistcoat Set", sub: "Boys Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 32, image: KI + "boys_waistcoat_set.png" },
        { title: "Boys Embroidered Kurta Peach", sub: "Boys Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 35, image: KI + "boys_embroidered_peach.png" },
        { title: "Boys Silk Kurta Maroon", sub: "Boys Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 38, image: KI + "boys_kurta_maroon.png" },
        { title: "Boys Angrakha Yellow Kurta", sub: "Boys Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 30, image: KI + "boys_angrakha_yellow.png" },
        { title: "Boys Bandi Jacket Set", sub: "Boys Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 32, image: KI + "boys_bandi_set.png" },
        { title: "Boys Cotton Kurta Blue", sub: "Boys Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 22, image: KI + "boys_cotton_kurta_blue.png" },
        { title: "Boys Kurta Churidar Green", sub: "Boys Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 35, image: KI + "boys_kurta_churidar.png" },
        { title: "Boys Kurta Nehru Jacket Combo", sub: "Boys Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 42, image: KI + "boys_kurta_jacket_combo.png" },
        { title: "Boys Mundu Dhoti Set White", sub: "Boys Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 28, image: KI + "boys_mundu_set.png" },
        { title: "Boys Achkan Sherwani Cream", sub: "Boys Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 55, image: KI + "boys_achkan_cream.png" },
        { title: "Boys Mirror Work Kurta", sub: "Boys Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 40, image: KI + "boys_mirror_work_kurta.png" },
        { title: "Boys Festive Red Kurta Set", sub: "Boys Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 38, image: KI + "boys_festive_set_red.png" },

        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        // â•â•  GIRLS DRESSES & TOPS (20 items) â•â•
        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        { title: "Girls Floral Frock Pink", sub: "Girls Dresses & Tops", sz: () => pickSizes(KIDS_AGE, 6), price: 18, image: KI + "girls_floral_frock.png" },
        { title: "Girls Party Dress Red Velvet", sub: "Girls Dresses & Tops", sz: () => pickSizes(KIDS_AGE, 6), price: 35, image: KI + "girls_party_dress_red.png" },
        { title: "Girls Maxi Dress Floral", sub: "Girls Dresses & Tops", sz: () => pickSizes(KIDS_AGE, 6), price: 28, image: KI + "girls_maxi_dress.png" },
        { title: "Girls Printed Kurti Yellow", sub: "Girls Dresses & Tops", sz: () => pickSizes(KIDS_AGE, 6), price: 15, image: KI + "girls_kurti_yellow.png" },
        { title: "Girls Jumpsuit Denim", sub: "Girls Dresses & Tops", sz: () => pickSizes(KIDS_AGE, 6), price: 25, image: KI + "girls_jumpsuit_denim.png" },
        { title: "Girls Peplum Top White", sub: "Girls Dresses & Tops", sz: () => pickSizes(KIDS_AGE, 6), price: 14, image: KI + "girls_peplum_white.png" },
        { title: "Girls Tulle Tutu Dress Lavender", sub: "Girls Dresses & Tops", sz: () => pickSizes(KIDS_AGE, 6), price: 30, image: KI + "girls_tutu_lavender.png" },
        { title: "Girls Ruffle Sleeve Top Peach", sub: "Girls Dresses & Tops", sz: () => pickSizes(KIDS_AGE, 6), price: 12, image: KI + "girls_ruffle_top.png" },
        { title: "Girls Off-Shoulder Top Striped", sub: "Girls Dresses & Tops", sz: () => pickSizes(KIDS_AGE, 6), price: 16, image: KI + "girls_offshoulder_striped.png" },
        { title: "Girls Summer Sundress Blue", sub: "Girls Dresses & Tops", sz: () => pickSizes(KIDS_AGE, 6), price: 20, image: KI + "girls_sundress_blue.png" },
        { title: "Girls Embellished Ball Gown", sub: "Girls Dresses & Tops", sz: () => pickSizes(KIDS_AGE, 6), price: 40, image: KI + "girls_ball_gown.png" },
        { title: "Girls Romper Polka Dot", sub: "Girls Dresses & Tops", sz: () => pickSizes(KIDS_AGE, 6), price: 16, image: KI + "girls_romper_polkadot.png" },
        { title: "Girls Boho Peasant Top", sub: "Girls Dresses & Tops", sz: () => pickSizes(KIDS_AGE, 6), price: 18, image: KI + "girls_peasant_top.png" },
        { title: "Girls Denim Dungaree Dress", sub: "Girls Dresses & Tops", sz: () => pickSizes(KIDS_AGE, 6), price: 28, image: KI + "girls_dungaree_dress.png" },
        { title: "Girls Plaid Pinafore Dress", sub: "Girls Dresses & Tops", sz: () => pickSizes(KIDS_AGE, 6), price: 22, image: KI + "girls_pinafore_plaid.png" },
        { title: "Girls Crop Top & Skirt Set", sub: "Girls Dresses & Tops", sz: () => pickSizes(KIDS_AGE, 6), price: 24, image: KI + "girls_crop_top_set.png" },
        { title: "Girls Tiered Ruffle Dress", sub: "Girls Dresses & Tops", sz: () => pickSizes(KIDS_AGE, 6), price: 26, image: KI + "girls_tiered_dress.png" },
        { title: "Girls Smocked Bodice Dress", sub: "Girls Dresses & Tops", sz: () => pickSizes(KIDS_AGE, 6), price: 25, image: KI + "girls_smocked_dress.png" },
        { title: "Girls Printed Tunic Top", sub: "Girls Dresses & Tops", sz: () => pickSizes(KIDS_AGE, 6), price: 18, image: KI + "girls_tunic_printed.png" },
        { title: "Girls Gold Sequin Party Dress", sub: "Girls Dresses & Tops", sz: () => pickSizes(KIDS_AGE, 6), price: 38, image: KI + "girls_sequin_dress.png" },

        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        // â•â•  GIRLS BOTTOMWEAR (20 items)     â•â•
        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        { title: "Girls Blue Denim Dungaree", sub: "Girls Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 25, image: KI + "girls_dungaree_blue.png" },
        { title: "Girls Cotton Leggings Black", sub: "Girls Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 10, image: KI + "girls_leggings_black.png" },
        { title: "Girls Floral Shorts Set", sub: "Girls Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 18, image: KI + "girls_shorts_floral.png" },
        { title: "Girls Palazzo Pants Pink", sub: "Girls Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 16, image: KI + "girls_palazzo_pink.png" },
        { title: "Girls Flared Jeans Light Blue", sub: "Girls Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 22, image: KI + "girls_flared_jeans.png" },
        { title: "Girls Rainbow Printed Skirt", sub: "Girls Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 14, image: KI + "girls_skirt_rainbow.png" },
        { title: "Girls Denim Mini Skirt", sub: "Girls Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 18, image: KI + "girls_denim_skirt.png" },
        { title: "Girls Track Pants Purple", sub: "Girls Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 15, image: KI + "girls_track_pants.png" },
        { title: "Girls Capri Pants White", sub: "Girls Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 13, image: KI + "girls_capri_white.png" },
        { title: "Girls Cargo Pants Olive", sub: "Girls Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 20, image: KI + "girls_cargo_olive.png" },
        { title: "Girls Culottes Mustard", sub: "Girls Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 16, image: KI + "girls_culottes.png" },
        { title: "Girls Sequin Leggings Gold", sub: "Girls Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 20, image: KI + "girls_sequin_leggings.png" },
        { title: "Girls Jogger Pants Pink", sub: "Girls Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 18, image: KI + "girls_joggers_pink.png" },
        { title: "Girls Jeggings Dark Blue", sub: "Girls Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 20, image: KI + "girls_jeggings.png" },
        { title: "Girls Tutu Skirt Pink", sub: "Girls Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 22, image: KI + "girls_tutu_skirt.png" },
        { title: "Girls Paperbag Waist Shorts", sub: "Girls Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 16, image: KI + "girls_paperbag_shorts.png" },
        { title: "Girls Striped Leggings Multi", sub: "Girls Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 12, image: KI + "girls_striped_leggings.png" },
        { title: "Girls Corduroy Skirt Rust", sub: "Girls Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 18, image: KI + "girls_corduroy_skirt.png" },
        { title: "Girls High Waist Skinny Jeans", sub: "Girls Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 24, image: KI + "girls_highwaist_jeans.png" },
        { title: "Girls Cotton Shorts Pack", sub: "Girls Bottomwear", sz: () => pickSizes(KIDS_AGE, 6), price: 15, image: KI + "girls_cotton_shorts.png" },

        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        // â•â•  GIRLS OUTERWEAR (20 items)      â•â•
        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        { title: "Girls Knit Cardigan Pink", sub: "Girls Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 20, image: KI + "girls_cardigan_pink.png" },
        { title: "Girls Hoodie Lavender", sub: "Girls Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 22, image: KI + "girls_hoodie_lavender.png" },
        { title: "Girls Denim Jacket Light Wash", sub: "Girls Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 30, image: KI + "girls_denim_jacket.png" },
        { title: "Girls Puffer Coat Rose", sub: "Girls Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 40, image: KI + "girls_puffer_rose.png" },
        { title: "Girls Windbreaker Mint", sub: "Girls Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 25, image: KI + "girls_windbreaker_mint.png" },
        { title: "Girls Trench Coat Beige", sub: "Girls Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 38, image: KI + "girls_trench_beige.png" },
        { title: "Girls Faux Fur Jacket White", sub: "Girls Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 42, image: KI + "girls_faux_fur_white.png" },
        { title: "Girls Fleece Pullover Coral", sub: "Girls Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 20, image: KI + "girls_fleece_coral.png" },
        { title: "Girls Winter Parka Navy", sub: "Girls Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 48, image: KI + "girls_parka_navy.png" },
        { title: "Girls Bomber Jacket Blush", sub: "Girls Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 32, image: KI + "girls_bomber_blush.png" },
        { title: "Girls Quilted Vest Pink", sub: "Girls Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 26, image: KI + "girls_quilted_vest.png" },
        { title: "Girls Knitted Poncho", sub: "Girls Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 28, image: KI + "girls_poncho_knit.png" },
        { title: "Girls Teddy Bear Coat", sub: "Girls Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 45, image: KI + "girls_teddy_coat.png" },
        { title: "Girls Polka Dot Raincoat", sub: "Girls Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 25, image: KI + "girls_raincoat_polka.png" },
        { title: "Girls Ski Snow Jacket Pink", sub: "Girls Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 52, image: KI + "girls_ski_jacket.png" },
        { title: "Girls Check Blazer", sub: "Girls Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 35, image: KI + "girls_blazer_check.png" },
        { title: "Girls Cape Coat Red", sub: "Girls Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 40, image: KI + "girls_cape_coat.png" },
        { title: "Girls Track Jacket Purple", sub: "Girls Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 28, image: KI + "girls_track_jacket.png" },
        { title: "Girls White Knit Shrug", sub: "Girls Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 18, image: KI + "girls_shrug_white.png" },
        { title: "Girls Lilac Puffer Jacket", sub: "Girls Outerwear", sz: () => pickSizes(KIDS_AGE, 5), price: 38, image: KI + "girls_puffer_lilac.png" },

        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        // â•â•  GIRLS ETHNIC (20 items)         â•â•
        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        { title: "Girls Lehenga Choli Pink", sub: "Girls Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 40, image: KI + "girls_lehenga_pink.png" },
        { title: "Girls Anarkali Suit Turquoise", sub: "Girls Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 35, image: KI + "girls_anarkali_turquoise.png" },
        { title: "Girls Salwar Kameez Floral", sub: "Girls Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 28, image: KI + "girls_salwar_floral.png" },
        { title: "Girls Sharara Set Purple", sub: "Girls Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 38, image: KI + "girls_sharara_purple.png" },
        { title: "Girls Ghagra Mirror Work", sub: "Girls Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 45, image: KI + "girls_ghagra_mirror.png" },
        { title: "Girls Pattu Pavadai Silk", sub: "Girls Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 42, image: KI + "girls_pattu_pavadai.png" },
        { title: "Girls Kurti Palazzo Set", sub: "Girls Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 22, image: KI + "girls_kurti_palazzo.png" },
        { title: "Girls Chanderi Dress Gold", sub: "Girls Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 48, image: KI + "girls_chanderi_gold.png" },
        { title: "Girls Langa Voni Set", sub: "Girls Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 36, image: KI + "girls_langa_voni.png" },
        { title: "Girls Embroidered Ethnic Frock", sub: "Girls Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 30, image: KI + "girls_ethnic_frock.png" },
        { title: "Girls Red Silk Anarkali", sub: "Girls Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 42, image: KI + "girls_anarkali_red.png" },
        { title: "Girls Blue Sequin Lehenga", sub: "Girls Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 50, image: KI + "girls_lehenga_blue.png" },
        { title: "Girls Pink Kurta Pajama Set", sub: "Girls Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 25, image: KI + "girls_kurta_set_pink.png" },
        { title: "Girls Rajasthani Ghagra Choli", sub: "Girls Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 45, image: KI + "girls_ghagra_rajasthani.png" },
        { title: "Girls Churidar Suit Set", sub: "Girls Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 32, image: KI + "girls_churidar_set.png" },
        { title: "Girls Silk Traditional Frock", sub: "Girls Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 38, image: KI + "girls_silk_frock.png" },
        { title: "Girls Green Anarkali Gown", sub: "Girls Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 40, image: KI + "girls_anarkali_green.png" },
        { title: "Girls Half Saree Dhavani Set", sub: "Girls Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 44, image: KI + "girls_dhavani_set.png" },
        { title: "Girls Peach Party Gown", sub: "Girls Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 48, image: KI + "girls_gown_peach.png" },
        { title: "Girls Yellow Sharara Suit", sub: "Girls Ethnic", sz: () => pickSizes(KIDS_AGE, 5), price: 36, image: KI + "girls_sharara_yellow.png" },

        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        // â•â•  BABY CLOTHING 0-2Y (20 items)   â•â•
        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        { title: "Baby Romper Cotton Pastel", sub: "Baby Clothing (0-2Y)", sz: () => "0-2Y", price: 8, image: KI + "baby_romper_pastel.png" },
        { title: "Baby Onesie Pack of 5", sub: "Baby Clothing (0-2Y)", sz: () => "0-2Y", price: 18, image: KI + "baby_onesie_pack.png" },
        { title: "Baby Full Sleeve Bodysuit", sub: "Baby Clothing (0-2Y)", sz: () => "0-2Y", price: 10, image: KI + "baby_bodysuit_white.png" },
        { title: "Baby Winter Jacket Pink", sub: "Baby Clothing (0-2Y)", sz: () => "0-2Y", price: 22, image: KI + "baby_winter_jacket.png" },
        { title: "Baby Sleepsuit Front Zip", sub: "Baby Clothing (0-2Y)", sz: () => "0-2Y", price: 12, image: KI + "baby_sleepsuit.png" },
        { title: "Baby Bodysuit with Mittens", sub: "Baby Clothing (0-2Y)", sz: () => "0-2Y", price: 14, image: KI + "baby_mitten_bodysuit.png" },
        { title: "Baby Organic Cotton Top", sub: "Baby Clothing (0-2Y)", sz: () => "0-2Y", price: 11, image: KI + "baby_organic_top.png" },
        { title: "Baby Fleece Footie Blue", sub: "Baby Clothing (0-2Y)", sz: () => "0-2Y", price: 15, image: KI + "baby_fleece_footie.png" },
        { title: "Baby Summer Outfit Set", sub: "Baby Clothing (0-2Y)", sz: () => "0-2Y", price: 16, image: KI + "baby_summer_set.png" },
        { title: "Baby Bear Jumpsuit", sub: "Baby Clothing (0-2Y)", sz: () => "0-2Y", price: 13, image: KI + "baby_bear_jumpsuit.png" },
        { title: "Baby Girl Ruffle Romper", sub: "Baby Clothing (0-2Y)", sz: () => "0-2Y", price: 12, image: KI + "baby_ruffle_romper.png" },
        { title: "Baby Knitted Sweater Cream", sub: "Baby Clothing (0-2Y)", sz: () => "0-2Y", price: 20, image: KI + "baby_knitted_sweater.png" },
        { title: "Baby Denim Dungaree", sub: "Baby Clothing (0-2Y)", sz: () => "0-2Y", price: 18, image: KI + "baby_dungaree.png" },
        { title: "Baby Bunting Bag Swaddle", sub: "Baby Clothing (0-2Y)", sz: () => "0-2Y", price: 22, image: KI + "baby_bunting_bag.png" },
        { title: "Baby Animal Print Set", sub: "Baby Clothing (0-2Y)", sz: () => "0-2Y", price: 16, image: KI + "baby_animal_set.png" },
        { title: "Baby Girl Tutu Dress Set", sub: "Baby Clothing (0-2Y)", sz: () => "0-2Y", price: 15, image: KI + "baby_tutu_dress.png" },
        { title: "Baby Footed Pants Pack", sub: "Baby Clothing (0-2Y)", sz: () => "0-2Y", price: 14, image: KI + "baby_footed_pants.png" },
        { title: "Baby Hooded Towel Bath Set", sub: "Baby Clothing (0-2Y)", sz: () => "0-2Y", price: 18, image: KI + "baby_hooded_towel_set.png" },
        { title: "Baby One-Piece Snowsuit", sub: "Baby Clothing (0-2Y)", sz: () => "0-2Y", price: 25, image: KI + "baby_snowsuit.png" },
        { title: "Baby Sailor Romper Set", sub: "Baby Clothing (0-2Y)", sz: () => "0-2Y", price: 16, image: KI + "baby_sailor_set.png" },

        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        // â•â•  KIDS FOOTWEAR (20 items)        â•â•
        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        { title: "Kids Velcro Sneakers White", sub: "Footwear", sz: () => pickSizes(KIDS_SHOE, 4), price: 22, image: KI + "kids_velcro_sneakers.png" },
        { title: "Kids School Shoes Black", sub: "Footwear", sz: () => pickSizes(KIDS_SHOE, 4), price: 28, image: KI + "kids_school_shoes.png" },
        { title: "Kids Light-Up Sneakers", sub: "Footwear", sz: () => pickSizes(KIDS_SHOE, 4), price: 30, image: KI + "kids_lightup_shoes.png" },
        { title: "Kids Sandals Summer Open", sub: "Footwear", sz: () => pickSizes(KIDS_SHOE, 4), price: 15, image: KI + "kids_sandals_summer.png" },
        { title: "Kids Running Shoes Blue", sub: "Footwear", sz: () => pickSizes(KIDS_SHOE, 4), price: 35, image: KI + "kids_running_blue.png" },
        { title: "Kids Slip-On Canvas White", sub: "Footwear", sz: () => pickSizes(KIDS_SHOE, 4), price: 18, image: KI + "kids_canvas_slipon.png" },
        { title: "Kids Waterproof Rain Boots", sub: "Footwear", sz: () => pickSizes(KIDS_SHOE, 4), price: 25, image: KI + "kids_rain_boots.png" },
        { title: "Kids Leather Formal Shoes", sub: "Footwear", sz: () => pickSizes(KIDS_SHOE, 4), price: 32, image: KI + "kids_formal_leather.png" },
        { title: "Kids High-Top Sneakers Red", sub: "Footwear", sz: () => pickSizes(KIDS_SHOE, 4), price: 28, image: KI + "kids_hightop_red.png" },
        { title: "Kids Clogs Comfort", sub: "Footwear", sz: () => pickSizes(KIDS_SHOE, 4), price: 14, image: KI + "kids_clogs.png" },
        { title: "Girls Pink Mary Jane Shoes", sub: "Footwear", sz: () => pickSizes(KIDS_SHOE, 4), price: 20, image: KI + "kids_mary_jane.png" },
        { title: "Kids Hiking Boots Brown", sub: "Footwear", sz: () => pickSizes(KIDS_SHOE, 4), price: 35, image: KI + "kids_hiking_boots.png" },
        { title: "Kids Colorful Flip Flops", sub: "Footwear", sz: () => pickSizes(KIDS_SHOE, 4), price: 8, image: KI + "kids_flip_flops.png" },
        { title: "Girls Ballet Flat Silver", sub: "Footwear", sz: () => pickSizes(KIDS_SHOE, 4), price: 22, image: KI + "kids_ballet_flats.png" },
        { title: "Kids Clog Sandals with Charms", sub: "Footwear", sz: () => pickSizes(KIDS_SHOE, 4), price: 18, image: KI + "kids_crocs_style.png" },
        { title: "Kids Football Cleats Green", sub: "Footwear", sz: () => pickSizes(KIDS_SHOE, 4), price: 30, image: KI + "kids_sports_cleats.png" },
        { title: "Kids Winter Snow Boots", sub: "Footwear", sz: () => pickSizes(KIDS_SHOE, 4), price: 32, image: KI + "kids_winter_boots.png" },
        { title: "Boys Penny Loafers Brown", sub: "Footwear", sz: () => pickSizes(KIDS_SHOE, 4), price: 25, image: KI + "kids_loafers.png" },
        { title: "Girls Glitter Sparkle Shoes", sub: "Footwear", sz: () => pickSizes(KIDS_SHOE, 4), price: 24, image: KI + "kids_glitter_shoes.png" },
        { title: "Kids Aqua Water Shoes", sub: "Footwear", sz: () => pickSizes(KIDS_SHOE, 4), price: 16, image: KI + "kids_water_shoes.png" },

        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        // â•â•  KIDS ACCESSORIES (20 items)     â•â•
        // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
        { title: "Kids Cartoon Backpack", sub: "Accessories", sz: () => "One Size", price: 20, image: KI + "kids_backpack.png" },
        { title: "Kids Water Bottle Stainless", sub: "Accessories", sz: () => "One Size", price: 12, image: KI + "kids_water_bottle.png" },
        { title: "Kids Sunglasses UV Protection", sub: "Accessories", sz: () => "One Size", price: 10, image: KI + "kids_sunglasses.png" },
        { title: "Kids Digital Watch Sports", sub: "Accessories", sz: () => "One Size", price: 15, image: KI + "kids_digital_watch.png" },
        { title: "Kids Baseball Cap", sub: "Accessories", sz: () => "One Size", price: 8, image: KI + "kids_baseball_cap.png" },
        { title: "Kids Hair Accessories Set", sub: "Accessories", sz: () => "One Size", price: 7, image: KI + "kids_hair_set.png" },
        { title: "Kids Insulated Lunch Box", sub: "Accessories", sz: () => "One Size", price: 18, image: KI + "kids_lunch_box.png" },
        { title: "Kids Winter Beanie Hat", sub: "Accessories", sz: () => "One Size", price: 10, image: KI + "kids_beanie_hat.png" },
        { title: "Kids Elastic Stretch Belt", sub: "Accessories", sz: () => "One Size", price: 6, image: KI + "kids_belt.png" },
        { title: "Kids Patterned Socks Pack", sub: "Accessories", sz: () => "One Size", price: 8, image: KI + "kids_socks_pack.png" },
        { title: "Kids Character Umbrella", sub: "Accessories", sz: () => "One Size", price: 12, image: KI + "kids_umbrella.png" },
        { title: "Kids Knitted Scarf", sub: "Accessories", sz: () => "One Size", price: 10, image: KI + "kids_scarf_knit.png" },
        { title: "Kids Winter Fleece Gloves", sub: "Accessories", sz: () => "One Size", price: 8, image: KI + "kids_gloves.png" },
        { title: "Kids Cartoon Wallet", sub: "Accessories", sz: () => "One Size", price: 7, image: KI + "kids_wallet.png" },
        { title: "Kids Cotton Bucket Hat", sub: "Accessories", sz: () => "One Size", price: 10, image: KI + "kids_bucket_hat.png" },
        { title: "Boys Bow Tie & Suspender Set", sub: "Accessories", sz: () => "One Size", price: 12, image: KI + "kids_bow_tie_set.png" },
        { title: "Girls Floral Headband Set", sub: "Accessories", sz: () => "One Size", price: 8, image: KI + "kids_headband_set.png" },
        { title: "Toddler Mini Animal Backpack", sub: "Accessories", sz: () => "One Size", price: 15, image: KI + "kids_mini_backpack.png" },
        { title: "Girls Bead Jewelry Set", sub: "Accessories", sz: () => "One Size", price: 9, image: KI + "kids_jewelry_set.png" },
        { title: "Kids Travel Neck Pillow", sub: "Accessories", sz: () => "One Size", price: 14, image: KI + "kids_travel_pillow.png" },
    ];

    for (const p of kidsItemsList) {
        products.push({
            title: p.title,
            description: `${p.title} - Fun, comfortable kids wear.`,
            price: p.price,
            image: p.image,
            category: "Fashion",
            subcategory: p.sub,
            gender: "Kids",
            size: p.sz(),
            stock: rs(),
            vendorId: pick(kv),
        });
    }
    console.log(`  ðŸ§’ Kids: ${products.filter(p => p.gender === "Kids").length}`);


    console.log(`  ðŸ§’ Kids: ${products.filter(p => p.gender === "Kids").length}`);

    // ===== GEN Z =====
    const genzItems = [
        { names: ["GenZ Oversized Graphic Jacket", "GenZ Varsity College Jacket", "GenZ Puffer Vest"], sub: "Jacket", cat: "Fashion" },
        { names: ["GenZ Chunky High-Top Sneakers", "GenZ Platform Street Sneakers", "GenZ Retro Skate Sneakers"], sub: "Sneakers", cat: "Fashion" },
        { names: ["GenZ Futuristic Sunglasses", "GenZ Y2K Wrap Sunglasses"], sub: "Sunglasses", cat: "Fashion" },
        { names: ["GenZ Transparent Crossbody Bag", "GenZ Techwear Sling Bag"], sub: "Bag", cat: "Fashion" },
        { names: ["GenZ RGB Gaming Headphones", "GenZ Noise Cancelling Over-Ear Headphones"], sub: "Headphones", cat: "Electronics" },
        { names: ["GenZ Mini Portable Boombox Speaker", "GenZ LED Party Speaker"], sub: "Speaker", cat: "Electronics" },
        { names: ["GenZ Digital Retro Watch", "GenZ Smart Fitness Watch"], sub: "Watch", cat: "Electronics" }
    ];
    for (const g of genzItems) for (const t of g.names) products.push({ title: t, description: `${t} - Trending on social media.`, price: rp(19, 149), image: getImgForProduct(t, g.sub, "Unisex"), category: g.cat, subcategory: g.sub, gender: "Unisex", size: g.cat === "Fashion" ? pickSizes(CLOTHING, 4) : "One Size", stock: rs(), vendorId: pick(mv) });
    console.log(`  ðŸ”¥ GenZ: 16`);

    // ===== ELECTRONICS =====
    const elecItems = [
        ["Headphones", ["Wireless ANC Headphones", "Over-Ear Studio Headphones", "Gaming Headset RGB", "Foldable Bluetooth Headphones", "Sport Neckband Earphones"]],
        ["Speaker", ["Portable Bluetooth Speaker", "Home Theater Soundbar", "Waterproof Mini Speaker", "Smart WiFi Speaker", "Party Speaker 100W"]],
        ["Watch", ["Fitness Smartwatch Pro", "AMOLED Smart Watch", "GPS Running Watch", "Classic Hybrid Smartwatch", "Kids Smart Watch"]],
        ["Keyboard", ["Mechanical Gaming Keyboard", "Wireless Ergonomic Keyboard", "Compact 60% Keyboard", "Slim Bluetooth Keyboard"]],
        ["Charger", ["65W GaN USB-C Charger", "Wireless Fast Charging Pad", "20000mAh Power Bank", "Desktop Charging Station"]],
        ["Webcam", ["4K Action Camera", "Webcam HD 1080p", "Dash Cam Dual Lens", "Drone Camera 4K"]],
        ["Laptop", ["Ultra Slim Laptop 14inch", "Gaming Laptop RTX", "2-in-1 Convertible Laptop", "Budget Work Laptop"]],
    ];
    const ev = [v["TechZone Store"], v["Gadget World"]];
    for (const [sub, items] of elecItems) for (const t of items) products.push({ title: t, description: `${t} - Latest technology. 1 year warranty.`, price: rp(19, 299), image: getImgForProduct(t, sub, "Unisex"), category: "Electronics", subcategory: sub, gender: "Unisex", stock: rs(), vendorId: pick(ev) });

    // ===== HOME =====
    const homeItems = [
        ["Decor", ["Ceramic Plant Pot Set", "Abstract Canvas Wall Art", "LED String Fairy Lights", "Macrame Wall Hanging", "Decorative Throw Pillows"]],
        ["Furnishing", ["Chunky Knit Throw Blanket", "Velvet Cushion Covers", "Cotton Bedsheet King", "Sheer Curtain Pair", "Jute Area Rug 5x7"]],
        ["Kitchen", ["Cast Iron Skillet 12inch", "French Press Coffee Maker", "Bamboo Cutting Board Set", "Non-Stick Cookware Set"]],
        ["Lighting", ["Table Lamp Ceramic", "Floor Lamp Arc", "Pendant Light Industrial", "LED Strip Lights RGB"]],
    ];
    const hv = [v["HomeStyle Co"], v["Kitchen Pro"]];
    for (const [sub, items] of homeItems) for (const t of items) products.push({ title: t, description: `${t} - Transform your living space.`, price: rp(9, 79), image: getImgForProduct(t, sub, "Unisex"), category: "Home", subcategory: sub, gender: "Unisex", stock: rs(), vendorId: pick(hv) });

    // ===== SPORTS =====
    const sportsItems = [
        ["Yoga", ["Premium Yoga Mat 6mm", "Yoga Block Cork Set", "Yoga Strap Cotton", "Yoga Wheel", "Meditation Cushion", "Yoga Towel Non-Slip"]],
        ["Gym", ["Adjustable Dumbbell Set", "Resistance Band Set 5pk", "Foam Roller Recovery", "Jump Rope Speed", "Gym Gloves Padded", "Weight Lifting Belt"]],
        ["Running", ["Ultralight Running Shoes", "Running Shorts 5inch", "Compression Tights", "Reflective Vest Night"]],
        ["Outdoor", ["Hiking Backpack 40L", "Camping Tent 2-Person", "Insulated Water Bottle 32oz", "Trekking Poles Carbon"]],
    ];
    const sv = [v["SportsPeak"], v["FitLife Gear"]];
    for (const [sub, items] of sportsItems) for (const t of items) products.push({ title: t, description: `${t} - Engineered for peak performance.`, price: rp(12, 149), image: getImgForProduct(t, sub, "Unisex"), category: "Sports", subcategory: sub, gender: "Unisex", stock: rs(), vendorId: pick(sv) });

    // ===== BOOKS =====
    const booksItems = [
        ["Programming", ["The Art of Programming", "JavaScript Complete Guide", "Python for Data Science"]],
        ["Psychology", ["The Psychology of Success", "Mindful Living Journal", "Atomic Habits Guide"]],
        ["Art", ["Modern Art Guide", "Photography Masterclass", "Interior Design Bible"]],
        ["Cookbook", ["Healthy Meal Prep Cookbook", "Italian Cuisine Classic", "Baking Bread at Home"]],
        ["Fiction", ["Mystery Thriller Novel", "Sci-Fi Space Odyssey", "Romance Bestseller"]],
        ["Kids Books", ["Fairy Tales Illustrated", "Science for Kids", "Activity Book Puzzles", "Bedtime Stories Treasury", "World Atlas for Kids"]],
    ];
    for (const [sub, items] of booksItems) for (const t of items) products.push({ title: t, description: `${t} - Engaging content, beautifully printed.`, price: rp(9, 54), image: getImgForProduct(t, sub, sub === "Kids Books" ? "Kids" : "Unisex"), category: "Books", subcategory: sub, gender: sub === "Kids Books" ? "Kids" : "Unisex", stock: rs(), vendorId: v["BookWorm Press"] });

    // ===== BEAUTY =====
    const WB = "/products/beauty/";
    const womenBeautyList = [
        { title: "Women Vitamin C Brightening Serum", sub: "Serums", price: 25, image: WB + "vitc_serum.png" },
        { title: "Women Hyaluronic Acid Serum", sub: "Serums", price: 20, image: WB + "hyaluronic_serum.png" },
        { title: "Women Niacinamide Pore Minimizer", sub: "Serums", price: 18, image: WB + "niacinamide_serum.png" },
        { title: "Women Retinol Anti-Aging Serum", sub: "Serums", price: 30, image: WB + "retinol_serum.png" },
        { title: "Women Day Cream SPF30", sub: "Moisturizers", price: 22, image: WB + "day_cream.png" },
        { title: "Women Night Repair Cream", sub: "Moisturizers", price: 28, image: WB + "night_cream.png" },
        { title: "Women Gel Moisturizer", sub: "Moisturizers", price: 19, image: WB + "gel_moisturizer.png" },
        { title: "Women Aloe Vera Moisturizer", sub: "Moisturizers", price: 15, image: WB + "aloe_moisturizer.png" },
        { title: "Women Sunscreen SPF50 Matte", sub: "Sunscreen", price: 18, image: WB + "sunscreen_matte.png" },
        { title: "Women Tinted Sunscreen", sub: "Sunscreen", price: 20, image: WB + "sunscreen_tinted.png" },
        { title: "Women Sunscreen Gel Lightweight", sub: "Sunscreen", price: 22, image: WB + "sunscreen_gel.png" },
        { title: "Matte Liquid Lipstick Set", sub: "Makeup", price: 35, image: WB + "lipstick_set.png" },
        { title: "Foundation Full Coverage", sub: "Makeup", price: 40, image: WB + "foundation.png" },
        { title: "Concealer Stick", sub: "Makeup", price: 18, image: WB + "concealer.png" },
        { title: "Mascara Volumizing", sub: "Makeup", price: 15, image: WB + "mascara.png" },
        { title: "Eyeshadow Palette 18 Shades", sub: "Makeup", price: 45, image: WB + "eyeshadow.png" },
        { title: "Blush Powder Duo", sub: "Makeup", price: 25, image: WB + "blush.png" },
        { title: "Setting Spray", sub: "Makeup", price: 20, image: WB + "setting_spray.png" },
        { title: "Eyeliner Waterproof", sub: "Makeup", price: 12, image: WB + "eyeliner.png" },
        { title: "Women Hair Repair Argan Oil", sub: "Hair Care", price: 28, image: WB + "hair_oil.png" },
        { title: "Women Keratin Shampoo", sub: "Hair Care", price: 22, image: WB + "keratin_shampoo.png" },
        { title: "Women Conditioner Deep Moisture", sub: "Hair Care", price: 20, image: WB + "hair_conditioner.png" },
        { title: "Women Hair Mask Protein", sub: "Hair Care", price: 30, image: WB + "hair_mask.png" },
        { title: "Women Heat Protectant Spray", sub: "Hair Care", price: 18, image: WB + "heat_protect.png" },
        { title: "Women Body Lotion Shea Butter", sub: "Body Care", price: 15, image: WB + "body_lotion.png" },
        { title: "Women Shower Gel Rose", sub: "Body Care", price: 12, image: WB + "shower_gel.png" },
        { title: "Women Body Scrub Coffee", sub: "Body Care", price: 18, image: WB + "body_scrub.png" },
        { title: "Women Hand Cream Gift Set", sub: "Body Care", price: 25, image: WB + "hand_cream.png" },
        { title: "Women Body Oil Coconut", sub: "Body Care", price: 22, image: WB + "body_oil.png" },
        { title: "Women Eau de Parfum Floral", sub: "Fragrance", price: 65, image: WB + "perfume_floral.png" },
        { title: "Women Body Mist Vanilla", sub: "Fragrance", price: 20, image: WB + "body_mist.png" },
        { title: "Women Perfume Gift Set", sub: "Fragrance", price: 85, image: WB + "perfume_gift.png" },
        { title: "Makeup Brush Set 12pc", sub: "Tools", price: 45, image: WB + "makeup_brushes.png" },
        { title: "Jade Face Roller", sub: "Tools", price: 18, image: WB + "jade_roller.png" },
        { title: "Hair Dryer Ionic", sub: "Tools", price: 75, image: WB + "hair_dryer.png" },
        { title: "Straightener Flat Iron", sub: "Tools", price: 65, image: WB + "hair_straightener.png" },
        { title: "Facial Cleansing Brush", sub: "Tools", price: 35, image: WB + "cleansing_brush.png" },
        { title: "Beauty Blender Set", sub: "Tools", price: 15, image: WB + "beauty_blender.png" },
        
        // Extra Serums (6) to reach 10
        { title: "Women Salicylic Acid Serum", sub: "Serums", price: 22, image: WB + "serum_salicylic.png" },
        { title: "Women Multi-Peptide Serum", sub: "Serums", price: 35, image: WB + "serum_peptides.png" },
        { title: "Women Radiant Glow Serum", sub: "Serums", price: 28, image: WB + "serum_glow.png" },
        { title: "Women Snail Mucin Serum", sub: "Serums", price: 25, image: WB + "serum_snail_mucin.png" },
        { title: "Women Caffeine Eye Serum", sub: "Serums", price: 18, image: WB + "serum_eye.png" },
        { title: "Women Collagen Boosting Serum", sub: "Serums", price: 40, image: WB + "serum_collagen.png" },

        // Extra Lipsticks (9) to reach 10
        { title: "Ruby Red Matte Lipstick", sub: "Makeup", price: 25, image: WB + "lipstick_red.png" },
        { title: "Nude Pink Creamy Lipstick", sub: "Makeup", price: 22, image: WB + "lipstick_nude.png" },
        { title: "Shiny Clear Lip Gloss", sub: "Makeup", price: 15, image: WB + "lipstick_gloss.png" },
        { title: "Cherry Red Lip Tint Stain", sub: "Makeup", price: 18, image: WB + "lipstick_stain.png" },
        { title: "Dark Plum Vampy Lipstick", sub: "Makeup", price: 26, image: WB + "lipstick_plum.png" },
        { title: "Coral Pink Lip Crayon", sub: "Makeup", price: 20, image: WB + "lipstick_crayon.png" },
        { title: "Tinted Moisturizing Lip Balm", sub: "Makeup", price: 12, image: WB + "lipstick_balm.png" },
        { title: "Pro Lip Color Palette", sub: "Makeup", price: 45, image: WB + "lipstick_palette.png" },
        { title: "Nude Velvet Liquid Lipstick", sub: "Makeup", price: 24, image: WB + "lipstick_liquid_nude.png" }
    ];
    for (const p of womenBeautyList) {
        products.push({ title: p.title, description: `${p.title} - Dermatologist tested, cruelty-free.`, price: p.price, image: p.image, category: "Beauty", subcategory: p.sub, gender: "Women", size: "One Size", stock: rs(), vendorId: v["GlowUp Beauty"] });
    }

    const menBeauty = [
        ["Skincare", ["Men Vitamin C Face Serum", "Men Anti-Acne Serum", "Men Oil-Free Moisturizer", "Men After Shave Balm"]],
        ["Hair Care", ["Men Anti-Dandruff Shampoo", "Men Hair Wax Strong Hold", "Men Beard Oil", "Men 2-in-1 Shampoo Conditioner"]],
        ["Body Care", ["Men Shower Gel Charcoal", "Men Body Spray Deodorant", "Men Face Wash Deep Clean"]],
        ["Fragrance", ["Men Cologne Fresh Citrus", "Men Perfume Oud Wood", "Men Eau de Toilette Sport"]],
    ];
    for (const [sub, items] of menBeauty) for (const t of items) products.push({ title: t, description: `${t} - Premium men's grooming essential.`, price: rp(8, 49), image: getImgForProduct(t, sub, "Men"), category: "Beauty", subcategory: sub, gender: "Men", stock: rs(), vendorId: v["GlowUp Beauty"] });

    const babyBeautyItems = [
        ["Baby Soap", ["Baby Mild Soap Bar", "Baby Moisturizing Soap", "Baby Coconut Soap", "Baby Oatmeal Soap"]],
        ["Baby Shampoo", ["Baby Tear-Free Shampoo Gentle", "Baby Shampoo Coconut Milk", "Baby Nourishing Shampoo"]],
        ["Baby Lotion", ["Baby Daily Moisturizing Lotion", "Baby Calming Lavender Lotion", "Baby Shea Butter Lotion"]],
        ["Baby Powder", ["Baby Talc-Free Natural Powder", "Baby Corn Starch Powder", "Baby Cooling Powder"]],
        ["Baby Oil", ["Baby Massage Oil Coconut", "Baby Massage Oil Sesame", "Baby Soothing Oil Chamomile"]],
        ["Baby Cream", ["Baby Diaper Rash Cream", "Baby Winter Cream", "Baby Nourishing Face Cream"]],
        ["Baby Wash", ["Baby Head-to-Toe Wash", "Baby Gentle Body Wash", "Baby Foam Wash Sensitive"]],
    ];
    for (const [sub, items] of babyBeautyItems) for (const t of items) products.push({ title: t, description: `${t} - Pediatrician recommended, safe for newborns.`, price: rp(3, 18), image: getImgForProduct(t, sub, "Kids"), category: "Beauty", subcategory: sub, gender: "Kids", stock: rs(), vendorId: v["GlowUp Beauty"] });

    // INSERT ALL
    const created = await prisma.product.createMany({ data: products });
    console.log(`\nâœ… Total: ${created.count} products`);

    // REVIEWS
    const allP = await prisma.product.findMany({ select: { id: true } });
    const reviews = [];
    const r5 = ["Amazing quality!", "Best purchase!", "Perfect!", "Love it!", "Incredible value!"];
    const r4 = ["Really good.", "Very happy.", "Great quality.", "Solid product."];
    const r3 = ["Decent.", "Expected more.", "Average quality."];
    for (const p of allP) {
        const n = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < n; i++) {
            const b = buyers[i % buyers.length];
            if (reviews.find(r => r.userId === b.id && r.productId === p.id)) continue;
            const rand = Math.random();
            const rating = rand > 0.4 ? 5 : rand > 0.15 ? 4 : 3;
            reviews.push({ rating, comment: rating === 5 ? pick(r5) : rating === 4 ? pick(r4) : pick(r3), userId: b.id, productId: p.id });
        }
    }
    await prisma.review.createMany({ data: reviews });
    console.log(`âœ… ${reviews.length} reviews`);

    // ORDERS
    const orders = [];
    for (let i = 0; i < 30; i++) {
        const b = pick(buyers), p = pick(allP), q = Math.floor(Math.random() * 3) + 1;
        orders.push({ userId: b.id, productId: p.id, quantity: q, total: rp(10, 200) * q, status: pick(["pending", "confirmed", "shipped", "delivered"]) });
    }
    await prisma.order.createMany({ data: orders });
    console.log(`âœ… 30 orders\n\nðŸŽ‰ Done!\n`);
}
main().catch(console.error).finally(() => prisma.$disconnect());

