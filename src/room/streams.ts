import { enterRoomContainer, permissionDenied, showMsgBox, showVideos, videoContainer } from "./ui"
import { device, producers } from "./_mediasoup"

let 
    isTouchableDevice = window.matchMedia('(hover:none)').matches,
    prevVideoSrc = '',
    // localVideoTrack:MediaStreamTrack,
    // localAudioTrack:MediaStreamTrack,
    localUserStream:MediaStream,
    localDisplayStream:MediaStream,
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
        localUserStream.getTracks().forEach(t=>t.stop())
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
    useUserMedia = (src:string) => ['desktop-camera','front-camera','rear-camera'].includes(src),
    getVideoSrc = () => (document.querySelector('input[name="select-video-source"]:checked') as HTMLInputElement).value,
    requestLocalStream = async() => {
        if (!device.canProduce('video')) {
            console.log('cannot produce video')
            userDeniedPermission()
            throw new Error('cannot produce video')
        }

        /*
        const videoSrc = getVideoSrc()

        if (useUserMedia(videoSrc)){
            const constraint = {
                audio:true,
                ...(videoSrc==='desktop-camera' && {video:true}),
                ...(videoSrc==='front-camera' && {video:{facingMode:'user'}}),
                ...(videoSrc==='rear-camera' && {video:{facingMode:'environment'}}),
            }
            try {
                let videoNotLive = true
                while (videoNotLive){
                    localUserStream = await navigator.mediaDevices.getUserMedia(constraint);
                    videoNotLive = localUserStream.getVideoTracks()[0].readyState === 'ended';
                }
                (document.getElementById('localVideo') as HTMLVideoElement).srcObject = new MediaStream([localUserStream.getVideoTracks()[0]]);
                showVideos()
            } catch (error) {
                console.error(error)
                throw error
            }
        } else {
            try {
                localUserStream = await navigator.mediaDevices.getUserMedia({video:false,audio:true});

                let videoNotLive = true
                while (videoNotLive){
                    localDisplayStream = await navigator.mediaDevices.getDisplayMedia({video:true,audio:false});
                    videoNotLive = localDisplayStream.getVideoTracks()[0].readyState === 'ended';
                }
                (document.getElementById('localVideo') as HTMLVideoElement).srcObject = localDisplayStream
                showVideos()
            } catch (error){
                console.error(error)
                throw error
            }
        }
        */

        try {
            // let videoNotLive = true
            // while (videoNotLive){
                localUserStream = await navigator.mediaDevices.getUserMedia({video:true,audio:true});
            //     videoNotLive = localUserStream.getVideoTracks()[0].readyState === 'ended';
            //     console.log(localUserStream.getVideoTracks()[0].readyState)
            // }
            // (document.getElementById('localVideo') as HTMLVideoElement).srcObject = new MediaStream([localUserStream.getVideoTracks()[0]]);
            // showVideos()
        } catch (error) {
            console.error(error)
            throw error
        }
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
    getVideoSrc,
    localUserStream,
    localDisplayStream,
    useUserMedia,
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