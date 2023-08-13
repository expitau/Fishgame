// This file contains code for rendering the game
let cnv, frame;

const PIXELSIZE = 6.25;

let graphicsReady = false;
let graphics;
let levelImage;
let fishSheets = {};

async function loadAssets() {

    graphics = {
        tileSheet: await new Promise(resolve => { _p5.loadImage('resources/tile_spritesheet.png', resolve) }),
        fishSheet: await new Promise(resolve => { _p5.loadImage('resources/fish_spritesheet.png', resolve) }),
        fishShadowSheet: await new Promise(resolve => { _p5.loadImage('resources/fishshadow_spritesheet.png', resolve) }),
        slapSheet: await new Promise(resolve => { _p5.loadImage('resources/slap_spritesheet.png', resolve) }),
        cursorSheet: await new Promise(resolve => { _p5.loadImage('resources/cursor_sheet.png', resolve) }),
        background: await new Promise(resolve => { _p5.loadImage('resources/background.png', resolve) }),
        iconSheet: await new Promise(resolve => { _p5.loadImage('resources/icon_spritesheet.png', resolve) }),
    };
}

function setupGraphics(state) {
    // Create canvas
    cnv = _p5.createCanvas(0, 0);

    _p5.noSmooth();
    _p5.pixelDensity(1);

    resizeCanvas()

    loadAssets().then(() => {
        console.log('[client] Graphics ready')
        graphicsReady = true;
        initalizeGraphics(state);
    })
}

function resizeCanvas() {
    frame = getGraphicsFrame()
    _p5.resizeCanvas(frame.screenWidth + 300, frame.screenHeight + 300);
    cnv.style('display', 'block');
    cnv.position(frame.originX - 150, frame.originY - 150, 'fixed');
}

function initalizeGraphics(state) {
    let spritemap = { '0': [5, 1], '1': [0, 0], '2': [1, 0], '3': [2, 0], '4': [3, 0], '[': [0, 1], '*': [0, 2], ']': [1, 1], 'c': [1, 2], '#': [2, 1], '_': [2, 2], '%': [3, 1], 'S': [4, 0], '$': [4, 1], 'E': [5, 0] }
    levelImage = _p5.createImage(maps[state.map].width * 8, maps[state.map].height * 8);
    levelImage.loadPixels();
    // graphics.tileSheet.loadPixels();
    for (let i = 0; i < maps[state.map].width; i++) {
        for (let j = 0; j < maps[state.map].height; j++) {
            // Get tile sprite
            function getTile(map, x, y) {
                if (x >= 0 && x < map.width && y >= 0 && y < map.height) {
                    return map.tilemap[y].charAt(x);
                }
                return 'X';
            }
            let spriteSymbol = getTile(maps[state.map], i, j);

            if (spriteSymbol === ' ') {
                continue;
            }

            // Draw tiles
            for (let px = 0; px < 8; px++) {
                for (let py = 0; py < 8; py++) {
                    let pixelColor = graphics.tileSheet.get(1 + spritemap[spriteSymbol][0] * 10 + px, 1 + spritemap[spriteSymbol][1] * 10 + py);
                    if (_p5.alpha(pixelColor) > 10) {
                        // draw sprite pixel
                        levelImage.set(i * 8 + px, j * 8 + py, pixelColor);
                    }
                    if (_p5.alpha(pixelColor) > 200 && i * 8 + px + 1 < maps[state.map].width * 8 && j * 8 + py + 1 < maps[state.map].height * 8) {
                        // draw shadow pixel
                        levelImage.set(i * 8 + px + 1, j * 8 + py + 1, _p5.color(0, 0, 0, 47));
                    }
                }
            }
        }
    }
    levelImage.updatePixels();
}

