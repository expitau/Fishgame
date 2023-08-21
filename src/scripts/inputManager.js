import { setupDocumentInput } from './documentInput.js';
import { setupPlayerInput } from './playerInput.js';
import { Q5 } from './q5.js';
import { resizeCanvas } from './render.js';

export const setupCallbacks = (clientContext) => {
  const q5 = new Q5();

  setupPlayerInput(clientContext, q5);
  setupDocumentInput(clientContext);

  q5.windowResized = () => resizeCanvas(q5);

  return q5;
};
