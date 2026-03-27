const { PrismaClient } = require('./prisma/generated/prisma');
const prisma = new PrismaClient();

async function fixAllPlaceholders() {
    console.log("Fixing all broken Pollinations images across the entire website...");
    
    // Find all products that have image.pollinations.ai URL and replace with standard beautiful placeholders
    const products = await prisma.product.findMany({
        where: {
            image: {
                contains: "pollinations.ai"
            }
        }
    });
    
    console.log(`Found ${products.length} products with broken Pollinations links!`);
    
    let updated = 0;
    for (const p of products) {
        const safePlaceholder = `https://placehold.co/400x500/f3f4f6/a3a8b4?text=${encodeURIComponent(p.title)}`;
        await prisma.product.update({
            where: { id: p.id },
            data: { image: safePlaceholder }
        });
        updated++;
    }
    
    console.log(`Successfully restored ${updated} broken products to safe placeholders!`);
    await prisma.$disconnect();
}

fixAllPlaceholders().catch(console.error);
