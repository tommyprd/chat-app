const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 });

let users = new Map();

function broadcast(data) {
  const message = JSON.stringify(data);
  for (let client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

wss.on('connection', (ws) => {
  let username = null;

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.type === 'join') {
      username = data.username;
      users.set(ws, username);
      broadcast({ type: 'userList', users: Array.from(users.values()) });
    }

    if (data.type === 'message') {
      broadcast({ type: 'message', username, text: data.text });
    }
  });

  ws.on('close', () => {
    users.delete(ws);
    broadcast({ type: 'userList', users: Array.from(users.values()) });
  });
});

console.log("WebSocket server running on ws://localhost:3000");
