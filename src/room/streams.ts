import { enterRoomContainer, permissionDenied, showMsgBox, videoContainer } from "./ui"
import { device, producers } from "./_mediasoup"

let 
    isTouchableDevice = window.matchMedia('(hover:none)').matches,
    prevVideoSrc = '',
    localVideoTrack:MediaStreamTrack,
    localAudioTrack:MediaStreamTrack,
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
        localVideoTrack?.stop()
        localAudioTrack?.stop()
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
    fetchVideo = (source:string) => new Promise<MediaStreamTrack>(async(resolve,reject)=>{
        try {
            let videoIsNotLive = true
            let stream:MediaStream
            
            while (videoIsNotLive){
                switch (source){
                    case 'desktop-camera':
                        stream = await navigator.mediaDevices.getUserMedia({video:true})
                        break
                    case 'desktop-display':
                    case 'camera-display':
                        stream = await navigator.mediaDevices.getDisplayMedia({video:true})
                        break
                    case 'front-camera':
                        stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'}})
                        break
                    case 'rear-camera':
                        stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}})
                        break
                    default: break;
                }
                videoIsNotLive = trackIsEnded(stream.getVideoTracks()[0])
            }
            setTimeout(()=>resolve(stream.getVideoTracks()[0]),100)
        } catch (error) {
            reject(error)
        }
    }),
    fetchAudio = () => new Promise<MediaStreamTrack>(async(resolve,reject)=>{
        try {
            let audioIsNotLive = true
            let stream:MediaStream
            while (audioIsNotLive){
                stream = await navigator.mediaDevices.getUserMedia({audio:true})
                audioIsNotLive = trackIsEnded(stream.getAudioTracks()[0])
            }
            resolve(stream.getAudioTracks()[0])
        } catch (error) {
            reject(error)
        }
    }),
    /*
    fetchVideo = async(source:string) => {
        try {
            let videoIsNotLive = true
            let stream:MediaStream
            
            while (videoIsNotLive){
                switch (source){
                    case 'desktop-camera':
                        stream = await navigator.mediaDevices.getUserMedia({video:true})
                        break
                    case 'desktop-display':
                    case 'camera-display':
                        stream = await navigator.mediaDevices.getDisplayMedia({video:true})
                        break
                    case 'front-camera':
                        stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'}})
                        break
                    case 'rear-camera':
                        stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}})
                        break
                    default: break;
                }
                videoIsNotLive = trackIsEnded(stream.getVideoTracks()[0])
            }

            if (!localVideoTrack) {
                console.log('localVideoTrack not exist')
                localVideoTrack = stream.getVideoTracks()[0];
                console.log('localVideoTrack readystate', stream.getVideoTracks()[0].readyState)
            } else {
                console.log('localVideoTrack exist')
                localVideoTrack.addEventListener('ended',()=>localVideoTrack = stream.getVideoTracks()[0])
                localVideoTrack.stop()
            }
        } catch (error) {
            console.error(error)
            throw error
        }
    },
    
    fetchAudio = async() => {
        try {
            let audioIsNotLive = true
            let stream:MediaStream
            while (audioIsNotLive){
                stream = await navigator.mediaDevices.getUserMedia({audio:true})
                audioIsNotLive = trackIsEnded(stream.getAudioTracks()[0])
            }
            localAudioTrack = stream.getAudioTracks()[0]
        } catch (error) {
            throw error
        }
    },
    */
    requestLocalStream = async() => {
        if (!device.canProduce('video')) {
            console.log('cannot produce video')
            userDeniedPermission()
            throw new Error('cannot produce video')
        }

        const videoSrc = (document.querySelector('input[name="select-video-source"]:checked') as HTMLInputElement).value

        try {
            localVideoTrack = await fetchVideo(videoSrc)
            localAudioTrack = await fetchAudio()
        } catch (error) {
            console.error(error)
            throw error
        }

        /*
        try {
            await Promise.all([
                fetchVideo(videoSrc),
                fetchAudio()
            ])
        } catch (error) {
            console.error(error)
            userDeniedPermission()
            throw error
        }
        */

        console.log(localAudioTrack)
        console.log(localVideoTrack)
    },
    changeVideoSource = async(source:string) => {
        try {
            localVideoTrack?.stop()
            producers?.video?.pause()
            localVideoTrack = await fetchVideo(source);
            (document.getElementById('localVideo') as HTMLVideoElement).srcObject = new MediaStream([localVideoTrack])
            producers?.video?.replaceTrack({track: localVideoTrack})
            producers?.video?.resume()
        } catch (error) {
            throw error
        }
    }

export {
    isTouchableDevice,
    prevVideoSrc,
    setPrevVideoSrc,
    localVideoTrack,
    localAudioTrack,
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