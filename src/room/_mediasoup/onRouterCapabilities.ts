import { Device, RtpCapabilities } from "mediasoup-client/lib/types"
import { device, isExistingRoom, setDevice } from "."
import { IdeleteClient } from "../interfaces"
import { requestLocalStream } from "../streams"
import { browserNotSupportMsg, enterRoomContainer, showMsgBox } from "../ui"
import { clientID, websocket } from "../ws"
import send from "../_ws/send"
import createProducerTransport from "./createProducerTransport"

const onRouterCapabilities = async (routerRtpCapabilities:RtpCapabilities) => {
    try {
        const _device = new Device()
        setDevice(_device)
        await device.load({ routerRtpCapabilities })
    } catch (error) {
        enterRoomContainer.classList.add('hidden')
        showMsgBox(browserNotSupportMsg)
        if (error.name === 'UnsupportedError') console.error('Browser not supported')
        const message:IdeleteClient = {
            type:'deleteClient',
            payload:{clientID}
        }
        send(message,websocket)
        return
    }

    if (!isExistingRoom) {
        try {
            await requestLocalStream()
        } catch (error) {
            console.error(error)
            return
        }
        createProducerTransport('video')
        createProducerTransport('audio')
    } else if (enterRoomContainer.classList.contains('hidden')) showMsgBox(enterRoomContainer)
}

export { onRouterCapabilities }