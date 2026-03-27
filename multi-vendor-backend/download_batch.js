const gis = require('g-i-s');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const OUT = path.join(__dirname, '..', 'multi-vendor-frontend', 'public', 'products', 'men');

const queries = [
    // ── Slippers (10) ──
    { name: 'men_slipper_black.png', query: 'men black rubber slide slipper sandal product photo ecommerce' },
    { name: 'men_slipper_brown.png', query: 'men brown leather casual slipper product photo ecommerce' },
    { name: 'men_slipper_blue.png', query: 'men blue flip flop slipper product photo ecommerce' },
    { name: 'men_slipper_green.png', query: 'men olive green casual slipper product photo ecommerce' },
    { name: 'men_slipper_sport.png', query: 'men sport slide slipper nike adidas product photo ecommerce' },
    { name: 'men_slipper_leather.png', query: 'men tan leather sandal slipper product photo ecommerce' },
    { name: 'men_slipper_comfort.png', query: 'men comfort orthopedic slipper product photo ecommerce' },
    { name: 'men_slipper_pool.png', query: 'men pool slide slipper waterproof product photo ecommerce' },
    { name: 'men_slipper_house.png', query: 'men house indoor slipper cozy product photo' },
    { name: 'men_slipper_ethnic.png', query: 'men ethnic kolhapuri chappal slipper product photo ecommerce' },

    // ── Extra Shirts to reach 10 (need 4) ──
    { name: 'men_pink_shirt.png', query: 'men pink formal shirt product photo ecommerce myntra' },
    { name: 'men_check_shirt.png', query: 'men checkered formal shirt product photo ecommerce' },
    { name: 'men_sky_blue_shirt.png', query: 'men sky blue cotton formal shirt product photo' },
    { name: 'men_grey_formal_shirt.png', query: 'men grey slim fit formal shirt product photo ecommerce' },

    // ── Extra Casual Pants to reach 10 (need 5) ──
    { name: 'men_khaki_pants.png', query: 'men khaki casual cotton pants product photo ecommerce' },
    { name: 'men_navy_chinos.png', query: 'men navy blue chinos pants product photo ecommerce' },
    { name: 'men_track_pants.png', query: 'men track pants jogger stripes product photo ecommerce' },
    { name: 'men_linen_pants.png', query: 'men white linen pants summer product photo ecommerce' },
    { name: 'men_corduroy_pants.png', query: 'men brown corduroy pants product photo ecommerce' },

    // ── Extra Jackets to reach 10 (need 3) ──
    { name: 'men_suede_jacket.png', query: 'men brown suede jacket product photo ecommerce fashion' },
    { name: 'men_track_jacket.png', query: 'men sports track jacket zip product photo ecommerce' },
    { name: 'men_quilted_jacket.png', query: 'men quilted padded jacket product photo ecommerce' },

    // ── Extra Shoes to reach 10 (need 6) ──
    { name: 'men_brogue_shoes.png', query: 'men tan brogue shoes product photo ecommerce' },
    { name: 'men_chelsea_boots.png', query: 'men black chelsea boots product photo ecommerce' },
    { name: 'men_canvas_shoes.png', query: 'men white canvas casual shoes product photo ecommerce' },
    { name: 'men_driving_shoes.png', query: 'men driving moccasin shoes product photo ecommerce' },
    { name: 'men_ankle_boots.png', query: 'men brown ankle boots product photo ecommerce' },
    { name: 'men_sandals_outdoor.png', query: 'men outdoor trekking sandals product photo ecommerce' },

    // ── Extra Sneakers to reach 10 (need 3) ──
    { name: 'men_chunky_sneakers.png', query: 'men chunky platform sneakers product photo ecommerce' },
    { name: 'men_knit_sneakers.png', query: 'men knit flyknit running sneakers product photo ecommerce' },
    { name: 'men_slip_on_sneakers.png', query: 'men slip on casual sneakers product photo ecommerce' },

    // ── Extra Watches to reach 10 (need 6) ──
    { name: 'men_gold_dial_watch.png', query: 'men gold dial luxury watch product photo ecommerce' },
    { name: 'men_sports_watch.png', query: 'men sports digital watch product photo ecommerce' },
    { name: 'men_diver_watch.png', query: 'men diver diving watch blue bezel product photo ecommerce' },
    { name: 'men_minimalist_watch.png', query: 'men minimalist simple watch product photo ecommerce' },
    { name: 'men_skeleton_watch.png', query: 'men skeleton transparent dial watch product photo' },
    { name: 'men_rose_gold_watch.png', query: 'men rose gold elegant watch product photo ecommerce' },

    // ── Extra Headphones to reach 10 (need 5) ──
    { name: 'men_earbuds_tws.png', query: 'true wireless earbuds TWS in case product photo ecommerce' },
    { name: 'men_neckband.png', query: 'men bluetooth neckband earphone product photo ecommerce' },
    { name: 'men_bone_conduction.png', query: 'bone conduction headphones product photo ecommerce' },
    { name: 'men_retro_headphones.png', query: 'retro vintage style headphones product photo ecommerce' },
    { name: 'men_sport_earbuds.png', query: 'sport waterproof earbuds hook ear product photo' },

    // ── Extra Sunglasses to reach 10 (need 5) ──
    { name: 'men_shield_sunglasses.png', query: 'men shield visor sunglasses product photo ecommerce' },
    { name: 'men_rectangular_sunglasses.png', query: 'men rectangular frame sunglasses product photo' },
    { name: 'men_blue_mirror_sunglasses.png', query: 'men blue mirror lens sunglasses product photo' },
    { name: 'men_wooden_sunglasses.png', query: 'men wooden bamboo frame sunglasses product photo' },
    { name: 'men_polarized_sunglasses.png', query: 'men polarized driving sunglasses product photo' },

    // ── Extra Perfume to reach 10 (need 6) ──
    { name: 'men_aqua_perfume.png', query: 'men aqua marine perfume bottle product photo ecommerce' },
    { name: 'men_woody_perfume.png', query: 'men woody musk perfume bottle product photo' },
    { name: 'men_leather_perfume.png', query: 'men leather scent perfume bottle luxury product photo' },
    { name: 'men_fresh_edc.png', query: 'men fresh eau de cologne green bottle product photo' },
    { name: 'men_amber_perfume.png', query: 'men amber oriental perfume bottle product photo' },
    { name: 'men_vetiver_perfume.png', query: 'men vetiver perfume bottle premium product photo' },
];

