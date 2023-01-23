import { IgetRouterRtpCapabilities, IwsEvent } from './interfaces'
import { onRouterCapabilities } from './_mediasoup/onRouterCapabilities'
import { onProducerTransportCreated } from './_mediasoup/onProducerTransportCreated'
import { onNewProducer } from './_mediasoup/onNewProducer'
import { onConsumerTransportCreated } from './_mediasoup/onConsumerTransportCreated'
import send from './_ws/send'
import { serverHost, setServerHost } from './_ws/serverHost'
import { onExistingProducerIDs } from './_mediasoup/onExistingProducerIDs'
import { connectionErrorContainer, enterRoomContainer, roomNotExistContainer, showMsgBox, updateVideoSize } from './ui'
import { setIsExistingRoom } from './_mediasoup'

let 
    roomID:string,
    clientID:string,
    websocket:WebSocket = null

const 
    setRoomID = (_id:string) => roomID = _id,
    wsOnOpen = () => {
        const message:IgetRouterRtpCapabilities = {
            type:'getRouterRtpCapabilities',
            payload:{roomID,serverHost}
        }
        send(message,websocket)
    },
    wsOnMessage = (e:MessageEvent) => {
        const msg = e.data
        if (typeof msg !== 'string') {
            console.error('json error')
            return
        }

        const {type,payload} = JSON.parse(msg) as IwsEvent

        switch (type){
            case 'routerCapabilities':
                clientID = payload.clientID
                onRouterCapabilities(payload.rtpCapabilities)
                break
            case 'producerTransportCreated':
                onProducerTransportCreated(payload.params,payload.kind)
                break
            // some events in onProducerTransportCreated.ts and onConsumerTransportCreated.ts
            case 'newProducer':
                onNewProducer(payload.producerID,payload.producerClientID,payload.kind);
                break;
            case 'deleteClient':
                document.getElementById(payload.clientID)?.remove()
                updateVideoSize()
                break
            case 'consumerTransportCreated':
                onConsumerTransportCreated(payload);
                break;
            case 'existingProducerIDs':
                onExistingProducerIDs(payload)
                break
            default: 
                break;
        }
    },
    validateRoomID = async() => {
        websocket?.removeEventListener('close',validateRoomID)
        const params = new URL(window.location.href).searchParams
        let roomOK:boolean = false
        setRoomID(params.get('id'))
    
        try {
            const 
                response = await fetch(`${process.env.API_PATH}/get-room-server-host?roomID=${roomID}`),
                json = await response.json()

            roomOK = json.roomOK as boolean
            setServerHost(json?.serverHost || '')
            if (!roomOK) showMsgBox(roomNotExistContainer)
        } catch (e) {
            showMsgBox(connectionErrorContainer)
        }

        if (roomOK) {
            if (!!serverHost) {
                setIsExistingRoom(true)
                setupWS(serverHost)
            }
            else showMsgBox(enterRoomContainer)
        }
    },
    setupWS = (host:string) => {
        websocket = new WebSocket(host)
        websocket.addEventListener('open',wsOnOpen)
        websocket.addEventListener('message',wsOnMessage)
        websocket.addEventListener('close',validateRoomID)
    }

export {
    roomID,
    clientID,
    setRoomID,
    websocket,
    setupWS,
    validateRoomID,
}