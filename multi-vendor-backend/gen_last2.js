const fs = require('fs');
const path = require('path');
const https = require('https');

const OUT = path.join(__dirname, '..', 'multi-vendor-frontend', 'public', 'products', 'men');

const images = [
    { name: 'men_formal_pants_navy.png', prompt: 'a young indian man wearing navy blue formal trousers with white formal shirt tucked in, full body, white studio background, product photography, realistic, 4k' },
    { name: 'men_torn_jeans.png', prompt: 'a young indian man wearing distressed ripped blue jeans with black tshirt, full body, white studio background, streetwear fashion, product photography, 4k' },
];

const delay = ms => new Promise(r => setTimeout(r, ms));

async function requestImage(prompt) {
    const data = JSON.stringify({ prompt, params: { width: 512, height: 512, steps: 30 }, nsfw: false, censor_nsfw: true, models: ["stable_diffusion", "Dreamshaper"] });
    return new Promise((resolve, reject) => {
        const req = https.request({ hostname: 'aihorde.net', path: '/api/v2/generate/async', method: 'POST', headers: { 'Content-Type': 'application/json', 'apikey': '0000000000' } }, res => {
            let result = ''; res.on('data', chunk => result += chunk); res.on('end', () => resolve(JSON.parse(result)));
        }); req.on('error', reject); req.write(data); req.end();
    });
}

function checkStatus(id) {
    return new Promise((resolve, reject) => {
        https.get("https://aihorde.net/api/v2/generate/check/" + id, { headers: { 'apikey': '0000000000' } }, res => {
            let result = ''; res.on('data', chunk => result += chunk); res.on('end', () => resolve(JSON.parse(result)));
        }).on('error', reject);
    });
}

function getResult(id) {
    return new Promise((resolve, reject) => {
        https.get("https://aihorde.net/api/v2/generate/status/" + id, { headers: { 'apikey': '0000000000' } }, res => {
            let result = ''; res.on('data', chunk => result += chunk); res.on('end', () => resolve(JSON.parse(result)));
        }).on('error', reject);
    });
}

function downloadFile(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (res) => { if (res.statusCode !== 200) { file.close(); return reject(new Error("HTTP " + res.statusCode)); } res.pipe(file); file.on('finish', () => { file.close(); resolve(); }); }).on('error', (err) => { file.close(); reject(err); });
    });
}

async function main() {
    if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
    for (const item of images) {
        const dest = path.join(OUT, item.name);
        if (fs.existsSync(dest) && fs.statSync(dest).size > 10000) { console.log("SKIP: " + item.name); continue; }
        console.log("Generating: " + item.name);
        try {
            const reqRes = await requestImage(item.prompt);
            const id = reqRes.id; console.log("  Job ID: " + id);
            let done = false;
            while (!done) { await delay(3000); const s = await checkStatus(id); console.log("  wait=" + s.wait_time + "s done=" + s.done); if (s.done) done = true; }
            const final = await getResult(id);
            if (final.generations && final.generations.length > 0) { await downloadFile(final.generations[0].img, dest); console.log("  OK!"); }
            else console.log("  FAIL");
        } catch (e) { console.log("  ERR: " + e.message); }
    }
    console.log("Done!");
}
main();
