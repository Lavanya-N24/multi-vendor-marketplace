const fs = require('fs');
const path = require('path');
const { PrismaClient } = require("./prisma/generated/prisma");
const prisma = new PrismaClient();

async function fixImages() {
    const products = await prisma.product.findMany();
    let fixed = 0;
    
    // Create mapping of available files in each product category
    const publicDir = path.join(__dirname, '..', 'multi-vendor-frontend', 'public');
    const productsDir = path.join(publicDir, 'products');
    
    for (const p of products) {
        const currentPath = path.join(publicDir, p.image);
        
        // If the file does NOT exist physically, we need to assign a valid one
        if (!fs.existsSync(currentPath)) {
            // Determine the ideal folder
            let folder = p.category.toLowerCase();
            if (folder === 'fashion') {
                if (p.gender === 'Men') folder = 'men';
                else if (p.gender === 'Women') folder = 'women';
                else folder = 'kids';
            } else if (folder === 'genz') {
                folder = 'unisex'; // Wait, let's use fashion or men/women
            }
            
            // Map subcategories or names for edge cases
            if (p.subcategory.toLowerCase().includes('yoga') || p.subcategory.toLowerCase().includes('gym') || p.subcategory.toLowerCase().includes('running') || p.subcategory.toLowerCase().includes('outdoor')) folder = 'sports';
            if (p.subcategory.toLowerCase().includes('decor') || p.subcategory.toLowerCase().includes('furnishing') || p.subcategory.toLowerCase().includes('kitchen') || p.subcategory.toLowerCase().includes('lighting')) folder = 'home';
            if (p.subcategory.toLowerCase().includes('serum') || p.subcategory.toLowerCase().includes('moisturizer') || p.subcategory.toLowerCase().includes('makeup') || p.subcategory.toLowerCase().includes('sunscreen') || p.subcategory.toLowerCase().includes('body care') || p.subcategory.toLowerCase().includes('hair care') || p.category === 'Beauty') folder = 'beauty';
            if (p.category === 'Books') folder = 'books';
            if (p.category === 'Electronics') folder = 'electronics';

            const dir = path.join(productsDir, folder);
            
            if (fs.existsSync(dir)) {
                // Get all png/jpg files
                const files = fs.readdirSync(dir).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));
                
                if (files.length > 0) {
                    // Pick a random valid image from the correct folder
                    const randomFile = files[Math.floor(Math.random() * files.length)];
                    const newImg = '/products/' + folder + '/' + randomFile;
                    
                    await prisma.product.update({ 
                        where: { id: p.id }, 
                        data: { image: newImg } 
                    });
                    fixed++;
                    //console.log(`Updated ${p.title} to ${newImg}`);
                } else {
                    await prisma.product.update({ 
                        where: { id: p.id }, 
                        data: { image: 'https://placehold.co/400x500/eaeaea/666666?text=No+Image' } 
                    });
                    fixed++;
                }
            } else {
                // If the folder itself doesn't exist, use fallback
                await prisma.product.update({ 
                    where: { id: p.id }, 
                    data: { image: 'https://placehold.co/400x500/eaeaea/666666?text=No+Image' } 
                });
                fixed++;
            }
        }
    }
    console.log('Fixed ' + fixed + ' broken images by mapping them to existing ones in their category folder.');
}

fixImages().catch(console.error).finally(() => prisma.$disconnect());
