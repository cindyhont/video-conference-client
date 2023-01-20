import { Consumer, Device, Producer, Transport } from "mediasoup-client/lib/types"

let 
    device:Device,
    isExistingRoom = false,
    producer:Producer,
    producerTransport:Transport,
    consumers:{
        [id:string]:Consumer;
    } = {},
    consumerTransports:{
        [id:string]:Transport;
    } = {}

const 
    setDevice = (_device:Device) => device = _device,
    setIsExistingRoom = (v:boolean) => isExistingRoom = v,
    setProducer = (_producer:Producer) => producer = _producer,
    setProducerTransport = (_transport:Transport) => producerTransport = _transport

export {
    device,
    isExistingRoom,
    producer,
    setDevice,
    setIsExistingRoom,
    setProducer,
    setProducerTransport
}