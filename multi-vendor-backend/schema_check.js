const { PrismaClient } = require('./prisma/generated/prisma');
const p = new PrismaClient();

async function run() {
    const prod = await p.product.findFirst();
    console.log(Object.keys(prod));
    await p.$disconnect();
}
run();