function download(url, dest) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(url);
        const protocol = parsed.protocol === "https:" ? https : http;
        const file = fs.createWriteStream(dest);
        const req = protocol.get(url, { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 10000 }, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                file.close();
                return download(res.headers.location, dest).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200 || !(res.headers["content-type"] || "").startsWith("image/")) {
                file.close();
                if (fs.existsSync(dest)) fs.unlinkSync(dest);
                return reject(new Error("HTTP " + res.statusCode));
            }
            res.pipe(file);
            file.on("finish", () => { file.close(); resolve(); });
        });
        req.on("error", (err) => { file.close(); if (fs.existsSync(dest)) fs.unlinkSync(dest); reject(err); });
        req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
    });
}

function searchImages(query) {
    return new Promise((resolve, reject) => {
        gis(query, (error, results) => {
            if (error) reject(error);
            else resolve(results);
        });
    });
}

const delay = ms => new Promise(r => setTimeout(r, ms));

async function main() {
    if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
    let ok = 0, fail = 0;

    for (let i = 0; i < queries.length; i++) {
        const item = queries[i];
        const dest = path.join(OUT, item.name);

        if (fs.existsSync(dest) && fs.statSync(dest).size > 5000) {
            console.log("[" + (i + 1) + "/" + queries.length + "] SKIP: " + item.name);
            ok++;
            continue;
        }

        console.log("[" + (i + 1) + "/" + queries.length + "] " + item.name);

        try {
            const results = await searchImages(item.query);
            if (results && results.length > 0) {
                let success = false;
                for (let j = 0; j < Math.min(8, results.length); j++) {
                    try {
                        await download(results[j].url, dest);
                        if (fs.statSync(dest).size > 5000) {
                            console.log("  OK (" + (fs.statSync(dest).size / 1024).toFixed(0) + " KB)");
                            success = true; ok++;
                            break;
                        } else {
                            if (fs.existsSync(dest)) fs.unlinkSync(dest);
                        }
                    } catch (e) { /* next */ }
                }
                if (!success) { console.log("  FAIL"); fail++; }
            } else {
                console.log("  NO RESULTS"); fail++;
            }
            await delay(800);
        } catch (err) {
            console.log("  ERROR: " + err.message); fail++;
        }
    }
    console.log("\nDone! OK=" + ok + " FAIL=" + fail);
}

main();
