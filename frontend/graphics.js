let Graphics = class{
    constructor() {
        // load sprites
        this.tileSheet = loadImage('./sprites/tile_spritesheet.png');
        this.fishSheet = loadImage('./sprites/fish_spritesheet.png');
        this.slapSheet = loadImage('./sprites/slap_spritesheet.png');
        this.cursorSheet = loadImage('./sprites/cursor_sheet.png');
        this.background = loadImage('./sprites/background.png');

        // Generate tile set
        this.tileSprites = {};
        this.tileSpriteGen([
            "1234S0",
            "[]#%  ",
            "*c_   ",
        ]);
    }

    // Generate tile sprites from spritesheet and pattern
    tileSpriteGen(pattern){
        for(let i = 0; i < pattern[0].length; i++){
            for(let j = 0; j < pattern.length; j++){
                if(pattern[j].charAt(i) !== " "){
                    this.tileSprites[pattern[j].charAt(i)] = [i, j];
                }
            }
        }
    }

    // Draw tile sprite [tile coordinates]
    displayTileSprite(spriteSymbol, x, y){
        if(spriteSymbol != " "){
            try{
                image(this.tileSheet, x * gameMap.tileSize, y * gameMap.tileSize, gameMap.tileSize, gameMap.tileSize, 1 + this.tileSprites[spriteSymbol][0] * 10, 1 + this.tileSprites[spriteSymbol][1] * 10, 8, 8);
            } catch (e){
                console.log("No Tile Labeled as '" + spriteSymbol + "'");
            }
        }
    }

    // Draw fish sprite [world coordinates, radians, 0-1]
    displayFishSprite(x, y, r, action){
        let offset = 5 * (gameMap.pixelSize);

        let fishR = (Math.floor(((2*r)/Math.PI) + 1/4) * (Math.PI/2)) % (Math.PI * 2);
        let fishSpriteR = ((r/Math.PI + 1/8) % (1/2)) > (1/4);

        push();
        translate(align(x), align(y));
        rotate(fishR);
        image(this.fishSheet, -offset, -offset, gameMap.pixelSize * 11, gameMap.pixelSize * 11, action * 12,  fishSpriteR * 11, 11, 11);
        pop();
    }

    // Draw cursor sprite [world coordinates, 0-1]
    displayCursorSprite(x, y, design){
        let offset = gameMap.pixelSize * 2;
        image(this.cursorSheet, align(x) - offset, align(y) - offset, gameMap.pixelSize * 5, gameMap.pixelSize * 5, design * 5, 0, 5, 5);
    }
    
    // Draw slap sprite [world coordinates, 0-3]
    displaySlapSprite(x, y, design){
        let offset = gameMap.pixelSize * 4;
        image(this.slapSheet, align(x) - offset, align(y) - offset, gameMap.tileSize, gameMap.tileSize, (design%2) * 9, floor(design/2) * 9, 8, 8);
    }
}