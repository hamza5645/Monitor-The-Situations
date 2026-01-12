import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const publicDir = join(rootDir, 'public');
const iconsDir = join(publicDir, 'icons');

// Ensure icons directory exists
mkdirSync(iconsDir, { recursive: true });

// Read the SVG
const svgBuffer = readFileSync(join(publicDir, 'favicon.svg'));

// Icon sizes to generate
const sizes = [
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

console.log('Generating PWA icons from favicon.svg...\n');

for (const { name, size } of sizes) {
  const outputPath = join(iconsDir, name);

  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(outputPath);

  console.log(`  Created: public/icons/${name} (${size}x${size})`);
}

console.log('\nDone! Icons generated successfully.');
