// Service Worker for cross-tab communication
const CHANNEL_NAME = 'data-stream';

let currentDataPoint = null;
let connectedTabs = new Set();

// Handle installation
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Handle activation
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Handle messages from tabs
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  console.log('SW received message:', type, data);
  
  switch (type) {
    case 'REGISTER_TAB':
      connectedTabs.add(event.source.id);
      console.log(`Tab registered: ${event.source.id}, total tabs: ${connectedTabs.size}`);
      
      // Send current data point to newly registered tab
      if (currentDataPoint) {
        event.source.postMessage({
          type: 'DATA_UPDATE',
          data: currentDataPoint
        });
      }
      break;
      
    case 'DATA_POINT':
      currentDataPoint = data;
      console.log('Broadcasting data point:', currentDataPoint);
      
      // Broadcast to all connected tabs
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'DATA_UPDATE',
            data: currentDataPoint
          });
        });
      });
      break;
      
    case 'KEYBOARD_EVENT':
      console.log('Broadcasting keyboard event:', data);
      // Broadcast keyboard events to all tabs
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          if (client.id !== event.source.id) {
            client.postMessage({
              type: 'KEYBOARD_EVENT',
              data: data
            });
          }
        });
      });
      break;
      
    default:
      console.log('Unknown message type:', type);
  }
});

// Handle tab close
self.addEventListener('beforeunload', (event) => {
  connectedTabs.delete(event.source.id);
});

console.log('Service Worker loaded');