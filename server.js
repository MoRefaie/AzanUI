const http = require('http');
const fs = require('fs');
const path = require('path');
const bonjour = require('bonjour')();

const PORT = process.env.PORT || 8080;
const isPkg = typeof process.pkg !== 'undefined';
const baseDist = isPkg
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
  let reqPath = req.url === '/' ? 'index.html' : req.url.replace(/^\//, '');
  let filePath = path.join(baseDist, reqPath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // SPA fallback: serve index.html
      fs.readFile(path.join(baseDist, 'index.html'), (err2, data2) => {
        if (err2) {
          res.writeHead(404);
          res.end('Not found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data2);
        }
      });
    } else {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      res.end(data);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://Azan.local:${PORT}`);
});