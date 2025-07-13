const WebSocket = require('ws');
const fs = require('fs')
const { getGitRemoteUrl, isGitRepository } = require('./utils')
const data = JSON.parse(process.argv[2] || '{}');
const applicationId = data.application_id
const token = data.token

const gateway = 'wss://gateway.discord.gg/?encoding=json&v=10';
const ws = new WebSocket(gateway);

const isOnGitRepository = isGitRepository(data.cwd)

ws?.on('open', async () => {
  console.log('[OPEN] Connected to gateway');

  const { title, filename, workspace } = data
  const timestampStart = Number(data.start_timestamp) || Date.now();
  fs.writeFileSync('log.txt', String(timestampStart))
  const { largeImageUrl, smallImageUrl } = await getImageFromFileExtension(filename);

  const identifyPayload = {
    op: 2,
    d: {
      token,
      properties: {
        os: "linux",
        browser: "Discord Client",
        device: "Discord Client"
      },
      presence: {
        afk: true,
        since: Date.now(),
        status: 'online',
        activities: [{
          name: title,
          type: 0,
          details: data.details.replace("%f", filename).replace("%w", workspace),
          state: data.state.replace("%f", filename).replace("%w", workspace),
          timestamps: {
            start: timestampStart
          },
          assets: {
            large_text: filename,
            large_image: largeImageUrl?.replace('https://cdn.discordapp.com/', 'mp:'),
            small_text: 'Termux',
            small_image: smallImageUrl?.replace('https://cdn.discordapp.com/', 'mp:')
          },
          buttons: isOnGitRepository ? [data.repo_button_text] : null,
          metadata: isOnGitRepository ? { button_urls: [getGitRemoteUrl(data.cwd)] } : null,
          application_id: applicationId,
        }]
      },
      compress: false,
      capabilites: 65,
      large_threshold: 100
    }
  };
  console.log(`[PRESENCE] Updating presence to "Editing: ${filename}"`);
  ws?.send(JSON.stringify(identifyPayload));
});

ws?.on('message', async (data) => {
  const message = JSON.parse(data);
  if (message.op === 10) {
    console.log('[HELLO] Received hello payload');
    console.log('[HEARTBEAT] Starting heartbeat');
    setInterval(() => {
      ws?.send(JSON.stringify({ op: 1, d: null }));
    }, message.d.heartbeat_interval);
  }

  if (message.t === 'READY') {
    console.log('[READY] Received ready payload');
  }
});

async function getImageFromFileExtension(fileName) {
  const messagesFromChat = await fetch('https://discord.com/api/v10/channels/1304454461057400834/messages?limit=100', {
    headers: {
      Authorization: token
    }
  }).then(res => res.json());

  const attachments = messagesFromChat?.filter(message => message.attachments.length).map(message => message.attachments).flat();

  return {
    largeImageUrl: attachments
      .find(attachment => fileName.replace('.', '{separate}').split('{separate}')[1] === attachment.filename.replace('.png', '') || fileName.endsWith(attachment.filename.replace('.png', '')))?.url
      || attachments.find(attachment => attachment.filename === 'None.png')?.url,
    smallImageUrl: attachments.find(attachment => attachment.filename === 'Termux.png')?.url
  }
}

process.on('exit', () => {
  console.log('[EXIT] Exiting...');
  const payloadWithNoPresence = {
    op: 3,
    d: {
      since: Date.now(),
      activities: null,
      status: 'online',
      afk: true
    }
  };
  ws?.send(JSON.stringify(payloadWithNoPresence));
  ws?.close();
})

process.on('SIGTERM', () => {
  process.exit();
});
