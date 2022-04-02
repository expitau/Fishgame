let socket;
//p5.disableFriendlyErrors = true;
let debugMode = false;
let serverConnectionInitialized = false;

let tickBuffer = { doTickBuffer: false }
let effects = []
let screenShakeTime = 0

let roomCode = function () {
    // Characters that are allowed to exist in a room code
    // let permittedChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ" + "1234567890"// + "abcdefghijklmnopqrstuvwxyz"
    let permittedChars = "ABCDEFGHJKLMNPQRTUVWXYZ" + "2346789"

    function fromIP(ip) {
        let bitSequence = ip.split(".").reduce((p, c) => p * 256 + parseInt(c), 0)
        let out = []
        while (bitSequence > 0) {
            let x = bitSequence % permittedChars.length
            bitSequence = (bitSequence - x) / permittedChars.length
            out = out.concat(permittedChars[x])
        }
        return out.reverse().join("")
    }
    function toIP(code) {
        let bitSequence = code.split('').reduce((p, c) => p * permittedChars.length + permittedChars.indexOf(c), 0)
        let out = []
        while (bitSequence > 0) {
            let x = bitSequence % 256
            bitSequence = (bitSequence - x) / 256
            out = out.concat([x])
        }
        return out.reverse().join(".")
    }
    return { fromIP, toIP }
}()


// Change me!
let code;
let params = new URLSearchParams(window.location.search)
if (params.get("room")) {
    code = params.get("room")
} else {
    code = prompt("Enter room code", "").toUpperCase()
    params.set("room", code)
    window.location.href = `?${params}`
}

startGame(roomCode.toIP(code))
function startGame(ip) {

    // Connect to server
    {
        socket = io(`http://${ip}:3000`);

        /** Socket Connection **/
        socket.on('connect', () => {
            console.log("You have connected as " + socket.id)
            id = socket.id;
        })

        /* On connection initialized */
        socket.on('init', (res) => {
            // set game data
            players = res.players;
            gameMap = new Map(res.gameMap);

            // set server flag ready
            serverConnectionInitialized = true;
            window.requestAnimationFrame(update)
        })

        /* On server update */
        socket.on('serverUpdate', (res) => {
            // Update to tick buffer
            tickBuffer.res = res;
            if (programReady && serverConnectionInitialized) {
                tickBuffer.res.effects.forEach(x => {effects.push(x); screenShakeTime = 3})
            }
            tickBuffer.doTickBuffer = true;
        })
    }

    // Server-client time sync
    let timeOffset = 0;
    {
        setInterval(syncTime, 3000)

        let timeSamples = [];
        function syncTime() {
            let timeSyncRequest = Date.now();
            socket.emit("timeSync", (res) => {
                // get current time offset
                timeSamples.push((res.time - timeSyncRequest) - (Date.now() - res.time)) / 2;

                // calculate average time offset
                timeOffset = 0;
                for (let i = 0; i < timeSamples.length; i++) {
                    timeOffset += timeSamples[i];
                }
                timeOffset /= timeSamples.length;

                // TODO: create function to find outlining datasamples and eliminate them from the average

                // print results
                if (debugMode) {
                    console.log("Time resynced by " + timeOffset + "ms");
                }
            });
        }
    }

    // Render loop
    function update() {
        // Wait for program and server flags
        if (programReady && serverConnectionInitialized) {
            // Setup game elements
            input.update();
            
            let lastUpdate;
            // Update physics information
            {
                lastUpdate ??= Date.now()
                // Read new tick buffer information
                if (tickBuffer.doTickBuffer) {
                    players = tickBuffer.res.players

                    tickBuffer.doTickBuffer = false;
                    lastUpdate = tickBuffer.res.lastUpdate - timeOffset;
                }

                // Run physics ticks on client as necessary
                deltaTime = (Math.round((Date.now() - lastUpdate) / 16));
                while (deltaTime > 0) {
                    deltaTime -= 1;
                    OnTick();
                }
                lastUpdate = Date.now()
            }

            // Render game
            OnRender(effects, screenShakeTime > 0 && screenShakeTime-- && true);

            // Draw FPS (rounded to 2 decimal places) at the top right of the screen
            if (debugMode) {
                let fps = frameRate();
                if (fps < 45) {
                    fill(255, 0, 0);
                    textSize(20);
                    text("FPS DROP: " + fps.toFixed(2), 4, 19);
                }
            }

            // Reset matrix
            pop();

            // Cleanup game elements
            input.reset();
        }
        // Rerun this function
        window.requestAnimationFrame(update);
    }
}



// On p5.js ready
let programReady = false;
var cnv;
function setup() {
    // Create canvas
    cnv = createCanvas(0, 0);

    noSmooth();
    pixelDensity(1);

    // Initialize game
    OnInit();

    // resize
    resizeCanvas(frame.screenWidth + 300, frame.screenHeight + 300);
    cnv.style('display', 'block');
    cnv.position(frame.originX - 150, frame.originY - 150, 'fixed');

    // Set program flag ready
    programReady = true;
}

// On window resize
function windowResized() {
    if (programReady && serverConnectionInitialized) {
        frame.calculateDimensions();
        resizeCanvas(frame.screenWidth + 300, frame.screenHeight + 300);
        cnv.style('display', 'block');
        cnv.position(frame.originX - 150, frame.originY - 150, 'fixed');
    }
}

// Toggle fullscreen mode
function toggleFullScreen() {
    var doc = window.document;
    var docEl = doc.documentElement;

    var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

    if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
        requestFullScreen.call(docEl);
    }
    else {
        cancelFullScreen.call(doc);
    }
}

