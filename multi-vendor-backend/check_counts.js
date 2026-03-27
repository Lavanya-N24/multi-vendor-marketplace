const { PrismaClient } = require('./prisma/generated/prisma');
const p = new PrismaClient();

async function run() {
    const counts = await p.product.groupBy({ 
        by: ['category'], 
        _count: { id: true }, 
        where: { image: { contains: 'placehold' } } 
    });
    console.log(JSON.stringify(counts, null, 2));
    await p.$disconnect();
}
run();
