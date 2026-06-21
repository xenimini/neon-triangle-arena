// server/src/socket.js
const { pool } = require('./database/database');

let rooms = new Map(); // roomId -> { players: Map, coins: [], obstacles: [] }

function generateRoomId() {
  return 'room_' + Math.random().toString(36).substring(2, 8);
}

function createGameObjects() {
  const coins = [];
  const obstacles = [];
  
  // Создаём 12 монет
  for (let i = 0; i < 12; i++) {
    coins.push({
      id: 'coin_' + i,
      position: {
        x: (Math.random() - 0.5) * 28,
        z: (Math.random() - 0.5) * 28
      }
    });
  }

  // Создаём 6 опасных кубов
  for (let i = 0; i < 6; i++) {
    obstacles.push({
      id: 'obs_' + i,
      position: {
        x: (Math.random() - 0.5) * 25,
        z: (Math.random() - 0.5) * 25
      }
    });
  }

  return { coins, obstacles };
}

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Игрок подключился:', socket.id);

    let currentRoom = null;
    let playerData = null;

    socket.on('join-game', (user) => {
      playerData = user;
      
      // Создаём или присоединяемся к комнате (максимум 2 игрока для простоты)
      if (rooms.size === 0 || ![...rooms.values()].some(r => r.players.size < 2)) {
        currentRoom = generateRoomId();
        rooms.set(currentRoom, { 
          players: new Map(), 
          ...createGameObjects() 
        });
      } else {
        currentRoom = [...rooms.keys()].find(id => rooms.get(id).players.size < 2);
      }

      const room = rooms.get(currentRoom);
      room.players.set(socket.id, { 
        id: socket.id, 
        username: user.username, 
        color: Math.random() * 0xffffff,
        score: 0,
        hp: 100,
        position: { x: (Math.random()-0.5)*10, z: (Math.random()-0.5)*10 },
        rotation: { y: 0 }
      });

      socket.join(currentRoom);

      // Отправляем данные комнаты всем
      const playersArray = Array.from(room.players.values());
      
      io.to(currentRoom).emit('room-joined', {
        roomId: currentRoom,
        players: playersArray
      });
    });

    socket.on('player-move', (data) => {
      if (!currentRoom) return;
      const room = rooms.get(currentRoom);
      const player = room.players.get(socket.id);
      if (player) {
        player.position = data.position;
        player.rotation = data.rotation;
        
        socket.to(currentRoom).emit('player-moved', {
          id: socket.id,
          position: data.position,
          rotation: data.rotation
        });
      }
    });

    socket.on('chat-message', (message) => {
      if (!currentRoom) return;
      io.to(currentRoom).emit('new-chat-message', {
        username: playerData.username,
        message: message,
        created_at: new Date()
      });
    });

    socket.on('disconnect', () => {
      if (currentRoom && rooms.has(currentRoom)) {
        const room = rooms.get(currentRoom);
        room.players.delete(socket.id);
        
        io.to(currentRoom).emit('player-left', { id: socket.id });

        if (room.players.size === 0) {
          rooms.delete(currentRoom);
        }
      }
      console.log('Игрок отключился:', socket.id);
    });
  });
};