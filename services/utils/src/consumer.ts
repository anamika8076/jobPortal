
import { Kafka } from "kafkajs";
import nodemailer from "nodemailer";

export const startSendMailConsumer = async () => {
  try {
    const kafka = new Kafka({
      clientId: "mail-service",
      brokers: [process.env.kafka_broker || "localhost:9092"],
    });

    const consumer = kafka.consumer({
      groupId: "mail-service-group",
    });

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await consumer.connect();

    await consumer.subscribe({
      topic: "send-mail",
      fromBeginning: true,
    });

    console.log("Mail service consumer connected");

    await consumer.run({
      eachMessage: async ({ message }) => {
        try {
          const value = message.value?.toString();

          if (!value) {
            console.error("Received an empty Kafka message");
            return;
          }

          const { to, subject, html } = JSON.parse(value);

          if (!to || !subject || !html) {
            console.error("Invalid email message: missing required fields");
            return;
          }

          await transporter.sendMail({
            from: `Hirely <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
          });

          console.log(`Mail sent to ${to}`);
        } catch (error) {
          console.error("Failed to process or send email:", error);
        }
      },
    });
  } catch (error) {
    console.error("Failed to start mail service consumer:", error);
  }
};
