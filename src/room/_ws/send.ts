import { IwsMessage } from "../interfaces";

const send = (message:IwsMessage,ws:WebSocket) => {
    ws.send(JSON.stringify(message))
}

export default send