function getGraphicsFrame(width = 800, height = 600, marginRatio = 1 / 20) {
    let frame = {
        width: width,
        height: height,
        marginRatio: marginRatio,
        aspectRatio: height / width,
        changeRatio: 0,
    }
    if (frame.aspectRatio > _p5.windowHeight / _p5.windowWidth) {
        frame.margin = _p5.windowHeight * frame.marginRatio;
        frame.screenHeight = _p5.windowHeight - frame.margin * 2;
        frame.screenWidth = frame.screenHeight / frame.aspectRatio;
    } else {
        frame.margin = _p5.windowWidth * frame.marginRatio;
        frame.screenWidth = _p5.windowWidth - frame.margin * 2;
        frame.screenHeight = frame.screenWidth * frame.aspectRatio;
    }
    frame.originX = (_p5.windowWidth - frame.screenWidth) / 2;
    frame.originY = (_p5.windowHeight - frame.screenHeight) / 2;
    frame.changeRatio = frame.screenWidth / frame.width;
    return frame
}

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

function renderGraphics(state) {

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
            _p5.background('#dbba67');
            _p5.push();
            _p5.translate(150 + screenShakeMap[0] * frame.changeRatio, 150 + screenShakeMap[1] * frame.changeRatio);
            _p5.scale(frame.changeRatio);
            _p5.fill('#b09554');
            _p5.noStroke();
            _p5.rect(-maps[state.map].pixelSize, -maps[state.map].pixelSize, frame.width + maps[state.map].pixelSize * 2, frame.height + maps[state.map].pixelSize * 2);
        }
    }

    // // Compute graphics
    {

        if (!graphicsReady || !connected) {
            _p5.pop();
            return;
        }

        // Draw players
        for (const player of gameState.players) {
            {
                // Create new fish based on fish hue
                let tempFishSheet;
                if (fishSheets[player.color] === undefined) {
                    tempFishSheet = _p5.createImage(graphics.fishSheet.width, graphics.fishSheet.height);
                    tempFishSheet.loadPixels();
                    graphics.fishSheet.loadPixels();
                    for (let i = 0; i < graphics.fishSheet.width; i++) {
                        for (let j = 0; j < graphics.fishSheet.height; j++) {
                            let pixel = (i + graphics.fishSheet.width * j) * 4;
                            if (graphics.fishSheet.pixels[pixel + 3] > 100) {
                                let hsbPixel = RGBToHSB(graphics.fishSheet.pixels[pixel], graphics.fishSheet.pixels[pixel + 1], graphics.fishSheet.pixels[pixel + 2]);
                                let rgbPixel = HSBToRGB((hsbPixel[0] + player.color) % 360, hsbPixel[1], hsbPixel[2]);
                                tempFishSheet.set(i, j, _p5.color(rgbPixel[0], rgbPixel[1], rgbPixel[2], 255));
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
    _p5.image(graphics.background, 0, 0, frame.width, frame.height);

    // Draw player shadows
    for (const player of gameState.players) {
        {
            let vAngle = ((Math.PI * 2) + Math.atan2(player.vy, player.vx)) % (Math.PI * 2);
            let action = 0
            if (player.vy ** 2 + player.vx ** 2 < 1) {
                // If absolute player velocity is less than 1, flatfish
                action = 0;
            } else if (Math.abs(((Math.PI * 4) + player.r + Math.PI / 2) % (Math.PI * 2) - vAngle) < Math.PI / 2) {
                // If velocity angle pointed up down the fish, bend ends up
                action = 2;
            } else {
                // If velocity angle pointed down on the fish, bend ends down
                action = 1;
            }
            // Calculate fish pos/rot
            let offset = 5 * (6.25);

            let fishR = (Math.floor(((2 * player.r) / Math.PI) + 1 / 4) * (Math.PI / 2)) % (Math.PI * 2);
            let fishSpriteR = ((player.r / Math.PI + 1 / 8) % (1 / 2)) > (1 / 4);

            // Display shadow
            _p5.push();
            _p5.translate(align(player.x + 6.25), align(player.y + 6.25 * 3));
            _p5.rotate(fishR);
            _p5.image(graphics.fishShadowSheet, -offset, -offset, 6.25 * 11, 6.25 * 11, action * 12, fishSpriteR * 11, 11, 11);
            _p5.pop();
        }
    }

    // Draw level
    _p5.image(levelImage, 0, 0, maps[state.map].width * 50, maps[state.map].height * 50);

    {
        let player = gameState.players.filter(player => player.id === id)[0];
        if (player) {
            // Health bar
            for (let i = 0; i < 3; i++) {
                _p5.image(graphics.iconSheet, align((maps[state.map].width * 8 - (i + 1) * 8) * maps[state.map].pixelSize), align(maps[state.map].pixelSize), 6.25 * 7, 6.25 * 7, 0 * 8, ((player.health > i) ? 0 : 1) * 8, 7, 7);
            }
        }
    }

    // Display fish
    for (const player of gameState.players) {
        let vAngle = ((Math.PI * 2) + Math.atan2(player.vy, player.vx)) % (Math.PI * 2);
        let action = 0
        if (player.vy ** 2 + player.vx ** 2 < 1) {
            // If absolute player velocity is less than 1, flatfish
            action = 0;
        } else if (Math.abs(((Math.PI * 4) + player.r + Math.PI / 2) % (Math.PI * 2) - vAngle) < Math.PI / 2) {
            // If velocity angle pointed up down the fish, bend ends up
            action = 2;
        } else {
            // If velocity angle pointed down on the fish, bend ends down
            action = 1;
        }

        // Calculate fish pos/rot
        let offset = 5 * (6.25);

        let fishR = (Math.floor(((2 * player.r) / Math.PI) + 1 / 4) * (Math.PI / 2)) % (Math.PI * 2);
        let fishSpriteR = ((player.r / Math.PI + 1 / 8) % (1 / 2)) > (1 / 4);

        // Draw fish
        _p5.push();
        _p5.translate(align(player.x), align(player.y));
        _p5.fill(HSBToRGB(player.color, 100, 100));
        _p5.textAlign(_p5.CENTER)
        _p5.text(player.name, 0, -25);
        _p5.rotate(fishR);
        _p5.image(fishSheets[player.color], -offset, -offset, 6.25 * 11, 6.25 * 11, action * 12, fishSpriteR * 11, 11, 11);
        _p5.pop();
    }


    // Draw cursor when mouse is held
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


                _p5.image(graphics.cursorSheet, align(cursorX) - 6.25 * 2, align(cursorY) - 6.25 * 2, 6.25 * 5, 6.25 * 5, (pvp ? 0 : !getCollisionArea(maps[state.map], cursorX, cursorY)) * 6, pvp * 6, 5, 5);
            }
        }
    }

    // Draw effects
    {

        for (let i = 0; i < graphicsEffects.length; i++) {
            graphicsEffects[i].time--;
            if (graphicsEffects[i].time <= 0) {
                graphicsEffects.pop(i);
                i--;
                continue;
            }
            switch (graphicsEffects[i].name) {

                // White circle on hit object
                case 'impact':
                    _p5.image(graphics.slapSheet, align(graphicsEffects[i].x) - 6.25 * 4, align(graphicsEffects[i].y) - 6.25 * 4, 50, 50, ((4 - Math.floor(graphicsEffects[i].time / 4)) % 2) * 9, Math.floor((4 - Math.floor(graphicsEffects[i].time / 4)) / 2) * 9, 8, 8)
                    break;

                // Splatter 'paint' on hit or death
                case 'splat':
                    let [x, y, hue, r] = [graphicsEffects[i].x, graphicsEffects[i].y, graphicsEffects[i].color, graphicsEffects[i].r]
                    graphics.background.loadPixels();
                    fishSheets[hue].loadPixels();
                    let fishColor = fishSheets[hue].get(2, 5);
                    let angle, distance, xPos, yPos;
                    for (let i = 0; i < 25; i++) {
                        angle = _p5.random(r - Math.PI / 10, r + Math.PI / 10) + Math.PI;
                        distance = _p5.random(0, 15);
                        xPos = Math.floor(x / 6.25 + Math.sin(angle) * distance + _p5.random(-3, 3));
                        yPos = Math.floor(y / 6.25 + Math.cos(angle) * distance + _p5.random(-3, 3));
                        graphics.background.set(_p5.constrain(xPos, 0, 127), yPos, fishColor);
                    }
                    graphics.background.updatePixels();
                    break;

                // Screen shake
                case 'shake':
                    if (graphicsEffects[i].id == id) {
                        screenShakeTime = graphicsEffects[i].time;
                    }
                    break;
            }
        }
    }
    _p5.pop();
}
