import { runTgChatBot } from "@effect-ak/tg-bot-client/bot"
import { botLogic } from "./bot/logic"

// POLLING

runTgChatBot({
  type: "fromJsonFile",
  mode: {
    type: "single",
    ...botLogic 
  },
  poll: {
    log_level: "debug"
  }
});
