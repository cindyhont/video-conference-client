import { DtlsParameters, IceCandidate, IceParameters, MediaKind } from "mediasoup-client/lib/types";
import { device, setProducer, setProducerTransport } from "."
import { IconnectProducerTransport, Iproduce, IwsEvent } from "../interfaces";
import { getVideoSrc, localDisplayStream, localUserStream, useUserMedia } from "../streams";
import { permissionDenied, showMsgBox, showVideos, videoContainer } from "../ui";
import { clientID, websocket } from "../ws";
import send from "../_ws/send";
import { fetchExistingProducerIDs } from "./fetchExistingProducerIDs";

const 
    getUserMedia = async () => {
        if (!device.canProduce('video')) {
            throw new Error('cannot produce video')
        }

        let stream:MediaStream
        try {
            stream = await navigator.mediaDevices.getUserMedia({video:true,audio:true})
        } catch (error) {
            throw error
        }

        return stream
    },
    onProducerTransportCreated = async (
        transportParams:{
            id: string;
            iceParameters: IceParameters;
            iceCandidates: IceCandidate[];
            dtlsParameters: DtlsParameters;
        },
        mediaKind:MediaKind,
    ) => {
        const transport = device.createSendTransport(transportParams)
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
                        producerNotConnected = false
                        callback()
                    } else if (producerNotConnected) {
                        errback(new Error('producerNotConnected'))
                    }
                }
            })
        })

        transport.on('produce', async ({ kind, rtpParameters }, callback, errback ) => {
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
                // console.log(notProduced,mediaKind,type,payload)
                if (type === 'produced') {
                    notProduced = false
                    if (payload.kind===mediaKind){
                        /**** fetch other producers ****/
                        if (mediaKind==='video') fetchExistingProducerIDs()
    
                        callback({id:payload.id})
                    }
                } else if (notProduced) {
                    errback(new Error('notProduced'))
                }
            })
        })

        transport.on('connectionstatechange',state => {
            switch (state){
                case 'connecting':
                    // console.log('connecting')
                    break
                case 'connected':
                    // (document.getElementById('localVideo') as HTMLVideoElement).srcObject = localStream//new MediaStream([localVideoTrack])
                    // showVideos()
                    break
                case 'failed':
                    console.log('failed')
                    transport.close()
                    break
            }
        })

        const videoSrc = getVideoSrc()

        try {
            const _producer = await transport.produce({track: mediaKind === 'video' ? useUserMedia(videoSrc) ? localUserStream.getVideoTracks()[0] : localDisplayStream.getVideoTracks()[0] : localUserStream.getAudioTracks()[0]})
            setProducer(_producer,mediaKind)
        } catch (error) {
            videoContainer.classList.add('hidden')
            showMsgBox(permissionDenied)
        }
    }

export { onProducerTransportCreated }