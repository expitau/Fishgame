let Graphics = class{
    constructor() {
        this.tile_sprites = [];
        this.fish_sprites = [];
        this.tile_pattern = [
            "1234S0",
            "[]#%  ",
            "*c_   ",
        ];
        this.generateSprites();
        this.screenShake = [0, 0];
        this.screenShakeTime = 0;
    }

    generateSprites(){
        this.tile_sheet = loadImage('./sprites/tile_spritesheet.png');
        this.fish_sheet = loadImage('./sprites/fish_spritesheet.png');
        this.slap_sheet = loadImage('./sprites/slap_spritesheet.png');
        this.background = loadImage('./sprites/background.png');
        this.cursor = loadImage('./sprites/cursor_sheet.png');
        for(let i = 0; i < this.tile_pattern[0].length; i++){
            for(let j = 0; j < this.tile_pattern.length; j++){
                if(this.tile_pattern[j].charAt(i) !== " "){
                    this.tile_sprites.push([this.tile_pattern[j].charAt(i), i, j]);
                }
            }
        }
    }

    displayTileSprite(spriteSymbol, x, y){
        if(spriteSymbol != " "){
            for(let i = 0; i < this.tile_sprites.length; i++){
                if(spriteSymbol === this.tile_sprites[i][0]){
                    image(this.tile_sheet, x * gameMap.tileSize, y * gameMap.tileSize, gameMap.tileSize, gameMap.tileSize, 1 + this.tile_sprites[i][1] * 10, 1 + this.tile_sprites[i][2] * 10, 8, 8);
                }
            }
        }
    }

    displayFishSprite(x, y, r, action){
        let fishX = floor(x / (gameMap.tileSize/8)) * (gameMap.tileSize/8);
        let fishY = floor(y / (gameMap.tileSize/8)) * (gameMap.tileSize/8);
        let offset = 5 * (gameMap.tileSize/8);

        let fishR = (Math.floor(((2*r)/Math.PI) + 1/4) * (Math.PI/2)) % (Math.PI * 2);
        let fishSpriteR = ((r/Math.PI + 1/8) % (1/2)) > (1/4);

        push();
        translate(fishX, fishY);
        rotate(fishR);
        image(this.fish_sheet, -offset, -offset, gameMap.tileSize * 11/8, gameMap.tileSize * 11/8, action * 12,  fishSpriteR * 11, 11, 11);
        pop();
    }

    displayCursorSprite(x, y, design){
        let cursorX = floor(x / (gameMap.tileSize/8)) * (gameMap.tileSize/8);
        let cursorY = floor(y / (gameMap.tileSize/8)) * (gameMap.tileSize/8);
        let offset = gameMap.tileSize * 2/8;

        push();
        translate(cursorX, cursorY);
        image(this.cursor, -offset, -offset, gameMap.tileSize * 5/8, gameMap.tileSize * 5/8, design * 5, 0, 5, 5);
        pop();
    }
    
    displaySlapSprite(x, y, design){
        let slapX = floor(x / (gameMap.tileSize/8)) * (gameMap.tileSize/8);
        let slapY = floor(y / (gameMap.tileSize/8)) * (gameMap.tileSize/8);
        let offset = gameMap.tileSize * 4/8;

        push();
        translate(slapX, slapY);
        image(this.slap_sheet, -offset, -offset, gameMap.tileSize, gameMap.tileSize, (design%2) * 9, floor(design/2) * 9, 8, 8);
        pop();
    }

    displayMap(){
        for(let i = 0; i < gameMap.width; i++){
            for(let j = 0; j < gameMap.height; j++){
                this.displayTileSprite(gameMap.getTile(i, j), i, j);
            }
        }
    }

    OnScreenShake(){
        if(this.screenShakeTime > 0){
            this.screenShake = [
                ((random(0, 1) > 0.5) ? -1 : 1) * (gameMap.tileSize/8),
                ((random(0, 1) > 0.5) ? -1 : 1) * (gameMap.tileSize/8)
            ];
        }else{
            this.screenShake = [0, 0];
        }
    }
}