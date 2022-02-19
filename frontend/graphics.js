let Graphics = class{
    constructor() {
        this.tileSprites = [];
        this.fishSprites = [];

        this.tileSheet = loadImage('./sprites/tile_spritesheet.png');
        this.fishSheet = loadImage('./sprites/fish_spritesheet.png');
        this.slapSheet = loadImage('./sprites/slap_spritesheet.png');
        this.cursorSheet = loadImage('./sprites/cursor_sheet.png');
        this.background = loadImage('./sprites/background.png');

        this.tilePattern = [
            "1234S0",
            "[]#%  ",
            "*c_   ",
        ];

        for(let i = 0; i < this.tilePattern[0].length; i++){
            for(let j = 0; j < this.tilePattern.length; j++){
                if(this.tilePattern[j].charAt(i) !== " "){
                    this.tileSprites.push([this.tilePattern[j].charAt(i), i, j]);
                }
            }
        }
    }

    displayTileSprite(spriteSymbol, x, y){
        if(spriteSymbol != " "){
            for(let i = 0; i < this.tileSprites.length; i++){
                if(spriteSymbol === this.tileSprites[i][0]){
                    image(this.tileSheet, x * gameMap.tileSize, y * gameMap.tileSize, gameMap.tileSize, gameMap.tileSize, 1 + this.tileSprites[i][1] * 10, 1 + this.tileSprites[i][2] * 10, 8, 8);
                }
            }
        }
    }

    displayFishSprite(x, y, r, action){
        let offset = 5 * (gameMap.tileSize/8);

        let fishR = (Math.floor(((2*r)/Math.PI) + 1/4) * (Math.PI/2)) % (Math.PI * 2);
        let fishSpriteR = ((r/Math.PI + 1/8) % (1/2)) > (1/4);

        push();
        translate(align(x), align(y));
        rotate(fishR);
        image(this.fishSheet, -offset, -offset, gameMap.tileSize * 11/8, gameMap.tileSize * 11/8, action * 12,  fishSpriteR * 11, 11, 11);
        pop();
    }

    displayCursorSprite(x, y, design){
        let offset = gameMap.tileSize * 2/8;
        image(this.cursorSheet, align(x) - offset, align(y) - offset, gameMap.tileSize * 5/8, gameMap.tileSize * 5/8, design * 5, 0, 5, 5);
    }
    
    displaySlapSprite(x, y, design){
        let offset = gameMap.tileSize * 4/8;
        image(this.slapSheet, align(x) - offset, align(y) - offset, gameMap.tileSize, gameMap.tileSize, (design%2) * 9, floor(design/2) * 9, 8, 8);
    }
}