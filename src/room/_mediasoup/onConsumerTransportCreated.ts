import { DtlsParameters, IceCandidate, IceParameters } from "mediasoup-client/lib/types";
import { device } from ".";
import { IconnectConsumerTransport, Iconsume, Iresume, IwsEvent } from "../interfaces";
import { updateVideoSize, videoContainer } from "../ui";
import { websocket } from "../ws";
import send from "../_ws/send";
import { fetchConsumerTrack } from "./fetchConsumerTrack";

const 
    onConsumerTransportCreated = async (
        {
            consumerTransportParams,
            producerID,
        }:{
            consumerTransportParams:{
                id: string;
                iceParameters: IceParameters;
                iceCandidates: IceCandidate[];
                dtlsParameters: DtlsParameters;
            };
            producerID:string;
        }
    ) => {
        const 
            transport = device.createRecvTransport(consumerTransportParams),
            stream = new MediaStream(),
            videoElem = document.createElement('video')
        videoElem.autoplay = true
        videoElem.controls = true
        videoElem.id = producerID
        
        websocket.addEventListener('message',async (e)=>{
            const msg = e.data
            if (typeof msg !== 'string'){
                console.error(new Error('non string data'))
                return
            }

            const {type,payload} = JSON.parse(msg) as IwsEvent

            if (type==='subscribed' && payload.producerID === producerID) {
                // console.log('subscribed')
                const track = await fetchConsumerTrack(payload,transport)
                stream.addTrack(track)
                videoContainer.appendChild(videoElem)
                updateVideoSize()
            }
        })

        transport.on('connect',({dtlsParameters},callback,errback)=>{
            const message:IconnectConsumerTransport = {
                type:'connectConsumerTransport',
                payload:{
                    dtlsParameters,
                    transportID:transport.id,
                }
            }
            send(message,websocket)

            let consumerNotConnected = true
            websocket.addEventListener('message',async (e)=>{
                const msg = e.data
                if (typeof msg !== 'string'){
                    errback(new Error('non string data'))
                    return
                }

                const {type,payload} = JSON.parse(msg) as IwsEvent

                switch (type){
                    case 'consumerConnected':
                        if (payload.transportID === transport.id) {
                            consumerNotConnected = false
                            callback()
                        }
                        break
                    default: 
                        if (consumerNotConnected) errback(new Error('consumerNotConnected'))
                        break
                }
            })
            
        })

        transport.on('connectionstatechange',(state) => {
            switch (state){
                case 'connecting':
                    // console.log('connecting');
                    break;
                case 'connected':
                    // console.log('connected');
                    videoElem.srcObject = stream /////////////////

                    const message:Iresume = {
                        type:'resume',
                        payload:{
                            rtpCapabilities:device.rtpCapabilities,
                            transportID:transport.id,
                            producerID,
                        }
                    }
                    send(message,websocket)
                    break;
                case 'failed':
                    // console.log('failed')
                    break;
            }
            
        })

        const message:Iconsume = {
            type:'consume',
            payload:{
                rtpCapabilities:device.rtpCapabilities,
                producerID,
                consumerTranportID:transport.id,
            }
        }
        send(message,websocket)
    }

export { onConsumerTransportCreated }