const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

let users = {};
let messages = [];

io.on('connection', (socket) => {
  socket.username = "Anonim"; // default

  socket.on('set username', (name) => {
    socket.username = name;
  });
  // Terima nama pengguna
  socket.on('new user', (username) => {
    users[socket.id] = username;
    console.log(`${username} bergabung.`);

    // Kirim pesan lama
    messages.forEach((msg) => {
      socket.emit('chat message', msg);
    });
  });

socket.on('chat message', (msg) => {
  msg.id = uuidv4();
  msg.from = socket.username || 'Anonim'; // kamu bisa buat fitur login nanti
  msg.time = moment().format('HH:mm'); // contoh: 14:35
  messages.push(msg);
  io.emit('chat message', msg);
  if (!msg.text || typeof msg.text !== 'string') return;
    if (msg.text.length > 1000) return; // Tolak pesan terlalu panjang
});


  // Saat pesan dibaca oleh user
  socket.on('message read', (msgId) => {
    const user = users[socket.id];
    const message = messages.find(m => m.id === msgId);

    if (message && user) {
      message.status[user] = 'R';
      io.emit('status update', {
        id: msgId,
        user,
        status: 'R'
      });
    }
  });

  // Saat mengetik
  socket.on('typing', ({ user }) => {
    socket.broadcast.emit('display typing', { user });
  });

  // Berhenti mengetik
  socket.on('stop typing', ({ user }) => {
    socket.broadcast.emit('hide typing', { user });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`Pengguna keluar: ${users[socket.id]}`);
    delete users[socket.id];
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:3000`);
});
