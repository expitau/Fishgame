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
    }

    getTile(x, y){
        return this.maps[this.currentMap][y].charAt(x);
    }
}