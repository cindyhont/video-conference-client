import { IgetRouterRtpCapabilities, IwsEvent } from './interfaces'
import { onRouterCapabilities } from './_mediasoup/onRouterCapabilities'
import { onProducerTransportCreated } from './_mediasoup/onProducerTransportCreated'
import { onNewProducer } from './_mediasoup/onNewProducer'
import { onConsumerTransportCreated } from './_mediasoup/onConsumerTransportCreated'
import send from './_ws/send'
import { serverHost } from './_ws/serverHost'
import { onExistingProducerIDs } from './_mediasoup/onExistingProducerIDs'
import { updateVideoSize } from './ui'

let 
    roomID:string,
    clientID:string,
    websocket:WebSocket = null

const 
    setRoomID = (_id:string) => roomID = _id,
    setupWS = (host:string) => {
        websocket = new WebSocket(host)

        websocket.addEventListener('open',()=>{
            const message:IgetRouterRtpCapabilities = {
                type:'getRouterRtpCapabilities',
                payload:{roomID,serverHost}
            }
            send(message,websocket)
        })

        websocket.addEventListener('message',e=>{
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
                    onProducerTransportCreated(payload)
                    break
                // some events in onProducerTransportCreated.ts and onConsumerTransportCreated.ts
                case 'newProducer':
                    onNewProducer(payload.producerID);
                    break;
                case 'deleteProducer':
                    document.getElementById(payload.producerID)?.remove()
                    updateVideoSize()
                    break
                case 'consumerTransportCreated':
                    onConsumerTransportCreated(payload);
                    break;
                case 'existingProducerIDs':
                    onExistingProducerIDs(payload.producerIDs)
                    break
                default: 
                    break;
            }
        })
    }

export {
    roomID,
    clientID,
    setRoomID,
    websocket,
    setupWS
}