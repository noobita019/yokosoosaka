var http = require('http');
var fs = require('fs');
var path = require('path');

var mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.json': 'application/json'
};

http.createServer(function(req, res) {
  var urlPath = req.url.split('?')[0];
  var filePath = path.join(__dirname, 'yokoso-website', urlPath === '/' ? 'index.html' : urlPath);
  var ext = path.extname(filePath);
  var contentType = mime[ext] || 'application/octet-stream';
  fs.readFile(filePath, function(err, content) {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
}).listen(8080, function() {
  console.log('Server running on http://localhost:8080');
});
