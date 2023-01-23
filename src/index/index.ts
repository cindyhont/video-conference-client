import '../output.css';

let roomID = ''

const 
    getRoomLinkBtn = document.getElementById("share-room-link"),
    getRoomLinkTooltip = getRoomLinkBtn.getElementsByTagName('span')[0],
    roomURL = document.getElementById('room-url') as HTMLAnchorElement,
    onViewportResize = () => {
        const {width,height} = window.visualViewport;
        document.body.style.setProperty('--full-width',`${width}px`)
        document.body.style.setProperty('--full-height',`${height}px`)
    }

if ('visualViewport' in window){
    onViewportResize()
    window.visualViewport.addEventListener('resize',onViewportResize)
}

let removeTooltipTimeout:NodeJS.Timeout

getRoomLinkBtn.addEventListener('click',()=>{
    getRoomLinkTooltip.classList.remove('show')
    clearTimeout(removeTooltipTimeout)

    navigator.clipboard.writeText(`${process.env.CLIENT_HOST}/room?id=${roomID}`)
        .then(()=>{
            getRoomLinkTooltip.classList.add('show')
            removeTooltipTimeout = setTimeout(() => {
                getRoomLinkTooltip.classList.remove('show')
            }, 3000);
        })
})

getRoomLinkBtn.addEventListener('mouseleave',()=>{
    getRoomLinkTooltip.classList.remove('show')
    clearTimeout(removeTooltipTimeout)
})

fetch(`${process.env.API_PATH}/create-room-link`)
    .then(r=>r.json())
    .then(j=>{
        roomID = j.id
        roomURL.href = `/room?id=${j.id}`
    })
    .catch(e=>console.error(e))