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
}

