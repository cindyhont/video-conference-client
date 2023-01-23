import { MediaKind } from "mediasoup-client/lib/types"
import { IcreateConsumerTransport } from "../interfaces"
import { clientID, websocket } from "../ws"
import send from "../_ws/send"

const onNewProducer = (producerID:string,producerClientID:string,kind:MediaKind) => {
    const message:IcreateConsumerTransport = {
        type:'createConsumerTransport',
        payload:{ 
            clientID,
            producerID,
            producerClientID,
            kind,
        }
    }
    send(message,websocket)
}

export { onNewProducer }