let Graphics = class{
    constructor() {
        // load sprites
        this.tileSheet = loadImage('./sprites/tile_spritesheet.png');
        this.fishSheet = loadImage('./sprites/fish_spritesheet.png');
        this.fishShadowSheet = loadImage('./sprites/fishshadow_spritesheet.png');
        this.slapSheet = loadImage('./sprites/slap_spritesheet.png');
        this.cursorSheet = loadImage('./sprites/cursor_sheet.png');
        this.background = loadImage('./sprites/background.png');

        // Generate tile set
        this.tileSprites = {};
        this.tileSpriteGen([
            "1234SE",
            "[]#%$0",
            "*c_   ",
        ]);

        this.fishSheets = {};
    }

    // Generate tile sprites from spritesheet and pattern [ASCII]
    tileSpriteGen(pattern){
        for(let i = 0; i < pattern[0].length; i++){
            for(let j = 0; j < pattern.length; j++){
                if(pattern[j].charAt(i) !== " "){
                    this.tileSprites[pattern[j].charAt(i)] = [i, j];
                }
            }
        }
    }

    // Draw tile sprite [ASCII, tile coordinates]
    displayTileSprite(spriteSymbol, x, y){
        if(spriteSymbol != " "){
            try{
                image(this.tileSheet, x * gameMap.tileSize, y * gameMap.tileSize, gameMap.tileSize, gameMap.tileSize, 1 + this.tileSprites[spriteSymbol][0] * 10, 1 + this.tileSprites[spriteSymbol][1] * 10, 8, 8);
            } catch (e){
                console.log("No Tile Labeled as '" + spriteSymbol + "'");
            }
        }
    }


    // Draw fish shadow sprite [player]
    displayFishShadowSprite(player){
        // Calculate fish pos/rot
        let offset = 5 * (gameMap.pixelSize);

        let fishR = (Math.floor(((2*player.physics.r)/Math.PI) + 1/4) * (Math.PI/2)) % (Math.PI * 2);
        let fishSpriteR = ((player.physics.r/Math.PI + 1/8) % (1/2)) > (1/4);

        // Display shadow
        push();
        translate(align(player.physics.x + gameMap.pixelSize), align(player.physics.y + gameMap.pixelSize * 3));
        rotate(fishR);
        image(this.fishShadowSheet, -offset, -offset, gameMap.pixelSize * 11, gameMap.pixelSize * 11, player.physics.action * 12,  fishSpriteR * 11, 11, 11);
        pop();
    }

    // Draw fish sprite [player]
    displayFishSprite(player){
        // Make sure sprites are loaded
        if(!(this.fishSheet.width > 1)){
            return;
        }

        // Create new fish based on fish hue
        let tempFishSheet;
        if(this.fishSheets[player.color] === undefined){
            tempFishSheet = createImage(this.fishSheet.width, this.fishSheet.height);
            tempFishSheet.loadPixels();
            this.fishSheet.loadPixels();
            for(let i = 0; i < this.fishSheet.width; i++){
                for(let j = 0; j < this.fishSheet.height; j++){
                    let pixel = (i + this.fishSheet.width * j) * 4;
                    if(this.fishSheet.pixels[pixel + 3] > 100){
                        let hsbPixel = RGBToHSB(this.fishSheet.pixels[pixel], this.fishSheet.pixels[pixel + 1], this.fishSheet.pixels[pixel + 2]);
                        let rgbPixel = HSBToRGB((hsbPixel[0] + player.color) % 360, hsbPixel[1], hsbPixel[2]);
                        tempFishSheet.set(i, j, color(rgbPixel[0], rgbPixel[1], rgbPixel[2], 255));
                    }
                }
            }
            tempFishSheet.updatePixels();
            this.fishSheets[player.color] = tempFishSheet;
        }

        // Calculate fish pos/rot
        let offset = 5 * (gameMap.pixelSize);

        let fishR = (Math.floor(((2*player.physics.r)/Math.PI) + 1/4) * (Math.PI/2)) % (Math.PI * 2);
        let fishSpriteR = ((player.physics.r/Math.PI + 1/8) % (1/2)) > (1/4);

        // Display fish
        push();
        translate(align(player.physics.x), align(player.physics.y));
        rotate(fishR);
        image(this.fishSheets[player.color], -offset, -offset, gameMap.pixelSize * 11, gameMap.pixelSize * 11, player.physics.action * 12,  fishSpriteR * 11, 11, 11);
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