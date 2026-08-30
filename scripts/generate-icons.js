const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

// Helper to create uncompressed/deflated PNG file in pure Node.js
function createPNG(width, height) {
  // RGBA buffer
  const buffer = Buffer.alloc(width * height * 4);

  // Background: #1e1b19 (30, 27, 25)
  // Gold accent: #d4af37 (212, 175, 55)
  const bgR = 30, bgG = 27, bgB = 25;
  const goldR = 212, goldG = 175, goldB = 55;

  const cx = width / 2;
  const cy = height / 2;
  const r = width * 0.42;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Gold border ring
      if (Math.abs(dist - r) < width * 0.02) {
        buffer[idx] = goldR;
        buffer[idx + 1] = goldG;
        buffer[idx + 2] = goldB;
        buffer[idx + 3] = 255;
      } else if (dist < r) {
        // Inner diamond monogram area
        const manhattan = Math.abs(dx) + Math.abs(dy);
        if (Math.abs(manhattan - r * 0.7) < width * 0.015) {
          buffer[idx] = goldR;
          buffer[idx + 1] = goldG;
          buffer[idx + 2] = goldB;
          buffer[idx + 3] = 220;
        } else if (Math.abs(dx) < width * 0.08 && Math.abs(dy) < height * 0.22) {
          // Central core gold accent
          buffer[idx] = goldR;
          buffer[idx + 1] = goldG;
          buffer[idx + 2] = goldB;
          buffer[idx + 3] = 255;
        } else {
          buffer[idx] = bgR;
          buffer[idx + 1] = bgG;
          buffer[idx + 2] = bgB;
          buffer[idx + 3] = 255;
        }
      } else {
        // Outer dark background
        buffer[idx] = bgR;
        buffer[idx + 1] = bgG;
        buffer[idx + 2] = bgB;
        buffer[idx + 3] = 255;
      }
    }
  }

  // Build valid PNG Chunk format
  const rawScanlines = Buffer.alloc(height * (width * 4 + 1));
  let rawIdx = 0;
  for (let y = 0; y < height; y++) {
    rawScanlines[rawIdx++] = 0; // Filter type 0 (None)
    for (let x = 0; x < width * 4; x++) {
      rawScanlines[rawIdx++] = buffer[y * width * 4 + x];
    }
  }

  const compressedData = zlib.deflateSync(rawScanlines);

  // PNG Signature
  const pngHeader = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR Chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  const ihdrChunk = createChunk("IHDR", ihdr);
  const idatChunk = createChunk("IDAT", compressedData);
  const iendChunk = createChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([pngHeader, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(12 + length);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, "ascii");
  data.copy(chunk, 8);

  const crc = calculateCRC(chunk.subarray(4, 8 + length));
  chunk.writeUInt32BE(crc, 8 + length);
  return chunk;
}

// Simple CRC32 for PNG chunks
function calculateCRC(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

// Ensure icons folder exists
const iconsDir = path.join(__dirname, "..", "public", "icons");
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

fs.writeFileSync(path.join(iconsDir, "icon-192.png"), createPNG(192, 192));
fs.writeFileSync(path.join(iconsDir, "icon-512.png"), createPNG(512, 512));
fs.writeFileSync(path.join(iconsDir, "icon-maskable-192.png"), createPNG(192, 192));
fs.writeFileSync(path.join(iconsDir, "icon-maskable-512.png"), createPNG(512, 512));

console.log("✅ Static PNG icons generated successfully in public/icons/");
