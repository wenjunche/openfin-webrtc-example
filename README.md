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