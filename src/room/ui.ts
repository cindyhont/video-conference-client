const
    spinner = document.getElementById('spinner'),
    postRoomIdValidation = document.getElementById('post-room-id-validation'),
    browserNotSupportMsg = document.getElementById('browser-not-support'),
    permissionDenied = document.getElementById('permission-denied') as HTMLDivElement,
    closeWindowBtn = document.getElementById("close-window") as HTMLButtonElement,
    enterRoomContainer = document.getElementById('enter-room-container'),
    enterRoomBtn = document.getElementById('enter-room-btn'),
    roomNotExistContainer = document.getElementById('room-not-exist-container'),
    connectionErrorContainer = document.getElementById("connection-error"),
    reloadPageBtns = document.getElementsByClassName("reload-page") as HTMLCollectionOf<HTMLButtonElement>,
    videoContainer = document.getElementById('videos') as HTMLDivElement,
    leaveRoomBtn = document.getElementById('leave-room') as HTMLButtonElement,
    nonVideoContainer = document.getElementById('non-video-container') as HTMLDivElement,
    showMsgBox = (msgElem:HTMLElement) => {
        spinner.classList.add('hidden')
        msgElem.classList.remove('hidden')
        postRoomIdValidation.classList.remove('hidden')
    },
    setVideoSize = (size:number) => {
        videoContainer.style.setProperty('--width',`${size}%`)
        videoContainer.style.setProperty('--height',`${size}%`)
    },
    updateVideoSize = () => {
        const videoCount = videoContainer.querySelectorAll('video').length
        if (videoCount===1) setVideoSize(100)
        else if (videoCount===2){
            if (window.matchMedia('(orientation: landscape)').matches){
                videoContainer.style.setProperty('--width',`50%`)
                videoContainer.style.setProperty('--height',`100%`)
            } else {
                videoContainer.style.setProperty('--width',`100%`)
                videoContainer.style.setProperty('--height',`50%`)
            }
        }
        else if (videoCount<5) setVideoSize(50)
        else setVideoSize(100/3)
    },
    showVideos = () => {
        spinner.classList.add('hidden')
        nonVideoContainer.classList.add('hidden')
        videoContainer.classList.remove('hidden')
    }

export {
    spinner,
    postRoomIdValidation,
    browserNotSupportMsg,
    permissionDenied,
    closeWindowBtn,
    enterRoomContainer,
    enterRoomBtn,
    roomNotExistContainer,
    connectionErrorContainer,
    reloadPageBtns,
    videoContainer,
    leaveRoomBtn,
    nonVideoContainer,
    showMsgBox,
    updateVideoSize,
    showVideos,
}