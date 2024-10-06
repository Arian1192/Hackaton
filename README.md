# Hackathon Telegram Bot - Microservicio de Análisis de Sentimientos

Este proyecto forma parte de una hackatón donde se desarrolló un **bot de Telegram** capaz de analizar el sentimiento de los mensajes enviados en un grupo. El bot utiliza **Kafka** como intermediario de mensajería y la librería **transformers** para el análisis de sentimientos de los mensajes, ayudando a moderar la conversación de manera automática.

## ¿De qué trata la hackatón?

El objetivo de la hackatón es crear una herramienta que permita a los administradores de grupos de Telegram moderar los mensajes automáticamente. A través del análisis de sentimientos, el bot identifica mensajes con contenido negativo y notifica tanto al remitente como a los administradores del grupo. Esto ayuda a mantener un ambiente saludable en las conversaciones.

### Funcionalidad

1. **Recepción de Mensajes**: El bot recibe los mensajes enviados en el grupo de Telegram.
2. **Análisis de Sentimiento**: Utiliza la API de transformers para determinar si el mensaje es positivo o negativo.
3. **Notificación de Mensajes Negativos**: Si el mensaje es clasificado como negativo, se envía una notificación a todos los administradores del grupo, excepto al usuario que envió el mensaje.
4. **Kafka para Comunicación**: Se utilizan varios topics en Kafka para enviar y recibir datos entre el bot de Telegram y el microservicio de análisis de sentimientos.

## Requisitos

- **Node.js** >= versión X.X
- **Kafka** >= versión X.X
- **Docker** (opcional para desplegar Kafka y Zookeeper)
- **Librería @xenova/transformers** para el análisis de sentimientos.

## Instalación

1. Clona el repositorio:

   ```bash
   git clone https://github.com/tu-usuario/hackathon-telegram-bot.git
   cd hackathon-telegram-bot

   ```

2. Installa las dependencias:

   ```bash
   npm install

   ```

3. Configura las variables de entorno creando un archivo .env en la raíz del proyecto:

   ```env
   TELEGRAM_BOT_TOKEN=tu_token_de_telegram

   ```

4. Asegurate de tener kafka y Zookeeper corriendo. Si no los tienes, puedes usar Docker

   ```bash
   docker-compose up -d
   ```

## Uso

Para iniciar tanto el bot de Telegram como el microservicio de análisis de sentimientos usaremos concurrently

```bash
npm run dev:both
```

Esto levantara las dos apps, para ver como funciona deberas ir al package.json de projecto raiz.

Esto levantara tanto el Bot como el Analizador de sentimientos.

Cada vez que se mande un mensaje se mandará a través de kafka usando un "Producer", llegará al analizador de sentimientos, que valorará de manera positiva o negativa el sentimiento del mensaje, si el mensaje es negativo, se mandará un mensaje de vuelta en otro topic hacia el bot, que será consumido y se mandará a todos los usuarios una advertencia de que el usuario X esta diciendo algo con un sentimiento negativo excepto a la persona que lo mandó.

Además usando el bot de telegram tambien advertiremos al usuario que ha mandado el mensaje que debe cuidar sus modales.
