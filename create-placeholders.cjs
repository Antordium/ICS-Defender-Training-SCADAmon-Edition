const fs = require('fs');
const zlib = require('zlib');

// Create a proper PNG with specific dimensions
function createPNG(width, height, r = 100, g = 100, b = 200) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 2;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdrChunk = createChunk('IHDR', ihdrData);

  const rowSize = 1 + width * 3;
  const rawData = Buffer.alloc(rowSize * height);
  for (let y = 0; y < height; y++) {
    rawData[y * rowSize] = 0;
    for (let x = 0; x < width; x++) {
      const offset = y * rowSize + 1 + x * 3;
      rawData[offset] = r;
      rawData[offset + 1] = g;
      rawData[offset + 2] = b;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type);
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcData);

  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc >>> 0, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function crc32(data) {
  let crc = 0xFFFFFFFF;
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }
  return crc ^ 0xFFFFFFFF;
}

const assets = {
  'assets/images/axulart/character/custom.png': createPNG(256, 264, 80, 120, 200),
  'assets/images/parabellum-games/characters.png': createPNG(320, 160, 200, 100, 100),
  'assets/images/pimen/ice-attack/active.png': createPNG(128, 32, 100, 200, 255),
  'assets/images/pimen/ice-attack/start.png': createPNG(128, 32, 150, 220, 255),
  'assets/images/pimen/slash.png': createPNG(192, 48, 255, 200, 100),
  'assets/images/axulart/beach/crushed.png': createPNG(128, 64, 240, 220, 150),
  'assets/images/kenneys-assets/ui-space-expansion/glassPanel.png': createPNG(100, 100, 200, 200, 220),
  'assets/images/kenneys-assets/ui-space-expansion/glassPanel_purple.png': createPNG(100, 100, 180, 150, 200),
  'assets/images/kenneys-assets/ui-space-expansion/glassPanel_green.png': createPNG(100, 100, 150, 200, 150),
  'assets/images/kenneys-assets/ui-space-expansion/custom-ui.png': createPNG(200, 50, 50, 50, 80),
  'assets/images/kenneys-assets/ui-pack/blue_button01.png': createPNG(100, 40, 80, 120, 200),
  'assets/images/kenneys-assets/ui-pack/blue_button00.png': createPNG(100, 40, 100, 140, 220),
  'assets/images/kenneys-assets/ui-space-expansion/barHorizontal_green_right.png': createPNG(8, 16, 50, 200, 50),
  'assets/images/kenneys-assets/ui-space-expansion/barHorizontal_green_mid.png': createPNG(8, 16, 50, 200, 50),
  'assets/images/kenneys-assets/ui-space-expansion/barHorizontal_green_left.png': createPNG(8, 16, 50, 200, 50),
  'assets/images/kenneys-assets/ui-space-expansion/barHorizontal_blue_right.png': createPNG(8, 16, 50, 50, 200),
  'assets/images/kenneys-assets/ui-space-expansion/barHorizontal_blue_mid.png': createPNG(8, 16, 50, 50, 200),
  'assets/images/kenneys-assets/ui-space-expansion/barHorizontal_blue_left.png': createPNG(8, 16, 50, 50, 200),
  'assets/images/kenneys-assets/ui-space-expansion/barHorizontal_shadow_right.png': createPNG(8, 16, 30, 30, 30),
  'assets/images/kenneys-assets/ui-space-expansion/barHorizontal_shadow_mid.png': createPNG(8, 16, 30, 30, 30),
  'assets/images/kenneys-assets/ui-space-expansion/barHorizontal_shadow_left.png': createPNG(8, 16, 30, 30, 30),
};

Object.entries(assets).forEach(([path, data]) => {
  fs.writeFileSync(path, data);
  console.log('Created:', path);
});

console.log('\nAll properly-sized placeholder images created!');
