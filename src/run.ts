import { runTgChatBot } from "@effect-ak/tg-bot-client/bot"
import { botLogic } from "./bot/logic"
import * as config from "../config.json"

runTgChatBot({
  bot_token: config.bot_token,
  mode: {
    type: "single",
    ...botLogic 
  },
  poll: {
    log_level: "debug"
  }
});
