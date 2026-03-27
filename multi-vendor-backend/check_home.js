const { PrismaClient } = require('./prisma/generated/prisma');
const p = new PrismaClient();

async function run() {
    const products = await p.product.findMany({
        where: { OR: [{ gender: 'Home' }, { category: 'Home' }] }
    });
    
    let total = products.length;
    let missingImages = products.filter(pr => !pr.image || pr.image.includes('pollinations') || pr.image.includes('placehold'));
    
    console.log(`Total Home products: ${total}`);
    console.log(`Missing/broken images for Home: ${missingImages.length}`);
    
    if (missingImages.length > 0) {
        console.log("Sample missing:");
        missingImages.slice(0, 5).forEach(pr => {
            console.log(`- [${pr.subcategory}] ${pr.title} -> ${pr.image}`);
        });
    }

    await p.$disconnect();
}
run();
