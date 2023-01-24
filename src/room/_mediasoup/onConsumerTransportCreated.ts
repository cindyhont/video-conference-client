import { Consumer, DtlsParameters, IceCandidate, IceParameters } from "mediasoup-client/lib/types";
import { device } from ".";
import { IconnectConsumerTransport, Iconsume, Iresume, IwsEvent } from "../interfaces";
import { setRemoteStream, setVideoElement, videoElements } from "../streams";
import { updateVideoSize, videoContainer } from "../ui";
import { websocket } from "../ws";
import send from "../_ws/send";

const 
    onConsumerTransportCreated = async (
        {
            consumerTransportParams,
            producerID,
            producerClientID,
        }:{
            consumerTransportParams:{
                id: string;
                iceParameters: IceParameters;
                iceCandidates: IceCandidate[];
                dtlsParameters: DtlsParameters;
            };
            producerID:string;
            producerClientID: string;
        }
    ) => {
        const transport = device.createRecvTransport(consumerTransportParams)
        let consumer:Consumer

        if (!(producerClientID in videoElements)) {
            const videoElem = document.createElement('video')
            videoElem.autoplay = true
            videoElem.controls = true
            videoElem.id = producerClientID
            setVideoElement(videoElem,producerClientID)
        }
        
        websocket.addEventListener('message',async (e)=>{
            const msg = e.data
            if (typeof msg !== 'string'){
                console.error(new Error('non string data'))
                return
            }

            const {type,payload} = JSON.parse(msg) as IwsEvent

            switch (type){
                case 'subscribed':
                    if (payload.producerID === producerID){
                        consumer = await transport.consume({
                            id:payload.consumerID,
                            producerId:producerID,
                            kind:payload.kind,
                            rtpParameters:payload.rtpParameters,
                        })
                        setRemoteStream(producerClientID,consumer.track)
                        if (payload.kind==='video') {
                            videoContainer.appendChild(videoElements[producerClientID])
                        }
                        videoElements[producerClientID]?.addEventListener('pause',()=>{
                            consumer.pause()
                        })
                        videoElements[producerClientID]?.addEventListener('play',()=>{
                            consumer.resume()
                        })
                        updateVideoSize()
                    }
                    break
                case 'resumed':
                    if (payload.consumerTransportID === transport.id && !!consumer) consumer.resume()
                default: break;
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
                    const message:Iresume = {
                        type:'resume',
                        payload:{
                            rtpCapabilities:device.rtpCapabilities,
                            transportID:transport.id,
                            producerID,
                            consumerID:consumer?.id || '',
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