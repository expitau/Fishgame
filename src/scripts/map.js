export const maps = [
  {
    currentMap: 0,
    movementColliders: '#',
    slapColliders: '+#',
    tilemap: [
      '                ',
      '       +        ',
      '      ++        ',
      '   ########     ',
      '   #          ++',
      '              ++',
      '+            ###',
      '+     ####   ###',
      '##              ',
      '##  +     ++ +  ',
      '##  ++    ++ +  ',
      '################',
    ],
    spawnPoint: [
      375,
      75,
    ],
    width: 16,
    height: 12,
    pixelSize: 6.25,
    tileSize: 50,
  },
];

// Read tile on tilemap [world coordinates] > [tile symbol]
export function getCurrentTile(gameMap, x, y) {
  if (x > 0 && x < gameMap.width * gameMap.tileSize && y > 0 && y < gameMap.height * gameMap.tileSize) {
    return gameMap.tilemap[Math.floor(y / gameMap.tileSize)].charAt(Math.floor(x / gameMap.tileSize));
  }
  return '#';
}

// Read tiles on tilemap in a small rectangular cluster [world coordinates]
export function getSlapArea(gameMap, x, y) {
  for (let i = -1; i <= 1; i += 1) {
    for (let j = -1; j <= 1; j += 1) {
      if (gameMap.slapColliders.includes(getCurrentTile(gameMap, x + i * gameMap.tileSize * 0.3, y + j * gameMap.tileSize * 0.3))) {
        return true;
      }
    }
  }
  return false;
}
