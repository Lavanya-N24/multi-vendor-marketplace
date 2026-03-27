const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

const PRODUCTS_DIR = path.join(__dirname, '../multi-vendor-frontend/public/products');

async function syncLocalImages() {
  const categories = fs.readdirSync(PRODUCTS_DIR).filter(f => fs.statSync(path.join(PRODUCTS_DIR, f)).isDirectory());
  
  for (const cat of categories) {
    const catDir = path.join(PRODUCTS_DIR, cat);
    const files = fs.readdirSync(catDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));
    
    console.log(`Syncing ${cat} (${files.length} files)...`);
    
    for (const file of files) {
      // Try to find a product that matches the filename (loose match)
      // filenames are like 'boys_denim_jacket.png'
      // product titles are like 'Boys Denim Jacket'
      const titleMatch = file.replace(/_/g, ' ').replace('.png', '').replace('.jpg', '');
      
      const product = await prisma.product.findFirst({
        where: {
          OR: [
            { title: { contains: titleMatch, mode: 'insensitive' } },
            { image: { contains: file } }
          ]
        }
      });
      
      if (product && (product.image.includes('placehold.co') || product.image.includes('pollinations'))) {
        await prisma.product.update({
          where: { id: product.id },
          data: { image: `/products/${cat}/${file}` }
        });
        console.log(`  Updated ${product.title} -> /products/${cat}/${file}`);
      }
    }
  }
}

syncLocalImages().then(() => {
  console.log('Sync complete.');
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
