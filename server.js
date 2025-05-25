const http = require('http');
const fs = require('fs');
const path = require('path');
const bonjour = require('bonjour')();

const PORT = process.env.PORT || 8080;
const isPkg = typeof process.pkg !== 'undefined';
const staticPath = isPkg
  ? path.join(path.dirname(process.execPath), 'dist')
  : path.join(__dirname, 'dist');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

bonjour.publish({ name: 'AzanUI', type: 'http', port: PORT, host: 'Azan.local' });

const server = http.createServer((req, res) => {
  let filePath = path.join(staticPath, req.url === '/' ? 'index.html' : req.url);

  // If the file does not exist, serve index.html (SPA fallback)
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(staticPath, 'index.html');
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://Azan.local:${PORT}`);
});