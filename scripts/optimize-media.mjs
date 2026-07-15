import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, renameSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpegPath from 'ffmpeg-static';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const assets = join(root, 'public', 'assets');
const tmp = join(root, '.tmp-optimize');

mkdirSync(tmp, { recursive: true });

const kb = (file) => Math.round(statSync(file).size / 1024);

async function writeWebp(input, output, { width, quality = 78 }) {
  await sharp(input)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 6 })
    .toFile(output);
  console.log(`${output.replace(root, '')}: ${kb(output)} KB`);
}

async function writeJpeg(input, output, { width, quality = 78 }) {
  await sharp(input)
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality, mozjpeg: true })
    .toFile(output);
  console.log(`${output.replace(root, '')}: ${kb(output)} KB`);
}

function compressVideo(input, output, { scale, crf = 28, fps = 24 }) {
  const args = [
    '-y',
    '-i', input,
    '-vf', `scale=${scale}:-2`,
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-crf', String(crf),
    '-an',
    '-movflags', '+faststart',
    '-pix_fmt', 'yuv420p',
    '-r', String(fps),
    output,
  ];
  const result = spawnSync(ffmpegPath, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    throw new Error(`ffmpeg failed for ${input}`);
  }
  console.log(`${output.replace(root, '')}: ${kb(output)} KB`);
}

function replaceFile(from, to) {
  copyFileSync(from, to);
}

async function optimizeImages() {
  const jobs = [
    ['iriguti.png', 'iriguti.webp', 1200, 80],
    ['theater.png', 'theater.webp', 1400, 78],
    ['tennai.png', 'tennai.webp', 1000, 78],
    ['tennai02.png', 'tennai02.webp', 1400, 78],
    ['sp-iriguti.jpg', 'sp-iriguti.webp', 750, 76],
    ['sp-theater.jpg', 'sp-theater.webp', 750, 76],
    ['item01.jpg', 'item01.webp', 900, 78],
    ['item02.jpg', 'item02.webp', 900, 78],
    ['sp-item01.jpg', 'sp-item01.webp', 750, 76],
    ['tennai02.jpg', 'tennai02-info.webp', 750, 78],
  ];

  for (const [src, dest, width, quality] of jobs) {
    await writeWebp(join(assets, src), join(assets, dest), { width, quality });
  }

  await writeJpeg(join(assets, 'theater.png'), join(assets, 'theater-poster.jpg'), {
    width: 1280,
    quality: 62,
  });

  // Compact favicon from oversized ico/png source
  const faviconSource = join(root, 'public', 'favicon.ico');
  const faviconPng = join(root, 'public', 'favicon-32.png');
  await sharp(faviconSource)
    .resize(32, 32, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toFile(faviconPng);

  // Also emit a small multi-size ICO-compatible PNG set referenced as icon
  const favicon192 = join(root, 'public', 'favicon.png');
  await sharp(faviconSource)
    .resize(48, 48, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toFile(favicon192);

  // Replace bloated favicon.ico with 48px PNG bytes renamed is not ideal for ico.
  // Keep a tiny true ICO by writing PNG and pointing HTML to favicon.png.
  console.log(`favicon-32.png: ${kb(faviconPng)} KB`);
  console.log(`favicon.png: ${kb(favicon192)} KB`);
}

function optimizeVideos() {
  const videos = [
    ['movie01.mp4', 'movie01.mp4', '1280', 28, 24],
    ['movie02.mp4', 'movie02.mp4', '1280', 29, 24],
    ['sp-movie01.mp4', 'sp-movie01.mp4', '720', 30, 24],
    ['sp-movie02.mp4', 'sp-movie02.mp4', '720', 30, 24],
  ];

  for (const [src, dest, scale, crf, fps] of videos) {
    const input = join(assets, src);
    const output = join(tmp, dest);
    const before = kb(input);
    compressVideo(input, output, { scale, crf, fps });
    const after = kb(output);
    if (after < before) {
      replaceFile(output, input);
      console.log(`replaced ${src}: ${before} -> ${after} KB`);
    } else {
      console.log(`kept original ${src}: compressed ${after} KB >= ${before} KB`);
    }
  }
}

function removeHeavySources() {
  const removable = [
    'iriguti.png',
    'theater.png',
    'tennai.png',
    'tennai02.png',
  ];
  for (const name of removable) {
    const file = join(assets, name);
    try {
      unlinkSync(file);
      console.log(`removed ${name}`);
    } catch {
      // ignore
    }
  }

  // Replace oversized favicon.ico with a tiny PNG-based fallback copy
  const tinyIco = join(root, 'public', 'favicon.png');
  const legacyIco = join(root, 'public', 'favicon.ico');
  try {
    unlinkSync(legacyIco);
  } catch {
    // ignore
  }
  // Browsers accepting png as favicon; also keep .ico alias as copy for old clients
  copyFileSync(tinyIco, legacyIco);
  console.log(`favicon.ico replaced: ${kb(legacyIco)} KB`);
}

await optimizeImages();
optimizeVideos();
removeHeavySources();

writeFileSync(join(tmp, 'done'), 'ok');
console.log('Media optimization complete.');
