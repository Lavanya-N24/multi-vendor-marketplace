const fs = require('fs');
const { PrismaClient } = require('./prisma/generated/prisma');
const p = new PrismaClient();

async function run() {
    const products = await p.product.findMany({
        where: { OR: [{ gender: 'Home' }, { category: 'Home' }] },
        select: { title: true, subcategory: true, image: true }
    });
    fs.writeFileSync('home.json', JSON.stringify(products, null, 2));
    await p.$disconnect();
}
run();
