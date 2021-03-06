# openfin-webrtc-example

A sample WebRTC app that uses signaling and STUN servers hosted by OpenFin.

## Build the example

Clone this repository and execute the following commands to build the project and start webpack dev server.

```sh
   npm install
   npm run build
   npm run start
```

## Run the example

Two instances of the example app need to be started so WebRTC can be established.

```sh
   npm run start:example
   npm run start:example
```

Once the two instances are connected,  Use "CREATE CHANNEL" buttons to create data channels with names enterd in "channel name".  For each data channel, text message can be sent and received with SEND button.

## Run the example with Bloomberg service

Check out [bloomberg service repo](git@github.com:openfin/bloomberg-service.git) and start the serice in emulator mode.  Then start one instance of the example with:

```sh
   npm run start:example:blp
```

Once two instances are connected, create a data channel first.  Then click on "Send ReferenceDataRequest" to send a Bloomberg request to the peer.

## Code in the example

1. Dependency in package.json

```sh
    "openfin-webrtc-client": "1.0.9",
```

2. Intializing PeerConnection

```javascript
import { Configuration, PeerChannel, PeerConnection } from 'openfin-webrtc-client';

   const configuration: Configuration = {
      signalingBaseUrl: 'https://webrtc-signaling-dev.openfin.co',
      pairingCode: 'myWebrtcExample'  // both peers need to use the same code
   };

    const peerConnection:PeerConnection = new PeerConnection(configuration);
    await peerConnection.initialize();

```

3. Listen to PeerConnection events

```javascript
   peerConnection.onConnect(() => {
         // connection is open
   });
   peerConnection.onDisconnect(() => {
         // connection is closed
   });

   peerConnection.onChannel((channel: PeerChannel) => {
      // got a new channel opened by the remote peer
   });

```

4. Create WebRTC Data Channel

```javascript
   const channel: PeerChannel = peerConnection.createDataChannel("chanelName");
```

More inforamtion is available [here](https://www.npmjs.com/package/openfin-webrtc-client).