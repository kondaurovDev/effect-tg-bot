import { MessageHandler } from "@effect-ak/tg-bot/misc";

export const messageHandler: MessageHandler = ({ message, currentChatId, chat }) => {

  if (message.text == null) {
    return chat.sendMessage({
      chat_id: currentChatId,
      text: "I got your non-text message!",
      reply_parameters: {
        chat_id: currentChatId,
        message_id: message.message_id
      }
    });
  }

  if (message.text == "/random") {
    return chat.sendDice({
      chat_id: currentChatId,
      emoji: "🏀"
    });
  }

  if (message.text == "/start") {
    return chat.sendMessage({
      chat_id: currentChatId,
      text: `Hello, ${message.from?.first_name}. Let's do it! :)`
    })
  }

}
