const params = new URLSearchParams(window.location.search);
const username = params.get('username');
const email = params.get('email');

const socket = new WebSocket('ws://localhost:3000');
const chat = document.getElementById('chat');
const messageInput = document.getElementById('message');
const userList = document.getElementById('userList');

socket.onopen = () => {
  socket.send(JSON.stringify({ type: 'join', username, email }));
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === 'message') {
    const msg = document.createElement('div');
    msg.textContent = `${data.username}: ${data.text}`;
    chat.appendChild(msg);
  }

  if (data.type === 'userList') {
    userList.innerHTML = '';
    data.users.forEach(user => {
      const li = document.createElement('li');
      li.textContent = user;
      userList.appendChild(li);
    });
  }
};

messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && messageInput.value.trim() !== '') {
    socket.send(JSON.stringify({ type: 'message', text: messageInput.value }));
    messageInput.value = '';
  }
});
