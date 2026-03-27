const { PrismaClient } = require("./prisma/generated/prisma");
const prisma = new PrismaClient();
async function run() {
    const n = await prisma.product.count({ where: { gender: "Kids", image: { contains: "placehold.co" } } });
    const t = await prisma.product.count({ where: { gender: "Kids" } });
    const sample = await prisma.product.findFirst({ where: { gender: "Kids" }, select: { title: true, image: true, subcategory: true } });
    console.log(`With placehold.co: ${n} / Total Kids: ${t}`);
    console.log("Sample:", JSON.stringify(sample));
    await prisma.$disconnect();
}
run().catch(async e => { console.error(e); await prisma.$disconnect(); });
