import { startServer } from './server.js';
import { startClient } from './client.js';
import { SERVER_PREFIX } from './types.js';
import { getParamData } from './params.js';
/* global Peer */

export async function createGame() {
  const params = getParamData();

  if (params.serverId === undefined || params.serverId === '') {
    window.location.href = 'index.html';
    return;
  }

  const loadingText = document.getElementById('loadingText');
  const titleText = params.isServer ? 'Starting server' : 'Connecting to...';
  loadingText.innerHTML = `<div class="no-wrap">${titleText}</div><div class="info">${params.serverId}</div>`;

  if (params.isServer) {
    const response = 
    await fetch("https://qinqii.metered.live/api/v1/turn/credentials?apiKey=4e8a7e31bc4d677c43f8d794ff581ad2dc3e");
  
    // Saving the response in the iceServers array
    const iceServers = await response.json();
    console.log("[server] Using ice servers: ", iceServers)

    const server = new Peer(SERVER_PREFIX + params.serverId, {
      config: {
         iceServers: iceServers,
        //  iceServers: [
        //     { urls: 'turn:server.expitau.com', username: 'expitau', credential: 'ZmlzaGdhbWU=' }
        //  ]
      }
   });

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
