import { DtlsParameters, IceCandidate, IceParameters } from "mediasoup-client/lib/types";
import { device, setProducer, setProducerTransport } from "."
import { IconnectProducerTransport, Iproduce } from "../interfaces";
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
    ) => {
        const transport = device.createSendTransport(transportParams)
        setProducerTransport(transport)

        transport.on('connect',async ({dtlsParameters},callback,errback)=>{
            const message:IconnectProducerTransport = {
                type:'connectProducerTransport',
                payload:{
                    transportID:transport.id,
                    dtlsParameters
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

                const evt = JSON.parse(msg)
                if (evt.type==='producerConnected') {
                    producerNotConnected = false
                    callback()
                } else if (producerNotConnected) errback(new Error('producerNotConnected'))
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

                const evt = JSON.parse(msg)
                if (evt.type === 'produced') {
                    notProduced = false
                    
                    /**** fetch other producers ****/
                    fetchExistingProducerIDs()

                    callback({id:evt.payload.id})
                } else if (notProduced) errback(new Error('notProduced'))
            })
        })

        transport.on('connectionstatechange',state => {
            switch (state){
                case 'connecting':
                    // console.log('connecting')
                    break
                case 'connected':
                    (document.getElementById('localVideo') as HTMLVideoElement).srcObject = stream
                    showVideos()
                    break
                case 'failed':
                    console.log('failed')
                    transport.close()
                    break
            }
        })

        let stream:MediaStream

        try {
            stream = await getUserMedia()
            const track = stream.getVideoTracks()[0]
            const _producer = await transport.produce({track})
            setProducer(_producer)
        } catch (error) {
            videoContainer.classList.add('hidden')
            showMsgBox(permissionDenied)
        }
    }

export { onProducerTransportCreated }