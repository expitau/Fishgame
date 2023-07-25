
let lastUpdate = Date.now()
let deltaTime = 0;

function setup() {
    fg_setupGraphics(gameState);

    if (!(isMobile())) {
        document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock || document.body.webkitRequestPointerLock;
        document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;
        document.addEventListener("mousemove", OnMouseMove, false);
    }

    function renderLoop() {
        // Handle Input
        {

            if (keys[27] || keys[80]) {
                document.exitPointerLock();
            }
        }
        fg_renderGraphics(gameState);
        window.requestAnimationFrame(renderLoop)
    }
    window.requestAnimationFrame(renderLoop)


    setInterval(() => {
        deltaTime = Math.round(Date.now() / 16) - Math.round(lastUpdate / 16);
        while (deltaTime > 0) {
            deltaTime -= 1;
            if (connected) {
                fg_physicsTick(gameState);
            }
            lastUpdate = Date.now()
        }
    }, 1000 / 60) // 20 times per second
}

let cursorData = {
    r: 0,
    x: 0,
    y: 0,
    visible: false,
    max: 50,
    display: 60
};
let keys = [];
let mouseIsHeld = false;

function OnMouseMove(e) {
    let movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
    let movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;

    {
        cursorData.x += movementX;
        cursorData.y += movementY;

        let cursorDist = (cursorData.x ** 2 + cursorData.y ** 2) ** 0.5;
        if (cursorDist > cursorData.max) {
            cursorData.x *= cursorData.max / cursorDist;
            cursorData.y *= cursorData.max / cursorDist;
        }

        cursorData.r = Math.atan2(cursorData.x, cursorData.y);
    }
}

function mouseDragged() {
    if (isMobile()) {
        let movementX = mouseX - pmouseX;
        let movementY = mouseY - pmouseY;

        {
            cursorData.x += movementX;
            cursorData.y += movementY;

            let cursorDist = (cursorData.x ** 2 + cursorData.y ** 2) ** 0.5;
            if (cursorDist > cursorData.max) {
                cursorData.x *= cursorData.max / cursorDist;
                cursorData.y *= cursorData.max / cursorDist;
            }

            cursorData.r = Math.atan2(cursorData.x, cursorData.y);
        }
    }
}

function isMobile() {
    return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
}

function mousePressed() {
    mouseIsHeld = true;
    cursorData.x = 0;
    cursorData.y = 0;

    if (!(isMobile())) {
        // document.body.requestPointerLock();
    }
}

function doubleClicked() {
    toggleFullScreen();
}

function mouseReleased() {
    mouseIsHeld = false;

    if (cursorData.x != 0 && cursorData.y != 0) {
        fg_physicsInput(gameState, {
            cursorR: cursorData.r
        }, id);
        serverConnection.send({ type: CONN_EVENTS.clientUpdate, data: { cursorR: cursorData.r } });
        cursorData.x = 0;
        cursorData.y = 0;
    }
}

function keyPressed() {
    keys[keyCode] = true;
}

function keyReleased() {
    keys[keyCode] = false;
}

let screenShakeTime = 0;

// On physics tick, map state -> new state
function fg_physicsTick(state) {
    for (let i = 0; i < state.effects.length; i++) {
        state.effects[i].time--;
        if (state.effects[i].time <= 0) {
            state.effects.pop(i);
        }
    }

    // Loop through all players
    for (const player of state.players) {
        // Add gravity
        player.vy += 0.06;

        // Add air resistance
        player.vy *= 0.998;
        player.vx *= 0.997;
        player.vr *= 0.995;

        // Calculate next position
        let newPosX = player.x + player.vx;
        let newPosY = player.y + player.vy;

        //Test for x coordinate collisions
        if (!maps[state.map].colliders.includes(getCurrentTile(maps[state.map], newPosX + ((newPosX > player.x) ? 1 : -1) * maps[state.map].pixelSize, player.y))) {
            // On no collision, update player position
            player.x = newPosX;
        } else {
            // On collision, bounce x velocity with energy lost
            player.vx *= -0.9;

            // Set player rotation velocity based on current y velocity
            player.vr = player.vy * (player.vx > 0 ? 1 : -1) * 0.015;
        }

        //Test for y coordinate collision
        if (!maps[state.map].colliders.includes(getCurrentTile(maps[state.map], player.x, newPosY + ((newPosY > player.y) ? 1 : -1) * maps[state.map].pixelSize))) {
            // On no collision, update player position
            player.y = newPosY;
        } else {
            // On collision, bounce y velocity with energy lost
            player.vy *= -0.9;

            // Set player rotation velocity based on current x velocity and whether a floor or ceiling was hit
            if (Math.abs(player.vx) > 0.7) {
                player.vr = player.vx * (player.vy > 0 ? -0.5 : 1) * 0.02;
            } else {
                player.vr = player.vx * (player.vy > 0 ? 1 : -1) * 0.005;
            }

            // If player rotation velocity is lower than threthhold, update player rotation to slowly align to surface
            if (Math.abs(player.vr) < 0.2) {
                if (player.r < Math.PI / 2) {
                    player.r *= 0.6;
                } else if (player.r > Math.PI * 3 / 2) {
                    player.r = 2 * Math.PI + (player.r - 2 * Math.PI) * 0.6;
                } else {
                    player.r = Math.PI + (player.r - Math.PI) * 0.6;
                }
            }
        }

        // Update player rotation
        player.r += player.vr;

        // Bound player rotation between 0 and 2 * PI
        player.r = ((Math.PI * 4) + player.r) % (Math.PI * 2);

        // Calculate angle of velocity
        let vAngle = ((Math.PI * 2) + Math.atan2(player.vy, player.vx)) % (Math.PI * 2);

        // if (player.vy ** 2 + player.vx ** 2 < 1) {
        //     // If absolute player velocity is less than 1, flatfish
        //     player.physics.action = 0;
        // } else if (Math.abs(((Math.PI * 4) + player.physics.r + Math.PI / 2) % (Math.PI * 2) - vAngle) < Math.PI / 2) {
        //     // If velocity angle pointed up down the fish, bend ends up
        //     player.physics.action = 2;
        // } else {
        //     // If velocity angle pointed down on the fish, bend ends down
        //     player.physics.action = 1;
        // }

        state.x = player.x;
        state.y = player.y;
    }
}

