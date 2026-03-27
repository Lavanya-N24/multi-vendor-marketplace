const { PrismaClient } = require("./prisma/generated/prisma");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();
const publicDir = path.join(__dirname, "..", "multi-vendor-frontend", "public");

async function main() {
    const products = await prisma.product.findMany({
        select: { id: true, title: true, image: true, gender: true, subcategory: true }
    });

    const missing = [];

    for (const p of products) {
        if (!p.image) {
            missing.push(`NO_IMAGE | ${p.gender} | ${p.subcategory} | ${p.title}`);
            continue;
        }
        if (p.image.startsWith("http")) continue;
        const fullPath = path.join(publicDir, p.image);
        if (!fs.existsSync(fullPath)) {
            missing.push(`${p.gender} | ${p.subcategory} | ${p.title} | ${p.image}`);
        }
    }

    fs.writeFileSync("missing_images.txt", "MISSING COUNT: " + missing.length + "\n" + missing.join("\n"));
    console.log("Done. Check missing_images.txt");

    await prisma.$disconnect();
}

main();
