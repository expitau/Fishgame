import { getCurrentTile, getSlapArea, maps } from './map.js';
import { INPUT_TYPES } from './types.js';

// On physics tick, modify state
export function physicsTick(initialState) {
  const state = structuredClone(initialState);

  // Loop through all players
  // eslint-disable-next-line no-restricted-syntax
  for (const player of state.players) {
    // Add gravity
    player.vy += 0.06;

    // Add air resistance
    player.vy *= 0.998;
    player.vx *= 0.997;
    player.vr *= 0.995;

    // Calculate next position
    const newPosX = player.x + player.vx;
    const newPosY = player.y + player.vy;

    // Test for x coordinate collisions
    if (!maps[state.map].movementColliders.includes(getCurrentTile(maps[state.map], newPosX + ((newPosX > player.x) ? 1 : -1) * maps[state.map].pixelSize, player.y))) {
      // On no collision, update player position
      player.x = newPosX;
    } else {
      // On collision, bounce x velocity with energy lost
      player.vx *= -0.9;

      // Set player rotation velocity based on current y velocity
      player.vr = player.vy * (player.vx > 0 ? 1 : -1) * 0.015;
    }

    // Test for y coordinate collision
    if (!maps[state.map].movementColliders.includes(getCurrentTile(maps[state.map], player.x, newPosY + ((newPosY > player.y) ? 1 : -1) * maps[state.map].pixelSize))) {
      // On no collision, update player position
      player.y = newPosY;
    } else {
      // On collision, bounce y velocity with energy lost
      player.vy *= -0.9;

      // Set player rotation velocity based on current x velocity and whether a floor or ceiling was hit
      if (Math.abs(player.vx) > 0.7) {
        player.vr = player.vx * (player.vy > 0 ? -0.5 : 1) * 0.02;
      } else {
        player.vr = player.vx * (player.vy > 0 ? 1 : -1) * 0.005;
      }

      // If player rotation velocity is lower than threthhold, update player rotation to slowly align to surface
      if (Math.abs(player.vr) < 0.2) {
        if (player.r < Math.PI / 2) {
          player.r *= 0.6;
        } else if (player.r > Math.PI * 1.5) {
          player.r = 2 * Math.PI + (player.r - 2 * Math.PI) * 0.6;
        } else {
          player.r = Math.PI + (player.r - Math.PI) * 0.6;
        }
      }
    }

    // Update player rotation
    player.r += player.vr;

    // Bound player rotation between 0 and 2 * PI
    player.r = ((Math.PI * 4) + player.r) % (Math.PI * 2);
  }

  return { state };
}

// On player input
export function physicsInput(initialState, type, data) {
  const state = structuredClone(initialState);
  const effects = [];

  if (type === INPUT_TYPES.move) {
    const { input } = data;
    const { id } = data;

    const player = state.players.filter((p) => p.id === id)[0];

    // Break cursor into x,y components
    const dx = Math.sin(input.cursorR);
    const dy = Math.cos(input.cursorR);
    let pvp = false;

    // If player can hit a player
    // eslint-disable-next-line no-restricted-syntax
    for (const otherPlayer of state.players) {
      if (otherPlayer.id !== player.id) {
        if (((player.x + dx * 60 - otherPlayer.x) ** 2 + (player.y + dy * 60 - otherPlayer.y) ** 2) ** 0.5 < 7 * maps[state.map].pixelSize
                    || ((player.x - otherPlayer.x) ** 2 + (player.y - otherPlayer.y) ** 2) ** 0.5 < 7 * maps[state.map].pixelSize) {
          // Set hit power
          const power = 7;

          // Apply new player velocities
          player.vx = -power * dx;
          player.vy = -power * dy;
          player.vr = 0.2 * (player.vx > 0 ? 1 : -1);
          otherPlayer.vx = power * dx;
          otherPlayer.vy = power * dy;
          otherPlayer.vr = -player.vr;
          otherPlayer.health -= 1;

          // Update player rotation to point of contact
          player.r = (input.cursorR + Math.PI) % (Math.PI * 2);

          // Add slap effect
          effects.push({
            name: 'impact',
            x: (otherPlayer.x + player.x) / 2,
            y: (otherPlayer.y + player.y) / 2,
            time: 15,
          });

          // On Player death
          if (otherPlayer.health <= 0) {
            effects.push({
              name: 'splat',
              x: otherPlayer.x,
              y: otherPlayer.y,
              color: otherPlayer.color,
              r: player.r,
              time: 15,
            });

            effects.push({
              name: 'shake',
              time: 25,
              id: otherPlayer.id,
            });
            otherPlayer.health = 3;
            [otherPlayer.x, otherPlayer.y] = maps[state.map].spawnPoint;
            otherPlayer.vx = 0;
            otherPlayer.vy = 0;
            otherPlayer.vr = 0;
          } else {
            effects.push({
              name: 'splat',
              x: otherPlayer.x,
              y: otherPlayer.y,
              color: otherPlayer.color,
              r: player.r,
              time: 2,
            });
            effects.push({
              name: 'shake',
              time: 5,
              id: otherPlayer.id,
            });
          }
          pvp = true;
        }
      }
    }

    // If player can hit a tile
    if (!pvp && getSlapArea(maps[state.map], player.x + dx * 60, player.y + dy * 60)) {
      // Set hit power
      const power = 7;

      // Calculate what factor of new movement to conserved momentum to use on both the x and y axis
      const xFactor = Math.min(Math.max(Math.abs((-power * dx) / player.vx), 0.01), 0.99);
      const yFactor = Math.min(Math.max(Math.abs((-power * dy) / player.vy), 0.01), 0.99);

      // Apply new player velocities
      player.vx = (-power * dx) * xFactor + player.vx * (1 - xFactor);
      player.vy = (-power * dy) * yFactor + player.vy * (1 - yFactor);
      player.vr = 0.2 * (player.vx > 0 ? 1 : -1);

      // Update player rotation to point of contact
      player.r = (input.cursorR + Math.PI) % (Math.PI * 2);

      // Add slap effect
      effects.push({
        name: 'impact',
        x: player.x + dx * 15,
        y: player.y + dy * 15,
        time: 15,
      });
    }
  } else if (type === INPUT_TYPES.connect) {
    const { id } = data;
    console.log(`[server] Adding player ${id}}`);
    state.players ??= [];
    state.players.push({
      id,
      x: maps[state.map].spawnPoint[0],
      y: maps[state.map].spawnPoint[1],
      r: 0,
      vx: 0,
      vy: 0,
      vr: 0,
      health: 3,
      color: 0,
      name: '',
    });
  } else if (type === INPUT_TYPES.disconnect) {
    const { id } = data;
    console.log(`[server] Removing player ${id}}`);
    state.players = state.players.filter((player) => player.id !== id);
  } else if (type === INPUT_TYPES.settings) {
    const player = state.players.find((p) => p.id === data.id);
    const { name, color } = data;
    if (player !== undefined) {
      player.name = name ?? '';
      player.color = color ?? 0;
    }
  } else if (type === INPUT_TYPES.cache) {
    // no side effects, just stores state and effects
  }

  return { state, effects };
}
