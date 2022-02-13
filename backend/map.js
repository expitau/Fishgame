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
        calculateSpawn(this);
    }
}

function calculateSpawn(gameMap){
    for(let i = 0; i < gameMap.width; i++){
        for(let j = 0; j < gameMap.height; j++){
            if (gameMap.tilemap[j].charAt(i) === "S") {
                gameMap.spawnPoint = [(i + 0.5) * gameMap.tileSize, (j + 0.5) * gameMap.tileSize];
            }
        }
    }
}
