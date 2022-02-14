let Graphics = class{
    constructor() {
        this.tile_sprites = [];
        this.fish_sprites = [];
        this.tile_pattern = [
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
        this.tile_sheet = loadImage('./sprites/tile_spritesheet.png');
        this.fish_sheet = loadImage('./sprites/fish_spritesheet.png');
        this.background = loadImage('./sprites/background.png');
        for(var i = 0; i < this.tile_pattern[0].length; i++){
            for(var j = 0; j < this.tile_pattern.length; j++){
                if(this.tile_pattern[j].charAt(i) !== " "){
                    this.tile_sprites.push([this.tile_pattern[j].charAt(i), i, j]);
                }
            }
        }
    }

    displayTileSprite(spriteSymbol, x, y){
        if(spriteSymbol != " "){
            for(var i = 0; i < this.tile_sprites.length; i++){
                if(spriteSymbol === this.tile_sprites[i][0]){
                    image(this.tile_sheet, x * gameMap.tileSize, y * gameMap.tileSize, gameMap.tileSize, gameMap.tileSize, this.tile_sprites[i][1] * 8, this.tile_sprites[i][2] * 8, 8, 8);
                }
            }
        }
    }

    displayFishSprite(x, y, r, action){
        let fishX = floor(x / (gameMap.tileSize/8)) * (gameMap.tileSize/8);
        let fishY = floor(y / (gameMap.tileSize/8)) * (gameMap.tileSize/8);
        let offset = 5 * (gameMap.tileSize/8);

        let fishR = 0;
        let fishSpriteR = 0;

        if(r >= Math.PI * 15/8 || r < Math.PI * 1/8){
            fishR = 0;
            fishSpriteR = 0;
        }else if(r >= Math.PI * 1/8 && r < Math.PI * 3/8){
            fishR = 0;
            fishSpriteR = 1;
        }else if(r >= Math.PI * 3/8 && r < Math.PI * 5/8){
            fishR = Math.PI/2;
            fishSpriteR = 0;
        }else if(r >= Math.PI * 5/8 && r < Math.PI * 7/8){
            fishR = Math.PI/2;
            fishSpriteR = 1;
        }else if(r >= Math.PI * 7/8 && r < Math.PI * 9/8){
            fishR = Math.PI;
            fishSpriteR = 0;
        }else if(r >= Math.PI * 9/8 && r < Math.PI * 11/8){
            fishR = Math.PI;
            fishSpriteR = 1;
        }else if(r >= Math.PI * 11/8 && r < Math.PI * 13/8){
            fishR = Math.PI * 3/2;
            fishSpriteR = 0;
        }else if(r >= Math.PI * 13/8 && r < Math.PI * 15/8){
            fishR = Math.PI * 3/2;
            fishSpriteR = 1;
        }

        push();
        translate(fishX, fishY);
        rotate(fishR);
        image(this.fish_sheet, -offset, -offset, gameMap.tileSize * 11/8, gameMap.tileSize * 11/8, action * 12,  fishSpriteR * 11, 11, 11);
        pop();
    }
    
    displayMap(){
        for(var i = 0; i < gameMap.width; i++){
            for(var j = 0; j < gameMap.height; j++){
                this.displayTileSprite(gameMap.getTile(i, j), i, j);
            }
        }
    }
}