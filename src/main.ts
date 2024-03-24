import { Effect, Layer, Match } from "effect";

import { BotResponse, handleBotMessages } from "./bot-api/bot-msg-handler";

const bot =
  handleBotMessages(
    msg =>
      Match.value(msg.text?.toLowerCase()).pipe(
        Match.when(
          Match.undefined,
          () => BotResponse({ text: "a?", dice: "🏀" })
        ),
        Match.when(
          "/start",
          () => BotResponse({ text: `Hello, ${msg.from.first_name}. Let's do it! :)` })
        ),
        Match.when(
          "/random",
          () => BotResponse({ dice: "🎰" })
        ),
        Match.orElse(
          () => BotResponse({ text: `How can I help you, ${msg.from.first_name}?`, dice: "⚽" })
        )
      )
  );

Effect.runFork(
  Layer.launch(bot)
)
