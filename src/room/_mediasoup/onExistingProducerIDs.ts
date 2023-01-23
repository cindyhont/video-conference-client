import { MediaKind } from "mediasoup-client/lib/types";
import { onNewProducer } from "./onNewProducer"

const onExistingProducerIDs = (
    payload:{
        [clientID:string]:{
            [kind:string]:string;
        }
    }
) => {
    const entries = Object.entries(payload)

    entries.forEach(entry=>{
        const [clientID,producerIDs] = entry
        Object.entries(producerIDs).forEach(([kind,producerID])=>{
            onNewProducer(producerID,clientID,kind as MediaKind)
        })
    })
}

export { onExistingProducerIDs }