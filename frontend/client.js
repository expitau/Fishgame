

document.addEventListener('DOMContentLoaded', () => {
    display = new Display();
    gameLoop();
})

function gameLoop() {
    display.background(10);
    window.requestAnimationFrame(gameLoop);
}