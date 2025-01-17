import { runTgChatBot } from "@effect-ak/tg-bot-client"
import { buddyBot } from "./bots/buddy"

runTgChatBot({
  type: "fromJsonFile",
  ...buddyBot
});
