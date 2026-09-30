import { Kafka } from "kafkajs"
import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()

export const startSendMailConsumer = async () => {
    try {
        const kafka = new Kafka({
          clientId: "mail-service",
          brokers: [process.env.kafka_broker || "localhost:9092"],
        });  
        const consumer = kafka.consumer({ groupId: "mail-service-group" })
        await consumer.connect()
        const topicName = "send-mail"
        await consumer.subscribe({ topic: topicName, fromBeginning: true })
        console.log("mail service consumer started, listening for sending mail")

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const { to, subject, html } = JSON.parse(
                        message.value?.toString() || "{}"
                    )
                    const transporter = nodemailer.createTransport({
                      host: "smtp.gmail.com",
                      port: 465,
                      secure: true,
                      auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS,
                      },
                    });
                    await transporter.sendMail({
                        from: "hireheaven <no-reply>",
                        to,
                        subject,
                        html,
                    })
                    console.log(`Mail sent to ${to} with subject: ${subject}`)

                    
                } catch (error) {
                    console.log("failed to send mail", error)
                    
                }
            }
        })
    } catch (error) {
        console.log("failed to start mail service consumer", error) 
    }
}