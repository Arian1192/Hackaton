import { pipeline } from "@xenova/transformers";
import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: 'Hackathon-Telegram-Bot',
  brokers: ['localhost:9092']
});

const consumer = kafka.consumer({
  groupId: 'sentiment-analysis-group'
});

const run = async () => {
  console.log("Sentiment Analysis Microservice is running ...")
  const pipe = await pipeline("sentiment-analysis");

  await consumer.connect();
  await consumer.subscribe({
    topic: "sentiment-analysis",
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const {name, userId, chatId, message: telegramMessage } = JSON.parse(message.value.toString());
      const sentiment = await pipe(telegramMessage);

      // si el mensaje tiene un sentimient negativo mandariamos un mensaje a un topic de kafka
      // devuelta a al bot de telegram para indicarle a todos los usuarios excepto el que lo manda
      // que el mensaje tiene un sentimiento negativo.
      if(sentiment[0].label === "NEGATIVE"){
        const producer = kafka.producer()
        await producer.connect()
        await producer.send({
          topic: "negative-sentiment",
          messages: [
            { value: JSON.stringify({
              name,
              userId,
              chatId,
              message: `The messsage: ${telegramMessage} send by user: ${name} has a negative sentiment.`
            }
            )}
          ]
        })
      }
      console.log(sentiment) // asegúrate de usar await aquí si pipe devuelve una promesa
      console.log(
        `Received message: ${telegramMessage} with sentiment: ${sentiment[0].label}`
      )
    },
  });
};

run().catch(console.error);
