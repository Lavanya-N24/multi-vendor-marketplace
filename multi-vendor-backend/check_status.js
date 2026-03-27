const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const beautyCount = await prisma.product.count({ where: { category: 'Beauty' } });
  const kidsCount = await prisma.product.count({ where: { category: 'Kids' } });
  const homeCount = await prisma.product.count({ where: { category: 'Home' } });
  
  console.log('--- Product Counts ---');
  console.log('Beauty:', beautyCount);
  console.log('Kids:', kidsCount);
  console.log('Home:', homeCount);
  
  const beautyImages = await prisma.product.findMany({ 
    where: { category: 'Beauty' },
    select: { image: true },
    take: 5
  });
  
  console.log('\n--- Sample Beauty Images ---');
  console.log(beautyImages.map(p => p.image));
  
  const placeholderCount = await prisma.product.count({
    where: {
      image: {
        contains: 'placehold.co'
      }
    }
  });
  console.log('\nRemaining Placeholders:', placeholderCount);
  
  process.exit(0);
}

check();
