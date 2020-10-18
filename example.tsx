import { Configuration, WebRTCSignaling } from 'openfin-webrtc-client';
import queryString from 'query-string';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Bloomberg, Channel } from './components';

const channelsMap: Map<string, RTCDataChannel> = new Map();  // label -> DataChannel

// @ts-ignore
let blpClient:any;

const configuration: Configuration = {
    signalingBaseUrl: 'https://webrtc-signaling-dev.openfin.co',
    pairingCode: 'webrtcExample',
    debug: false
};

window.addEventListener("DOMContentLoaded",  async () => {
    const webRTCClient:WebRTCSignaling = new WebRTCSignaling(configuration);    
    await webRTCClient.init();

    const parsed = queryString.parse(location.search);
    if (parsed.blp === 'true') {
        await blpClientInit();
    }

    setupChannelUI(webRTCClient);

});

function addChannel(channel: RTCDataChannel): boolean {
    if (!channelsMap.has(channel.label)) {
        channelsMap.set(channel.label, channel);
        return true;
    } else {
        return false;
    }
}

function removeChannel(channel: RTCDataChannel) {
    channelsMap.delete(channel.label);
}

function setupChannelUI(webRTCClient: WebRTCSignaling ) {

    ReactDOM.render(
        <Channel name='channel1' webRTCClient={webRTCClient} addChannel={addChannel} removeChannel={removeChannel} />,
        document.getElementById('channel1')
    );

    ReactDOM.render(
        <Channel name='channel2' webRTCClient={webRTCClient} addChannel={addChannel} removeChannel={removeChannel} />,
        document.getElementById('channel2')
    );

    ReactDOM.render(
        <Bloomberg webRTCClient={webRTCClient} blpClient={blpClient} />,
        document.getElementById('bloomberg')
    );

}

async function blpClientInit()  {
    console.log('initializing blpApi client');
    // window.blpApi is set in index.html
    // @ts-ignore
    blpClient = await window.blpApi.getClient();
}
