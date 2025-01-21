### What is this?

This is a simple Telegram chatbot. Here, I have demonstrated several libraries:

- **effect**: A powerful toolkit for building programs of any complexity without increasing that complexity.
- **@effect-ak/tg-bot-client**: Interacts with the Telegram API and serves as a chatbot launcher that pulls messages from the Telegram Bot API and triggers handler functions.
- **@effect-ak/aws-sdk**: A generator for wrappers around `@aws-sdk/client-*` to enable working with AWS SDK within the Effect ecosystem. The AWS SDK is used to deploy the bot as a Lambda function.

### Checking Out the Telegram Bot Live

The bot is deployed and can be tested via [Telegram](https://t.me/effect_buddy_bot).

> The bot runs on a Lambda function and needs to be "woken up" to start the Lambda function. To do this, press the "Wake Up" button. A browser will open, which will start the Lambda function, and the bot will become active within 1 minute. After that, you will need to wake up the bot again.

### Running Locally

Alternatively, you can run the chatbot locally using your own bot.

- Clone this repository.
- Install dependencies: `pnpm install`.
- Create a `config.json` with the following structure:
  ```json
  {
    "bot_token": "*** your bot token ***"
  }
  ```
- Modify [./src/bot-logic.ts](./src/bot-logic.ts) to implement your desired bot logic.
- Run the bot: `tsx src/local-run.ts` (requires global `tsx`).

### How Does It Work?

It uses long-polling to fetch messages from the Telegram bot's queue (messages are kept for 24 hours) and utilizes `@effect-ak/tg-bot-client` to process message updates.