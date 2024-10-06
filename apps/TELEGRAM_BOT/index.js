import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
dotenv.config();
import { Kafka } from "kafkajs";

const token = process.env.TELEGRAM_BOT_TOKEN;
/**
 * params token: string // Telegram Bot Token
 * params { polling: boolean } // Polling is a method where the bot will ask the Telegram server if there are any new updates.
 */
const bot = new TelegramBot(token, { polling: true });
const kafka = new Kafka({
  clientId: 'Hackathon-Telegram-Bot',
  brokers: ['localhost:9092']
});

const producer = kafka.producer();
const consumer = kafka.consumer({
  groupId: 'sentiment-analysis-group-2'
})

bot.on("message", async (msg) => {
  /**
   * params msg: object // Message object
   * msg.chat.id: number // Chat ID
   * msg.text: string // Message text
   * msg.from.id: number
   */

  const chatId = msg.chat.id;
  const message = msg.text;
  const userId = msg.from.id;
  const name = msg.from.first_name;

  //First of all we need to check if the message is text or not
  if (msg.text) {
    //Connect to the Kafka Producer
    await producer.connect();
    //Send the message to the Sentiment Analysis Microservice
    await producer.send({
      topic: "sentiment-analysis",
      messages: [
        { value: JSON.stringify({name, chatId, message, userId }) }
      ]
    })
    // Prepare the topic to send to the Sentiment Analysis Microservice
    await producer.disconnect();
  }
});


const run = async () => {
  console.log("Negative Sentiment Sentinel is running ...")
  await consumer.connect();
  await consumer.subscribe({
    topic: "negative-sentiment",
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({
      topic,
      partition,
      message
    }) => {
     const {name, userId, chatId, message: telegramMessage } = JSON.parse(message.value.toString());
     console.log(userId, chatId, telegramMessage)
     const users = await bot.getChatAdministrators(chatId);
      const otherAdmins = users.filter(user => user.user.id !== userId);
      console.log(otherAdmins)
      bot.sendMessage(userId, `Please ${name} be careful with the messages you send. `)
      for (let i = 0; i < otherAdmins.length; i++ ){
        if(otherAdmins[i].user.is_bot) return
        await bot.sendMessage(otherAdmins[i].user.id, telegramMessage);
      }
    }
  })
};

run().catch(console.error);
console.log("Telegram Bot is running...")
