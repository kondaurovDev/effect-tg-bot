import { BotFactoryServiceDefault, runTgChatBot } from "@effect-ak/tg-bot-client"
import { buddyBot } from "./bots/buddy"
import { Effect } from "effect"

export const handler =
  Effect.gen(function* () {

    const bot =
      yield* BotFactoryServiceDefault
        .runBot({
          type: "config",
          bot_token: "",
          max_empty_responses: 3,
          ...buddyBot
        });

  });
