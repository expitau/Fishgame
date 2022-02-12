module.exports = class Map {
    constructor(mapId) {
        this.currentMap = mapId;
        this.maps = [
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
        ];

        this.width = 16;
        this.height = 12;
        //this.width = this.maps[this.currentMap].length;
        //this.height = this.maps[this.currentMap][0].length();
        this.tileSize = 50;
        this.spawnPoint = [100, 100];
        //calculateSpawn();
    }

    calculateSpawn(){
        for(var i = 0; i < this.width; i++){
            for(var j = 0; j < this.height; j++){
                if (this.maps[this.currentMap][j].charAt(i) === "S") {
                    this.spawnPoint = [(i + 0.5) * this.tileSize, (j + 0.5) * this.tileSize];
                }
            }
        }
    }

    getCurrentTile(x, y){
        if (0 < x && x < this.width * this.tileSize && 0 < y && y < this.height * this.tileSize){
            let tile = [Math.floor(x / this.tileSize), Math.floor(y / this.tileSize)]
            return this.maps[this.currentMap][tile[1]].charAt(tile[0]);
        }
        return "#";
    }
}

