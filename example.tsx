import { Configuration, PeerChannel, PeerConnection } from 'openfin-webrtc-client';
import queryString from 'query-string';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Bloomberg, Channel } from './components';

const channelsMap: Map<string, PeerChannel> = new Map();  // label -> DataChannel

// @ts-ignore
let blpClient:any;

const configuration: Configuration = {
    signalingBaseUrl: 'https://webrtc-signaling-dev.openfin.co',
    pairingCode: 'webrtcExample',
    debug: false
};

window.addEventListener("DOMContentLoaded",  async () => {
    const peerConnection:PeerConnection = new PeerConnection(configuration);

    const parsed = queryString.parse(location.search);
    if (parsed.blp === 'true') {
        await blpClientInit();
    }

    setupChannelUI(peerConnection);

    await peerConnection.initialize();
});

function addChannel(channel: PeerChannel): boolean {
    if (!channelsMap.has(channel.name)) {
        channelsMap.set(channel.name, channel);
        return true;
    } else {
        return false;
    }
}

function removeChannel(channel: PeerChannel) {
    channelsMap.delete(channel.name);
}

function setupChannelUI(peerConnection: PeerConnection) {

    ReactDOM.render(
        <Channel name='channel1' peerConnection={peerConnection}
                addChannel={addChannel} removeChannel={removeChannel} />,
        document.getElementById('channel1')
    );

    ReactDOM.render(
        <Channel name='channel2' peerConnection={peerConnection}
                addChannel={addChannel} removeChannel={removeChannel} />,
        document.getElementById('channel2')
    );

    ReactDOM.render(
        <Bloomberg peerConnection={peerConnection} blpClient={blpClient} />,
        document.getElementById('bloomberg')
    );

}

async function blpClientInit()  {
    console.log('initializing blpApi client');
    try {
    // window.blpApi is set in index.html
    // @ts-ignore
        blpClient = await window.blpApi.getClient();        
    } catch (err) {
        console.error(err);
    }
}
