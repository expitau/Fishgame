module.exports = class Map {
    constructor(mapId) {
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
                "  S          S  ",
                " ## ## ## ## ## ",
                "                ",
                "                ",
                "                ",
                "MMMMMMMMMMMMMMMM"
            ]
        ][mapId];

        this.width = 16;
        this.height = 12;
        //this.width = this.tilemap.length;
        //this.height = this.tilemap[0].length();
        this.tileSize = 50;
        this.spawnPoint = [100, 100];
        //calculateSpawn();
    }

    calculateSpawn(){
        for(var i = 0; i < this.width; i++){
            for(var j = 0; j < this.height; j++){
                if (this.tilemap[j].charAt(i) === "S") {
                    this.spawnPoint = [(i + 0.5) * this.tileSize, (j + 0.5) * this.tileSize];
                }
            }
        }
    }

    getCurrentTile(x, y){
        if (0 < x && x < this.width * this.tileSize && 0 < y && y < this.height * this.tileSize){
            let tile = [Math.floor(x / this.tileSize), Math.floor(y / this.tileSize)]
            return this.tilemap[tile[1]].charAt(tile[0]);
        }
        return "#";
    }
}

