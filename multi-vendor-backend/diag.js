const { PrismaClient } = require('./prisma/generated/prisma');
const p = new PrismaClient();

async function r() {
  const b = await p.product.findMany({
    where: {
      OR: [
        { subcategory: { contains: 'Book' } },
        { subcategory: { contains: 'Soap' } },
        { subcategory: { contains: 'Shampoo' } },
        { subcategory: { contains: 'Wash' } },
      ]
    },
    select: { title: true, gender: true, category: true, subcategory: true, image: true }
  });
  console.log(JSON.stringify(b, null, 2));
  await p.$disconnect();
}

r().catch(e => console.error(e));
