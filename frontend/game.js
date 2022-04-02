// Create global variables
let id, players = {};
let gameMap, graphics, input;

function getFrame(width = 800, height = 600, marginRatio = 1/20){
    let frame = {
        width: width,
        height: height,
        marginRatio: marginRatio,
        aspectRatio: height / width,
        changeRatio: 0,
    }
    if(frame.aspectRatio > windowHeight / windowWidth){
        frame.margin = windowHeight * frame.marginRatio;
        frame.screenHeight = windowHeight - frame.margin * 2;
        frame.screenWidth = frame.screenHeight / frame.aspectRatio;
    }else{
        frame.margin = windowWidth * frame.marginRatio;
        frame.screenWidth = windowWidth - frame.margin * 2;
        frame.screenHeight = frame.screenWidth * frame.aspectRatio;
    }
    frame.originX = (windowWidth - frame.screenWidth) / 2;
    frame.originY = (windowHeight - frame.screenHeight) / 2;
    frame.changeRatio = frame.screenWidth / frame.width;
    
    return frame
}
// On initialize
function OnInit() {
    // effects = new Effects();
    // frame = new Frame();
    frame = getFrame()


    
    // graphics = new Graphics();
    input = new Input();
}

// On game tick (game logic only)
function OnTick() {
    // calculate physics
    Physics.OnTick(players, gameMap);
}

// On frame render (visuals only)

