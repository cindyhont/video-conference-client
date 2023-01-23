import { enterRoomContainer, permissionDenied, showMsgBox, videoContainer } from "./ui"
import { device, producers } from "./_mediasoup"

let 
    isTouchableDevice = window.matchMedia('(hover:none)').matches,
    prevVideoSrc = '',
    // localVideoTrack:MediaStreamTrack,
    // localAudioTrack:MediaStreamTrack,
    localStream = new MediaStream(),
    remoteStreams:{
        [clientID:string]:MediaStream
    } = {},
    videoElements:{
        [clientID:string]:HTMLVideoElement
    } = {}

const 
    setPrevVideoSrc = (s:string) => {
        localStorage.setItem('video-source',s)
        prevVideoSrc = s
    },
    clearLocalStream = () => {
        localStream.getTracks().forEach(t=>t.stop())
    },
    setRemoteStream = (clientID:string,track:MediaStreamTrack) => {
        if (clientID in remoteStreams) remoteStreams[clientID].addTrack(track)
        else remoteStreams[clientID] = new MediaStream([track])
    },
    deleteStream = (clientID:string) => {
        if (clientID in remoteStreams) delete remoteStreams[clientID]
    },
    setVideoElement = (elem:HTMLVideoElement,clientID:string) => {
        remoteStreams[clientID] = new MediaStream()
        elem.srcObject = remoteStreams[clientID]
        videoElements[clientID] = elem
    },
    deleteVideoElement = (clientID:string) => {
        videoElements[clientID]?.remove()
        delete videoElements[clientID]
    },
    userDeniedPermission = () => {
        videoContainer.classList.add('hidden')
        enterRoomContainer.classList.add('hidden')
        showMsgBox(permissionDenied)
    },
    trackIsEnded = (t:MediaStreamTrack) => t.readyState === 'ended',
    fetchVideo = (source:string) => new Promise<boolean>(async(resolve,reject)=>{
        if (source==='desktop-camera'){
            navigator.mediaDevices.getUserMedia({video:true,audio:false})
                .then(stream=>{
                    localStream.getVideoTracks().forEach(t=>{
                        t.stop()
                        localStream.removeTrack(t)
                    })
                    localStream.addTrack(stream.getVideoTracks()[0])
                    resolve(true)
                })
                .catch(error=>reject(error))
        } else if (source==='front-camera'){
            navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:false})
                .then(stream=>{
                    localStream.getVideoTracks().forEach(t=>{
                        t.stop()
                        localStream.removeTrack(t)
                    })
                    localStream.addTrack(stream.getVideoTracks()[0])
                    resolve(true)
                })
                .catch(error=>reject(error))
        } else if (source==='rear-camera'){
            navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'},audio:false})
                .then(stream=>{
                    localStream.getVideoTracks().forEach(t=>{
                        t.stop()
                        localStream.removeTrack(t)
                    })
                    localStream.addTrack(stream.getVideoTracks()[0])
                    resolve(true)
                })
                .catch(error=>reject(error))
        } else {
            navigator.mediaDevices.getDisplayMedia({video:true,audio:false})
                .then(stream=>{
                    localStream.getVideoTracks().forEach(t=>{
                        t.stop()
                        localStream.removeTrack(t)
                    })
                    localStream.addTrack(stream.getVideoTracks()[0])
                    resolve(true)
                })
                .catch(error=>reject(error))
        }
    }),
    fetchAudio = () => new Promise<boolean>(async(resolve,reject)=>{
        navigator.mediaDevices.getUserMedia({video:false,audio:true})
            .then(stream=>{
                localStream.getAudioTracks().forEach(t=>{
                    t.stop()
                    localStream.removeTrack(t)
                })
                localStream.addTrack(stream.getAudioTracks()[0])
                resolve(true)
            })
            .catch(error=>reject(error))
    }),
    requestLocalStream = async() => {
        if (!device.canProduce('video')) {
            console.log('cannot produce video')
            userDeniedPermission()
            throw new Error('cannot produce video')
        }

        const videoSrc = (document.querySelector('input[name="select-video-source"]:checked') as HTMLInputElement).value
        // let tracks:MediaStreamTrack[]

        try {
            await Promise.all([fetchAudio(),fetchVideo(videoSrc)])
        } catch (error) {
            console.error(error)
            throw error
        }
        console.log(localStream)
    },
    changeVideoSource = async(source:string) => {
        try {
            /*
            localVideoTrack?.stop()
            producers?.video?.pause()
            localVideoTrack = await fetchVideo(source);
            (document.getElementById('localVideo') as HTMLVideoElement).srcObject = new MediaStream([localVideoTrack])
            producers?.video?.replaceTrack({track: localVideoTrack})
            producers?.video?.resume()
            */
        } catch (error) {
            throw error
        }
    }

export {
    isTouchableDevice,
    prevVideoSrc,
    setPrevVideoSrc,
    localStream,
    // localVideoTrack,
    // localAudioTrack,
    remoteStreams,
    videoElements,
    clearLocalStream,
    setRemoteStream,
    deleteStream,
    setVideoElement,
    deleteVideoElement,
    requestLocalStream,
    changeVideoSource,
}