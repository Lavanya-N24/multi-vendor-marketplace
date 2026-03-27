const fs = require('fs');
const path = require('path');
const https = require('https');

const OUT = path.join(__dirname, '..', 'multi-vendor-frontend', 'public', 'products', 'men');

const queries = [
    { name: 'men_wayfarer.png', prompt: 'a young man wearing modern black wayfarer sunglasses, white background, product photo, portrait, realistic photography' },
    { name: 'men_sport_sunglasses.png', prompt: 'a young man wearing sport wraparound racing sunglasses, white background, product photo, portrait, highly detailed' },
    { name: 'men_clubmaster.png', prompt: 'a young man wearing half rim clubmaster sunglasses, white background, elegant product photo, portrait, realistic' },
    { name: 'men_sunglasses.png', prompt: 'a young man wearing aviator sunglasses, white background, fashion product photo, portrait, realistic' }
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
        https.get(`https://aihorde.net/api/v2/generate/check/${id}`, { headers: { 'apikey': '0000000000' } }, res => {
            let result = '';
            res.on('data', chunk => result += chunk);
            res.on('end', () => resolve(JSON.parse(result)));
        }).on('error', reject);
    });
}

function getResult(id) {
    return new Promise((resolve, reject) => {
        https.get(`https://aihorde.net/api/v2/generate/status/${id}`, { headers: { 'apikey': '0000000000' } }, res => {
            let result = '';
            res.on('data', chunk => result += chunk);
            res.on('end', () => resolve(JSON.parse(result)));
        }).on('error', reject);
    });
}

function download(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        const req = https.get(url, (res) => {
            if (res.statusCode !== 200) {
                file.close();
                return reject(new Error(`HTTP ${res.statusCode}`));
            }
            res.pipe(file);
            file.on('finish', () => { file.close(); resolve(); });
        }).on('error', (err) => { file.close(); reject(err); });
    });
}

async function main() {
    if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

    for (const item of queries) {
        const dest = path.join(OUT, item.name);
        console.log(`\nGenerating: ${item.name}`);

        try {
            const reqRes = await requestImage(item.prompt);
            const id = reqRes.id;
            console.log(`  -> Job ID: ${id}`);

            let done = false;
            while (!done) {
                await delay(3000); // 3 seconds
                const status = await checkStatus(id);
                console.log(`  -> Status: wait=${status.wait_time}s, queue=${status.queue_position}, done=${status.done}`);
                if (status.done) done = true;
            }

            const final = await getResult(id);
            if (final.generations && final.generations.length > 0) {
                const url = final.generations[0].img;
                console.log(`  -> Downloading from ${url}`);
                await download(url, dest);
                console.log(`  ✅ Saved!`);
            } else {
                console.log(`  ❌ Failed to generate (no generations array)`);
            }
        } catch (e) {
            console.log(`  ❌ Error: ${e.message}`);
        }
    }
}

main();
