/* eslint-disable no-param-reassign */
import { INPUT_TYPES, CONN_EVENTS } from './types.js';
import { physicsTick, physicsInput } from './physics.js';

let lastTickUpdate = Date.now();
let gameState = {
  map: 0,
  players: [],
};

export function startServer(server) {
  let effects = [];
  console.log(`[server] Room code: ${server.id}`);

  const connections = {};

  server.on('connection', (conn) => {
    console.log(`[server] Added connection ${conn.peer}`);

    connections[conn.peer] = { heartbeat: 0, connection: conn };

    conn.on('open', () => {
      gameState = serverInput(Date.now(), INPUT_TYPES.connect, { id: conn.peer }).state;

      conn.on('data', (data) => {
        let inputResponse;
        switch (data.type) {
          case CONN_EVENTS.clientUpdate:
            // eslint-disable-next-line no-case-declarations
            inputResponse = serverInput(data.time, INPUT_TYPES.move, { input: data.data, id: conn.peer });
            effects = [...effects, ...inputResponse.effects];
            gameState = inputResponse.state;
            break;
          case CONN_EVENTS.heartbeat:
            conn.send({ type: CONN_EVENTS.heartbeatResponse });
            break;
          case CONN_EVENTS.heartbeatResponse:
            connections[conn.peer].heartbeat = 0;
            break;
          case CONN_EVENTS.metaDataChange:
            inputResponse = serverInput(Date.now(), INPUT_TYPES.settings, { name: data.data.name, color: data.data.color, id: conn.peer });
            effects = [...effects, ...inputResponse.effects];
            gameState = inputResponse.state;
            break;
          default: break;
        }
      });

      conn.on('close', () => {
        delete connections[conn.peer];
        gameState = serverInput(Date.now(), INPUT_TYPES.disconnect, { id: conn.peer }).state;
      });

      conn.send({ type: CONN_EVENTS.clientInit, data: gameState });
    });
  });

  // Update serverside physics
  setInterval(() => runPhysicsTick(), 1000 / 20);

  // Emit server heartbeat
  setInterval(() => serverHeartbeat(connections), 1000);

  // Cache current state
  setInterval(() => cacheState(), 1000 * 2);

  // Emit updates
  setInterval(() => { emitUpdate(connections, effects); effects = []; }, 1000 / 10);
}

function runPhysicsTick() {
  ({ state: gameState } = computePhysics(gameState, lastTickUpdate, []));
}

function emitUpdate(connections, effects) {
  Object.values(connections).forEach((conn) => {
    conn.connection.send({
      type: CONN_EVENTS.serverUpdate,
      data: { timeStamp: lastTickUpdate, state: gameState },
    });

    if (effects.length > 0) {
      conn.connection.send({ type: CONN_EVENTS.serverEffect, data: effects });
    }
  });
}

function serverHeartbeat(connections) {
  Object.values(connections).forEach((conn) => {
    conn.connection.send({ type: CONN_EVENTS.heartbeat });
    conn.heartbeat += 1;
    if (conn.heartbeat > 5) {
      conn.connection.close();
      delete connections[conn.peer];
      gameState.players = gameState.players.filter((player) => player.id !== conn.peer);
    }
  });
}

function cacheState() {
  gameState = serverInput(Date.now(), INPUT_TYPES.cache, {}).state;
}

function saveInput(inputQueue, inputTime, type, data) {
  inputQueue.push({
    time: inputTime, state: structuredClone(gameState), type, data, effected: false,
  });
}

// Server specific rollback handling
export function serverInput(time, type, data) {
  console.log(`[server] Handling server input ${Date.now() - time}ms early`);

  let savedInputs = [];

  // If no saved input, rollback as far as possible
  if (savedInputs.length === 0) {
    time = Date.now();
    saveInput(savedInputs, time, type, data);
  } else {
    const subsequentInputs = savedInputs.filter((input) => input.time < time);
    let lastInput;

    if (subsequentInputs.length === 0) {
      [lastInput] = savedInputs.sort((a, b) => a.time - b.time);
      time = lastInput.time;
    } else {
      [lastInput] = subsequentInputs.sort((a, b) => b.time - a.time);
    }

    saveInput(savedInputs, time, type, data);

    lastTickUpdate = lastInput.time;
    time = lastInput.time;
    gameState = structuredClone(lastInput.state);
  }

  savedInputs = savedInputs.filter((x) => x.time >= Date.now() - 10000);
  return computePhysics(gameState, time, savedInputs);
}

// Compute all physics from state from time until now, with inputs
function computePhysics(state, time, savedInputs) {
  let effects = [];

  // Last known correct state
  let lastTime = time;

  // Compute all physics from last known correct state until first input after lastTime
  const processQueue = savedInputs.filter((x) => x.time >= lastTime).sort((a, b) => a.time - b.time);
  // eslint-disable-next-line no-restricted-syntax
  for (const input of processQueue) {
    state = computePartialPhysics(state, lastTime, input.time);
    input.state = structuredClone(state);
    let newEffects = [];
    ({ state, effects: newEffects } = physicsInput(state, input.type, input.data));

    if (!input.effected) {
      effects = [...effects, ...newEffects];
      input.effected = true;
    }
    lastTime = input.time;
  }
  state = computePartialPhysics(state, lastTime, Date.now());
  lastTickUpdate = Date.now();
  return { state, effects };
}

function computePartialPhysics(partialState, timeA, timeB) {
  let deltaFrames = Math.round(timeB / 16) - Math.round(timeA / 16);
  while (deltaFrames > 0) {
    deltaFrames -= 1;
    partialState = physicsTick(partialState).state;
  }
  return partialState;
}
