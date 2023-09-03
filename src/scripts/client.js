import { CONN_EVENTS, SERVER_PREFIX } from './types.js';
import { physicsTick } from './physics.js';
import { setupGraphics, renderGraphics, addGraphicsEffects } from './render.js';
import { setupCallbacks } from './inputManager.js';
/* global Peer */

let timeOffset = 0;
let lastUpdate = Date.now();

export function setupGame(clientContext) {
  const q5 = setupCallbacks(clientContext);

  setupGraphics(q5).then(() => {
    console.log('[client] Graphics ready');

    // Start render loop
    window.requestAnimationFrame(() => { renderLoop(clientContext, q5); });

    // Start physics loop
    setInterval(() => runPhysicsTick(clientContext), 1000 / 60);
  });
}

function renderLoop(clientContext, q5) {
  renderGraphics(clientContext, q5);
  window.requestAnimationFrame(() => { renderLoop(clientContext, q5); });
}

function runPhysicsTick(clientContext) {
  let deltaTime = Math.round((Date.now() - timeOffset) / 16) - Math.round(lastUpdate / 16);
  while (deltaTime > 0) {
    deltaTime -= 1;
    clientContext.state = physicsTick(clientContext.state).state;
    lastUpdate = (Date.now() - timeOffset);
  }
}

export function startClient(serverId, isServer, playerMetadata) {
  const client = new Peer();

  client.on('open', (clientId) => {
    console.log('[client] connecting...');

    const conn = client.connect(SERVER_PREFIX + serverId);

    const clientContext = {
      sendEvent(eventType, data) {
        conn.send({
          type: eventType,
          data,
          time: Date.now() - timeOffset,
        });
      },
      state: {
        map: 0,
        players: [],
      },
      clientId,
      serverId,
      allowInput: true,
      isServer,
      connected: false,
      heartbeat: 0,
    };

    conn.on('open', () => {
      console.log('[client] connected');

      setupGame(clientContext);

      conn.on('data', (data) => {
        switch (data.type) {
          case CONN_EVENTS.clientInit:
            clientContext.state = data.data;
            clientContext.connected = true;
            conn.send({
              type: CONN_EVENTS.clientResponse,
              data: {
                name: playerMetadata.name,
                color: playerMetadata.color,
              },
            });
            break;
          case CONN_EVENTS.serverUpdate:
            clientContext.state = data.data.state;
            lastUpdate = data.data.timeStamp;
            timeOffset = 0.7 * timeOffset + 0.3 * (Date.now() - lastUpdate);
            break;
          case CONN_EVENTS.heartbeatResponse:
            clientContext.heartbeat = 0;
            break;
          case CONN_EVENTS.heartbeat:
            conn.send({ type: CONN_EVENTS.heartbeatResponse });
            break;
          case CONN_EVENTS.serverEffect:
            addGraphicsEffects(data.data);
            break;
          default: break;
        }
      });
      setInterval(() => clientHeartbeat(conn, clientContext), 1000);
    });
    setTimeout(() => clientTimeout(conn, clientContext), 5000);
  });
}

function clientHeartbeat(conn, clientContext) {
  conn.send({ type: CONN_EVENTS.heartbeat });
  clientContext.heartbeat += 1;
  if (clientContext.heartbeat > 5) {
    conn.close();
    clientContext.connected = false;
    serverTimedOut(clientContext.isServer);
  }
}

function clientTimeout(conn, clientContext) {
  setTimeout(() => {
    if (clientContext.connected === false) {
      conn.close();
      serverTimedOut(clientContext.isServer);
    }
  }, 5000);
}

function serverTimedOut(isServer) {
  const loadingText = document.getElementById('loadingText');
  loadingText.innerText = `Unable to ${isServer ? 'start' : 'find'} Server.`;
  setTimeout(() => {
    location.href = `index.html${location.search}`;
  }, 1300);
}
