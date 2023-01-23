import { DtlsParameters, IceCandidate, IceParameters, MediaKind, RtpCapabilities, RtpParameters } from "mediasoup-client/lib/types";

// events

export interface IrouterCapabilities {
    type:'routerCapabilities';
    payload:{
        rtpCapabilities:RtpCapabilities;
        clientID:string;
    }
}

export interface IproducerTransportCreated {
    type:'producerTransportCreated';
    payload:{
        kind:MediaKind;
        params:{
            id: string;
            iceParameters: IceParameters;
            iceCandidates: IceCandidate[];
            dtlsParameters: DtlsParameters;
        }
    }
}

export interface InewProducer {
    type:'newProducer';
    payload:{
        producerID:string;
        producerClientID:string;
        kind:MediaKind;
    }
}

export interface IconsumerTransportCreated {
    type:'consumerTransportCreated';
    payload:{
        consumerTransportParams:{
            id: string;
            iceParameters: IceParameters;
            iceCandidates: IceCandidate[];
            dtlsParameters: DtlsParameters;
        };
        producerID:string;
        producerClientID:string;
    }
}

export interface IconsumerConnected {
    type:'consumerConnected';
    payload:{
        transportID:string;
    }
}

export interface Isubscribed {
    type:'subscribed',
    payload:{
        producerID: string;
        consumerID: string;
        kind: MediaKind;
        rtpParameters: RtpParameters;
        type: "simple" | "simulcast" | "svc" | "pipe";
        producerPaused: boolean;
    }
}

export interface IexistingProducerIDs {
    type:'existingProducerIDs',
    payload:{
        [clientID:string]:{
            [kind:string]:string;
        }
    }
}

export interface Iproduced {
    type:'produced';
    payload:{
        id:string;
        kind:MediaKind;
    };
}

export interface IproducerConnected {
    type:'producerConnected';
    payload:{
        mediaKind:MediaKind;
    }
}

export interface Iresumed {
    type:'resumed';
    payload:{
        consumerTransportID:string;
    }
}

export interface IdeleteClient {
    type:'deleteClient';
    payload:{
        clientID:string;
    }
}

export type IwsEvent = IrouterCapabilities
    | IproducerTransportCreated
    | InewProducer
    | IconsumerTransportCreated
    | IconsumerConnected
    | Isubscribed
    | IexistingProducerIDs
    | Iproduced
    | IproducerConnected
    | Iresumed
    | IdeleteClient

// messages

export interface IgetRouterRtpCapabilities {
    type:'getRouterRtpCapabilities';
    payload:{
        roomID:string;
        serverHost:string;
    }
}

export interface IcreateProducerTransport {
    type:'createProducerTransport',
    payload:{
        forceTcp:boolean;
        rtpCapabilities:RtpCapabilities;
        clientID:string;
        kind:MediaKind;
    }
}

export interface IconnectProducerTransport {
    type:'connectProducerTransport';
    payload:{
        transportID:string;
        dtlsParameters:DtlsParameters;
        mediaKind:MediaKind;
    };
}

export interface Iproduce {
    type:'produce';
    payload:{
        clientID:string;
        transportID:string;
        kind:MediaKind;
        rtpParameters:RtpParameters;
    };
}

export interface IcreateConsumerTransport {
    type:'createConsumerTransport',
    payload:{
        clientID:string;
        producerID:string;
        producerClientID:string;
        kind:MediaKind;
    };
}

export interface IconnectConsumerTransport {
    type:'connectConsumerTransport',
    payload:{
        dtlsParameters: DtlsParameters;
        transportID:string;
    }
}

export interface Iconsume {
    type:'consume';
    payload:{
        rtpCapabilities:RtpCapabilities;
        producerID:string;
        consumerTranportID:string;
    };
}

export interface Iresume {
    type:'resume';
    payload:{
        rtpCapabilities:RtpCapabilities;
        transportID:string;
        producerID:string;
        consumerID:string;
    };
}

export interface IfetchExistingProducerIDs {
    type:'fetchExistingProducerIDs',
    payload:{
        roomID:string;
        clientID:string;
    }
}

export type IwsMessage = IdeleteClient
    | IgetRouterRtpCapabilities
    | IcreateProducerTransport
    | IconnectProducerTransport
    | Iproduce
    | IcreateConsumerTransport
    | IconnectConsumerTransport
    | Iconsume
    | Iresume
    | IfetchExistingProducerIDs