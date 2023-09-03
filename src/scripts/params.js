export function getParamData() {
  const params = new URLSearchParams(window.location.search);

  let isServer = false;
  let isClient = false;
  let serverId = '';

  const playerMetadata = {
    name: '',
    color: Math.floor(Math.random() * 360),
  };

  if (params.get('m')) {
    const mode = params.get('m');
    isServer = mode % 2 === 1;
    isClient = Math.floor(mode / 2) % 2 === 1;
  } else {
    isClient = true;
  }

  if (params.get('name')) {
    playerMetadata.name = params.get('name');
  }

  if (params.get('room')) {
    serverId = params.get('room');
  } else {
    serverId = generateServerID();
  }

  return {
    serverId,
    isServer,
    isClient,
    playerMetadata,
  };
}

function generateServerID() {
  let result = '';
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789';

  for (let i = 0; i < 4; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}
