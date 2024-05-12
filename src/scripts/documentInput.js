/* global qrcode */

import { cursorData } from './playerInput.js';
import { toggleFullscreen } from './render.js';
import { CONN_EVENTS } from './types.js';
import { HSBToRGB } from './utilities.js';

export function setupDocumentInput(clientContext) {
  window.onSettingsChange = () => {
    const displayName = document.getElementById('nameInput').value;
    const displayColor = document.getElementById('colorInput').value;
    updateColorDisplay();
    clientContext.sendEvent(CONN_EVENTS.metaDataChange, { name: displayName, color: displayColor });
  };

  function updateColorDisplay() {
    const colorSlider = document.getElementById('colorInput');
    const colorInputDisplay = document.getElementById('colorInputDisplay');
    const colorString = (() => `rgb(${HSBToRGB(colorSlider.value, 100, 100).join(', ')})`)();
    colorInputDisplay.style.color = colorString;
    colorSlider.style['accent-color'] = colorString;
  }

  window.updateColorDisplay = updateColorDisplay;

  const updateJoinInfo = () => {
    document.getElementById('joinInfo').hidden = false;
    document.getElementById('code').innerHTML = `Room Code: ${clientContext.serverId}`;
    const qr = qrcode(0, 'M');
    const link = `https://expitau.com/Fishgame/game.html?room=${clientContext.serverId}`;
    qr.addData(link);
    qr.make();
    const img = qr.createImgTag();
    const qrElt = document.getElementById('qr');
    qrElt.innerHTML = img;
    qrElt.firstChild.style.width = '100%';
    qrElt.firstChild.style.height = '100%';
    qrElt.firstChild.style.imageRendering = 'pixelated';
    qrElt.firstChild.style['border-radius'] = '0.5rem';
  };

  window.openSettings = () => {
    clientContext.allowInput = false;
    cursorData.active = false;
    const currentPlayer = clientContext.state.players.filter((p) => p.id === clientContext.clientId)[0];
    document.getElementById('nameInput').value = currentPlayer.name ?? '';
    document.getElementById('colorInput').value = currentPlayer.color ?? 0;
    updateColorDisplay();
    updateJoinInfo();
    document.getElementById('settingsModal').showModal();
  };

  window.closeSettings = () => {
    clientContext.allowInput = true;
    document.getElementById('settingsModal').close();
  };

  window.returnToLobby = () => {
    location.href = `index.html${location.search}`;
  };

  window.toggleFullscreen = () => {
    toggleFullscreen();
  };
}
