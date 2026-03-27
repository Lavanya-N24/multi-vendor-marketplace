const { PrismaClient } = require('./prisma/generated/prisma');
const p = new PrismaClient();

async function run() {
  const res = await p.product.updateMany({
    where: {
      OR: [
        { image: { contains: 'pollinations' } },
        { image: null },
      ]
    },
    data: {
      image: 'https://placehold.co/400x500/f3f4f6/a3a8b4?text=Generating+Image...'
    }
  });

  console.log('Fixed broken images:', res.count);
  await p.$disconnect();
}
run();
