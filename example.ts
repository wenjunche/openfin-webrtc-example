import { Configuration, WebRTCSignaling, SignalingEvent } from 'openfin-webrtc-client';

const channelsMap: Map<string, RTCDataChannel> = new Map();  // label -> DataChannel

const configuration: Configuration = {
    signalingBaseUrl: 'https://webrtc-signaling-dev.openfin.co',
    peerDomain: 'webrtcExample',
    debug: false
};

window.addEventListener("DOMContentLoaded",  async () => {
    const webRTCClient:WebRTCSignaling = new WebRTCSignaling(configuration);
    webRTCClient.on('webrtc', (data: SignalingEvent) => {
        if (data.action === 'ready') {
            onWebRTCReady();
        }
        else if (data.action === 'disconnect') {
            onWebRTCDisconnect();
        }
    });
    webRTCClient.on('channel', (data: SignalingEvent) => {
        if (data.action === 'open') {
            addChannel(data.channel);
        }
        else if (data.action === 'close') {
            removeChannel(data.channel);
        }
    });
    await webRTCClient.init();

    setupChannelUI('1', webRTCClient);
    setupChannelUI('2', webRTCClient);

});

function onWebRTCReady() {
    for (let i = 1; i <= 2; i++) {
        const btn = document.getElementById(`channelCreate${i}`) as HTMLButtonElement;
        btn.disabled = false;
    }
}

function onWebRTCDisconnect() {
    channelsMap.forEach( channel => {
        removeChannel(channel);
    });
}

function setupChannelUI(channelId: string, webRTCClient: WebRTCSignaling ) {
    const createBtn = document.getElementById('channelCreate' + channelId);
    createBtn.addEventListener('click', () => {
        const cl = document.getElementById(`channelName${channelId}`) as HTMLInputElement
        const channelName = cl.value;
        webRTCClient.createDataChannel(channelName);
        cl.value = '';
    });

    const sendBtn = document.getElementById('channelSend' + channelId);
    sendBtn.addEventListener('click', () => {
        const channelName = (document.getElementById('channelName' + channelId) as HTMLInputElement).value;
        channelsMap.get(channelName).send((document.getElementById('outgoingText' + channelId) as HTMLInputElement).value)
    });
}

function addChannel(channel: RTCDataChannel) {
    channelsMap.set(channel.label, channel);
    const name = channel.label;
    for (let i = 1; i <= 2; i++) {
        const cl = document.getElementById(`channelName${i}`) as HTMLInputElement
        if (cl.value === '') {
            cl.value = name;
            channel.addEventListener('message', (event) => {
                populateIncomingText(channel.label, event.data);
            });
            channel.addEventListener('close', (event) => {
                cleanup(channel, cl);
            });
            const btn = document.getElementById(`channelSend${i}`) as HTMLButtonElement;
            btn.disabled = false;
            return;
        }    
    }
    console.error('There are 2 channels already');
}

function removeChannel(channel: RTCDataChannel) {
    channelsMap.delete(channel.label);
    const name = channel.label;
    for (let i = 1; i <= 2; i++) {
        const cl = document.getElementById(`channelName${i}`) as HTMLInputElement;
        if (cl.value === name) {
            cl.value = '';
            const outEl = document.getElementById(`outgoingText${i}`) as HTMLInputElement;
            outEl.value = '';
            const inEl = document.getElementById(`incomingText${i}`) as HTMLInputElement;
            inEl.value = '';
            const btn = document.getElementById(`channelSend${i}`) as HTMLButtonElement;
            btn.disabled = true;
            return;
        }    
    }
}

function cleanup(channel: RTCDataChannel, cl: HTMLInputElement) {
    channelsMap.delete(channel.label);
    cl.value = '';
}

function populateIncomingText(channelName: string, text: any) {
    const cl1 = document.getElementById('channelName1') as HTMLInputElement
    const cl2 = document.getElementById('channelName2') as HTMLInputElement
    if (cl1.value === channelName) {
        const incoming = document.getElementById('incomingText1');
        incoming.innerText = text;
    }
    if (cl2.value === channelName) {
        const incoming = document.getElementById('incomingText2');
        incoming.innerText = text;
    }
}
