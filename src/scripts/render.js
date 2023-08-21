import { getSlapArea, maps } from './map.js';
import { cursorData } from './playerInput.js';
import { HSBToRGB, RGBToHSB, isMobile } from './utilities.js';

// This file contains code for rendering the game
let cnv;
let frame;
let q5;
let graphics;

const fishSheets = {};
let screenShakeTime = 0;
let graphicsEffects = [];

export async function setupGraphics(_q5) {
  // Create canvas
  q5 = _q5;
  cnv = q5.createCanvas(0, 0);
  q5.pixelDensity(1);
  q5.noSmooth();

  resizeCanvas(q5);
  await loadAssets(q5);
}

export function resizeCanvas() {
  if (q5 === null) { return; }
  frame = getGraphicsFrame();
  q5.resizeCanvas(frame.screenWidth + 300, frame.screenHeight + 300);
  cnv.style.width = `${frame.screenWidth + 300}px`;
  cnv.style.height = `${frame.screenHeight + 300}px`;
  cnv.style.display = 'block';
  cnv.style.position = 'fixed';
  cnv.style.left = `${frame.originX - 150}px`;
  cnv.style.top = `${frame.originY - 150}px`;

  const iconBar = document.getElementById('primary-icon-bar');
  iconBar.classList.remove('hidden');
  iconBar.style.position = 'fixed';
  iconBar.style.display = 'flex';
  if (frame.originX - 100 > 5) {
    iconBar.style['flex-direction'] = 'column';
    iconBar.style.left = `${frame.originX - (frame.screenWidth / 16) * 1.8}px`;
    iconBar.style.top = `${frame.originY - (frame.screenWidth / 16) * 0.2}px`;
  } else {
    iconBar.style['flex-direction'] = 'row';
    iconBar.style.left = `${frame.originX - (frame.screenWidth / 16) * 0.3}px`;
    iconBar.style.top = `${frame.originY - (frame.screenWidth / 16) * 1.7}px`;
  }
  iconBar.style.scale = `${frame.screenWidth / 8}%`;
}

async function loadAssets() {
  graphics = {
    tileSheet: await new Promise((resolve) => { q5.loadImage('resources/tile_spritesheet.png', resolve); }),
    fishSheet: await new Promise((resolve) => { q5.loadImage('resources/fish_spritesheet.png', resolve); }),
    fishShadowSheet: await new Promise((resolve) => { q5.loadImage('resources/fishshadow_spritesheet.png', resolve); }),
    slapSheet: await new Promise((resolve) => { q5.loadImage('resources/slap_spritesheet.png', resolve); }),
    cursorSheet: await new Promise((resolve) => { q5.loadImage('resources/cursor_sheet.png', resolve); }),
    background: await new Promise((resolve) => { q5.loadImage('resources/background.png', resolve); }),
    iconSheet: await new Promise((resolve) => { q5.loadImage('resources/icon_spritesheet.png', resolve); }),
    levelImage: await new Promise((resolve) => { q5.loadImage('resources/levelImage.png', resolve); }),
  };
}

export function toggleFullscreen() {
  q5.fullscreen(!q5.isFullscreen());

  if (isMobile()) {
    screen.orientation.lock('landscape');
  }

  resizeCanvas();

  if (q5.isFullscreen()) {
    document.getElementById('fullscreenOnIcon').classList.add('hidden');
    document.getElementById('fullscreenOffIcon').classList.remove('hidden');
  } else {
    document.getElementById('fullscreenOffIcon').classList.add('hidden');
    document.getElementById('fullscreenOnIcon').classList.remove('hidden');
  }
}

export function addGraphicsEffects(newEffects) {
  graphicsEffects = [...graphicsEffects, ...newEffects];
}

function getGraphicsFrame(width = 800, height = 600, marginRatio = 1 / 20) {
  const aspectRatio = height / width;
  let screenHeight;
  let screenWidth;
  let margin;

  if (aspectRatio > q5.windowHeight / q5.windowWidth) {
    margin = q5.windowHeight * marginRatio;
    screenHeight = q5.windowHeight - margin * 2;
    screenWidth = screenHeight / aspectRatio;
  } else {
    margin = q5.windowWidth * marginRatio;
    screenWidth = q5.windowWidth - margin * 2;
    screenHeight = screenWidth * aspectRatio;
  }

  return {
    width,
    height,
    screenHeight,
    screenWidth,
    originX: (q5.windowWidth - screenWidth) / 2,
    originY: (q5.windowHeight - screenHeight) / 2,
    changeRatio: screenWidth / width,
  };
}

const randomInRange = (min, max) => Math.random() * (max - min) + min;
// eslint-disable-next-line no-nested-ternary
const constrainValue = (value, min, max) => (value < min ? min : (value > max ? max : value));

