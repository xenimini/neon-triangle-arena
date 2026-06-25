import { io } from 'socket.io-client';
import { SOCKET_URL } from './config/network.js';

export class NetworkManager {
  constructor() {
    this.socket = null;
    this.callbacks = {
      onRoomJoined: null,
      onPlayerJoined: null,
      onPlayerLeft: null,
      onPlayerMoved: null,
      onNewChatMessage: null,
    };
  }

  connect(userData) {
    console.log(`🔌 Пытаюсь подключиться к ${SOCKET_URL}`);

    this.socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionAttempts: 5,
      timeout: 10000,
      transports: ['polling', 'websocket']
    });

    this.socket.on('connect', () => {
      console.log('✅ Подключено к серверу!');
      this.socket.emit('join-game', userData);
    });

    this.socket.on('connect_error', (err) => {
      console.error('❌ Ошибка подключения:', err.message);
    });

    this.socket.on('disconnect', () => {
      console.warn('🔴 Отключено от сервера');
    });

    // Остальные обработчики
    this.socket.on('room-joined', (data) => {
      if (this.callbacks.onRoomJoined) this.callbacks.onRoomJoined(data);
    });

    this.socket.on('player-joined', (player) => {
      if (this.callbacks.onPlayerJoined) this.callbacks.onPlayerJoined(player);
    });

    this.socket.on('player-left', (data) => {
      if (this.callbacks.onPlayerLeft) this.callbacks.onPlayerLeft(data);
    });

    this.socket.on('player-moved', (data) => {
      if (this.callbacks.onPlayerMoved) this.callbacks.onPlayerMoved(data);
    });

    this.socket.on('new-chat-message', (msg) => {
      if (this.callbacks.onNewChatMessage) this.callbacks.onNewChatMessage(msg);
    });
  }

  sendMove(position, rotation) {
    if (this.socket?.connected) this.socket.emit('player-move', { position, rotation });
  }

  sendMessage(message) {
    if (this.socket?.connected) this.socket.emit('chat-message', message);
  }

  disconnect() {
    if (this.socket) this.socket.disconnect();
  }
}