
import * as React from 'react';
import { WebRTCSignaling, SignalingEvent } from 'openfin-webrtc-client';

//import { ThemeProvider } from '@rmwc/theme';
import '@rmwc/theme/styles';

import { Button } from '@rmwc/button';
import '@rmwc/button/styles';

import { TextField } from '@rmwc/textfield';
import '@rmwc/textfield/styles';

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
            <TextField label="channel name" onChange={ (ev) => onChannelNameChange((ev.target as HTMLInputElement).value) } value={ channelName} />
            <Button raised onClick={createChannel} disabled={!isWebRTCReady}>Create Channel</Button>
        </div>
        <div>
            <TextField label="outgoing text" onChange={ (ev) => onOutgoingTextChange((ev.target as HTMLInputElement).value) } />
            <Button raised  onClick={sendChannelText} disabled={ !dataChannel }>Send</Button>
        </div>
        <div style={{color: "white"}}>
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
    action: 'requestRefData',
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

const subscribeRequest = { 
    type: 'bloomberg',
    action: 'subscribe',
    request: [{
        security: 'IBM US Equity', 
        fields: ['LAST_PRICE'] 
    }]
};
    

export const Bloomberg: React.FunctionComponent<BloombergProps> = ( (props) => {
    const [isWebRTCReady, setIsWebRTCReady] = React.useState(false);
    const dataChannel = React.useRef(null);
    const [sendButtonDescription, setSendButtonDescription] = React.useState('');
    const [incomingText, setIncomingText] = React.useState('');
    const [subscribeData, setSubscribeData] = React.useState('');

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
            if (message.action === 'requestRefData') {
                const resp = await accessBloombergService(message.request);
                dataChannel.current.send(JSON.stringify({type: 'bloomberg', response: resp}));
            }
            if (message.action === 'subscribe') {
                await subscribeBloombergService(message.request);
            }
            if (message.response) {
                setIncomingText(message.response);
            }
            if (message.subscribeData) {
                setSubscribeData(JSON.stringify(message.subscribeData));
            }
        }
    };
    const sendBloombergRequest = () => {
        if (props.blpClient) {
            accessBloombergService(refDataRequest.request);
        } 
        else if (dataChannel.current) {
            setIncomingText('');
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
    const subscribeBloomberg = () => {
        if (props.blpClient) {
            subscribeBloombergService(refDataRequest.request);
        } 
        else if (dataChannel.current) {
            setSubscribeData('sending subscribe request');
            dataChannel.current.send(JSON.stringify(subscribeRequest));
        } else {
            setSubscribeData('Please create a data channel first');
        }
    }
    const subscribeBloombergService = async (request:any) => {
        // @ts-ignore
        const sessionStarted:boolean = await props.blpClient.startSession();
        if (!sessionStarted) {
            setSubscribeData('Error starting blpApi session');
            return;
        }
        // @ts-ignore
        props.blpClient.addEventListener('subscription-data', e => {
            setSubscribeData(JSON.stringify(e));
            dataChannel.current.send(JSON.stringify({type: 'bloomberg', subscribeData: e}));
        });
        // @ts-ignore
        await props.blpClient.subscribe(request);
    }

    return (
      <div>  
        <div>
            <button disabled={!isWebRTCReady || props.blpClient} onClick={sendBloombergRequest}>{sendButtonDescription}</button>
        </div>
        <div>
            <label>{incomingText}</label>
        </div>
        <br></br>
        <div>
            <button disabled={!isWebRTCReady || props.blpClient} onClick={subscribeBloomberg}>Subcribe to IBM US Equity</button>
        </div>
        <div>
            <label>{subscribeData}</label>
        </div>

      </div>
    );

})