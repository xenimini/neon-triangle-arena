import { Game } from './Game.js';

document.addEventListener('DOMContentLoaded', () => {
  const loading = document.getElementById('loading');
  
  let username = localStorage.getItem('username') || 
                 prompt('Введите имя для игры:') || 
                 'Игрок' + Math.floor(Math.random() * 9999);

  localStorage.setItem('username', username);

  console.log(`✅ Игрок: ${username}`);

  const game = new Game();
  
  // Временный хак — запускаем игру даже без сети
  setTimeout(() => {
    if (loading) loading.style.display = 'none';
    
    // Имитируем успешное подключение
    game.localPlayerId = 'local';
    const fakeData = {
      players: [{ id: 'local', username: username }]
    };
    if (game.network.callbacks.onRoomJoined) {
      game.network.callbacks.onRoomJoined(fakeData);
    }
  }, 800);

  game.start({ id: 'local', username: username });
});