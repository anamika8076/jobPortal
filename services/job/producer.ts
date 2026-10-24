import { Kafka, Producer, Admin } from "kafkajs";
import dotenv from "dotenv";
dotenv.config();

let producer: Producer;
let admin: Admin;


export const connectKafka = async () => {
    try {
        const kafka = new Kafka({
          clientId: "auth-service",
          brokers: [process.env.kafka_broker || "localhost:9092"],
        });
        admin = kafka.admin();
        await admin.connect();
        const topics = await admin.listTopics()
        if (!topics.includes("send-mail")) {
            await admin.createTopics({
                topics:[{
                    topic: "send-mail",
                    numPartitions: 1,
                    replicationFactor: 1,
                }]
            })
            console.log("topic 'send-mail' created")
        }
        await admin.disconnect();
        producer = kafka.producer();
        await producer.connect();
        console.log("kafka producer connected")
         
        
    } catch (error) {
        console.log("failed to connect kafka producer", error)
        
    }
} 

export const publishToKafka = async (topic: string, message: any) => { 
    if (!producer) {
        console.log("Kafka producer is not connected");
        return;
    }
    try { 
        await producer.send({
            topic,
            messages: [{ value: JSON.stringify(message) }],
        })
    }
    catch(error) {
        console.log("failed to publish message to kafka", error)
    }
}
export const disconnectKafka = async () => { 
    if(producer) {
        await producer.disconnect();
        console.log("kafka producer disconnected")
    }
}