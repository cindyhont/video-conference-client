import { Device, RtpCapabilities } from "mediasoup-client/lib/types"
import { device, isExistingRoom, setDevice } from "."
import { IdeleteClient } from "../interfaces"
import { requestLocalStream } from "../streams"
import { enterRoomContainer, showMsgBox } from "../ui"
import { clientID, websocket } from "../ws"
import send from "../_ws/send"
import createProducerTransport from "./createProducerTransport"

const onRouterCapabilities = async (routerRtpCapabilities:RtpCapabilities) => {
    try {
        const _device = new Device()
        setDevice(_device)
    } catch (error) {
        if (error.name === 'UnsupportedError') console.error('Browser not supported')
        const message:IdeleteClient = {
            type:'deleteClient',
            payload:{clientID}
        }
        send(message,websocket)
        return
    }

    await device.load({ routerRtpCapabilities })
    if (!isExistingRoom) {
        try {
            await requestLocalStream()
        } catch (error) {
            console.error(error)
            return
        }
        createProducerTransport('video')
        createProducerTransport('audio')
    }

    // can start room
    if (isExistingRoom && enterRoomContainer.classList.contains('hidden')) showMsgBox(enterRoomContainer)
}

export { onRouterCapabilities }