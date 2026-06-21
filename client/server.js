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

io.on('connection', (socket) => {
  console.log(`🟢 Игрок подключился: ${socket.id}`);

  socket.on('join-game', (userData) => {
    socket.username = userData.username;
    socket.playerId = userData.id;
    socket.join('arena');

    console.log(`👤 ${userData.username} вошёл в игру`);

    // Отправляем данные о комнате
    socket.emit('room-joined', {
      players: [{ id: socket.id, username: userData.username }]
    });

    // Уведомляем остальных
    socket.to('arena').emit('player-joined', {
      id: socket.id,
      username: userData.username
    });
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
    io.to('arena').emit('player-left', { id: socket.id });
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 NEON ARENA Server запущен на http://localhost:${PORT}`);
});