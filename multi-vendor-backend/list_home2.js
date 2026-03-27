const { PrismaClient } = require('./prisma/generated/prisma');
const p = new PrismaClient();

async function run() {
    const products = await p.product.findMany({
        where: { OR: [{ gender: 'Home' }, { category: 'Home' }] },
        select: { title: true, subcategory: true, image: true }
    });
    console.log(JSON.stringify(products));
    await p.$disconnect();
}
run();
