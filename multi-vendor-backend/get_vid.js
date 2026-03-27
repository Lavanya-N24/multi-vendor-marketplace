const { PrismaClient } = require('./prisma/generated/prisma');
const p = new PrismaClient();

async function run() {
    const v = await p.user.findFirst({where: {role: 'VENDOR'}});
    console.log(v.id);
    await p.$disconnect();
}
run();