let levelImage;
let fishSheets = {}
function OnRender(effects, screenShake) {
    graphics ??= {
        tileSheet: loadImage('./sprites/tile_spritesheet.png'),
        fishSheet: loadImage('./sprites/fish_spritesheet.png'),
        fishShadowSheet: loadImage('./sprites/fishshadow_spritesheet.png'),
        slapSheet: loadImage('./sprites/slap_spritesheet.png'),
        cursorSheet: loadImage('./sprites/cursor_sheet.png'),
        background: loadImage('./sprites/background.png'),
        iconSheet: loadImage('./sprites/icon_spritesheet.png', () => { graphics.ready = true }),
        ready: false
    };

    function align(value) {
        return Math.floor(value / (gameMap.tileSize / 8)) * (gameMap.tileSize / 8)
    }


    // Render frame
    {
        // Screenshake
        let screenShakeMap = []
        {
            if (screenShake) {
                screenShakeMap = [
                    ((Math.random() > 0.5) ? -1 : 1) * (gameMap.pixelSize),
                    ((Math.random() > 0.5) ? -1 : 1) * (gameMap.pixelSize)
                ];
            } else {
                screenShakeMap = [0, 0];
            }
        }

        // Create and render frame
        {
            background("#dbba67");
            push();
            translate(150 + screenShakeMap[0] * frame.changeRatio, 150 + screenShakeMap[1] * frame.changeRatio);
            scale(frame.changeRatio);
            fill("#b09554");
            noStroke();
            rect(-gameMap.pixelSize, -gameMap.pixelSize, frame.width + gameMap.pixelSize * 2, frame.height + gameMap.pixelSize * 2);
        }
    }

    // Compute graphics
    {
        function HSBToRGB(h, s, b) {
            s /= 100;
            b /= 100;
            const k = (n) => (n + h / 60) % 6;
            const f = (n) => b * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)));
            return [255 * f(5), 255 * f(3), 255 * f(1)];
        }

        // convert an RGB color to HSB [0-255, 0-255, 0-255]
        function RGBToHSB(r, g, b) {
            r /= 255;
            g /= 255;
            b /= 255;
            const v = Math.max(r, g, b),
                n = v - Math.min(r, g, b);
            const h =
                n === 0 ? 0 : n && v === r ? (g - b) / n : v === g ? 2 + (b - r) / n : 4 + (r - g) / n;
            return [60 * (h < 0 ? h + 6 : h), v && (n / v) * 100, v * 100];
        }


        if (!graphics.ready) {
            return;
        }
        if (levelImage === undefined) {
            let spritemap = { "0": [5, 1], "1": [0, 0], "2": [1, 0], "3": [2, 0], "4": [3, 0], "[": [0, 1], "*": [0, 2], "]": [1, 1], "c": [1, 2], "#": [2, 1], "_": [2, 2], "%": [3, 1], "S": [4, 0], "$": [4, 1], "E": [5, 0] }
            levelImage = createImage(gameMap.width * 8, gameMap.height * 8);
            levelImage.loadPixels();
            // graphics.tileSheet.loadPixels();
            for (let i = 0; i < gameMap.width; i++) {
                for (let j = 0; j < gameMap.height; j++) {
                    // Get tile sprite
                    let spriteSymbol = gameMap.getTile(i, j);

                    if (spriteSymbol === " ") {
                        continue;
                    }

                    // Draw tiles
                    for (let px = 0; px < 8; px++) {
                        for (let py = 0; py < 8; py++) {
                            let pixelColor = graphics.tileSheet.get(1 + spritemap[spriteSymbol][0] * 10 + px, 1 + spritemap[spriteSymbol][1] * 10 + py);
                            if (alpha(pixelColor) > 10) {
                                // draw sprite pixel
                                levelImage.set(i * 8 + px, j * 8 + py, pixelColor);
                            }
                            if (alpha(pixelColor) > 200 && i * 8 + px + 1 < gameMap.width * 8 && j * 8 + py + 1 < gameMap.height * 8) {
                                // draw shadow pixel
                                levelImage.set(i * 8 + px + 1, j * 8 + py + 1, color(0, 0, 0, 47));
                            }
                        }
                    }
                }
            }
            levelImage.updatePixels();
        }

        // draw players
        for (const [pid, player] of Object.entries(players)) {
            {
                // Make sure sprites are loaded
                if (!(graphics.fishSheet.width > 1)) {
                    return;
                }

                // Create new fish based on fish hue
                let tempFishSheet;
                if (fishSheets[player.color] === undefined) {
                    tempFishSheet = createImage(graphics.fishSheet.width, graphics.fishSheet.height);
                    tempFishSheet.loadPixels();
                    graphics.fishSheet.loadPixels();
                    for (let i = 0; i < graphics.fishSheet.width; i++) {
                        for (let j = 0; j < graphics.fishSheet.height; j++) {
                            let pixel = (i + graphics.fishSheet.width * j) * 4;
                            if (graphics.fishSheet.pixels[pixel + 3] > 100) {
                                let hsbPixel = RGBToHSB(graphics.fishSheet.pixels[pixel], graphics.fishSheet.pixels[pixel + 1], graphics.fishSheet.pixels[pixel + 2]);
                                let rgbPixel = HSBToRGB((hsbPixel[0] + player.color) % 360, hsbPixel[1], hsbPixel[2]);
                                tempFishSheet.set(i, j, color(rgbPixel[0], rgbPixel[1], rgbPixel[2], 255));
                            }
                        }
                    }
                    tempFishSheet.updatePixels();
                    fishSheets[player.color] = tempFishSheet;
                }
            }
        }
    }

    // Draw background
    image(graphics.background, 0, 0, frame.width, frame.height);

    // Draw player shadows
    for (const [pid, player] of Object.entries(players)) {
        {
            // Calculate fish pos/rot
            let offset = 5 * (6.25);

            let fishR = (Math.floor(((2 * player.physics.r) / Math.PI) + 1 / 4) * (Math.PI / 2)) % (Math.PI * 2);
            let fishSpriteR = ((player.physics.r / Math.PI + 1 / 8) % (1 / 2)) > (1 / 4);

            // Display shadow
            push();
            translate(align(player.physics.x + 6.25), align(player.physics.y + 6.25 * 3));
            rotate(fishR);
            image(graphics.fishShadowSheet, -offset, -offset, 6.25 * 11, 6.25 * 11, player.physics.action * 12, fishSpriteR * 11, 11, 11);
            pop();
        }
    }

    // Draw level
    image(levelImage, 0, 0, gameMap.width * 50, gameMap.height * 50);

    // Health bar
    for (let i = 0; i < 3; i++) {
        image(graphics.iconSheet, align((gameMap.width * 8 - (i + 1) * 8) * gameMap.pixelSize), align(gameMap.pixelSize), 6.25 * 7, 6.25 * 7, 0 * 8, ((players[id].health > i) ? 0 : 1) * 8, 7, 7);
    }

    // Display fish
    for (const [pid, player] of Object.entries(players)) {
        // Calculate fish pos/rot
        let offset = 5 * (6.25);

        let fishR = (Math.floor(((2 * player.physics.r) / Math.PI) + 1 / 4) * (Math.PI / 2)) % (Math.PI * 2);
        let fishSpriteR = ((player.physics.r / Math.PI + 1 / 8) % (1 / 2)) > (1 / 4);

        // Draw fish
        push();
        translate(align(player.physics.x), align(player.physics.y));
        rotate(fishR);
        image(fishSheets[player.color], -offset, -offset, 6.25 * 11, 6.25 * 11, player.physics.action * 12, fishSpriteR * 11, 11, 11);
        pop();
    }


    // Draw cursor
    {
        if (mouseIsHeld) {
            let player = players[id];
            if (cursorData.x !== 0 && cursorData.y !== 0) {
                let cursorX = align(player.physics.x) + Math.sin(cursorData.r) * cursorData.display;
                let cursorY = align(player.physics.y) + Math.cos(cursorData.r) * cursorData.display;
                let pvp = false;

                // check if you can attack another player
                for (const [opid, otherPlayer] of Object.entries(players)) {
                    if (opid !== id) {
                        if (((player.physics.x + Math.sin(cursorData.r) * cursorData.display - otherPlayer.physics.x) ** 2 + (player.physics.y + Math.cos(cursorData.r) * cursorData.display - otherPlayer.physics.y) ** 2) ** 0.5 < 7 * gameMap.pixelSize || ((player.physics.x - otherPlayer.physics.x) ** 2 + (player.physics.y - otherPlayer.physics.y) ** 2) ** 0.5 < 7 * gameMap.pixelSize) {
                            pvp = true;
                        }
                    }
                }


                image(graphics.cursorSheet, align(cursorX) - 6.25 * 2, align(cursorY) - 6.25 * 2, 6.25 * 5, 6.25 * 5, (pvp ? 0 : !gameMap.getCollisionArea(cursorX, cursorY)) * 6, pvp * 6, 5, 5);
            }
        }
    }

    // Draw effects
    {
        for (let i = 0; i < effects.length; i++) {
            switch (effects[i][0]) {
                case "impact": //[world coordinates, time]
                    // display
                    image(graphics.slapSheet, align(effects[i][1]) - 6.25 * 4, align(effects[i][2]) - 6.25 * 4, 50, 50, ((4 - Math.floor(effects[i][3] / 4)) % 2) * 9, floor((4 - Math.floor(effects[i][3] / 4)) / 2) * 9, 8, 8)
                    // graphics.displaySlapSprite(, , );
                    // handle update
                    effects[i][3]--;
                    if (effects[i][3] <= 0) {
                        effects.pop(i);
                        i--;
                    }
                    break;
                case "splat": //[player id, radians, time]
                    // Add death effect
                    {
                        let [x, y, hue, r] = [effects[i][1], effects[i][2], effects[i][3], effects[i][4]]
                        graphics.background.loadPixels();
                        fishSheets[hue].loadPixels();
                        let fishColor = fishSheets[hue].get(2, 5);
                        let angle, distance, xPos, yPos;
                        for (let i = 0; i < 25; i++) {
                            angle = random(r - PI / 10, r + PI / 10) + PI;
                            distance = random(0, 15);
                            xPos = Math.floor(x / 6.25 + Math.sin(angle) * distance + random(-3, 3));
                            yPos = Math.floor(y / 6.25 + Math.cos(angle) * distance + random(-3, 3));
                            graphics.background.set(constrain(xPos, 0, 127), yPos, fishColor);
                        }
                        graphics.background.updatePixels();
                    }
                    // handle update
                    effects[i][5]--;
                    if (effects[i][5] <= 0) {
                        effects.pop(i);
                        i--;
                    }
                    break;
            }
        }
    }
}