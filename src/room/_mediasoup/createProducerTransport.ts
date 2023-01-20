import { device } from "."
import { IcreateProducerTransport } from "../interfaces"
import { clientID, websocket } from "../ws"
import send from "../_ws/send"

const createProducerTransport = () => {
    const message:IcreateProducerTransport = {
        type:'createProducerTransport',
        payload:{
            forceTcp:false,
            rtpCapabilities:device.rtpCapabilities,
            clientID,
        }
    }
    send(message,websocket)
}

export default createProducerTransport