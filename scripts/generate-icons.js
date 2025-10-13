import sharp from 'sharp';
import toIco from 'to-ico';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDir = join(__dirname, '..', 'public');

async function generateIcons() {
  try {
    const svgBuffer = readFileSync(join(publicDir, 'swipeQ.svg'));

    // Generate PNG icons
    const sizes = [
      { name: 'pwa-192x192.png', size: 192 },
      { name: 'pwa-512x512.png', size: 512 },
      { name: 'apple-touch-icon.png', size: 180 }
    ];

    for (const { name, size } of sizes) {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(join(publicDir, name));
      console.log(`Generated ${name}`);
    }

    // Generate favicon.ico with multiple sizes
    const png16 = await sharp(svgBuffer)
      .resize(16, 16)
      .png()
      .toBuffer();

    const png32 = await sharp(svgBuffer)
      .resize(32, 32)
      .png()
      .toBuffer();

    const icoBuffer = await toIco([png16, png32]);
    writeFileSync(join(publicDir, 'favicon.ico'), icoBuffer);
    console.log('Generated favicon.ico (16x16, 32x32)');

    console.log('All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error.message);
    process.exit(1);
  }
}

generateIcons();
