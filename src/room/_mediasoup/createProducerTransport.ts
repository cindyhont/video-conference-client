import { MediaKind } from "mediasoup-client/lib/types"
import { device } from "."
import { IcreateProducerTransport } from "../interfaces"
import { clientID, websocket } from "../ws"
import send from "../_ws/send"

const createProducerTransport = (kind:MediaKind) => {
    const message:IcreateProducerTransport = {
        type:'createProducerTransport',
        payload:{
            forceTcp:false,
            rtpCapabilities:device.rtpCapabilities,
            clientID,
            kind
        }
    }
    send(message,websocket)
}

export default createProducerTransport