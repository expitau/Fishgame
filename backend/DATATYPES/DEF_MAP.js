let Map = class {
    constructor(mapId) {
        if (typeof mapId === 'object'){
            Object.assign(this, mapId)
            return;
        }

        this.currentMap = mapId;
        this.tilemap = [
            [
                "                ",
                "                ",
                "      0S        ",
                "      []        ",
                "     ######     ",
                "            30  ",
                "            []  ",
                "  ####    ####  ",
                "                ",
                "    10    24 *  ",
                "    []    [] c  ",
                "################"
            ],
            [
                "                ",
                "                ",
                "                ",
                "                ",
                "     ######     ",
                "                ",
                "  S             ",
                " ## ## ## ## ## ",
                "                ",
                "                ",
                "                ",
                "MMMMMMMMMMMMMMMM"
            ]
        ][mapId]; 

        this.width = this.tilemap[0].length;
        this.height = this.tilemap.length;
        this.pixelSize = 6.25;
        this.tileSize = this.pixelSize * 8;
        this.spawnPoint = [100, 100];
        this.levelGen();
    }

    // Generate the level tilemap
    levelGen(){
        for(let i = 0; i < this.width; i++){
            for(let j = 0; j < this.height; j++){
                // Set spawn point
                if (this.getTile(i, j) === "S") {
                    this.spawnPoint = [(i + 0.5) * this.tileSize, (j + 0.5) * this.tileSize];
                }

                if (this.getTile(i, j) === " ") {
                    // Set flooring
                    if(this.getTile(i, j + 1) === "#"){
                        this.setTile(i, j, "_");
                    }

                    // Set desk tops
                    if(this.getTile(i, j + 1) === "[" || this.getTile(i, j + 1) === "]"){
                        this.setTile(i, j, 0);
                    }
                }
            }
        }
    }

    // Read tile on tilemap [tile coordinates]
    getTile (x, y){
        return this.tilemap[y].charAt(x);
    }

    // Change tile on tilemap [tile coordinates]
    setTile (x, y, newTile){
        this.tilemap[y] = this.tilemap[y].substring(0, x) + newTile + this.tilemap[y].substring(x + 1);
    }

    // Read tile on tilemap [world coordinates] 
    getCurrentTile (x, y){
        if (0 < x && x < this.width * this.tileSize && 0 < y && y < this.height * this.tileSize){
            return this.tilemap[Math.floor(y / this.tileSize)].charAt(Math.floor(x / this.tileSize));
        }
        return "#";
    }

    // Read tiles on tilemap in a small rectangular cluster [world coordinates] 
    getTileCluster(x, y){
        for(let i = -1; i <= 1; i ++){
            for(let j = -1; j <= 1; j ++){
                if(gameMap.getCurrentTile(x + i * gameMap.tileSize * 0.3, y + j * gameMap.tileSize * 0.3) === "#"){
                    return true;
                }
            }
        }
        return false;
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
    module.exports = Map
}