function createSplatter(x, y, hue, r, pixelSize) {
  graphics.background.loadPixels();
  fishSheets[hue].loadPixels();
  const fishColor = fishSheets[hue].get(2, 5);
  let angle;
  let distance;
  let xPos;
  let yPos;
  for (let i = 0; i < 25; i += 1) {
    angle = randomInRange(r - Math.PI / 10, r + Math.PI / 10) + Math.PI;
    distance = randomInRange(0, 15);
    xPos = Math.floor(x / pixelSize + Math.sin(angle) * distance + randomInRange(-3, 3));
    yPos = Math.floor(y / pixelSize + Math.cos(angle) * distance + randomInRange(-3, 3));
    graphics.background.set(constrainValue(xPos, 0, 127), yPos, fishColor);
  }
  graphics.background.updatePixels();
}

export function renderGraphics(clientContext) {
  const { pixelSize, width: mapWidth, height: mapHeight } = maps[clientContext.state.map];
  const currentPlayer = clientContext.state.players.filter((p) => p.id === clientContext.clientId)[0];

  function align(value) {
    return Math.floor(value / pixelSize) * pixelSize;
  }

  // Screenshake
  let screenShakeMap = [];
  if (screenShakeTime > 0) {
    screenShakeTime -= 1;
    screenShakeMap = [
      ((Math.random() > 0.5) ? -1 : 1) * pixelSize,
      ((Math.random() > 0.5) ? -1 : 1) * pixelSize,
    ];
  } else {
    screenShakeMap = [0, 0];
  }

  // Create and render frame
  q5.background('#dbba67');
  q5.push();
  q5.translate(150 + screenShakeMap[0] * frame.changeRatio, 150 + screenShakeMap[1] * frame.changeRatio);
  q5.scale(frame.changeRatio);
  q5.fill('#b09554');
  q5.noStroke();
  q5.rect(-pixelSize, -pixelSize, frame.width + pixelSize * 2, frame.height + pixelSize * 2);

  // Remove any unused fish sprite sheets from memory
  const unusedPlayerColors = clientContext.state.players
    .filter((player) => ((player.color === null) ? false : !Object.keys(fishSheets).includes(player.color.toString())));

  for (let colorIndex = 0; colorIndex < unusedPlayerColors.length; colorIndex += 1) {
    console.log(`removed color:${unusedPlayerColors[colorIndex]}`);
    delete fishSheets[unusedPlayerColors[colorIndex]];
  }

  const playerSpriteInfo = {};

  // Create new fish sprite sheets based of fish hue if one does not exist
  for (let playerIndex = 0; playerIndex < clientContext.state.players.length; playerIndex += 1) {
    const player = clientContext.state.players[playerIndex];
    if (fishSheets[player.color] === undefined) {
      const tempFishSheet = q5.createImage(graphics.fishSheet.width, graphics.fishSheet.height);
      tempFishSheet.loadPixels();
      graphics.fishSheet.loadPixels();
      for (let i = 0; i < graphics.fishSheet.width; i += 1) {
        for (let j = 0; j < graphics.fishSheet.height; j += 1) {
          const pixel = (i + graphics.fishSheet.width * j) * 4;
          if (graphics.fishSheet.pixels[pixel + 3] > 100) {
            const hsbPixel = RGBToHSB(graphics.fishSheet.pixels[pixel], graphics.fishSheet.pixels[pixel + 1], graphics.fishSheet.pixels[pixel + 2]);
            const rgbPixel = HSBToRGB((hsbPixel[0] + player.color) % 360, hsbPixel[1], hsbPixel[2]);
            tempFishSheet.set(i, j, q5.color(rgbPixel[0], rgbPixel[1], rgbPixel[2]));
          }
        }
      }
      tempFishSheet.updatePixels();
      fishSheets[player.color] = tempFishSheet;
    }

    const angle = ((Math.PI * 2) + Math.atan2(player.vy, player.vx)) % (Math.PI * 2);
    playerSpriteInfo[playerIndex] = {
      // eslint-disable-next-line no-nested-ternary
      action: (player.vy ** 2 + player.vx ** 2 < 1) ? 0 : ((Math.abs(((Math.PI * 4) + player.r + Math.PI / 2) % (Math.PI * 2)) - angle) < Math.PI / 2) ? 2 : 1,
      direction: (Math.floor(((2 * player.r) / Math.PI) + 1 / 4) * (Math.PI / 2)) % (Math.PI * 2),
      rotationSprite: ((player.r / Math.PI + 1 / 8) % (1 / 2)) > (1 / 4),
    };
  }

  // Draw background
  q5.image(graphics.background, 0, 0, frame.width, frame.height);

  // Draw player shadows
  for (let playerIndex = 0; playerIndex < clientContext.state.players.length; playerIndex += 1) {
    const player = clientContext.state.players[playerIndex];
    const playerInfo = playerSpriteInfo[playerIndex];
    q5.push();
    q5.translate(Math.floor(player.x + pixelSize), Math.floor(player.y + pixelSize * 3));
    q5.rotate(playerInfo.direction);
    q5.image(
      graphics.fishShadowSheet,
      -5 * pixelSize,
      -5 * pixelSize,
      pixelSize * 11,
      pixelSize * 11,
      playerInfo.action * 12,
      playerInfo.rotationSprite * 11,
      11,
      11,
    );
    q5.pop();
  }

  // Draw level
  q5.image(graphics.levelImage, 0, 0, mapWidth * 50, mapHeight * 50);

  if (!currentPlayer) {
    // console.log('players: ');
    // console.log(state.players);
    // console.log(`clientId:${clientId}`);
    q5.pop();
    return;
  }

  // Health bar
  for (let i = 0; i < 3; i += 1) {
    q5.image(
      graphics.iconSheet,
      align((mapWidth * 8 - (i + 1) * 8) * pixelSize),
      pixelSize,
      pixelSize * 7,
      pixelSize * 7,
      0,
      ((currentPlayer.health > i) ? 0 : 1) * 8,
      7,
      7,
    );
  }

  // Display fish
  for (let playerIndex = 0; playerIndex < clientContext.state.players.length; playerIndex += 1) {
    const player = clientContext.state.players[playerIndex];
    const playerInfo = playerSpriteInfo[playerIndex];
    q5.push();
    q5.translate(Math.floor(player.x), Math.floor(player.y));
    if (player.name !== '') {
      q5.fill(255, 255, 255, 160);
      q5.textAlign(q5.CENTER);
      q5.textSize(25);
      const nameWidth = q5.textWidth(player.name) + 27;
      q5.rect(-nameWidth / 2, -54, nameWidth, 28, 20);
      const playerColor = HSBToRGB(player.color, 100, 100);
      q5.fill(q5.color(playerColor[0], playerColor[1], playerColor[2]));
      q5.text(player.name, 0, -30);
    }
    q5.rotate(playerInfo.direction);
    q5.image(
      fishSheets[player.color],
      -5 * pixelSize,
      -5 * pixelSize,
      pixelSize * 11,
      pixelSize * 11,
      playerInfo.action * 12,
      playerInfo.rotationSprite * 11,
      11,
      11,
    );
    q5.pop();
  }

  // Draw cursor when mouse is held
  if (cursorData.active) {
    if (cursorData.x !== 0 || cursorData.y !== 0) {
      const cursorX = currentPlayer.x + Math.sin(cursorData.r) * cursorData.display;
      const cursorY = currentPlayer.y + Math.cos(cursorData.r) * cursorData.display;
      let pvp = false;

      // check if you can attack another player
      for (let playerIndex = 0; playerIndex < clientContext.state.players.length; playerIndex += 1) {
        const otherPlayer = clientContext.state.players[playerIndex];
        if (otherPlayer.id !== clientContext.clientId) {
          if (((currentPlayer.x + Math.sin(cursorData.r) * cursorData.display - otherPlayer.x) ** 2 + (currentPlayer.y + Math.cos(cursorData.r) * cursorData.display - otherPlayer.y) ** 2) ** 0.5 < 7 * pixelSize || ((currentPlayer.x - otherPlayer.x) ** 2 + (currentPlayer.y - otherPlayer.y) ** 2) ** 0.5 < 7 * pixelSize) {
            pvp = true;
          }
        }
      }

      q5.image(graphics.cursorSheet, cursorX - pixelSize * 2, cursorY - pixelSize * 2, pixelSize * 5, pixelSize * 5, (pvp ? 0 : !getSlapArea(maps[clientContext.state.map], cursorX, cursorY)) * 6, pvp * 6, 5, 5);
    }
  }

  // Draw effects
  for (let i = 0; i < graphicsEffects.length; i += 1) {
    graphicsEffects[i].time -= 1;
    if (graphicsEffects[i].time <= 0) {
      graphicsEffects.pop(i);
      i -= 1;
      // eslint-disable-next-line no-continue
      continue;
    }
    switch (graphicsEffects[i].name) {
      // White circle on hit object
      case 'impact':
        q5.image(
          graphics.slapSheet,
          graphicsEffects[i].x - pixelSize * 4,
          graphicsEffects[i].y - pixelSize * 4,
          50,
          50,
          ((4 - Math.floor(graphicsEffects[i].time / 4)) % 2) * 9,
          Math.floor((4 - Math.floor(graphicsEffects[i].time / 4)) / 2) * 9,
          8,
          8,
        );
        break;

        // Splatter 'paint' on hit or death
      case 'splat':
        createSplatter(graphicsEffects[i].x, graphicsEffects[i].y, graphicsEffects[i].color, graphicsEffects[i].r, pixelSize);
        break;

        // Screen shake
      case 'shake':
        if (graphicsEffects[i].id === clientContext.clientId) {
          screenShakeTime = graphicsEffects[i].time;
        }
        break;
      default: break;
    }
  }
  q5.pop();
}
