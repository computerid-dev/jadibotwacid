// Dipakai sebagai pengganti perintah `lt`, karena CLI localtunnel (bin/lt.js)
// nabrak error di Termux/Android gara-gara dependency `openurl` nolak platform android.
// Script ini manggil library localtunnel langsung, tanpa lewat CLI itu.

const localtunnel = require('localtunnel');

const PORT = process.env.PORT || 3000;
const SUBDOMAIN = process.env.LT_SUBDOMAIN || 'jadibotcidwa';

(async () => {
  const tunnel = await localtunnel({ port: PORT, subdomain: SUBDOMAIN });

  console.log('Tunnel aktif, URL publik:', tunnel.url);
  console.log('Isi ini ke BOT_ENGINE_URL di Vercel:', tunnel.url);

  tunnel.on('close', () => {
    console.log('Tunnel ketutup, jalanin ulang: node tunnel.js');
  });

  tunnel.on('error', (err) => {
    console.error('Tunnel error:', err.message);
  });
})();
