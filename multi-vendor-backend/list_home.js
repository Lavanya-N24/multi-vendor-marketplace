const { PrismaClient } = require('./prisma/generated/prisma');
const p = new PrismaClient();

async function run() {
    const products = await p.product.findMany({
        where: { OR: [{ gender: 'Home' }, { category: 'Home' }] },
        select: { title: true, subcategory: true }
    });
    products.forEach(pr => console.log(`${pr.subcategory}|${pr.title}`));
    await p.$disconnect();
}
run();
