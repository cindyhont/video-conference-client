import { IcreateConsumerTransport } from "../interfaces"
import { clientID, websocket } from "../ws"
import send from "../_ws/send"

const onNewProducer = (producerID:string) => {
    const message:IcreateConsumerTransport = {
        type:'createConsumerTransport',
        payload:{ 
            clientID,
            producerID,
        }
    }
    send(message,websocket)
}

export { onNewProducer }