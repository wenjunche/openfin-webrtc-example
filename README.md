# openfin-webrtc-example

A sample WebRTC app that uses signaling and STUN servers hosted by OpenFin.

### Running the sample

1. Install project dependencies.

```sh
   npm i
```

2. Build the project.

```sh
   npm run build
```

3. Start the Webpack dev server.

```sh
   npm run start
```

4. Start the example.  Two instances of the example app need to be started so WebRTC can be established.

```sh
   npm run start:example
```

5. Check out [bloomberg service repo](git@github.com:openfin/bloomberg-service.git) and start the serice with in emulator mode.  Then start one instance of the example with:

```sh
   npm run start:example:blp
```

