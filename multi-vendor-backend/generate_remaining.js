const fs = require('fs');
const path = require('path');
const https = require('https');

const OUT = path.join(__dirname, '..', 'multi-vendor-frontend', 'public', 'products', 'men');

const images = [
    // Jackets - need 3 more unique
    { name: 'men_slim_blazer.png', prompt: 'a young man wearing a sleek black slim fit blazer jacket, white studio background, fashion product photography, realistic, 4k' },
    { name: 'men_puffer_jacket.png', prompt: 'a young man wearing a dark navy blue puffer winter jacket, white studio background, ecommerce product photo, realistic, 4k' },
    { name: 'men_windbreaker.png', prompt: 'a young man wearing a grey lightweight windbreaker sports jacket, white studio background, product photography, realistic, 4k' },
    // Shoes - need 3 more unique
    { name: 'men_derby_shoes.png', prompt: 'a pair of shiny black leather derby lace up dress shoes on white background, product photography, ecommerce, realistic, 4k' },
    { name: 'men_brown_loafers.png', prompt: 'a pair of brown suede penny loafer shoes on white background, product photography, ecommerce, realistic, 4k' },
    { name: 'men_monk_strap.png', prompt: 'a pair of tan leather double monk strap dress shoes on white background, product photography, ecommerce, realistic, 4k' },
];

const delay = ms => new Promise(r => setTimeout(r, ms));

async function requestImage(prompt) {
    const data = JSON.stringify({
        prompt: prompt,
        params: {
            width: 512,
            height: 512,
            steps: 30
        },
        nsfw: false,
        censor_nsfw: true,
        models: ["stable_diffusion", "Dreamshaper"]
    });

    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'aihorde.net',
            path: '/api/v2/generate/async',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': '0000000000'
            }
        };

        const req = https.request(options, res => {
            let result = '';
            res.on('data', chunk => result += chunk);
            res.on('end', () => resolve(JSON.parse(result)));
        });

        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

function checkStatus(id) {
    return new Promise((resolve, reject) => {
        https.get("https://aihorde.net/api/v2/generate/check/" + id, { headers: { 'apikey': '0000000000' } }, res => {
            let result = '';
            res.on('data', chunk => result += chunk);
            res.on('end', () => resolve(JSON.parse(result)));
        }).on('error', reject);
    });
}

function getResult(id) {
    return new Promise((resolve, reject) => {
        https.get("https://aihorde.net/api/v2/generate/status/" + id, { headers: { 'apikey': '0000000000' } }, res => {
            let result = '';
            res.on('data', chunk => result += chunk);
            res.on('end', () => resolve(JSON.parse(result)));
        }).on('error', reject);
    });
}

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                file.close();
                return reject(new Error("HTTP " + res.statusCode));
            }
            res.pipe(file);
            file.on('finish', () => { file.close(); resolve(); });
        }).on('error', (err) => { file.close(); reject(err); });
    });
}

async function main() {
    if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

    for (const item of images) {
        const dest = path.join(OUT, item.name);

        if (fs.existsSync(dest) && fs.statSync(dest).size > 10000) {
            console.log("SKIP (exists): " + item.name);
            continue;
        }

        console.log("\nGenerating: " + item.name);

        try {
            const reqRes = await requestImage(item.prompt);
            const id = reqRes.id;
            console.log("  -> Job ID: " + id);

            let done = false;
            while (!done) {
                await delay(3000);
                const status = await checkStatus(id);
                console.log("  -> wait=" + status.wait_time + "s, queue=" + status.queue_position + ", done=" + status.done);
                if (status.done) done = true;
            }

            const final = await getResult(id);
            if (final.generations && final.generations.length > 0) {
                const url = final.generations[0].img;
                console.log("  -> Downloading...");
                await downloadFile(url, dest);
                console.log("  OK Saved!");
            } else {
                console.log("  FAIL - no generations");
            }
        } catch (e) {
            console.log("  ERROR: " + e.message);
        }
    }
    console.log("\nAll done!");
}

main();
