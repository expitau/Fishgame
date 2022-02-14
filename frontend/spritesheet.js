let Spritesheet = class{
    constructor() {
        this.sprites = [];
        this.pattern = [
            "1234S0* ",
            "[]#%_ c ",
            "        ",
            "        ",
            "        ",
            "        ",
            "        ",
            "        "
        ];
        this.generateSprites();
    }

    generateSprites(){
        this.sheet = loadImage('./sprites/spritesheet.png');
        this.background = loadImage('./sprites/background.png');
        for(var i = 0; i < this.pattern[0].length; i++){
            for(var j = 0; j < this.pattern.length; j++){
                if(this.pattern[j].charAt(i) !== " "){
                    this.sprites.push([this.pattern[j].charAt(i), i, j]);
                }
            }
        }
    }

    drawTileSprite(spriteSymbol, x, y){
        if(spriteSymbol != " "){
            for(var i = 0; i < this.sprites.length; i++){
                if(spriteSymbol === this.sprites[i][0]){
                    image(this.sheet, x * gameMap.tileSize, y * gameMap.tileSize, gameMap.tileSize, gameMap.tileSize, this.sprites[i][1] * 8, this.sprites[i][2] * 8, 8, 8);
                }
            }
        }
    }
    
    displayMap(){
        for(var i = 0; i < gameMap.width; i++){
            for(var j = 0; j < gameMap.height; j++){
                this.drawTileSprite(gameMap.getTile(i, j), i, j);
            }
        }
    }
}