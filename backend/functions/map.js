module.exports = [Map, getCollisionArea, getCurrentTile]

function Map(mapId) {
    let map = {
        currentMap: mapId,
        colliders: "#$X",
        tilemap:
            [
                "                ",
                "      0S        ",
                "      []        ",
                "   ########     ",
                "   #          3E",
                "              []",
                "E            ###",
                "]     ####   ###",
                "##              ",
                "##  1     24 *  ",
                "##  []    [] c  ",
                "################"
            ],
        spawnPoint: [100, 100],
    }
    map.width = map.tilemap[0].length
    map.height = map.tilemap.length
    map.pixelSize = 6.25
    map.tileSize = map.pixelSize * 8


    // Read tile on tilemap [tile coordinates] > [tile symbol]
    function getTile(x, y) {
        if (x >= 0 && x < map.width && y >= 0 && y < map.height) {
            return map.tilemap[y].charAt(x);
        }
        return "X";
    }

    // Change tile on tilemap [tile coordinates]
    function setTile(x, y, newTile) {
        map.tilemap[y] = map.tilemap[y].substring(0, x) + newTile + map.tilemap[y].substring(x + 1);
    }

    for (let i = 0; i < map.width; i++) {
        for (let j = 0; j < map.height; j++) {
            // Set spawn point
            if (getTile(i, j) === "S") {
                map.spawnPoint = [(i + 0.5) * map.tileSize, (j + 0.5) * map.tileSize];
            }

            // Set wall tiles
            if (getTile(i, j) === "#" && (getTile(i, j - 1) === "#" || getTile(i, j - 1) === "$")) {
                setTile(i, j, "$");
            }

            if (getTile(i, j) === " ") {
                // Set flooring
                if (getTile(i, j + 1) === "#") {
                    setTile(i, j, "_");
                }

                // Set desk tops
                if (getTile(i, j + 1) === "[" || getTile(i, j + 1) === "]") {
                    setTile(i, j, 0);
                }
            }
        }
    }
    return map;
}
// Read tile on tilemap [world coordinates] > [tile symbol]
function getCurrentTile(gameMap, x, y) {
    if (0 < x && x < gameMap.width * gameMap.tileSize && 0 < y && y < gameMap.height * gameMap.tileSize) {
        return gameMap.tilemap[Math.floor(y / gameMap.tileSize)].charAt(Math.floor(x / gameMap.tileSize));
    }
    return "X";
}

// Read tiles on tilemap in a small rectangular cluster [world coordinates] 
function getCollisionArea(gameMap, x, y) {
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (gameMap.colliders.includes(getCurrentTile(gameMap, x + i * gameMap.tileSize * 0.3, y + j * gameMap.tileSize * 0.3))) {
                return true;
            }
        }
    }
    return false;
}