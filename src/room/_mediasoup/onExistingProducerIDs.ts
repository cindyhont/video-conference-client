import { onNewProducer } from "./onNewProducer"

const onExistingProducerIDs = (producerIDs:string[]) => {
    producerIDs.forEach(e=>onNewProducer(e))
}

export { onExistingProducerIDs }