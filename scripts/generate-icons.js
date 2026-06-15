// Generates simple PWA PNG icons (brand background + white medical cross)
// without any image dependencies. Run with: node scripts/generate-icons.js
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const BRAND = [37, 109, 112]; // #256d70
const WHITE = [255, 255, 255];

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crc]);
}

function makePng(size) {
  // Build RGBA pixel data with a centered plus sign + rounded corners.
  const armThickness = Math.round(size * 0.16);
  const armLength = Math.round(size * 0.56);
  const center = size / 2;
  const radius = Math.round(size * 0.18); // corner rounding

  const rows = [];
  for (let y = 0; y < size; y++) {
    const row = Buffer.alloc(1 + size * 4);
    row[0] = 0; // filter type none
    for (let x = 0; x < size; x++) {
      // Rounded-corner transparency check.
      const inCornerX = x < radius ? radius - x : x > size - radius ? x - (size - radius) : 0;
      const inCornerY = y < radius ? radius - y : y > size - radius ? y - (size - radius) : 0;
      const transparent =
        inCornerX > 0 &&
        inCornerY > 0 &&
        inCornerX * inCornerX + inCornerY * inCornerY > radius * radius;

      const inVertical =
        Math.abs(x - center) <= armThickness / 2 &&
        Math.abs(y - center) <= armLength / 2;
      const inHorizontal =
        Math.abs(y - center) <= armThickness / 2 &&
        Math.abs(x - center) <= armLength / 2;
      const isCross = inVertical || inHorizontal;

      const [r, g, b] = isCross ? WHITE : BRAND;
      const off = 1 + x * 4;
      row[off] = r;
      row[off + 1] = g;
      row[off + 2] = b;
      row[off + 3] = transparent ? 0 : 255;
    }
    rows.push(row);
  }

  const raw = Buffer.concat(rows);
  const idat = zlib.deflateSync(raw);

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const outDir = path.join(__dirname, "..", "public", "icons");
fs.mkdirSync(outDir, { recursive: true });

const targets = [
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["apple-touch-icon.png", 180],
  ["maskable-512.png", 512],
];

for (const [name, size] of targets) {
  fs.writeFileSync(path.join(outDir, name), makePng(size));
  console.log("wrote", name, size + "x" + size);
}
