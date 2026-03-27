const { PrismaClient } = require('./prisma/generated/prisma');
const fs = require('fs');
const path = require('path');
const p = new PrismaClient();

async function run() {
    const products = await p.product.findMany({
        where: { gender: 'Kids' },
        select: { id: true, title: true, image: true, subcategory: true }
    });

    console.log('Total Kids products in DB:', products.length);

    const noFile = [];
    const placeholder = [];
    const ok = [];

    for (const m of products) {
        if (m.image && (m.image.includes('placehold') || m.image.includes('http'))) {
            placeholder.push(m);
        } else if (m.image) {
            const fp = path.join(__dirname, '..', 'multi-vendor-frontend', 'public', m.image);
            if (!fs.existsSync(fp)) {
                noFile.push(m);
            } else {
                const stat = fs.statSync(fp);
                if (stat.size < 1000) {
                    noFile.push(m);
                } else {
                    ok.push(m);
                }
            }
        } else {
            noFile.push(m);
        }
    }

    console.log('\nOK (image file exists):', ok.length);
    console.log('Placeholder/External URLs:', placeholder.length);
    console.log('Missing local files:', noFile.length);

    // Show ALL missing
    const allMissing = [...placeholder, ...noFile];
    console.log('\nTotal needing images:', allMissing.length);
    console.log('\n=== ALL MISSING IMAGES ===');
    allMissing.forEach((m, i) => {
        console.log(`${i + 1}. [${m.subcategory}] "${m.title}" -> ${m.image}`);
    });

    // Also list generated files in folder
    const kidsDir = path.join(__dirname, '..', 'multi-vendor-frontend', 'public', 'products', 'kids');
    if (fs.existsSync(kidsDir)) {
        const files = fs.readdirSync(kidsDir);
        console.log('\nFiles in kids folder:', files.length);
    }

    await p.$disconnect();
}

run().catch(async e => { console.error(e); await p.$disconnect(); });
