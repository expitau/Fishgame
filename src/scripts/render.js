// Read tile on tilemap [world coordinates] > [tile symbol]
function getCurrentTile(gameMap, x, y) {
    if (0 < x && x < gameMap.width * gameMap.tileSize && 0 < y && y < gameMap.height * gameMap.tileSize) {
        return gameMap.tilemap[Math.floor(y / gameMap.tileSize)].charAt(Math.floor(x / gameMap.tileSize));
    }
    return "X";
}

// Read tiles on tilemap in a small rectangular cluster [world coordinates] 
function getCollisionArea(gameMap, x, y) {
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if (gameMap.colliders.includes(getCurrentTile(gameMap, x + i * gameMap.tileSize * 0.3, y + j * gameMap.tileSize * 0.3))) {
                return true;
            }
        }
    }
    return false;
}

// This file contains code for rendering the game
let cnv, frame;

const PIXELSIZE = 6.25;

function fg_setupGraphics(state) {
    // Create canvas
    cnv = createCanvas(0, 0);

    noSmooth();
    pixelDensity(1);

    // Initialize game    
    frame = fg_getGraphicsFrame()

    // resize
    resizeCanvas(frame.screenWidth + 300, frame.screenHeight + 300);
    cnv.style('display', 'block');
    cnv.position(frame.originX - 150, frame.originY - 150, 'fixed');

    graphics = {
        tileSheet: loadImage('./resources/tile_spritesheet.png'),
        fishSheet: loadImage('./resources/fish_spritesheet.png'),
        fishShadowSheet: loadImage('./resources/fishshadow_spritesheet.png'),
        slapSheet: loadImage('./resources/slap_spritesheet.png'),
        cursorSheet: loadImage('./resources/cursor_sheet.png'),
        background: loadImage('./resources/background.png'),
        iconSheet: loadImage('./resources/icon_spritesheet.png', () => { graphicsReady = true; fg_initalizeGraphics(state) })
    };
}

function fg_initalizeGraphics(state) {
    let spritemap = { "0": [5, 1], "1": [0, 0], "2": [1, 0], "3": [2, 0], "4": [3, 0], "[": [0, 1], "*": [0, 2], "]": [1, 1], "c": [1, 2], "#": [2, 1], "_": [2, 2], "%": [3, 1], "S": [4, 0], "$": [4, 1], "E": [5, 0] }
    levelImage = createImage(maps[state.map].width * 8, maps[state.map].height * 8);
    levelImage.loadPixels();
    // graphics.tileSheet.loadPixels();
    for (let i = 0; i < maps[state.map].width; i++) {
        for (let j = 0; j < maps[state.map].height; j++) {
            // Get tile sprite
            function getTile(map, x, y) {
                if (x >= 0 && x < map.width && y >= 0 && y < map.height) {
                    return map.tilemap[y].charAt(x);
                }
                return "X";
            }
            let spriteSymbol = getTile(maps[state.map], i, j);

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
                    if (alpha(pixelColor) > 200 && i * 8 + px + 1 < maps[state.map].width * 8 && j * 8 + py + 1 < maps[state.map].height * 8) {
                        // draw shadow pixel
                        levelImage.set(i * 8 + px + 1, j * 8 + py + 1, color(0, 0, 0, 47));
                    }
                }
            }
        }
    }
    levelImage.updatePixels();
}

function fg_getGraphicsFrame(width = 800, height = 600, marginRatio = 1 / 20) {
    let frame = {
        width: width,
        height: height,
        marginRatio: marginRatio,
        aspectRatio: height / width,
        changeRatio: 0,
    }
    if (frame.aspectRatio > windowHeight / windowWidth) {
        frame.margin = windowHeight * frame.marginRatio;
        frame.screenHeight = windowHeight - frame.margin * 2;
        frame.screenWidth = frame.screenHeight / frame.aspectRatio;
    } else {
        frame.margin = windowWidth * frame.marginRatio;
        frame.screenWidth = windowWidth - frame.margin * 2;
        frame.screenHeight = frame.screenWidth * frame.aspectRatio;
    }
    frame.originX = (windowWidth - frame.screenWidth) / 2;
    frame.originY = (windowHeight - frame.screenHeight) / 2;
    frame.changeRatio = frame.screenWidth / frame.width;
    return frame
}

