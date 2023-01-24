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
    } catch (error) {
        // show firefox error
        const p = document.createElement('p')
        p.innerText = error
        p.style.color = '#fff'
        p.style.position = 'absolute'
        p.style.top = '0'
        p.style.left = '0'
        p.style.zIndex = '1000'
        p.style.marginBottom = '20px'
        p.style.backgroundColor = '#000'
        document.body.appendChild(p)


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

    try {
        await device.load({ routerRtpCapabilities })
    } catch (error) {
        // show firefox error
        const p = document.createElement('p')
        p.innerText = error
        p.style.color = '#fff'
        p.style.position = 'absolute'
        p.style.top = '0'
        p.style.left = '0'
        p.style.zIndex = '1000'
        p.style.backgroundColor = '#000'
        document.body.appendChild(p)




        enterRoomContainer.classList.add('hidden')
        showMsgBox(browserNotSupportMsg)
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