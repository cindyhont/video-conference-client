import { Device, MediaKind, Producer, Transport } from "mediasoup-client/lib/types"

let 
    device:Device,
    isExistingRoom = false,
    producers:{
        [kind:string]:Producer
    } = {},
    producerTransports:{
        [kind:string]:Transport
    } = {}

const 
    setDevice = (_device:Device) => device = _device,
    setIsExistingRoom = (v:boolean) => isExistingRoom = v,
    setProducer = (_producer:Producer,kind:MediaKind) => producers[kind] = _producer,
    setProducerTransport = (_transport:Transport,kind:MediaKind) => producerTransports[kind] = _transport

export {
    device,
    isExistingRoom,
    producers,
    setDevice,
    setIsExistingRoom,
    setProducer,
    setProducerTransport,
}