import { IfetchExistingProducerIDs } from "../interfaces"
import { clientID, roomID, websocket } from "../ws"
import send from "../_ws/send"

const fetchExistingProducerIDs = () => {
    const message:IfetchExistingProducerIDs = {
        type:'fetchExistingProducerIDs',
        payload:{
            roomID,
            clientID
        }
    }
    send(message,websocket)
}

export { fetchExistingProducerIDs }