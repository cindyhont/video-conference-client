import '../output.css';
import { roomID, setupWS, validateRoomID, websocket } from './ws';
import {
    browserNotSupportMsg,
    closeWindowBtn,
    enterRoomContainer,
    enterRoomBtn,
    connectionErrorContainer,
    reloadPageBtns,
    showMsgBox,
    updateVideoSize,
    videoContainer,
    postRoomIdValidation,
    spinner,
    leaveRoomBtn,
    nonVideoContainer,
    videoSourceIconCheckbox
} from './ui'
import createProducerTransport from './_mediasoup/createProducerTransport';
import { detectDevice } from 'mediasoup-client';
import { serverHost, setServerHost } from './_ws/serverHost';
import { isExistingRoom, producers, setIsExistingRoom } from './_mediasoup';
import { changeVideoSource, clearLocalStream, isTouchableDevice, prevVideoSrc, requestLocalStream, setPrevVideoSrc } from './streams';

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
        } else {
            if (isExistingRoom) {
                try {
                    await requestLocalStream()
                } catch (error) {
                    return
                }
                createProducerTransport('video')
                createProducerTransport('audio')
            }
            postRoomIdValidation.classList.add('hidden')
            enterRoomContainer.classList.add('hidden')
            spinner.classList.remove('hidden')
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
            videoContainer.style.setProperty('--video-w',`50%`)
            videoContainer.style.setProperty('--video-h',`100%`)
        } else {
            videoContainer.style.setProperty('--video-w',`100%`)
            videoContainer.style.setProperty('--video-h',`50%`)
        }
    },
    leaveRoom = () => {
        websocket?.close()
        
        setIsExistingRoom(true)
        clearLocalStream()

        videoContainer.classList.add('hidden')
        nonVideoContainer.classList.remove('hidden')

        // delete video elements
        const remoteVideos = document.querySelectorAll('video:not(#localVideo)')
        remoteVideos.forEach(e=>e.remove())
    },
    onViewportResize = () => {
        const {width,height} = window.visualViewport;
        document.body.style.setProperty('--full-width',`${width}px`)
        document.body.style.setProperty('--full-height',`${height}px`)
    },
    selectDefaultVideoSource = () => {
        let initialVideoSrc = localStorage.getItem('video-source');
        if (isTouchableDevice){
            initialVideoSrc = ['front-camera','rear-camera','camera-display'].includes(initialVideoSrc) ? initialVideoSrc : 'front-camera'
        } else {
            initialVideoSrc = ['desktop-camera','desktop-display'].includes(initialVideoSrc) ? initialVideoSrc : 'desktop-camera'
        }

        (document.querySelector(`#select-video-source [value="${initialVideoSrc}"]`) as HTMLInputElement).click();
        document.querySelectorAll('.select-video-source-svg').forEach(elem=>{
            if (elem.classList.contains(initialVideoSrc)) elem.classList.remove('hidden')
        });
        (document.querySelectorAll(`.${isTouchableDevice ? 'desktop' : 'touchable'}-video-source`) as NodeListOf<HTMLElement>).forEach(elem=>elem.style.display = 'none')
        
        setPrevVideoSrc(initialVideoSrc)
    },
    videoSourceInputOnChange = async(e:Event) => {
        const source = (e.target as HTMLInputElement).value
        if (!producers?.video || producers.video.closed){
            setPrevVideoSrc(source)
            return
        }

        if (source===prevVideoSrc) return

        try {
            await changeVideoSource(source)
            document.querySelectorAll('.select-video-source-svg').forEach(elem=>{
                if (elem.classList.contains(source)) elem.classList.remove('hidden')
                else elem.classList.add('hidden')
            })
            setPrevVideoSrc(source)
        } catch (error) {
            (document.getElementById(prevVideoSrc) as HTMLInputElement).click()
            
            const label = document.querySelector(`label[for="${source}"]`)
            label.classList.add('bg-slate-600')
            label.classList.remove('bg-cyan-400')
            label.classList.remove('cursor-pointer');
            (label as HTMLElement).style.cursor = 'not-allowed';
            (document.getElementById(prevVideoSrc) as HTMLInputElement).disabled = true;
        }
    },
    videoSourceInputOnClick = (e:Event) => {
        if (videoSourceIconCheckbox.checked) videoSourceIconCheckbox.click()

        const source = (e.target as HTMLInputElement).value

        if (!producers?.video || producers.video.closed) return
        if (source===prevVideoSrc && source==='desktop-display') changeVideoSource(source)
    }

if ('visualViewport' in window){
    onViewportResize()
    window.visualViewport.addEventListener('resize',onViewportResize)
}

closeWindowBtn.addEventListener('click',()=>window.close())
enterRoomBtn.addEventListener('click',getNewRoomServerHost)
leaveRoomBtn.addEventListener('click',leaveRoom)
window.matchMedia('(orientation: landscape)').addEventListener('change',onOrientationChange)

for (let i=0; i<reloadPageBtns.length; i++){
    reloadPageBtns.item(i).addEventListener('click',()=>window.location.reload())
}

selectDefaultVideoSource()

const videoSourceMenu = document.getElementById("select-video-source")
videoSourceMenu.addEventListener('change',videoSourceInputOnChange)
videoSourceMenu.addEventListener('click',videoSourceInputOnClick)

updateVideoSize()
checkCapability()
