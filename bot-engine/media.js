const { spawn } = require('child_process');
const fs = require('fs/promises');
const os = require('os');
const path = require('path');

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn('ffmpeg', args);
    let stderr = '';
    proc.stderr.on('data', (d) => (stderr += d.toString()));
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error('ffmpeg gagal: ' + stderr.slice(-400)));
    });
    proc.on('error', () => reject(new Error('ffmpeg gak ketemu, jalanin: pkg install ffmpeg')));
  });
}

async function tmpFile(ext) {
  return path.join(os.tmpdir(), `jbw_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`);
}

// Ubah buffer gambar apapun (jpg/png/dll) jadi webp 512x512, siap dipake jadi stiker WA
async function imageBufferToWebp(buffer) {
  const inPath = await tmpFile('img');
  const outPath = await tmpFile('webp');
  await fs.writeFile(inPath, buffer);
  await runFfmpeg([
    '-y', '-i', inPath,
    '-vf', "scale='min(512,iw)':'min(512,ih)':force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0",
    '-vcodec', 'libwebp',
    outPath
  ]);
  const out = await fs.readFile(outPath);
  await fs.unlink(inPath).catch(() => {});
  await fs.unlink(outPath).catch(() => {});
  return out;
}

// Render teks jadi stiker webp 512x512 langsung dari ffmpeg (gak perlu library gambar tambahan)
async function textToWebp(text) {
  const outPath = await tmpFile('webp');
  const safeText = text.replace(/:/g, '\\:').replace(/'/g, "\\'");
  await runFfmpeg([
    '-y',
    '-f', 'lavfi',
    '-i', 'color=c=#16130f:s=512x512',
    '-vf', `drawtext=text='${safeText}':fontcolor=#ff5a1f:fontsize=48:x=(w-text_w)/2:y=(h-text_h)/2:line_spacing=10`,
    '-frames:v', '1',
    '-vcodec', 'libwebp',
    outPath
  ]);
  const out = await fs.readFile(outPath);
  await fs.unlink(outPath).catch(() => {});
  return out;
}

// Ubah buffer gambar apapun jadi jpg (dipake sebelum masuk PDF)
async function imageBufferToJpg(buffer) {
  const inPath = await tmpFile('img');
  const outPath = await tmpFile('jpg');
  await fs.writeFile(inPath, buffer);
  await runFfmpeg(['-y', '-i', inPath, outPath]);
  const out = await fs.readFile(outPath);
  await fs.unlink(inPath).catch(() => {});
  await fs.unlink(outPath).catch(() => {});
  return out;
}

module.exports = { imageBufferToWebp, textToWebp, imageBufferToJpg };
