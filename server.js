// Relay don gian: cac thiet bi cung "room" nhan duoc tin nhan cua nhau.
// Chay: npm install && node server.js   (mac dinh cong 8080, doi bang bien moi truong PORT)
// Cung phuc vu trang dieu khien cho dien thoai tai duong dan "/".
var http = require('http'), fs = require('fs'), path = require('path');
var WebSocketServer = require('ws').Server;
var PORT = process.env.PORT || 8080;

var server = http.createServer(function (req, res) {
  fs.readFile(path.join(__dirname, 'public', 'index.html'), function (err, data) {
    if (err) { res.writeHead(500); res.end('error'); return; }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });
});

var wss = new WebSocketServer({ server: server });
var rooms = {};
wss.on('connection', function (ws, req) {
  var m = /room=([^&]+)/.exec(req.url || '');
  var room = m ? decodeURIComponent(m[1]) : '';
  if (room.length < 8) { ws.close(); return; }   // ma phong phai dai, dong vai tro mat khau
  rooms[room] = rooms[room] || [];
  rooms[room].push(ws);
  ws.on('message', function (data) {
    rooms[room].forEach(function (c) {
      if (c !== ws && c.readyState === 1) { c.send(String(data)); }
    });
  });
  ws.on('close', function () {
    rooms[room] = rooms[room].filter(function (c) { return c !== ws; });
    if (!rooms[room].length) { delete rooms[room]; }
  });
});
server.listen(PORT, function () { console.log('Relay dang chay o cong ' + PORT); });
