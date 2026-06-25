import { Game } from './Game.js';

document.addEventListener('DOMContentLoaded', () => {
  const loading = document.getElementById('loading');
  const nameModal = document.getElementById('name-modal');
  const nameInput = document.getElementById('name-input');
  const startBtn = document.getElementById('start-game');

  nameInput.value = localStorage.getItem('username') || '';

  startBtn.addEventListener('click', () => {
    let username = nameInput.value.trim();
    if (!username) username = 'Игрок' + Math.floor(Math.random() * 9999);

    localStorage.setItem('username', username);

    nameModal.style.display = 'none';
    loading.style.display = 'flex';

    const game = new Game();
    game.start({ username });
  });

  nameModal.style.display = 'flex';
});