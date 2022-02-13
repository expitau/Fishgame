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
                "                ",
                "       S        ",
                "     ######     ",
                "                ",
                "                ",
                "  ####    ####  ",
                "                ",
                "                ",
                "                ",
                "#######MM#######"
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
        this.calculateSpawn();
    }

    calculateSpawn(){
        for(let i = 0; i < this.width; i++){
            for(let j = 0; j < this.height; j++){
                if (this.tilemap[j].charAt(i) === "S") {
                    this.spawnPoint = [(i + 0.5) * this.tileSize, (j + 0.5) * this.tileSize];
                }
            }
        }
    }

    getTile (x, y){
        if (0 <= x && x < this.width && 0 <= y && y < this.height){
            return this.tilemap[y].charAt(x);
        }
        return "#";
    }
    
    getCurrentTile(x, y){
        if (0 < x && x < this.width * this.tileSize && 0 < y && y < this.height * this.tileSize){
            let tile = [Math.floor(x / this.tileSize), Math.floor(y / this.tileSize)]
            return this.tilemap[tile[1]].charAt(tile[0]);
        }
        return "#";
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