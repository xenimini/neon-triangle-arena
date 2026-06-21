// server/index.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./src/routes/auth');
const socketHandler = require('./src/socket');
const { initDatabase } = require('./src/database/database');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

app.use(cors());
app.use(express.json());

// Статические файлы
app.use(express.static(path.join(__dirname, '../client/dist')));

// API
app.use('/api/auth', authRoutes);

// Catch-all — исправленный вариант
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

socketHandler(io);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await initDatabase();
    console.log('✅ База данных подключена');
  } catch (error) {
    console.error('⚠️ Ошибка БД:', error.message);
  }

  server.listen(PORT, () => {
    console.log(`🚀 Сервер запущен → http://localhost:${PORT}`);
  });
};

startServer();