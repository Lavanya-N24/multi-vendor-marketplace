const { PrismaClient } = require('./prisma/generated/prisma');
const fs = require('fs');
const path = require('path');
const p = new PrismaClient();

async function run() {
    const products = await p.product.findMany({
        where: { gender: 'Kids' },
        select: { id: true, title: true, image: true, subcategory: true }
    });

    const missing = [];
    for (const m of products) {
        if (!m.image || m.image.includes('http') || m.image.includes('placehold')) {
            missing.push(m);
            continue;
        }
        const fp = path.join(__dirname, '..', 'multi-vendor-frontend', 'public', m.image);
        if (!fs.existsSync(fp) || fs.statSync(fp).size < 1000) {
            missing.push(m);
        }
    }

    const lines = [];
    lines.push('TOTAL=' + products.length);
    lines.push('MISSING=' + missing.length);
    lines.push('OK=' + (products.length - missing.length));
    lines.push('');
    missing.forEach(function(m, i) {
        lines.push((i+1) + '. [' + m.subcategory + '] ' + m.title + ' -> ' + m.image);
    });

    fs.writeFileSync(path.join(__dirname, 'missing_report.txt'), lines.join('\n'), 'utf8');
    console.log('Report written. TOTAL=' + products.length + ' MISSING=' + missing.length);

    await p.$disconnect();
}

run();
