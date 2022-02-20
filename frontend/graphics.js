let Graphics = class{
    constructor() {
        // load sprites
        this.tileSheet = loadImage('./sprites/tile_spritesheet.png');
        this.fishSheet = loadImage('./sprites/fish_spritesheet.png');
        this.fishShadowSheet = loadImage('./sprites/fishshadow_spritesheet.png');
        this.slapSheet = loadImage('./sprites/slap_spritesheet.png');
        this.cursorSheet = loadImage('./sprites/cursor_sheet.png');
        this.background = loadImage('./sprites/background.png');
        this.iconSheet = loadImage('./sprites/icon_spritesheet.png');
        this.levelImage;

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
    
    // Display level image
    displayLevelImage(){
        // Make sure sprites are loaded
        if(!(this.tileSheet.width > 1)){
            return;
        }

        if(this.levelImage === undefined){
            this.levelImage = createImage(gameMap.width * 8, gameMap.height * 8);
            this.levelImage.loadPixels();
            this.tileSheet.loadPixels();
            for(let i = 0; i < gameMap.width; i++){
                for(let j = 0; j < gameMap.height; j++){
                    // Get tile sprite
                    let spriteSymbol = gameMap.getTile(i, j);

                    if(spriteSymbol === " "){
                        continue;
                    }
                    
                    // Draw tiles
                    for(let px = 0; px < 8; px++){
                        for(let py = 0; py < 8; py++){
                            let pixelColor =  this.tileSheet.get(1 + this.tileSprites[spriteSymbol][0] * 10 + px, 1 + this.tileSprites[spriteSymbol][1] * 10 + py);
                            if(alpha(pixelColor) > 10){
                                // draw sprite pixel
                                this.levelImage.set(i*8 + px, j*8 + py, pixelColor);
                            }
                            if(alpha(pixelColor) > 200 && i*8 + px + 1 < gameMap.width * 8 && j*8 + py + 1 < gameMap.height * 8){
                                // draw shadow pixel
                                this.levelImage.set(i*8 + px + 1, j*8 + py + 1, color(0, 0, 0, 47));
                            }
                        }
                    }
                }
            }
            this.levelImage.updatePixels();
        }

        image(this.levelImage, 0, 0, gameMap.width * gameMap.tileSize, gameMap.height * gameMap.tileSize);
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

    // Draw cursor sprite [world coordinates, 0-1, 0-1]
    displayCursorSprite(x, y, design, attack){
        image(this.cursorSheet, align(x) - gameMap.pixelSize * 2, align(y) - gameMap.pixelSize * 2, gameMap.pixelSize * 5, gameMap.pixelSize * 5, design * 6, attack * 6, 5, 5);
    }
    
    // Draw slap sprite [world coordinates, 0-3]
    displaySlapSprite(x, y, design){
        image(this.slapSheet, align(x) - gameMap.pixelSize * 4, align(y) - gameMap.pixelSize * 4, gameMap.tileSize, gameMap.tileSize, (design%2) * 9, floor(design/2) * 9, 8, 8);
    }

    // Draw the icons  [world coordinates, 0-1, 0-2]
    displayIconSprite(x, y, icon, state){
        image(this.iconSheet, align(x), align(y), gameMap.pixelSize * 7, gameMap.pixelSize * 7, icon * 8, state * 8, 7, 7);
    }
}