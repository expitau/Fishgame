
/** Canvas Control **/
function setup() {
    createCanvas(windowWidth, windowHeight)
}

// Dynamically change the size of the canvas on window resize
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

window.requestAnimationFrame(render)

function render(){
    draw();
    window.requestAnimationFrame(render)
}