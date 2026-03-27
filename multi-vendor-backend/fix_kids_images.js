/**
 * fix_kids_images.js
 * Updates all Kids product images in the DB to use placehold.co colored placeholder URLs.
 * Run: node fix_kids_images.js
 */
const { PrismaClient } = require("./prisma/generated/prisma");
const prisma = new PrismaClient();

// Color scheme per subcategory for visually distinct placeholders
const subColors = {
    "Boys Topwear":        { bg: "3b82f6", fg: "ffffff" },
    "Boys Bottomwear":     { bg: "1d4ed8", fg: "ffffff" },
    "Boys Outerwear":      { bg: "1e3a5f", fg: "ffffff" },
    "Boys Ethnic":         { bg: "7c3aed", fg: "ffffff" },
    "Girls Dresses & Tops":{ bg: "ec4899", fg: "ffffff" },
    "Girls Bottomwear":    { bg: "db2777", fg: "ffffff" },
    "Girls Outerwear":     { bg: "9333ea", fg: "ffffff" },
    "Girls Ethnic":        { bg: "d97706", fg: "ffffff" },
    "Baby Clothing (0-2Y)":{ bg: "f97316", fg: "ffffff" },
    "Footwear":            { bg: "059669", fg: "ffffff" },
    "Accessories":         { bg: "0891b2", fg: "ffffff" },
};

function makeUrl(title, subcategory) {
    const c = subColors[subcategory] || { bg: "6b7280", fg: "ffffff" };
    const text = encodeURIComponent(title.replace(/[^a-zA-Z0-9 ]/g, "").slice(0, 20));
    return `https://placehold.co/400x500/${c.bg}/${c.fg}?text=${text}`;
}

async function main() {
    console.log("🔄 Updating Kids product images...");
    const kids = await prisma.product.findMany({ where: { gender: "Kids" } });
    console.log(`Found ${kids.length} kids products`);

    let updated = 0;
    for (const p of kids) {
        const newImage = makeUrl(p.title, p.subcategory || "");
        await prisma.product.update({
            where: { id: p.id },
            data: { image: newImage },
        });
        updated++;
        if (updated % 20 === 0) console.log(`  Updated ${updated}/${kids.length}...`);
    }

    console.log(`✅ Done! Updated ${updated} Kids products with placehold.co images.`);
    await prisma.$disconnect();
}

main().catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
