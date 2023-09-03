import { startServer } from './server.js';
import { startClient } from './client.js';
import { SERVER_PREFIX } from './types.js';
import { getParamData } from './params.js';
/* global Peer */

export const createGame = () => {
  const params = getParamData();

  if (params.serverId === undefined || params.serverId === '') {
    window.location.href = 'index.html';
    return;
  }

  const loadingText = document.getElementById('loadingText');
  const titleText = params.isServer ? 'Starting server' : 'Connecting to...';
  loadingText.innerHTML = `<div class="no-wrap">${titleText}</div><div class="info">${params.serverId}</div>`;

  if (params.isServer) {
    const server = new Peer(SERVER_PREFIX + params.serverId);

    server.on('open', () => {
      startServer(server);

      if (params.isClient) {
        startClient(params.serverId, params.isServer, params.playerMetadata);
      }
    });
  } else if (params.isClient) {
    startClient(params.serverId, params.isServer, params.playerMetadata);
  }
};

createGame();
