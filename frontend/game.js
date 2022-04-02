// Create global variables
let id, players = {};
let gameMap, frame, graphics, input;

// On initialize
function OnInit() {
    // effects = new Effects();
    frame = new Frame();
    graphics = new Graphics();
    input = new Input();
}

// On game tick (game logic only)
function OnTick() {
    // calculate physics
    Physics.OnTick(players, gameMap);
}

// On frame render (visuals only)
function OnRender(effects, screenShake) {
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

    // draw background
    image(graphics.background, 0, 0, frame.width, frame.height);

    // draw player shadows
    for (const [pid, player] of Object.entries(players)) {
        graphics.displayFishShadowSprite(player);
    }

    // draw map
    graphics.displayLevelImage();

    // icons
    for (let i = 0; i < 3; i++) {
        graphics.displayIconSprite((gameMap.width * 8 - (i + 1) * 8) * gameMap.pixelSize, gameMap.pixelSize, 0, (players[id].health > i) ? 0 : 1, 2);
    }

    // draw players
    for (const [pid, player] of Object.entries(players)) {
        graphics.displayFishSprite(player);
    }

    // draw cursor
    {
        if (mouseIsHeld) {
            let player = players[id];
            if (cursorData.x !== 0 && cursorData.y !== 0) {
                let cursorX = graphics.align(player.physics.x) + Math.sin(cursorData.r) * cursorData.display;
                let cursorY = graphics.align(player.physics.y) + Math.cos(cursorData.r) * cursorData.display;
                let pvp = false;
    
                // check if you can attack another player
                for (const [opid, otherPlayer] of Object.entries(players)) {
                    if (opid !== id) {
                        if (((player.physics.x + Math.sin(cursorData.r) * cursorData.display - otherPlayer.physics.x) ** 2 + (player.physics.y + Math.cos(cursorData.r) * cursorData.display - otherPlayer.physics.y) ** 2) ** 0.5 < 7 * gameMap.pixelSize || ((player.physics.x - otherPlayer.physics.x) ** 2 + (player.physics.y - otherPlayer.physics.y) ** 2) ** 0.5 < 7 * gameMap.pixelSize) {
                            pvp = true;
                        }
                    }
                }
    
                graphics.displayCursorSprite(cursorX, cursorY, pvp ? 0 : !gameMap.getCollisionArea(cursorX, cursorY), pvp);
            }
        }
    }

    // draw effects
    {
        for (let i = 0; i < effects.length; i++) {
            switch (effects[i][0]) {
                case "impact": //[world coordinates, time]
                    // display
                    graphics.displaySlapSprite(effects[i][1], effects[i][2], 4 - Math.floor(effects[i][3] / 4));
                    // handle update
                    effects[i][3]--;
                    if (effects[i][3] <= 0) {
                        effects.pop(i);
                        i--;
                    }
                    break;
                case "splat": //[player id, radians, time]
                    graphics.addDeathEffect(effects[i][1], effects[i][2], effects[i][3], effects[i][4]);
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