import { pipeline } from "@xenova/transformers";
import { Kafka } from "kafkajs";
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

const clients = new Set();

wss.on("connection", function connection(ws) {
  console.log("Connected to the WebSocket Server");

  // Añadir cliente al set de conexiones
  clients.add(ws);

  ws.on("message", function incoming(message) {
    console.log("received: %s", message);
  });

  ws.on("close", () => {
    // Eliminar cliente cuando se desconecta
    clients.delete(ws);
  });

  ws.send("Connected to the WebSocket Server");
});

const kafka = new Kafka({
  clientId: "Hackathon-Telegram-Bot",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({
  groupId: "sentiment-analysis-group-2",
});

const run = async () => {
  console.log("Sentiment Analysis Microservice is running ...");
  const pipe = await pipeline("sentiment-analysis");

  await consumer.connect();
  await consumer.subscribe({
    topic: "sentiment-analysis",
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const {
        name,
        userId,
        chatId,
        message: telegramMessage,
      } = JSON.parse(message.value.toString());
      const sentiment = await pipe(telegramMessage);

      if (sentiment[0].label === "NEGATIVE") {
        const producer = kafka.producer();
        await producer.connect();
        await producer.send({
          topic: "negative-sentiment",
          messages: [
            {
              value: JSON.stringify({
                name,
                userId,
                chatId,
                message: `The messsage: ${telegramMessage} send by user: ${name} has a negative sentiment.`,
              }),
            },
          ],
        });
      }
      console.log(sentiment);
      console.log(
        `Received message: ${telegramMessage} with sentiment: ${sentiment[0].label}`,
      );
      clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
          client.send(
            JSON.stringify({
              message: telegramMessage,
              sentiment: sentiment[0].label,
            })
          );
        }
      });
    },
  });
};

run().catch(console.error);
