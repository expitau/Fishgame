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
        this.tileSize = 50;
        this.spawnPoint = [100, 100];
        this.levelGen();
    }

    levelGen(){
        for(let i = 0; i < this.width; i++){
            for(let j = 0; j < this.height; j++){
                if (this.getTile(i, j) === "S") {
                    this.spawnPoint = [(i + 0.5) * this.tileSize, (j + 0.5) * this.tileSize];
                }
                if (this.getTile(i, j) === " ") {
                    if(this.getTile(i, j + 1) === "#"){
                        this.setTile(i, j, "_");
                    }
                    if(this.getTile(i, j + 1) === "[" || this.getTile(i, j + 1) === "]"){
                        this.setTile(i, j, 0);
                    }
                }
            }
        }
    }

    getTile (x, y){
        return this.tilemap[y].charAt(x);
    }

    setTile (x, y, newTile){
        this.tilemap[y] = this.tilemap[y].substring(0, x) + newTile + this.tilemap[y].substring(x + 1);
    }

    getCurrentTile (x, y){
        if (0 < x && x < this.width * this.tileSize && 0 < y && y < this.height * this.tileSize){
            return this.tilemap[Math.floor(y / this.tileSize)].charAt(Math.floor(x / this.tileSize));
        }
        return "#";
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
    module.exports = Map
}