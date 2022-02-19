let Map = class {
    constructor(mapId) {
        if (typeof mapId === 'object'){
            Object.assign(this, mapId)
            return;
        }

        this.currentMap = mapId;
        this.colliders = "#%$X";
        this.tilemap = [
            [
                "                ",
                "      0S        ",
                "      []        ",
                "   ########     ",
                "   ##         3E",
                "              []",
                "E           ####",
                "]     ####      ",
                "##              ",
                "##  1     24 *  ",
                "##  []    [] c  ",
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

                // Set wall tiles
                if (this.getTile(i, j) === "#" && (this.getTile(i, j - 1) === "#" || this.getTile(i, j - 1) === "$")) {
                    this.setTile(i, j, "$");
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

    // Read tile on tilemap [tile coordinates] > [tile symbol]
    getTile (x, y){
        if(x >= 0 && x < this.width && y >= 0 && y < this.height){
            return this.tilemap[y].charAt(x);
        }
        return "X";
    }

    // Change tile on tilemap [tile coordinates]
    setTile (x, y, newTile){
        this.tilemap[y] = this.tilemap[y].substring(0, x) + newTile + this.tilemap[y].substring(x + 1);
    }

    // Read tile on tilemap [world coordinates] > [tile symbol]
    getCurrentTile (x, y){
        if (0 < x && x < this.width * this.tileSize && 0 < y && y < this.height * this.tileSize){
            return this.tilemap[Math.floor(y / this.tileSize)].charAt(Math.floor(x / this.tileSize));
        }
        return "X";
    }

    // Returns if a tile is a collider    
    isCollider(tileSymbol){
        return this.colliders.includes(tileSymbol);
    }

    // Read tiles on tilemap in a small rectangular cluster [world coordinates] 
    getCollisionArea(x, y){
        for(let i = -1; i <= 1; i ++){
            for(let j = -1; j <= 1; j ++){
                if(this.isCollider(gameMap.getCurrentTile(x + i * this.tileSize * 0.3, y + j * this.tileSize * 0.3))){
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