let graphicsReady = false;
let graphics;
let levelImage;
let fishSheets = {};
function fg_renderGraphics(state) {
    function align(value) {
        return Math.floor(value / (maps[state.map].tileSize / 8)) * (maps[state.map].tileSize / 8)
    }

    // Render frame
    {
        // Screenshake
        let screenShakeMap = []
        {
            if (screenShakeTime > 0 && screenShakeTime--) {
                screenShakeMap = [
                    ((Math.random() > 0.5) ? -1 : 1) * (maps[state.map].pixelSize),
                    ((Math.random() > 0.5) ? -1 : 1) * (maps[state.map].pixelSize)
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
            rect(-maps[state.map].pixelSize, -maps[state.map].pixelSize, frame.width + maps[state.map].pixelSize * 2, frame.height + maps[state.map].pixelSize * 2);
        }
    }

    // // Compute graphics
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

        if (!graphicsReady || !connected) {
            pop();
            return;
        }

        // draw players
        for (const player of gameState.players) {
            {
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

    // // Draw player shadows
    for (const player of gameState.players) {
        {
            // Calculate fish pos/rot
            let offset = 5 * (6.25);

            let fishR = (Math.floor(((2 * player.r) / Math.PI) + 1 / 4) * (Math.PI / 2)) % (Math.PI * 2);
            let fishSpriteR = ((player.r / Math.PI + 1 / 8) % (1 / 2)) > (1 / 4);

            // Display shadow
            push();
            translate(align(player.x + 6.25), align(player.y + 6.25 * 3));
            rotate(fishR);
            image(graphics.fishShadowSheet, -offset, -offset, 6.25 * 11, 6.25 * 11, player.action * 12, fishSpriteR * 11, 11, 11);
            pop();
        }
    }

    // Draw level
    image(levelImage, 0, 0, maps[state.map].width * 50, maps[state.map].height * 50);

    {
        let player = gameState.players.filter(player => player.id === id)[0];
        // Health bar
        for (let i = 0; i < 3; i++) {
            image(graphics.iconSheet, align((maps[state.map].width * 8 - (i + 1) * 8) * maps[state.map].pixelSize), align(maps[state.map].pixelSize), 6.25 * 7, 6.25 * 7, 0 * 8, ((player.health > i) ? 0 : 1) * 8, 7, 7);
        }
    }

    // Display fish
    for (const player of gameState.players) {
        // Calculate fish pos/rot
        let offset = 5 * (6.25);

        let fishR = (Math.floor(((2 * player.r) / Math.PI) + 1 / 4) * (Math.PI / 2)) % (Math.PI * 2);
        let fishSpriteR = ((player.r / Math.PI + 1 / 8) % (1 / 2)) > (1 / 4);

        // Draw fish
        push();
        translate(align(player.x), align(player.y));
        rotate(fishR);
        image(fishSheets[player.color], -offset, -offset, 6.25 * 11, 6.25 * 11, player.action * 12, fishSpriteR * 11, 11, 11);
        pop();
    }


    // Draw cursor
    {
        if (mouseIsHeld) {
            let player = gameState.players.filter(player => player.id === id)[0];
            if (cursorData.x !== 0 && cursorData.y !== 0) {
                let cursorX = align(player.x) + Math.sin(cursorData.r) * cursorData.display;
                let cursorY = align(player.y) + Math.cos(cursorData.r) * cursorData.display;
                let pvp = false;

                // check if you can attack another player
                for (const otherPlayer of gameState.players) {
                    if (otherPlayer.id !== id) {
                        if (((player.x + Math.sin(cursorData.r) * cursorData.display - otherPlayer.x) ** 2 + (player.y + Math.cos(cursorData.r) * cursorData.display - otherPlayer.y) ** 2) ** 0.5 < 7 * maps[state.map].pixelSize || ((player.x - otherPlayer.x) ** 2 + (player.y - otherPlayer.y) ** 2) ** 0.5 < 7 * maps[state.map].pixelSize) {
                            pvp = true;
                        }
                    }
                }


                image(graphics.cursorSheet, align(cursorX) - 6.25 * 2, align(cursorY) - 6.25 * 2, 6.25 * 5, 6.25 * 5, (pvp ? 0 : !getCollisionArea(maps[state.map], cursorX, cursorY)) * 6, pvp * 6, 5, 5);
            }
        }
    }

    // Draw effects
    {
        for (let i = 0; i < gameState.effects.length; i++) {
            switch (gameState.effects[i].name) {
                case "impact": //[world coordinates, time]
                    // display
                    image(graphics.slapSheet, align(gameState.effects[i].x) - 6.25 * 4, align(gameState.effects[i].y) - 6.25 * 4, 50, 50, ((4 - Math.floor(gameState.effects[i].time / 4)) % 2) * 9, floor((4 - Math.floor(gameState.effects[i].time / 4)) / 2) * 9, 8, 8)
                    // graphics.displaySlapSprite(, , );
                    // handle update
                    break;
                case "splat": //[player id, radians, time]
                    // Add death effect
                    {
                        let [x, y, hue, r] = [gameState.effects[i].x, gameState.effects[i].y, gameState.effects[i].color, gameState.effects[i].r]
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
                    break;
            }
        }
    }
    pop();
}
