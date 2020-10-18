
import * as React from 'react';
import { WebRTCSignaling, SignalingEvent } from 'openfin-webrtc-client';

interface Props {
    name: string;
    webRTCClient:WebRTCSignaling;
    addChannel: (c: RTCDataChannel) => boolean;
    removeChannel: (c: RTCDataChannel) => void;
}

export const Channel: React.FunctionComponent<Props> = ( (props) => {
    const [isWebRTCReady, setIsWebRTCReady] = React.useState(false);
    const [channelName, setChannelName] = React.useState('');
    const channelNameRef = React.useRef('');
    const [outgoingText, setOutgoingText] = React.useState('');
    const [dataChannel, setDataChannel] = React.useState<RTCDataChannel>(null);
    const [incomingText, setIncomingText] = React.useState('');

    React.useEffect(() => {
        props.webRTCClient.on('webrtc', (data: SignalingEvent) => {
            if (data.action === 'ready') {
                onWebRTCReady();
            }
            else if (data.action === 'disconnect') {
                onWebRTCDisconnect();
            }
        });
        props.webRTCClient.on('channel', (ev: SignalingEvent) => {
            if (ev.channel.label === channelNameRef.current ) {
                if (ev.action === 'open') {
                    if (props.addChannel(ev.channel)) {
                        setDataChannel(ev.channel);
                        ev.channel.addEventListener('message', (onChannelMessage));
                    } else {
                        console.error('Error adding channel', ev.channel.label);
                    }
                }
                else if (ev.action === 'close') {
                    props.removeChannel(ev.channel);
                    cleanup();
                }
            }
            else if (channelNameRef.current === '' && ev.action === 'open') {
                if (props.addChannel(ev.channel)) {
                    setChannelName(ev.channel.label);
                    channelNameRef.current = ev.channel.label;
                    setDataChannel(ev.channel);
                    ev.channel.addEventListener('message', (onChannelMessage))
                }
            }
        });    
    }, []);


    const onWebRTCReady = () => {
        setIsWebRTCReady(true);
    };
    const onWebRTCDisconnect = () => {
        setIsWebRTCReady(false);
        cleanup();
    };
    const cleanup = () => {
        setDataChannel(null);
        setChannelName('');
        channelNameRef.current = '';
    }
    const onChannelMessage = (ev: MessageEvent) => {
        const message = JSON.parse(ev.data);
        if (message.type === 'chat') {
            setIncomingText(message.text);
        }    
    };
    const onChannelNameChange = (name:string) => {
        channelNameRef.current = name;
        setChannelName(name)
    };
    const onOutgoingTextChange = (text:string) => {
        setOutgoingText(text);
    };
    const createChannel = () => {
        props.webRTCClient.createDataChannel(channelNameRef.current);
    }
    const sendChannelText = () => {
        if (outgoingText && outgoingText !== '') {
            const payload = {
                type: 'chat',
                text: outgoingText
            }
            dataChannel.send(JSON.stringify(payload));
        }
    }

    return (
      <div>  
        <div>
            <input type="text" placeholder="Channel name" onChange={ (ev) => onChannelNameChange(ev.target.value) } value={ channelName} /><button onClick={createChannel} disabled={!isWebRTCReady}>Create Channel</button>
        </div>
        <div>
            <input type="text" onChange={ (ev) => onOutgoingTextChange(ev.target.value) } /><button onClick={sendChannelText} disabled={ !dataChannel }>Send</button>
        </div>
        <div>
            <span>Incoming Text:</span><span style={{margin: "0 0 0 10px"}}>{incomingText}</span>
        </div>
      </div>
    );

})

interface BloombergProps {
    webRTCClient:WebRTCSignaling;
    blpClient?: any;  // if set, this desktop has access to Blooberg service
}

const refDataRequest = { 
    type: 'bloomberg',
    request: {
            serviceUri: "//blp/refdata",
            operationName: "ReferenceDataRequest",
            requestObject: {
                securities: [
                    "IBM US Equity",
                    "VOD LN Equity"
                ],
                fields: [
                    "PX_LAST",
                    "DS002",
                    "EQY_WEIGHTED_AVG_PX"
                ],
                overrides: [
                    {
                    "fieldId": "VWAP_START_TIME",
                    "value": "9:30"
                    },
                    {
                    "fieldId": "VWAP_END_TIME",
                    "value": "11:30"
                    }
                ]
            }
        }
    };

export const Bloomberg: React.FunctionComponent<BloombergProps> = ( (props) => {
    const [isWebRTCReady, setIsWebRTCReady] = React.useState(false);
    const dataChannel = React.useRef(null);
    const [sendButtonDescription, setSendButtonDescription] = React.useState('');
    const [incomingText, setIncomingText] = React.useState('');

    React.useEffect(() => {
        props.webRTCClient.on('webrtc', (data: SignalingEvent) => {
            if (data.action === 'ready') {
                onWebRTCReady();
            }
            else if (data.action === 'disconnect') {
                onWebRTCDisconnect();
            }
        });
        props.webRTCClient.on('channel', (ev: SignalingEvent) => {
            if (!dataChannel.current ) {
                if (ev.action === 'open') {
                    dataChannel.current = ev.channel;
                    ev.channel.addEventListener('message', (onChannelMessage));
                }
                else if (ev.action === 'close') {
                    cleanup();
                }
            }
        });    
    }, []);

    if (sendButtonDescription === '') {
        if (props.blpClient) {
            setSendButtonDescription('Send ReferenceDataRequest to Bloomberg Service');
        } else {
            setSendButtonDescription('Send ReferenceDataRequest to Peer desktop');
        }
    }

    const onWebRTCReady = () => {
        setIsWebRTCReady(true);
    };
    const onWebRTCDisconnect = () => {
        setIsWebRTCReady(false);
        cleanup();
    };
    const cleanup = () => {
        dataChannel.current = '';
    }
    const onChannelMessage = async (ev: MessageEvent) => {
        const message = JSON.parse(ev.data);
        if (message.type === 'bloomberg') {
            if (message.request) {
                const resp = await accessBloombergService(message.request);
                dataChannel.current.send(JSON.stringify({type: 'bloomberg', response: resp}));
            }
            if (message.response) {
                setIncomingText(message.response);
            }
        }
    };
    const sendBloombergRequest = () => {
        if (props.blpClient) {
            accessBloombergService(refDataRequest.request);
        } 
        else if (dataChannel.current) {
            dataChannel.current.send(JSON.stringify(refDataRequest));
        } else {
            setIncomingText('Please create a data channel first');
        }
    }
    const accessBloombergService = async (request:any) => {
        setIncomingText(`Processing ${request.serviceUri}`);
        // @ts-ignore
        const sessionStarted:boolean = await props.blpClient.startSession();
        if (!sessionStarted) {
            setIncomingText('Error starting blpApi session');
            return;
        }
        // @ts-ignore
        let response = await props.blpClient.serviceRequest(request.serviceUri, request.operationName, request.requestObject);
        setIncomingText(JSON.stringify(response));
        return JSON.stringify(response);
    }

    return (
      <div>  
        <div>
            <button disabled={!isWebRTCReady} onClick={sendBloombergRequest}>{sendButtonDescription}</button>
        </div>
        <div>
            <label id="bloombergStatus">{incomingText}</label>
        </div>

      </div>
    );

})