// // On player input
function fg_physicsInput(state, input, id) {
    if (!connected) return;

    let player = state.players.filter(player => player.id === id)[0];

    // Break cursor into x,y components
    let dx = Math.sin(input.cursorR);
    let dy = Math.cos(input.cursorR);
    let pvp = false;

    // If player can hit a player
    for (let otherPlayer of state.players) {
        if (otherPlayer.id !== player.id) {
            if (((player.x + dx * 60 - otherPlayer.x) ** 2 + (player.y + dy * 60 - otherPlayer.y) ** 2) ** 0.5 < 7 * maps[state.map].pixelSize ||
                ((player.x - otherPlayer.x) ** 2 + (player.y - otherPlayer.y) ** 2) ** 0.5 < 7 * maps[state.map].pixelSize) {
                // Set hit power
                let power = 7;

                // Apply new player velocities
                player.vx = -power * dx;
                player.vy = -power * dy;
                player.vr = 0.2 * (player.vx > 0 ? 1 : -1);
                otherPlayer.vx = power * dx;
                otherPlayer.vy = power * dy;
                otherPlayer.vr = -player.vr;
                otherPlayer.health--;

                // Update player rotation to point of contact
                player.r = (input.cursorR + Math.PI) % (Math.PI * 2);

                // Add slap effect
                state.effects.push({
                    name: "impact",
                    x: (otherPlayer.x + player.x) / 2,
                    y: (otherPlayer.y + player.y) / 2,
                    time: 15
                });

                // On Player death
                if (otherPlayer.health <= 0) {
                    state.effects.push({
                        time: "splat",
                        x: otherPlayer.x,
                        y: otherPlayer.y,
                        color: otherPlayer.color,
                        r: player.r,
                        time: 15
                    });
                    otherPlayer.health = 3;
                    otherPlayer.x = maps[state.map].spawnPoint[0]
                    otherPlayer.y = maps[state.map].spawnPoint[1]
                    otherPlayer.vx = 0
                    otherPlayer.vy = 0
                    otherPlayer.vr = 0
                } else {
                    state.effects.push({
                        name: "splat",
                        x: otherPlayer.x,
                        y: otherPlayer.y,
                        color: otherPlayer.color,
                        r: player.r,
                        time: 2
                    });
                }

                pvp = true;
            }
        }
    }

    // If player can hit a tile
    if (!pvp && getCollisionArea(maps[state.map], player.x + dx * 60, player.y + dy * 60)) {
        // Set hit power
        let power = 7;

        // Calculate what factor of new movement to conserved momentum to use on both the x and y axis
        let xFactor = Math.min(Math.max(Math.abs((-power * dx) / player.vx), 0.01), 0.99);
        let yFactor = Math.min(Math.max(Math.abs((-power * dy) / player.vy), 0.01), 0.99);

        // Apply new player velocities
        player.vx = (-power * dx) * xFactor + player.vx * (1 - xFactor);
        player.vy = (-power * dy) * yFactor + player.vy * (1 - yFactor);
        player.vr = 0.2 * (player.vx > 0 ? 1 : -1);

        // Update player rotation to point of contact
        player.r = (input.cursorR + Math.PI) % (Math.PI * 2);

        // Add slap effect
        state.effects.push({
            name: "impact",
            x: player.x + dx * 15,
            y: player.y + dy * 15,
            time: 15
        });
    }
}
