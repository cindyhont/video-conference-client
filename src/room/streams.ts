import { enterRoomContainer, permissionDenied, showMsgBox, videoContainer } from "./ui"
import { device, producers } from "./_mediasoup"

let 
    isTouchableDevice = window.matchMedia('(hover:none)').matches,
    prevVideoSrc = '',
    localUserStream:MediaStream,
    localDisplayStream:MediaStream,
    remoteStreams:{
        [clientID:string]:MediaStream
    } = {},
    videoElements:{
        [clientID:string]:HTMLVideoElement
    } = {},
    videoIDs:string[] = []

const 
    setPrevVideoSrc = (s:string) => {
        localStorage.setItem('video-source',s)
        prevVideoSrc = s
    },
    clearLocalStream = () => {
        localUserStream.getTracks().forEach(t=>t.stop())
        localDisplayStream?.getTracks().forEach(t=>t.stop())
    },
    setRemoteStream = (clientID:string,track:MediaStreamTrack) => {
        if (clientID in remoteStreams) remoteStreams[clientID].addTrack(track)
        else remoteStreams[clientID] = new MediaStream([track])
    },
    setVideoElement = (elem:HTMLVideoElement,clientID:string) => {
        if (!videoIDs.includes(clientID)) videoIDs.push(clientID)
        remoteStreams[clientID] = new MediaStream()
        elem.srcObject = remoteStreams[clientID]
        videoElements[clientID] = elem
    },
    deleteVideoElement = (clientID:string) => {
        // delete video ID from array
        if (videoIDs.includes(clientID)) videoIDs = videoIDs.filter(e=>e!==clientID)

        // remove video element
        document.getElementById(clientID)?.remove()
        videoElements[clientID]?.remove()
        delete videoElements[clientID]

        // delete stream
        if (clientID in remoteStreams) {
            remoteStreams[clientID].getTracks().forEach(t=>{ t.stop() })
            delete remoteStreams[clientID]
        }
    },
    userDeniedPermission = () => {
        videoContainer.classList.add('hidden')
        enterRoomContainer.classList.add('hidden')
        showMsgBox(permissionDenied)
    },
    useUserMedia = (src:string) => ['desktop-camera','front-camera','rear-camera'].includes(src),
    getVideoSrc = () => (document.querySelector('input[name="select-video-source"]:checked') as HTMLInputElement).value,
    requestLocalStream = async() => {
        if (!device.canProduce('video')) {
            console.log('cannot produce video')
            userDeniedPermission()
            throw new Error('cannot produce video')
        }

        const videoSrc = getVideoSrc()
        if (useUserMedia(videoSrc)){
            const constraint = {
                audio:true,
                ...(videoSrc==='desktop-camera' && {video:true}),
                ...(videoSrc==='front-camera' && {video:{facingMode:'user'}}),
                ...(videoSrc==='rear-camera' && {video:{facingMode:'environment'}}),
            }
            try {
                localUserStream = await navigator.mediaDevices.getUserMedia(constraint);
            } catch (error) {
                console.error(error)
                throw error
            }
        } else {
            try {
                localUserStream = await navigator.mediaDevices.getUserMedia({video:false,audio:true});
                localDisplayStream = await navigator.mediaDevices.getDisplayMedia({video:true,audio:false});
            } catch (error){
                console.error(error)
                throw error
            }
        }
    },
    changeVideoSource = async(source:string) => {
        localUserStream.getVideoTracks().forEach(t=>{
            t.stop()
            localUserStream.removeTrack(t)
        })
        localDisplayStream?.getVideoTracks().forEach(t=>{
            t.stop()
            localDisplayStream.removeTrack(t)
        })

        producers?.video?.pause()
        if (useUserMedia(source)){
            try {
                const 
                    constraint = {
                        ...(source==='desktop-camera' && {video:true}),
                        ...(source==='front-camera' && {video:{facingMode:'user'}}),
                        ...(source==='rear-camera' && {video:{facingMode:'environment'}}),
                    },
                    stream = await navigator.mediaDevices.getUserMedia(constraint);
                producers?.video?.replaceTrack({track: stream.getVideoTracks()[0]})
                producers?.video?.resume()
                localUserStream.addTrack(stream.getVideoTracks()[0]);
                (document.getElementById('localVideo') as HTMLVideoElement).srcObject = new MediaStream([stream.getVideoTracks()[0]])
            } catch (error) {
                throw error
            }
        } else {
            try {
                localDisplayStream = await navigator.mediaDevices.getDisplayMedia({video:true,audio:false});
                producers?.video?.replaceTrack({track: localDisplayStream.getVideoTracks()[0]});
                producers?.video?.resume();
                (document.getElementById('localVideo') as HTMLVideoElement).srcObject = new MediaStream([localDisplayStream.getVideoTracks()[0]])
            } catch (error) {
                throw error
            }
        }
    }

export {
    isTouchableDevice,
    prevVideoSrc,
    setPrevVideoSrc,
    getVideoSrc,
    localUserStream,
    localDisplayStream,
    useUserMedia,
    remoteStreams,
    videoElements,
    clearLocalStream,
    setRemoteStream,
    setVideoElement,
    deleteVideoElement,
    videoIDs,
    requestLocalStream,
    changeVideoSource,
}