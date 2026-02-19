const fs = require('fs');
const path = require('path');
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');

// Try to register the local font
try {
    GlobalFonts.registerFromPath(path.join(__dirname, '../assets/fonts/ARIALN.TTF'), 'Arial Narrow');
} catch (e) {
    console.log("Could not load local font, relying on system fonts.");
}

const width = 512;
const height = 512;
const canvas = createCanvas(width, height);
const ctx = canvas.getContext('2d');

// Brat green background
ctx.fillStyle = '#8bce27';
ctx.fillRect(0, 0, width, height);

// Draw "brat" text, scaled exactly perfectly for an icon
ctx.fillStyle = '#000000';
ctx.filter = 'blur(4px)'; // Slight pixelated/blurry look
ctx.font = '220px "Arial Narrow"';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
// Push text slightly up or down to align visually inside a squircle
ctx.fillText('brat', width / 2, height / 2 + 15);

const buffer = canvas.toBuffer('image/png');
const outDir = path.join(__dirname, '../assets');

if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, 'icon.png'), buffer);
console.log('Vector-perfect icon generated at assets/icon.png');
