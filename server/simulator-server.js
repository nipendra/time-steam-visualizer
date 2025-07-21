const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
console.log('✅ WebSocket server running at ws://localhost:8080');

wss.on('connection', (ws) => {
  console.log('Client connected');

  let interval = null;
  let index = 0;

  const sendData = () => {
    if (index >= 11000) {
      clearInterval(interval);
      return;
    }

    const dataPoint = {
      t: Date.now(),
      s: 107804 + index,
      e: Array.from({ length: 8 }, (_, i) =>
        200 + Math.random() * 200 + Math.sin(index * 0.1 + i) * 50
      )
    };

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(dataPoint));
    }

    index++;
  };

  ws.on('message', (message) => {
    const msg = message.toString();
    console.log('[Server received]', msg);

    if (msg === 'START') {
      index = 0;
      clearInterval(interval); // just in case
      interval = setInterval(sendData, 50);
    }

    if (msg === 'STOP') {
      clearInterval(interval);
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
    clearInterval(interval);
  });
});
