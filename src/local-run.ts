import { runTgChatBot } from "@effect-ak/tg-bot-client"
import { botLogic } from "./bot/logic"

runTgChatBot({
  type: "fromJsonFile",
  log_level: "debug",
  ...botLogic
});
