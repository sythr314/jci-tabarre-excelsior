const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PREVIEW_FILE = path.join(__dirname, 'preview.html');

const server = http.createServer((req, res) => {
  fs.readFile(PREVIEW_FILE, 'utf8', (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Erreur lors de la lecture de preview.html');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🇭🇹 JCI Tabarre Excelsior — Serveur Local Prêt !`);
  console.log(`👉 Ouvrez votre navigateur sur : http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    const ALT_PORT = 3001;
    server.listen(ALT_PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🇭🇹 JCI Tabarre Excelsior — Serveur Local Prêt !`);
      console.log(`👉 Ouvrez votre navigateur sur : http://localhost:${ALT_PORT}`);
      console.log(`======================================================\n`);
    });
  } else {
    console.error('Erreur serveur:', e);
  }
});
