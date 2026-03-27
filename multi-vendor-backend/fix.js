const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, 'seed.js');
let code = fs.readFileSync(seedPath, 'utf8');

const lines = code.split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('https://image.pollinations.ai/prompt/')) {
        const titleMatch = lines[i].match(/title:\s*"([^"]+)"/);
        const subMatch = lines[i].match(/sub:\s*"([^"]+)"/);
        let gender = '"Men"';
        if (titleMatch && titleMatch[1].includes("Women")) gender = '"Women"';
        
        if (titleMatch && subMatch) {
            lines[i] = lines[i].replace(/image:\s*`https:\/\/image\.pollinations\.ai[^`]+`/, `image: getImgForProduct("${titleMatch[1]}", "${subMatch[1]}", ${gender})`);
        }
    }
}

fs.writeFileSync(seedPath, lines.join('\n'));
console.log("Replacement complete.");
