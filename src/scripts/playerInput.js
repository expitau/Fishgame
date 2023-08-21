import { physicsInput } from './physics.js';
import { CONN_EVENTS, INPUT_TYPES } from './types.js';

export const cursorData = {
  r: 0,
  x: 0,
  y: 0,
  visible: false,
  max: 50,
  display: 60,
  active: false,
};

export function setupPlayerInput(clientContext, q5) {
  function sendInput() {
    if (cursorData.x !== 0 || cursorData.y !== 0) {
      clientContext.state = physicsInput(clientContext.state, INPUT_TYPES.move, { input: { cursorR: cursorData.r }, id: clientContext.clientId }).state;
      clientContext.sendEvent(CONN_EVENTS.clientUpdate, { cursorR: cursorData.r });
      cursorData.x = 0;
      cursorData.y = 0;
    }
  }

  q5.mouseDragged = () => {
    if (!clientContext.allowInput) return;
    cursorData.x += q5.mouseX - q5.pmouseX;
    cursorData.y += q5.mouseY - q5.pmouseY;

    const cursorDist = (cursorData.x ** 2 + cursorData.y ** 2) ** 0.5;
    if (cursorDist > cursorData.max) {
      cursorData.x *= cursorData.max / cursorDist;
      cursorData.y *= cursorData.max / cursorDist;
    }

    cursorData.r = Math.atan2(cursorData.x, cursorData.y);
  };

  q5.mousePressed = () => {
    q5.cursor('default');
    if (!clientContext.allowInput) return;
    cursorData.active = true;
    cursorData.x = 0;
    cursorData.y = 0;
  };

  q5.mouseReleased = () => {
    if (!clientContext.allowInput) return;
    cursorData.active = false;
    sendInput();
  };
}
