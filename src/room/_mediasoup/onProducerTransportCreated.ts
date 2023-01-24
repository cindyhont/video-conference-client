import { DtlsParameters, IceCandidate, IceParameters, MediaKind } from "mediasoup-client/lib/types";
import { device, setProducer, setProducerTransport } from "."
import { IconnectProducerTransport, Iproduce, IwsEvent } from "../interfaces";
import { getVideoSrc, localDisplayStream, localUserStream, setVideoElement, useUserMedia, videoElements } from "../streams";
import { permissionDenied, showMsgBox, showVideos, updateVideoSize, videoContainer } from "../ui";
import { clientID, websocket } from "../ws";
import send from "../_ws/send";
import { fetchExistingProducerIDs } from "./fetchExistingProducerIDs";

const 
    onProducerTransportCreated = async (
        transportParams:{
            id: string;
            iceParameters: IceParameters;
            iceCandidates: IceCandidate[];
            dtlsParameters: DtlsParameters;
        },
        mediaKind:MediaKind,
    ) => {
        const 
            transport = device.createSendTransport(transportParams),
            videoSrc = getVideoSrc(),
            videoElem = document.getElementById('localVideo') as HTMLVideoElement
            
        setProducerTransport(transport,mediaKind)

        transport.on('connect',async ({dtlsParameters},callback,errback)=>{
            const message:IconnectProducerTransport = {
                type:'connectProducerTransport',
                payload:{
                    transportID:transport.id,
                    dtlsParameters,
                    mediaKind
                }
            }
            send(message,websocket)

            let producerNotConnected = true
            websocket.addEventListener('message',e=>{
                const msg = e.data
                if (typeof msg !== 'string'){
                    errback(new Error('non string data'))
                    return
                }

                const {type,payload} = JSON.parse(msg) as IwsEvent
                if (!!payload && 'mediaKind' in payload && payload.mediaKind === mediaKind){
                    if (type==='producerConnected') {
                        // console.log(mediaKind,'producerConnected')
                        producerNotConnected = false
                        callback()
                    } else if (producerNotConnected) {
                        // console.log(mediaKind,'producerNotConnected')
                        errback(new Error('producerNotConnected'))
                    }
                }
            })
        })

        transport.on('produce', async ({ kind, rtpParameters }, callback, errback ) => {
            // console.log(mediaKind,'produce')
            const message:Iproduce = {
                type:'produce',
                payload:{
                    clientID,
                    transportID:transport.id,
                    kind,
                    rtpParameters,
                }
            }
            send(message,websocket)

            let notProduced = true
            websocket.addEventListener('message',e=>{
                const msg = e.data
                if (typeof msg !== 'string') {
                    console.error('non string input')
                    return
                }

                const {type,payload} = JSON.parse(msg) as IwsEvent
                // console.log(mediaKind,notProduced,mediaKind,type,payload)

                if (!!payload && 'kind' in payload && payload.kind === mediaKind){
                    if (type === 'produced') {
                        notProduced = false
                        /**** fetch other producers ****/
                        if (mediaKind==='video') fetchExistingProducerIDs()
                        // console.log(mediaKind,'produced')
                        callback({id:payload.id})
                    } else if (notProduced) {
                        // console.log(mediaKind,'notProduced')
                        errback(new Error('notProduced'))
                    }
                }
            })
        })

        transport.on('connectionstatechange',state => {
            switch (state){
                case 'connecting':
                    // console.log(mediaKind,'connecting')
                    break
                case 'connected':
                    // console.log(mediaKind,'connected');
                    if (mediaKind==='video'){
                        videoElem.srcObject = useUserMedia(videoSrc) ? new MediaStream([localUserStream.getVideoTracks()[0]]) : new MediaStream([localDisplayStream.getVideoTracks()[0]]);
                        showVideos()
                        updateVideoSize()
                    }
                    break
                case 'failed':
                    // console.log(mediaKind,'failed')
                    transport.close()
                    break
            }
        })

        try {
            const _producer = await transport.produce({track: mediaKind === 'video' ? useUserMedia(videoSrc) ? localUserStream.getVideoTracks()[0] : localDisplayStream.getVideoTracks()[0] : localUserStream.getAudioTracks()[0]})
            setProducer(_producer,mediaKind)
        } catch (error) {
            videoContainer.classList.add('hidden')
            showMsgBox(permissionDenied)
        }
    }

export { onProducerTransportCreated }