const WebSocket = require('ws');

const PORT = process.env.PORT || 8080; // Use Railway's PORT or default to 8080
const wss = new WebSocket.Server({ port: PORT });


const clients = new Map();

wss.on('connection', (ws) => {
  const id = Date.now();
  clients.set(id, ws);

  console.log(`Client connected: ${id}`);

ws.on('message', (message) => {
  const data = JSON.parse(message); // Parse the incoming message
  if (data.type === 'updatePosition') {
    //console.log(`Received position update from ${id}:`, data.position);
  }

  // Broadcast the message to all other clients
  for (const [clientId, client] of clients) {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(message); // Ensure this is a string
    }
  }
});

  ws.on('close', () => {
    console.log(`Client disconnected: ${id}`);
    clients.delete(id);
  });
});

console.log(`WebSocket server is running on ws://localhost:${PORT}`);