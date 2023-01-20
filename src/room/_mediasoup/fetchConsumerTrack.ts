import { MediaKind, RtpParameters, Transport } from "mediasoup-client/lib/types";

const fetchConsumerTrack = async(
    {
        producerID,
        consumerID,
        kind,
        rtpParameters,
        type,
        producerPaused,
    }:{
        producerID: string;
        consumerID: string;
        kind: MediaKind;
        rtpParameters: RtpParameters;
        type: "simple" | "simulcast" | "svc" | "pipe";
        producerPaused: boolean;
    },
    consumerTransport:Transport
) => {
    const consumer = await consumerTransport.consume({
        id:consumerID,
        producerId:producerID,
        kind,
        rtpParameters,
    })

    return consumer.track
}

export { fetchConsumerTrack }