const { PrismaClient } = require('./prisma/generated/prisma');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

// This map translates db titles to the local files we expect
const EXPECTED = {
    "Fairy Tales Illustrated": "kids_fairy_tales.png",
    "Science for Kids": "kids_science_book.png",
    "Activity Book Puzzles": "kids_activity_book.png",
    "Bedtime Stories Treasury": "kids_bedtime_stories.png",
    "World Atlas for Kids": "kids_world_atlas.png",
    "Baby Mild Soap Bar": "baby_mild_soap.png",
    "Baby Moisturizing Soap": "baby_moisturizing_soap.png",
    "Baby Coconut Soap": "baby_coconut_soap.png",
    "Baby Oatmeal Soap": "baby_oatmeal_soap.png",
    "Baby Tear-Free Shampoo Gentle": "baby_tearfree_shampoo.png",
    "Baby Shampoo Coconut Milk": "baby_coconut_shampoo.png",
    "Baby Nourishing Shampoo": "baby_nourishing_shampoo.png",
    "Baby Daily Moisturizing Lotion": "baby_daily_lotion.png",
    "Baby Calming Lavender Lotion": "baby_lavender_lotion.png",
    "Baby Shea Butter Lotion": "baby_shea_lotion.png",
    "Baby Talc-Free Natural Powder": "baby_talcfree_powder.png",
    "Baby Corn Starch Powder": "baby_cornstarch_powder.png",
    "Baby Cooling Powder": "baby_cooling_powder.png",
    "Baby Massage Oil Coconut": "baby_coconut_oil.png",
    "Baby Massage Oil Sesame": "baby_sesame_oil.png",
    "Baby Soothing Oil Chamomile": "baby_chamomile_oil.png",
    "Baby Diaper Rash Cream": "baby_diaper_cream.png",
    "Baby Winter Cream": "baby_winter_cream.png",
    "Baby Nourishing Face Cream": "baby_face_cream.png",
    "Baby Head-to-Toe Wash": "baby_headtotoe_wash.png",
    "Baby Gentle Body Wash": "baby_body_wash.png",
    "Baby Foam Wash Sensitive": "baby_foam_wash.png"
};

async function run() {
    const products = await prisma.product.findMany({ where: { gender: 'Kids' } });

    let updated = 0;
    for (const p of products) {
        let desiredPath = p.image;
        if (EXPECTED[p.title]) {
            desiredPath = "/products/kids/" + EXPECTED[p.title];
        } else if (p.image && (p.image.includes('placehold') || p.image.includes('http') || !p.image.includes('.png'))) {
            // fuzzy guess for standard clothing/shoes
            let titleSlug = p.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
            const files = fs.readdirSync(path.join(__dirname, '..', 'multi-vendor-frontend', 'public', 'products', 'kids'));
            const match = files.find(f => p.title.toLowerCase().includes(f.split('_')[1]));
            if (match) desiredPath = "/products/kids/" + match;
        }

        const fp = desiredPath ? path.join(__dirname, '..', 'multi-vendor-frontend', 'public', desiredPath) : null;
        let finalUrl = desiredPath;

        if (!fp || !fs.existsSync(fp) || fs.statSync(fp).size < 1000) {
            // It hasn't downloaded yet. Set a nice placeholder so it doesn't show "No Image"
            finalUrl = `https://placehold.co/400x500/f3f4f6/a3a8b4?text=${encodeURIComponent(p.title)}`;
        }

        if (finalUrl !== p.image) {
            await prisma.product.update({
                where: { id: p.id },
                data: { image: finalUrl }
            });
            updated++;
        }
    }

    console.log("Re-applied dynamic fix to " + updated + " database records.");
    await prisma.$disconnect();
}

run().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
});
