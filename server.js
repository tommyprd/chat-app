const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

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

app.use(express.static(path.join(__dirname)));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
