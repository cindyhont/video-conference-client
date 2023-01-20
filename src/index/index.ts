import '../output.css';

let roomID = ''

console.log(process.env.API_PATH)

const 
    getRoomLinkBtn = document.getElementById("share-room-link"),
    getRoomLinkTooltip = getRoomLinkBtn.getElementsByTagName('span')[0],
    roomURL = document.getElementById('room-url') as HTMLAnchorElement

let removeTooltipTimeout:NodeJS.Timeout

getRoomLinkBtn.addEventListener('click',()=>{
    getRoomLinkTooltip.classList.remove('show')
    clearTimeout(removeTooltipTimeout)

    navigator.clipboard.writeText(roomID)
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