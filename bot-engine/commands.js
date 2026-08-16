const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { PDFDocument } = require('pdf-lib');
const { imageBufferToWebp, textToWebp, imageBufferToJpg } = require('./media');

function getText(msg) {
  return (
    msg.message?.conversation ||
    msg.message?.extendedTextMessage?.text ||
    msg.message?.imageMessage?.caption ||
    ''
  ).trim();
}

function getImageTarget(msg) {
  if (msg.message?.imageMessage) return msg;
  const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
  if (quoted?.imageMessage) return { message: quoted, key: msg.key };
  return null;
}

const MENU = `*JADI BOT WA — MENU*

.menu — lihat daftar command ini
.stiker — kirim/reply gambar pake caption ini buat jadi stiker
.stikertext <teks> — bikin stiker dari teks
.pdf — reply gambar pake caption ini buat diubah jadi PDF
.kalkulasi <ekspresi> — hitung angka, contoh: .kalkulasi 20*5

_by Nugroho Y.R._`;

async function handleMessage(sock, msg) {
  const from = msg.key.remoteJid;
  const text = getText(msg);
  if (!text.startsWith('.')) return;

  const [cmd, ...rest] = text.split(' ');
  const args = rest.join(' ');

  if (cmd === '.menu') {
    return sock.sendMessage(from, { text: MENU });
  }

  if (cmd === '.stiker') {
    const target = getImageTarget(msg);
    if (!target) {
      return sock.sendMessage(from, { text: 'Kirim gambar dengan caption .stiker, atau reply gambar pake .stiker' });
    }
    try {
      const buffer = await downloadMediaMessage(target, 'buffer', {});
      const webp = await imageBufferToWebp(buffer);
      return sock.sendMessage(from, { sticker: webp });
    } catch (e) {
      console.error(e);
      return sock.sendMessage(from, { text: 'Gagal bikin stiker, coba lagi' });
    }
  }

  if (cmd === '.stikertext') {
    if (!args) return sock.sendMessage(from, { text: 'Contoh: .stikertext Halo Dunia' });
    try {
      const webp = await textToWebp(args.slice(0, 60));
      return sock.sendMessage(from, { sticker: webp });
    } catch (e) {
      console.error(e);
      return sock.sendMessage(from, { text: 'Gagal bikin stiker, coba lagi' });
    }
  }

  if (cmd === '.pdf') {
    const target = getImageTarget(msg);
    if (!target) {
      return sock.sendMessage(from, { text: 'Kirim gambar dengan caption .pdf, atau reply gambar pake .pdf' });
    }
    try {
      const buffer = await downloadMediaMessage(target, 'buffer', {});
      const jpgBuffer = await imageBufferToJpg(buffer);

      const pdfDoc = await PDFDocument.create();
      const jpgImage = await pdfDoc.embedJpg(jpgBuffer);
      const page = pdfDoc.addPage([jpgImage.width, jpgImage.height]);
      page.drawImage(jpgImage, { x: 0, y: 0, width: jpgImage.width, height: jpgImage.height });
      const pdfBytes = await pdfDoc.save();

      return sock.sendMessage(from, {
        document: Buffer.from(pdfBytes),
        mimetype: 'application/pdf',
        fileName: 'hasil.pdf'
      });
    } catch (e) {
      console.error(e);
      return sock.sendMessage(from, { text: 'Gagal bikin PDF, coba lagi' });
    }
  }

  if (cmd === '.kalkulasi') {
    if (!/^[0-9+\-*/().\s]+$/.test(args)) {
      return sock.sendMessage(from, { text: 'Cuma boleh angka dan operator +-*/(), contoh: .kalkulasi 20*5' });
    }
    try {
      const result = Function(`"use strict"; return (${args})`)();
      return sock.sendMessage(from, { text: `Hasil: ${result}` });
    } catch {
      return sock.sendMessage(from, { text: 'Ekspresi gak valid' });
    }
  }
}

module.exports = { handleMessage };
