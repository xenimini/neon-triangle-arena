import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());
app.get('/', (req, res) => res.send('NEON ARENA - OK'));

const players = new Map(); // ← храним всех игроков

io.on('connection', (socket) => {
  console.log(`🟢 Игрок подключился: ${socket.id}`);

  socket.on('join-game', (userData) => {
    socket.username = userData.username;
    socket.join('arena');

    players.set(socket.id, {
      id: socket.id,
      username: userData.username
    });

    console.log(`👤 ${userData.username} вошёл в игру`);

    // Отправляем текущему игроку ВСЕХ игроков в комнате
    socket.emit('room-joined', {
      players: Array.from(players.values())
    });

    // Уведомляем остальных о новом игроке
    socket.to('arena').emit('player-joined', {
      id: socket.id,
      username: userData.username
    });
  });

  socket.on('chat-message', (text) => {
    if (!socket.username) return;
    const message = {
      username: socket.username,
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    io.to('arena').emit('new-chat-message', message);
  });

  socket.on('player-move', (data) => {
    socket.to('arena').emit('player-moved', {
      id: socket.id,
      position: data.position,
      rotation: data.rotation
    });
  });

  socket.on('disconnect', () => {
    console.log(`🔴 ${socket.username || socket.id} отключился`);
    players.delete(socket.id);
    io.to('arena').emit('player-left', { id: socket.id });
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 NEON ARENA Server запущен на http://localhost:${PORT}`);
});