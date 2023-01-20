import '../output.css';
import { roomID, setRoomID, setupWS, websocket } from './ws';
import {
    browserNotSupportMsg,
    closeWindowBtn,
    enterRoomContainer,
    enterRoomBtn,
    roomNotExistContainer,
    connectionErrorContainer,
    reloadPageBtns,
    showMsgBox,
    updateVideoSize,
    videoContainer,
    postRoomIdValidation,
    spinner,
    leaveRoomBtn,
    nonVideoContainer
} from './ui'
import createProducerTransport from './_mediasoup/createProducerTransport';
import { detectDevice } from 'mediasoup-client';
import { serverHost, setServerHost } from './_ws/serverHost';
import { isExistingRoom, setIsExistingRoom } from './_mediasoup';

const 
    getNewRoomServerHost = async() => {
        if (!serverHost) {
            try {
                const
                    response = await fetch(`${process.env.API_PATH}/open-new-room-get-host?roomID=${roomID}`),
                    json = await response.json()
                setServerHost(json.host)
                setupWS(json.host)
            } catch (error) {
                enterRoomContainer.classList.add('hidden')
                showMsgBox(connectionErrorContainer)
            }
        }
        // start room
        if (!!serverHost) {
            if (isExistingRoom) createProducerTransport()
            postRoomIdValidation.classList.add('hidden')
            enterRoomContainer.classList.add('hidden')
            spinner.classList.remove('hidden')
        }
    },
    validateRoomID = async() => {
        const params = new URL(window.location.href).searchParams
        let roomOK:boolean = false
        setRoomID(params.get('id'))
    
        try {
            const 
                response = await fetch(`${process.env.API_PATH}/get-room-server-host?roomID=${roomID}`),
                json = await response.json()

            roomOK = json.roomOK as boolean
            setServerHost(json?.serverHost || '')
            if (!roomOK) showMsgBox(roomNotExistContainer)
        } catch (e) {
            showMsgBox(connectionErrorContainer)
        }

        if (roomOK) {
            if (!!serverHost) {
                setIsExistingRoom(true)
                setupWS(serverHost)
            }
            else showMsgBox(enterRoomContainer)
        }
    },
    checkCapability = () => {
        const handlerName = detectDevice()
        if ((!('WebSocket' in window)) || !handlerName) showMsgBox(browserNotSupportMsg)
        else validateRoomID()
    },
    onOrientationChange = (e:MediaQueryListEvent) => {
        if (videoContainer.querySelectorAll('video').length !== 2) return
        if (e.matches){
            videoContainer.style.setProperty('--width',`50%`)
            videoContainer.style.setProperty('--height',`100%`)
        } else {
            videoContainer.style.setProperty('--width',`100%`)
            videoContainer.style.setProperty('--height',`50%`)
        }
    },
    leaveRoom = () => {
        websocket?.close()

        videoContainer.classList.add('hidden')
        nonVideoContainer.classList.remove('hidden')

        validateRoomID()

        // delete video elements
        const remoteVideos = document.querySelectorAll('video:not(#localVideo)')
        let ids:string[] = []
        remoteVideos.forEach(e=>ids.push(e.id))
        ids.forEach(e=>document.getElementById(e)?.remove())
    }

closeWindowBtn.addEventListener('click',()=>window.close())
enterRoomBtn.addEventListener('click',getNewRoomServerHost)
leaveRoomBtn.addEventListener('click',leaveRoom)
window.matchMedia('(orientation: landscape)').addEventListener('change',onOrientationChange)

for (let i=0; i<reloadPageBtns.length; i++){
    reloadPageBtns.item(i).addEventListener('click',()=>window.location.reload())
}

updateVideoSize()
checkCapability()