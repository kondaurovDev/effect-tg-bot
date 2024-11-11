### Running telegram bot locally

- clone this repo
- install dependecies `pnpm install`
- create `config.json` with structure taken from `config/example.json`, __put your credentials 🤪__
- change [./src/bot-logic.ts](./src/bot-logic.ts) to meet your desired bot's logic
- run the bot `pnpm tsx src/local-run.ts`

### How does it work?

It uses long-pooling to fetch messages from Telegram bot's queue (messages are kept for 24 hours) and uses `MessageHandler` to process message updates.
