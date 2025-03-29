const WebSocket = require('ws');

const PORT = process.env.PORT || 8081; // Use Railway’s assigned port

const wss = new WebSocket.Server({ port: PORT });

const clients = new Map();

wss.on('connection', (ws) => {
  const id = Date.now();
  clients.set(id, ws);

  console.log(`Client connected: ${id}`);

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'updatePosition') {
      // console.log(`Received position update from ${id}:`, data.position);
    }

    // Broadcast message to all clients except the sender
    for (const [clientId, client] of clients) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  });

  ws.on('close', () => {
    console.log(`Client disconnected: ${id}`);
    clients.delete(id);
  });
});

// Use the correct domain in logs
console.log(`WebSocket server is running on wss://multiplayer-production-fae6.up.railway.app`);
