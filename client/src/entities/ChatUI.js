export class ChatUI {
  constructor(network, inputManager) {
    this.network = network;
    this.input = inputManager;
    this.messagesContainer = document.getElementById('chat-messages');
    this.inputField = document.getElementById('chat-input');
    this.sendBtn = document.getElementById('chat-send');

    this._bindEvents();
  }

  _bindEvents() {
    this.sendBtn.addEventListener('click', () => this._sendMessage());
    
    this.inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this._sendMessage();
    });

    // Обработка сообщений ОТ сервера
    this.network.callbacks.onNewChatMessage = (msg) => {
      this.addMessage(msg.username, msg.text);
    };
  }

  _sendMessage() {
    const text = this.inputField.value.trim();
    if (!text) return;

    // Отправляем на сервер
    this.network.sendMessage(text);

    // Показываем своё сообщение сразу (локально)
    this.addMessage('Вы', text);

    this.inputField.value = '';
    this.inputField.focus();
  }

  addMessage(username, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message';
    
    const time = new Date().toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    msgDiv.innerHTML = `
      <span class="username">${username}:</span> ${text}
      <span class="time">${time}</span>
    `;

    this.messagesContainer.appendChild(msgDiv);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }
}